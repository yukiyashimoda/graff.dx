import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export type PropName = 'StreetLight' | 'TrafficLight' | 'TrafficSign' | 'UtilityPole'

const PROP_URLS: Record<PropName, string> = {
  StreetLight: '/models/props/StreetLight.glb',
  TrafficLight: '/models/props/TrafficLight.glb',
  TrafficSign: '/models/props/TrafficSign.glb',
  UtilityPole: '/models/props/UtilityPole.glb',
}

// 元アセットの"...EmissiveMat"系マテリアルは、生FBXインポートのままだと発光設定が失われて
// ただの灰色になる。名前パターンで拾って常時発光させる（ブルームでハローも自動で乗る）。
const EMISSIVE_MATERIAL_PATTERN = /emissive/i
const EMISSIVE_GLOW_COLOR = 0xfff2c8
const EMISSIVE_GLOW_INTENSITY = 3

/** JapaneseStreetPackの小物（街灯・信号機・標識・電柱）を配置するためのキット。 */
export class PropKit {
  private readonly templates: Record<PropName, THREE.Group>

  static async load(): Promise<PropKit> {
    const entries = await Promise.all(
      (Object.keys(PROP_URLS) as PropName[]).map(async (name) => {
        const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
          new GLTFLoader().load(PROP_URLS[name], resolve, undefined, reject)
        })
        applyEmissiveGlow(gltf.scene)
        return [name, gltf.scene] as const
      }),
    )
    return new PropKit(Object.fromEntries(entries) as Record<PropName, THREE.Group>)
  }

  private constructor(templates: Record<PropName, THREE.Group>) {
    this.templates = templates
  }

  place(name: PropName, position: THREE.Vector3, rotationYDeg = 0, scale = 1): THREE.Object3D {
    const clone = this.templates[name].clone(true)
    clone.position.set(position.x, position.y, position.z)
    clone.rotation.set(0, THREE.MathUtils.degToRad(rotationYDeg), 0)
    if (scale !== 1) clone.scale.setScalar(scale)
    return clone
  }
}

function applyEmissiveGlow(scene: THREE.Object3D) {
  const seen = new Set<THREE.Material>()
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial)) continue
      if (seen.has(material) || !EMISSIVE_MATERIAL_PATTERN.test(material.name)) continue
      seen.add(material)
      material.emissive.setHex(EMISSIVE_GLOW_COLOR)
      material.emissiveIntensity = EMISSIVE_GLOW_INTENSITY
    }
  })
}
