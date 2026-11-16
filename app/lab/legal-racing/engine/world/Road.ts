import * as THREE from 'three'
import { deriveCenterLineType, type CenterLineType, type Lane } from './road/types'

const ASPHALT_COLOR = 0x2a2e33
const LINE_COLOR: Record<CenterLineType['color'], number> = { WHITE: 0xe8e8e2, YELLOW: 0xf0b400 }
const SIGN_POLE_COLOR = 0x888888
const SIGN_DISC_COLOR = 0x1a5fb4
const SIGN_ARROW_COLOR = 0xffffff
const DASH_LENGTH = 3
const DASH_GAP = 3

/** position(a→b)上でpositionに最も近い点を返す（線分内にクランプ）。 */
function closestPointOnSegment(position: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3): THREE.Vector3 {
  const segment = b.clone().sub(a)
  const segmentLengthSq = segment.lengthSq()
  const toPosition = position.clone().sub(a)
  const t = segmentLengthSq === 0 ? 0 : THREE.MathUtils.clamp(toPosition.dot(segment) / segmentLengthSq, 0, 1)
  return a.clone().addScaledVector(segment, t)
}

/**
 * 直線道路セグメント（仕様v2 RoadSegment相当、Stage 1は直線のみ対応）。
 * 車線位置は必ずこのSegmentの進行方向ベクトルから左側通行になるよう算出する
 * （World座標のX/Zで固定的に左右を決めない：仕様v2 §2, §6）。
 */
export class Road {
  readonly id: string
  readonly object3D: THREE.Group
  readonly start: THREE.Vector3
  readonly end: THREE.Vector3
  readonly width: number
  readonly length: number
  readonly speedLimitKmh: number
  readonly oneWay: boolean
  /** このRoadSegmentの基準進行方向（start→end）。各Laneは個別に実際の進行方向を持つ。 */
  readonly direction: THREE.Vector3
  /** directionから見た左方向。車線オフセットは必ずこれを基準に計算する。 */
  readonly left: THREE.Vector3
  readonly centerLine: CenterLineType | null
  readonly lanes: Lane[]

  constructor(start: THREE.Vector3, end: THREE.Vector3, width = 12, speedLimitKmh = 40, oneWay = false) {
    this.id = `${start.x},${start.z}->${end.x},${end.z}`
    this.start = start.clone()
    this.end = end.clone()
    this.width = width
    this.length = start.distanceTo(end)
    this.speedLimitKmh = speedLimitKmh
    this.oneWay = oneWay
    this.direction = this.end.clone().sub(this.start).normalize()
    this.left = new THREE.Vector3(0, 1, 0).cross(this.direction).normalize()
    // 対向車線が存在しない一方通行の道路には中央線を引かない（仕様v2 §7）。
    this.centerLine = oneWay ? null : deriveCenterLineType(width, false)
    this.lanes = this.buildLanes()
    this.object3D = this.buildMesh()
  }

  /** start→endの正規化された進行方向。一方通行の「正しい向き」判定に使う。 */
  forwardDirection(): THREE.Vector3 {
    return this.direction.clone()
  }

  /** position(XZ)から道路中心線までの最近接点と距離（ソフトガードレール用、車線は区別しない）。 */
  closestPointAndDistance(position: THREE.Vector3): { point: THREE.Vector3; distance: number } {
    const point = closestPointOnSegment(position, this.start, this.end)
    const distance = Math.hypot(position.x - point.x, position.z - point.z)
    return { point, distance }
  }

  /**
   * 交差点手前で止めた区画線の端点と、そこでの接線（角を丸めるCornerCurve接続用：仕様v2 §20）。
   * nearStart=trueならstart側の端点、falseならend側。tangentは直線区画線と同じ向き（角へ向かう側）。
   */
  private markingEndpoint(nearStart: boolean, lateralOffset: number): { point: THREE.Vector3; tangent: THREE.Vector3; roadId: string } {
    const clearance = this.width / 2 + 0.6
    const alongDistance = nearStart ? clearance : this.length - clearance
    const point = this.start
      .clone()
      .addScaledVector(this.direction, alongDistance)
      .addScaledVector(this.left, lateralOffset)
    const tangent = nearStart ? this.direction.clone().negate() : this.direction.clone()
    return { point, tangent, roadId: this.id }
  }

