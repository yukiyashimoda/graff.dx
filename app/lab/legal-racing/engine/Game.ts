import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { InputManager } from './input/InputManager'
import { PlayerCar } from './player/PlayerCar'
import { City } from './world/City'
import { RuleSystem, type ViolationType } from './rules/RuleSystem'

const VIOLATION_LABELS: Record<ViolationType, string> = {
  speeding: 'SPEEDING',
  red_light: 'RED LIGHT',
  stop_sign: 'STOP SIGN',
  no_turn_signal: 'NO TURN SIGNAL',
  wrong_way: 'WRONG WAY',
}
const VIOLATION_NOTICE_DURATION = 1.6 // sec（仕様§24）

const CAMERA_DISTANCE = 6.5
const CAMERA_HEIGHT = 2.6
const CAMERA_LOOK_AHEAD = 2.0
const CAMERA_FOLLOW_LERP = 4.5 // 大きいほど追従が速い（急激に振らない範囲で）

// ヘッドライト・ブレーキ灯・ウインカーなど発光パーツにハロ（ブルーム）を乗せる。
// thresholdを高めにして、通常のライティングでは光らず発光マテリアルだけがにじむようにする。
const BLOOM_STRENGTH = 1.1
const BLOOM_RADIUS = 0.55
const BLOOM_THRESHOLD = 0.82

// 遠景をふわっとにじませたかったが、BokehPass（被写界深度）はこのシーンで1フレーム350ms前後
// （3fps未満）まで悪化したため撤去した。代わりにFogを近め・濃いめにして、背景が霞んで
// 溶けていくのと似た見え方をほぼノーコストで出す。
const FOG_NEAR = 22
const FOG_FAR = 130

export type GameHudRefs = {
  turnSignalLeftEl?: HTMLElement | null
  turnSignalRightEl?: HTMLElement | null
  violationNoticeEl?: HTMLElement | null
  speedLimitEl?: HTMLElement | null
}

/** Phase 1〜3: Ground + Player Car + Camera + Turn Signals + Roads。仕様§47相当。 */
export class Game {
  private readonly scene = new THREE.Scene()
  private readonly camera: THREE.PerspectiveCamera
  private readonly renderer: THREE.WebGLRenderer
  private readonly composer: EffectComposer
  private readonly clock = new THREE.Clock()
  private readonly input = new InputManager()
  private readonly playerCar = new PlayerCar()
  private readonly city: City
  private readonly ruleSystem: RuleSystem
  private readonly cameraTarget = new THREE.Vector3()
  private frameHandle = 0
  private disposed = false
  private violationNoticeTimer = 0

  constructor(private readonly canvas: HTMLCanvasElement, city: City, private readonly hud: GameHudRefs = {}) {
    this.city = city
    this.ruleSystem = new RuleSystem(this.city, this.playerCar)
    const { clientWidth, clientHeight } = canvas
    this.camera = new THREE.PerspectiveCamera(60, clientWidth / Math.max(1, clientHeight), 0.1, 500)

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(clientWidth, clientHeight, false)

    this.composer = new EffectComposer(this.renderer)
    this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.composer.setSize(clientWidth, clientHeight)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.composer.addPass(
      new UnrealBloomPass(new THREE.Vector2(clientWidth, clientHeight), BLOOM_STRENGTH, BLOOM_RADIUS, BLOOM_THRESHOLD),
    )

    this.buildScene()
    this.playerCar.controller.position.copy(this.city.spawn.position)
    this.playerCar.controller.heading = this.city.spawn.heading
    this.scene.add(this.playerCar.object3D)

    this.input.attach()
    window.addEventListener('resize', this.handleResize)

    this.snapCameraToCar()
    this.frameHandle = requestAnimationFrame(this.tick)
  }

