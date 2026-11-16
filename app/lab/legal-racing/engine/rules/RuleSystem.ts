import * as THREE from 'three'
import type { City } from '../world/City'
import type { Road } from '../world/Road'
import type { Intersection, StopLine } from '../world/Intersection'
import type { PlayerCar } from '../player/PlayerCar'
import type { TurnSignalSide } from '../player/TurnSignalController'
import type { Lane } from '../world/road/types'
import { CAR_LENGTH } from '../player/PlayerCar'

export type ViolationType = 'speeding' | 'red_light' | 'stop_sign' | 'no_turn_signal' | 'wrong_way'

export type RuleUpdateResult = {
  violations: ViolationType[]
  speedLimitKmh: number | null
}

const SPEEDING_GRACE_KMH = 3 // 多少の超過は許容する
const SPEEDING_SUSTAIN_SEC = 1.5 // 仕様§13：一定時間以上の超過で判定
const SPEEDING_COOLDOWN_SEC = 3 // 連続検知の抑制
const TURN_HEADING_THRESHOLD = Math.PI / 6 // 30°以上の変化を「右左折した」とみなす
const SIGNAL_LEAD_TIME_SEC = 1.0 // 仕様§10：交差点進入1秒以上前から出ている必要がある
const WRONG_WAY_MOVING_KMH = 3 // これ未満は逆走判定の対象外
const WRONG_WAY_DOT_THRESHOLD = -0.3 // 進行方向と最寄りLaneの向きがこれ以上ずれたら逆走候補（約107°超）
const WRONG_WAY_SUSTAIN_SEC = 1.0 // 逆走とみなすまでの継続時間
const WRONG_WAY_COOLDOWN_SEC = 3 // 連続検知の抑制
const WRONG_WAY_LANE_RANGE = 8 // この距離より最寄りLaneが遠い場合は判定しない（道路外や交差点内）
const STOP_THRESHOLD_KMH = 0.5 // 仕様v3 §15：これ以下なら「停止した」とみなす
const STOP_SUSTAIN_SEC = 0.3 // 仕様v3 §15：この時間以上継続して停止していれば成立
const STOP_LINE_APPROACH_RANGE = 20 // 停止線手前、この距離以内を「接近中」とみなす

type IntersectionState = {
  wasInside: boolean
  entryHeading: number
  signaledSide: TurnSignalSide
}

type StopLineState = {
  wasBefore: boolean
  stoppedDuration: number
  hasStoppedSufficiently: boolean
}

/** 仕様v2/v3の簡易判定。Penalty Time/Violation Pointsの集計はPhase 5で行う。 */
export class RuleSystem {
  private speedingTimer = 0
  private speedingCooldown = 0
  private wrongWayTimer = 0
  private wrongWayCooldown = 0
  private readonly intersectionState = new Map<Intersection, IntersectionState>()
  private readonly stopLineState = new Map<StopLine, StopLineState>()

  constructor(private readonly city: City, private readonly playerCar: PlayerCar) {
    for (const intersection of city.intersections) {
      this.intersectionState.set(intersection, { wasInside: false, entryHeading: 0, signaledSide: 'off' })
    }
    for (const stopLine of city.stopLines) {
      this.stopLineState.set(stopLine, { wasBefore: true, stoppedDuration: 0, hasStoppedSufficiently: false })
    }
  }

  update(dt: number): RuleUpdateResult {
    const violations: ViolationType[] = []
    const position = this.playerCar.controller.position
    const nearbyRoads = this.city.nearbyRoads(position)
    const nearbyIntersections = this.city.nearbyIntersections(position)
    const nearestRoad = this.findNearestRoad(nearbyRoads)
    const nearestLane = this.findNearestLane(nearbyRoads)
    const insideIntersection = nearbyIntersections.some((intersection) => intersection.contains(position))
    this.updateSpeeding(dt, nearestRoad, violations)
    this.updateWrongWay(dt, nearestLane, insideIntersection, violations)
    this.updateTurnSignals(violations)
    this.updateStopLines(dt, violations)
    return { violations, speedLimitKmh: nearestRoad?.road.speedLimitKmh ?? null }
  }

  private findNearestRoad(roads: Road[]): { road: Road; distance: number } | null {
    const position = this.playerCar.controller.position
    let nearest: { road: Road; distance: number } | null = null
    for (const road of roads) {
      const candidate = road.closestPointAndDistance(position)
      if (!nearest || candidate.distance < nearest.distance) nearest = { road, distance: candidate.distance }
    }
    return nearest
  }

  /** 近傍道路のLaneから最寄りを探す（車線ベースの逆走判定用：仕様v2 §6）。 */
  private findNearestLane(roads: Road[]): { lane: Lane; distance: number } | null {
    const position = this.playerCar.controller.position
    let nearest: { lane: Lane; distance: number } | null = null
    for (const road of roads) {
      const candidate = road.nearestLane(position)
      if (candidate && (!nearest || candidate.distance < nearest.distance)) nearest = candidate
    }
    return nearest
  }

  private updateSpeeding(dt: number, nearestRoad: { road: Road; distance: number } | null, events: ViolationType[]) {
    if (!nearestRoad) return
    const { speedKmh } = this.playerCar.controller

    this.speedingCooldown = Math.max(0, this.speedingCooldown - dt)
    const speed = Math.abs(speedKmh)

    if (speed > nearestRoad.road.speedLimitKmh + SPEEDING_GRACE_KMH) {
      this.speedingTimer += dt
      if (this.speedingTimer >= SPEEDING_SUSTAIN_SEC && this.speedingCooldown <= 0) {
        events.push('speeding')
        this.speedingCooldown = SPEEDING_COOLDOWN_SEC
        this.speedingTimer = 0
      }
    } else {
      this.speedingTimer = 0
    }
  }

