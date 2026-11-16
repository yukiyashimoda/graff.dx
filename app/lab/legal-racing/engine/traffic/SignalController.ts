export type LightPhase = 'green' | 'yellow' | 'red'
export type SignalGroup = 'through' | 'branch'

type Step = { through: LightPhase; branch: LightPhase; duration: number }

/**
 * T字路用の2方向（通過側／分岐側）信号サイクル。互いに素な状態遷移のみを列挙するため、
 * 独立タイマーのオフセット合わせと違い「両方が青（または黄）になる」ケースが構造的に起きない。
 * 全赤のクリアランス区間を挟むことで、切り替わり直後に両方赤で安全に空く時間も確保する。
 */
const SEQUENCE: Step[] = [
  { through: 'green', branch: 'red', duration: 14 },
  { through: 'yellow', branch: 'red', duration: 3 },
  { through: 'red', branch: 'red', duration: 2 },
  { through: 'red', branch: 'green', duration: 10 },
  { through: 'red', branch: 'yellow', duration: 3 },
  { through: 'red', branch: 'red', duration: 2 },
]

export class SignalController {
  private index = 0
  private timer: number

  constructor(startOffsetSec = 0) {
    this.timer = startOffsetSec
  }

  update(dt: number) {
    this.timer += dt
    while (this.timer >= SEQUENCE[this.index].duration) {
      this.timer -= SEQUENCE[this.index].duration
      this.index = (this.index + 1) % SEQUENCE.length
    }
  }

  getPhase(group: SignalGroup): LightPhase {
    return SEQUENCE[this.index][group]
  }
}