  /** デバッグ用。位置・速度の確認に使う。 */
  debugState() {
    return {
      position: this.playerCar.controller.position.clone(),
      speedKmh: this.playerCar.controller.speedKmh,
      heading: this.playerCar.controller.heading,
    }
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.frameHandle)
    this.input.detach()
    window.removeEventListener('resize', this.handleResize)
    this.composer.dispose()
    this.renderer.dispose()
    this.playerCar.dispose()
  }

  private buildScene() {
    this.scene.background = new THREE.Color(0x0d1420)
    this.scene.fog = new THREE.Fog(0x0d1420, FOG_NEAR, FOG_FAR)

    const hemi = new THREE.HemisphereLight(0x445566, 0x0a0a0a, 0.55)
    this.scene.add(hemi)

    const moon = new THREE.DirectionalLight(0xaec6ff, 0.35)
    moon.position.set(-30, 40, -20)
    this.scene.add(moon)

    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1f26, roughness: 0.95 })
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), groundMaterial)
    ground.rotation.x = -Math.PI / 2
    this.scene.add(ground)

    const grid = new THREE.GridHelper(2000, 200, 0x30435c, 0x222a33)
    this.scene.add(grid)

    this.scene.add(this.city.object3D)
  }

  private handleResize = () => {
    const { clientWidth, clientHeight } = this.canvas
    this.camera.aspect = clientWidth / Math.max(1, clientHeight)
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(clientWidth, clientHeight, false)
    this.composer.setSize(clientWidth, clientHeight)
  }

  private snapCameraToCar() {
    this.updateCameraTarget()
    this.camera.position.copy(this.cameraTarget)
    this.camera.lookAt(this.lookAtPoint())
  }

  private updateCameraTarget() {
    const heading = this.playerCar.controller.heading
    const behind = new THREE.Vector3(-Math.sin(heading), 0, -Math.cos(heading)).multiplyScalar(CAMERA_DISTANCE)
    this.cameraTarget.copy(this.playerCar.controller.position).add(behind)
    this.cameraTarget.y += CAMERA_HEIGHT
  }

  private lookAtPoint(): THREE.Vector3 {
    const heading = this.playerCar.controller.heading
    const ahead = new THREE.Vector3(Math.sin(heading), 0, Math.cos(heading)).multiplyScalar(CAMERA_LOOK_AHEAD)
    return this.playerCar.controller.position.clone().add(ahead).setY(1.0)
  }

  private tick = () => {
    if (this.disposed) return
    const dt = Math.min(this.clock.getDelta(), 0.05)

    const inputState = this.input.poll()
    this.playerCar.update(inputState, dt, (position) => this.city.keepOnRoad(position))
    this.city.update(dt)

    const { violations, speedLimitKmh } = this.ruleSystem.update(dt)
    if (violations.length > 0) this.showViolationNotice(violations[0])
    if (this.hud.speedLimitEl) this.hud.speedLimitEl.textContent = speedLimitKmh !== null ? String(speedLimitKmh) : '--'
    if (this.violationNoticeTimer > 0) {
      this.violationNoticeTimer -= dt
      if (this.violationNoticeTimer <= 0) this.hud.violationNoticeEl?.classList.remove('is-active')
    }

    this.updateCameraTarget()
    this.camera.position.lerp(this.cameraTarget, 1 - Math.exp(-CAMERA_FOLLOW_LERP * dt))
    this.camera.lookAt(this.lookAtPoint())

    this.updateHud()

    this.composer.render()
    this.frameHandle = requestAnimationFrame(this.tick)
  }

  private updateHud() {
    const { side, blinkOn } = this.playerCar.turnSignal
    this.hud.turnSignalLeftEl?.classList.toggle('is-active', side === 'left' && blinkOn)
    this.hud.turnSignalRightEl?.classList.toggle('is-active', side === 'right' && blinkOn)
  }

  private showViolationNotice(type: ViolationType) {
    const el = this.hud.violationNoticeEl
    if (!el) return
    el.textContent = VIOLATION_LABELS[type]
    el.classList.add('is-active')
    this.violationNoticeTimer = VIOLATION_NOTICE_DURATION
  }
}
