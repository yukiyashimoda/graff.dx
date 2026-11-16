import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const MODEL_URL = '/models/RoadUnit.glb'
// タイルによって素のY位置がほぼ0（地面プレーンとほぼ同一平面）になるものがあり、
// 背景の地面Meshとz-fightingして見えなくなるため、常にごくわずか浮かせる。
const TILE_Y_LIFT = 0.15

/** RoadUnit.glbに含まれるタイル名（元Unityアセット JapaneseStreetPack の RoadUnit）。 */
export type RoadTileName =
  | 'Road_TwoLane_10m'
  | 'Road_TwoLane_10m_PedestrianCrossing'
  | 'Road_TwoLane_20m'
  | 'Road_TwoLane_20m_PedestrianCrossing'
  | 'RoadUnit_Corner'
  | 'RoadUnit_Crossroad'
  | 'RoadUnit_T-Junction'
  | 'RoadUnit_T-junction_2'
  | 'RoadUnit_Half_Corner'
  | 'RoadUnit_Half_Crossroad'
  | 'RoadUnit_Half_End'
  | 'RoadUnit_Half_Entrance'
  | 'RoadUnit_Half_Straight'
  | 'RoadUnit_Half_T-junction'

/**
 * JapaneseStreetPackのRoadUnit.glbから、名前つきタイル（各パーツはローカル原点基準）を
 * クローンして配置するためのキット。1タイル＝ショーケース配置だったオブジェクトを
 * そのままグループごと複製し、position/rotationYだけ上書きする。
 */
export class RoadKit {
  private readonly scene: THREE.Group

  static async load(): Promise<RoadKit> {
    const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
      new GLTFLoader().load(MODEL_URL, resolve, undefined, reject)
    })
    return new RoadKit(gltf.scene)
  }

  private constructor(scene: THREE.Group) {
    this.scene = scene
  }

  /** タイルをposition(XZ, Y=0)に置き、rotationYDeg（0/90/180/270を想定）で回転したクローンを返す。 */
  place(name: RoadTileName, position: THREE.Vector3, rotationYDeg = 0): THREE.Object3D {
    const template = this.scene.getObjectByName(name)
    if (!template) throw new Error(`RoadKit: unknown tile "${name}"`)
    const clone = template.clone(true)
    clone.position.set(position.x, TILE_Y_LIFT, position.z)
    clone.rotation.set(0, THREE.MathUtils.degToRad(rotationYDeg), 0)
    return clone
  }
}