  /**
   * 最寄りLaneの向きと自車の進行方向を比較し、逆走（一方通行の逆走／対向車線への進入）を判定する。
   * 一方通行フラグではなくLane単位で判定するため、対向2車線道路での逆走も検知できる（仕様v2 §6）。
   */
  private updateWrongWay(
    dt: number,
    nearestLane: { lane: Lane; distance: number } | null,
    insideIntersection: boolean,
    events: ViolationType[],
  ) {
    this.wrongWayCooldown = Math.max(0, this.wrongWayCooldown - dt)
    const { heading, speedKmh } = this.playerCar.controller

    // 交差点内は右左折で一時的に向きが道路と合わなくなるため判定しない（旋回中の誤検知防止）。
    if (
      insideIntersection ||
      !nearestLane ||
      nearestLane.distance > WRONG_WAY_LANE_RANGE ||
      Math.abs(speedKmh) < WRONG_WAY_MOVING_KMH
    ) {
      this.wrongWayTimer = 0
      return
    }

    const laneDirection = nearestLane.lane.direction
    const dot = laneDirection.x * Math.sin(heading) + laneDirection.z * Math.cos(heading)

    if (dot < WRONG_WAY_DOT_THRESHOLD) {
      this.wrongWayTimer += dt
      if (this.wrongWayTimer >= WRONG_WAY_SUSTAIN_SEC && this.wrongWayCooldown <= 0) {
        events.push('wrong_way')
        this.wrongWayCooldown = WRONG_WAY_COOLDOWN_SEC
        this.wrongWayTimer = 0
      }
    } else {
      this.wrongWayTimer = 0
    }
  }

  /** ウインカー未点灯での右左折を判定する（交差点パッドへの進入・退出ベース：仕様v3 §21-27）。 */
  private updateTurnSignals(events: ViolationType[]) {
    const { position, heading } = this.playerCar.controller
    const turnSignal = this.playerCar.turnSignal

    for (const intersection of this.city.nearbyIntersections(position)) {
      const state = this.intersectionState.get(intersection)
      if (!state) continue

      const inside = intersection.contains(position)

      if (inside && !state.wasInside) {
        state.entryHeading = heading
        state.signaledSide =
          turnSignal.side !== 'off' && turnSignal.onDurationSec >= SIGNAL_LEAD_TIME_SEC ? turnSignal.side : 'off'
      }

      if (!inside && state.wasInside) {
        const delta = normalizeAngle(heading - state.entryHeading)
        const turnedLeft = delta >= TURN_HEADING_THRESHOLD
        const turnedRight = delta <= -TURN_HEADING_THRESHOLD

        if ((turnedLeft && state.signaledSide !== 'left') || (turnedRight && state.signaledSide !== 'right')) {
          events.push('no_turn_signal')
        }
      }

      state.wasInside = inside
    }
  }

  /**
   * 赤信号・一時停止の判定は、信号機や標識の位置ではなく、プレイヤー車両の前端が
   * StopLineを通過したかどうかを基準にする（仕様v3 §9, §11, §14-15）。
   * CAR → STOP LINE → INTERSECTION の順で判定し、intersection.contains()は使わない。
   */
  private updateStopLines(dt: number, events: ViolationType[]) {
    const { position, heading, speedKmh } = this.playerCar.controller
    const forward = new THREE.Vector3(Math.sin(heading), 0, Math.cos(heading))
    const frontPosition = position.clone().addScaledVector(forward, CAR_LENGTH / 2)

    for (const stopLine of this.city.stopLines) {
      const state = this.stopLineState.get(stopLine)
      if (!state) continue

      const offset = frontPosition.clone().sub(stopLine.position)

      // stopLine.directionへの単純な符号だけでは「線を挟んで反対側にいる」ことしか分からず、
      // 遠く離れた場所でも符号が反転しうる（＝無関係な位置での誤検知）。範囲外では状態を
      // リセットしたまま維持し、必ず接近範囲の「手前」側からしか判定を開始しないようにする。
      if (offset.length() > STOP_LINE_APPROACH_RANGE) {
        state.wasBefore = true
        state.stoppedDuration = 0
        state.hasStoppedSufficiently = false
        continue
      }

      const signedDistance = offset.dot(stopLine.direction)
      const isBefore = signedDistance < 0

      if (isBefore) {
        if (Math.abs(speedKmh) <= STOP_THRESHOLD_KMH) {
          state.stoppedDuration += dt
          if (state.stoppedDuration >= STOP_SUSTAIN_SEC) state.hasStoppedSufficiently = true
        } else {
          state.stoppedDuration = 0
        }
      }

      const crossed = state.wasBefore && !isBefore
      if (crossed) {
        if (stopLine.getPhase) {
          if (stopLine.getPhase() === 'red') events.push('red_light')
        } else if (stopLine.intersection.control === 'stop' && !state.hasStoppedSufficiently) {
          events.push('stop_sign')
        }
        state.stoppedDuration = 0
        state.hasStoppedSufficiently = false
      }

      state.wasBefore = isBefore
    }
  }
}

function normalizeAngle(angle: number): number {
  let a = angle % (Math.PI * 2)
  if (a > Math.PI) a -= Math.PI * 2
  if (a < -Math.PI) a += Math.PI * 2
  return a
}
