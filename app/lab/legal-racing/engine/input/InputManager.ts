export type InputState = {
  throttle: boolean // W
  steerLeft: boolean // A
  steerRight: boolean // D
  brake: boolean // Space
  reverse: boolean // S
  turnSignalLeft: boolean // ArrowLeft (edge-triggered, consumed by caller)
  turnSignalRight: boolean // ArrowRight (edge-triggered, consumed by caller)
}

const CODE_MAP: Record<string, keyof InputState> = {
  KeyW: 'throttle',
  KeyA: 'steerLeft',
  KeyD: 'steerRight',
  Space: 'brake',
  KeyS: 'reverse',
  ArrowLeft: 'turnSignalLeft',
  ArrowRight: 'turnSignalRight',
}

/** キーボード入力を保持する。◀︎▶︎は押した瞬間だけtrueになるedgeキューとして別管理。 */
export class InputManager {
  private held: Record<string, boolean> = {}
  private pressedThisFrame = new Set<keyof InputState>()

  private onKeyDown = (event: KeyboardEvent) => {
    const key = CODE_MAP[event.code]
    if (!key) return
    event.preventDefault()
    if (!this.held[event.code]) {
      if (key === 'turnSignalLeft' || key === 'turnSignalRight') this.pressedThisFrame.add(key)
    }
    this.held[event.code] = true
  }

  private onKeyUp = (event: KeyboardEvent) => {
    if (!CODE_MAP[event.code]) return
    event.preventDefault()
    this.held[event.code] = false
  }

  attach() {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  detach() {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  }

  /** その1フレームぶんの入力を取得し、edgeキューを消費する。 */
  poll(): InputState {
    const state: InputState = {
      throttle: Boolean(this.held.KeyW),
      steerLeft: Boolean(this.held.KeyA),
      steerRight: Boolean(this.held.KeyD),
      brake: Boolean(this.held.Space),
      reverse: Boolean(this.held.KeyS),
      turnSignalLeft: this.pressedThisFrame.has('turnSignalLeft'),
      turnSignalRight: this.pressedThisFrame.has('turnSignalRight'),
    }
    this.pressedThisFrame.clear()
    return state
  }
}