  edgeLineEndpoint(nearStart: boolean, side: 1 | -1): { point: THREE.Vector3; tangent: THREE.Vector3; roadId: string } {
    return this.markingEndpoint(nearStart, side * (this.width / 2 - 0.35))
  }

  /** 中央線がある道路のみ端点を返す（一方通行はnull＝カーブでの接続対象外）。 */
  centerLineEndpoint(nearStart: boolean): { point: THREE.Vector3; tangent: THREE.Vector3; roadId: string } | null {
    if (!this.centerLine) return null
    return this.markingEndpoint(nearStart, 0)
  }

  /** position(XZ)に最も近いLaneと距離を返す（車線ベースの逆走判定用：仕様v2 §6）。 */
  nearestLane(position: THREE.Vector3): { lane: Lane; distance: number } | null {
    let nearest: { lane: Lane; distance: number } | null = null
    for (const lane of this.lanes) {
      const point = closestPointOnSegment(position, lane.centerPath.v1, lane.centerPath.v2)
      const distance = Math.hypot(position.x - point.x, position.z - point.z)
      if (!nearest || distance < nearest.distance) nearest = { lane, distance }
    }
    return nearest
  }

  /** 各方向グループの車線を、Segmentのdirection/leftを基準に算出する（World座標の左右で固定しない）。 */
  private buildLanes(): Lane[] {
    const forwardCount = 1
    const backwardCount = this.oneWay ? 0 : 1
    const lanes: Lane[] = []

    const addGroup = (isForward: boolean, count: number) => {
      if (count === 0) return
      const direction = isForward ? this.direction.clone() : this.direction.clone().negate()
      const sign = isForward ? 1 : -1
      // 対向車線がある場合、各方向は道幅の半分（中央線から自分側）を占有する（左側通行の絶対条件）。
      // 一方通行の場合は対向車線が存在しないため、道幅全体を使って左右に車線を並べる。
      const groupWidth = this.oneWay ? this.width : this.width / 2
      const laneWidth = groupWidth / count

      for (let indexFromLeft = 0; indexFromLeft < count; indexFromLeft++) {
        const offset = this.oneWay
          ? -this.width / 2 + laneWidth * (indexFromLeft + 0.5)
          : sign * laneWidth * (count - 1 - indexFromLeft + 0.5)

        const fromPoint = this.start.clone().addScaledVector(this.left, offset)
        const toPoint = this.end.clone().addScaledVector(this.left, offset)
        const [laneStart, laneEnd] = isForward ? [fromPoint, toPoint] : [toPoint, fromPoint]

        lanes.push({
          id: `${this.id}#${isForward ? 'F' : 'B'}${indexFromLeft}`,
          roadId: this.id,
          direction,
          indexFromLeft,
          allowedDirections: ['STRAIGHT'],
          laneChangeLeft: false,
          laneChangeRight: false,
          speedLimit: this.speedLimitKmh,
          centerPath: new THREE.LineCurve3(laneStart, laneEnd),
        })
      }
    }

    addGroup(true, forwardCount)
    addGroup(false, backwardCount)

    return lanes
  }

