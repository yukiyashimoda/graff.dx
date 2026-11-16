import type { InputState } from '../input/InputManager'

export type TurnSignalSide = 'off' | 'left' | 'right'

const BLINK_INTERVAL = 0.5 // sec（点滅の半周期）
const AUTO_CANCEL_ANGLE = Math.PI * 0.4 // 約72°曲がったら自動解除（仕様§10の簡易版）

/** 仕様§7〜10。交差点の概念がまだないため、自動解除は累積ヨー角のみで判定する。 */
export class TurnSignalController {
  side: TurnSignalSide = 'off'
  blinkOn = false
  onDurationSec = 0 // 現在の状態がONになってからの経過秒数（違反判定§10用）

  private blinkTimer = 0
  private headingAtOn = 0

  update(input: InputState, currentHeading: number, dt: number) {
    this.handleToggle(input, currentHeading)
    this.handleAutoCancel(currentHeading)
    this.advanceBlink(dt)
    this.onDurationSec = this.side === 'off' ? 0 : this.onDurationSec + dt
  }

  private handleToggle(input: InputState, currentHeading: number) {
    if (input.turnSignalLeft) {
      this.side = this.side === 'left' ? 'off' : 'left'
      this.headingAtOn = currentHeading
      this.blinkTimer = 0
      this.blinkOn = true
    } else if (input.turnSignalRight) {
      this.side = this.side === 'right' ? 'off' : 'right'
      this.headingAtOn = currentHeading
      this.blinkTimer = 0
      this.blinkOn = true
    }
  }

  private handleAutoCancel(currentHeading: number) {
    if (this.side === 'off') return
    const delta = normalizeAngle(currentHeading - this.headingAtOn)
    if (this.side === 'left' && delta >= AUTO_CANCEL_ANGLE) this.side = 'off'
    if (this.side === 'right' && delta <= -AUTO_CANCEL_ANGLE) this.side = 'off'
  }

  private advanceBlink(dt: number) {
    if (this.side === 'off') {
      this.blinkOn = false
      this.blinkTimer = 0
      return
    }
    this.blinkTimer += dt
    if (this.blinkTimer >= BLINK_INTERVAL) {
      this.blinkTimer -= BLINK_INTERVAL
      this.blinkOn = !this.blinkOn
    }
  }
}

function normalizeAngle(angle: number): number {
  let a = angle % (Math.PI * 2)
  if (a > Math.PI) a -= Math.PI * 2
  if (a < -Math.PI) a += Math.PI * 2
  return a
}
