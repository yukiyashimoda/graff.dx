import * as THREE from 'three'
import type { InputState } from '../input/InputManager'

/** Arcade + Weight方式の簡易車両モデル。本格シミュレーションはしない（仕様§31）。 */
export class VehicleController {
  // 実際のスポーン位置・向きはCity.spawn（Lane中央）からGameが上書きする（仕様v2 §43 Single Source of Truth）
  position = new THREE.Vector3(0, 0, 0)
  heading = 0 // ラジアン。0 = +Z方向を向く
  speedKmh = 0 // 符号付き。前進が正、後退が負

  private steerInputSmoothed = 0 // -1(右)〜1(左)。タップ操作を穏やかにするための現在値

  private readonly maxSpeedKmh = 120
  private readonly reverseMaxSpeedKmh = 25
  private readonly accel = 18 // km/h per sec
  private readonly brakeDecel = 60 // km/h per sec
  private readonly coastDecel = 10 // km/h per sec（惰性の自然減速）
  private readonly reverseAccel = 14 // km/h per sec
  private readonly crawlSpeedKmh = 8 // W+Space同時押し時の徐行速度
  private readonly crawlAdjustRate = 20 // km/h per sec（徐行速度への収束の速さ）
  private readonly maxSteerRate = 1.6 // rad/sec（低速時の最大旋回角速度）
  private readonly steerRampRate = 3.5 // /sec（ステア入力が最大まで立ち上がる速さ。約0.3秒でフルロック）
  private readonly nearStopThresholdKmh = 3 // これ以下ならReverse開始可能とみなす

  update(input: InputState, dt: number) {
    this.applyLongitudinal(input, dt)
    this.applySteering(input, dt)
    this.integratePosition(dt)
  }

  private applyLongitudinal(input: InputState, dt: number) {
    if (input.brake && input.throttle) {
      // 徐行：アクセルとブレーキの同時押しで低速クロールへ収束させる
      this.speedKmh = moveToward(this.speedKmh, this.crawlSpeedKmh, this.crawlAdjustRate * dt)
      return
    }

    if (input.brake) {
      this.speedKmh = moveToward(this.speedKmh, 0, this.brakeDecel * dt)
      return
    }

    if (input.throttle) {
      this.speedKmh = Math.min(this.maxSpeedKmh, this.speedKmh + this.accel * dt)
      return
    }

    if (input.reverse) {
      const canReverse = Math.abs(this.speedKmh) <= this.nearStopThresholdKmh || this.speedKmh < 0
      if (canReverse) {
        this.speedKmh = Math.max(-this.reverseMaxSpeedKmh, this.speedKmh - this.reverseAccel * dt)
        return
      }
    }

    // 何も入力がなければ自然に減速する
    this.speedKmh = moveToward(this.speedKmh, 0, this.coastDecel * dt)
  }

  private applySteering(input: InputState, dt: number) {
    const targetSteerInput = (input.steerLeft ? 1 : 0) - (input.steerRight ? 1 : 0)
    this.steerInputSmoothed = moveToward(this.steerInputSmoothed, targetSteerInput, this.steerRampRate * dt)
    if (this.steerInputSmoothed === 0 || this.speedKmh === 0) return

    // 速度が上がるほど旋回はマイルドにする（アーケード的な安定感のため）
    const speedFactor = THREE.MathUtils.clamp(1 - Math.abs(this.speedKmh) / this.maxSpeedKmh, 0.35, 1)
    const direction = this.speedKmh >= 0 ? 1 : -1
    this.heading += this.steerInputSmoothed * this.maxSteerRate * speedFactor * direction * dt
  }

  private integratePosition(dt: number) {
    const speedMps = (this.speedKmh * 1000) / 3600
    const forward = new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading))
    this.position.addScaledVector(forward, speedMps * dt)
  }
}

function moveToward(current: number, target: number, maxDelta: number): number {
  if (Math.abs(target - current) <= maxDelta) return target
  return current + Math.sign(target - current) * maxDelta
}
