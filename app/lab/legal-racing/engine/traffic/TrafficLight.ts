import * as THREE from 'three'

export type LightPhase = 'green' | 'yellow' | 'red'

const DURATIONS: Record<LightPhase, number> = { green: 15, yellow: 3, red: 15 } // 仕様§27
const COLORS: Record<LightPhase, number> = { green: 0x35d16b, yellow: 0xf2c744, red: 0xe6483c }

/** 簡易周期の信号機。仕様§27。常時サイクルする。 */
export class TrafficLight {
  phase: LightPhase = 'green'
  readonly object3D: THREE.Group

  private timer = 0
  private readonly lampMeshes: Record<LightPhase, THREE.Mesh>

  constructor(position: THREE.Vector3, phaseOffset = 0) {
    this.timer = phaseOffset
    const { group, lamps } = buildLightPole()
    group.position.copy(position)
    this.object3D = group
    this.lampMeshes = lamps
    this.applyVisual()
  }

  update(dt: number) {
    this.timer += dt
    const duration = DURATIONS[this.phase]
    if (this.timer < duration) return
    this.timer -= duration
    this.phase = this.phase === 'green' ? 'yellow' : this.phase === 'yellow' ? 'red' : 'green'
    this.applyVisual()
  }

  private applyVisual() {
    for (const key of Object.keys(this.lampMeshes) as LightPhase[]) {
      const material = this.lampMeshes[key].material as THREE.MeshStandardMaterial
      const lit = key === this.phase
      material.emissiveIntensity = lit ? 1.8 : 0
      material.color.setHex(lit ? COLORS[key] : 0x1c1c1c)
    }
  }
}

function buildLightPole(): { group: THREE.Group; lamps: Record<LightPhase, THREE.Mesh> } {
  const group = new THREE.Group()

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x2c2f33, roughness: 0.7 }),
  )
  pole.position.y = 1.6
  group.add(pole)

  // 日本の車両用信号機は横型（円形3灯を水平配置）が標準
  const housing = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.4, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.6 }),
  )
  housing.position.y = 3.6
  group.add(housing)

  const order: LightPhase[] = ['green', 'yellow', 'red'] // 右から赤・黄・青（緑）の配列に対応
  const lamps = {} as Record<LightPhase, THREE.Mesh>
  order.forEach((phase, index) => {
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x1c1c1c, emissive: COLORS[phase], emissiveIntensity: 0 }),
    )
    lamp.position.set(-0.32 + index * 0.32, 3.6, 0.17)
    group.add(lamp)
    lamps[phase] = lamp
  })

  return { group, lamps }
}
