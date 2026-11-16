import * as THREE from 'three'
import type { LightPhase } from './SignalController'

const PHASE_COLOR: Record<LightPhase, number> = { green: 0x35d16b, yellow: 0xf2c744, red: 0xe6483c }
const LIT_INTENSITY = 3
const OFF_COLOR = 0x1c1c1c // 消灯時はレンズ地の暗い色（ベースカラーが白のままだとemissiveを足しても目立たない）

/**
 * JapaneseStreetPack TrafficLight.glb（forCar_Green/Red/Yellowの3レンズが同梱）1個ぶんの
 * 点灯制御。SignalController.getPhase()の結果を毎フレーム反映する。
 */
export class SignalHead {
  private readonly lensesByPhase: Record<LightPhase, THREE.MeshStandardMaterial[]>

  constructor(root: THREE.Object3D) {
    this.lensesByPhase = { green: [], yellow: [], red: [] }
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      const name = mesh.name.toLowerCase()
      const phase = (['green', 'yellow', 'red'] as LightPhase[]).find((p) => name.includes(p))
      if (!phase) return
      // 元アセットは3色のレンズが同じマテリアルを共有しているため、個別に光らせられるよう複製する。
      const material = (mesh.material as THREE.MeshStandardMaterial).clone()
      mesh.material = material
      this.lensesByPhase[phase].push(material)
    })
  }

  applyPhase(phase: LightPhase) {
    for (const key of ['green', 'yellow', 'red'] as LightPhase[]) {
      const lit = key === phase
      for (const material of this.lensesByPhase[key]) {
        material.color.setHex(lit ? PHASE_COLOR[key] : OFF_COLOR)
        material.emissive.setHex(lit ? PHASE_COLOR[key] : 0x000000)
        material.emissiveIntensity = lit ? LIT_INTENSITY : 0
      }
    }
  }
}