  private buildMesh(): THREE.Group {
    const group = new THREE.Group()
    const mid = this.start.clone().add(this.end).multiplyScalar(0.5)
    const angle = Math.atan2(this.end.x - this.start.x, this.end.z - this.start.z)

    const surface = new THREE.Mesh(
      new THREE.PlaneGeometry(this.width, this.length),
      new THREE.MeshStandardMaterial({ color: ASPHALT_COLOR, roughness: 0.9 }),
    )
    surface.rotation.x = -Math.PI / 2
    surface.rotation.z = -angle
    surface.position.set(mid.x, 0.02, mid.z)
    group.add(surface)

    // 区画線は交差点の手前で止める（実際の道路標示は交差点内を横切らない）。
    // startとendは常に交差点の中心と一致するため、道幅の半分＋余白を両端から差し引く。
    const clearance = this.width / 2 + 0.6
    const markingLength = Math.max(0, this.length - clearance * 2)

    if (markingLength > 0) {
      if (this.centerLine) {
        this.addStripedLine(group, mid, angle, 0, markingLength, this.centerLine.color, this.centerLine.style)
      }
      this.addEdgeLines(group, mid, angle, markingLength)
    }

    if (this.oneWay) this.addOneWaySign(group)

    return group
  }

  /** 路側帯の白線。中央線の有無に関わらず、道路の両端には常に引く（交差点の手前で止める）。 */
  private addEdgeLines(group: THREE.Group, mid: THREE.Vector3, angle: number, markingLength: number) {
    const offset = this.width / 2 - 0.35
    for (const side of [1, -1]) {
      this.addStripedLine(group, mid, angle, side * offset, markingLength, 'WHITE', 'SOLID')
    }
  }

  /** 実線または破線の道路標示を1本追加する。offsetはleft方向のオフセット。 */
  private addStripedLine(
    group: THREE.Group,
    mid: THREE.Vector3,
    angle: number,
    offset: number,
    markingLength: number,
    color: CenterLineType['color'],
    style: CenterLineType['style'],
  ) {
    const material = new THREE.MeshStandardMaterial({ color: LINE_COLOR[color], roughness: 0.6 })
    const center = mid.clone().addScaledVector(this.left, offset)

    if (style === 'SOLID') {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.15, markingLength), material)
      line.rotation.x = -Math.PI / 2
      line.rotation.z = -angle
      line.position.set(center.x, 0.03, center.z)
      group.add(line)
      return
    }

    const period = DASH_LENGTH + DASH_GAP
    const dashCount = Math.max(1, Math.floor(markingLength / period))
    for (let i = 0; i < dashCount; i++) {
      const dashCenterOffset = -markingLength / 2 + i * period + DASH_LENGTH / 2
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.15, DASH_LENGTH), material)
      dash.rotation.x = -Math.PI / 2
      dash.rotation.z = -angle
      const dashCenter = center.clone().addScaledVector(this.direction, dashCenterOffset)
      dash.position.set(dashCenter.x, 0.03, dashCenter.z)
      group.add(dash)
    }
  }

  /** 一方通行の入口に立てる標識（青い円形に白矢印）。路面標示ではなく実際の道路と同じ標識で示す。 */
  private addOneWaySign(group: THREE.Group) {
    const base = this.start.clone().addScaledVector(this.left, this.width / 2 + 1.2)
    // 進入してくる車から見えるよう、標識面は進行方向と逆向き（手前）を向く
    const facing = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), this.direction.clone().negate())

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8),
      new THREE.MeshStandardMaterial({ color: SIGN_POLE_COLOR, roughness: 0.5 }),
    )
    pole.position.set(base.x, 1.2, base.z)
    group.add(pole)

    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(0.5, 24),
      new THREE.MeshStandardMaterial({ color: SIGN_DISC_COLOR, roughness: 0.4 }),
    )
    disc.quaternion.copy(facing)
    disc.position.set(base.x, 2.5, base.z)
    group.add(disc)

    const arrow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.66, 0.14),
      new THREE.MeshStandardMaterial({ color: SIGN_ARROW_COLOR, roughness: 0.4 }),
    )
    arrow.quaternion.copy(facing)
    arrow.position.set(base.x, 2.5, base.z)
    arrow.translateZ(0.01) // ディスクとのZファイティング防止
    group.add(arrow)
  }
}
