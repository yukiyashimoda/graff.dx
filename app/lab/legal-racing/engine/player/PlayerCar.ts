import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VehicleController } from './VehicleController'
import { TurnSignalController } from './TurnSignalController'
import type { InputState } from '../input/InputManager'

const TURN_EMISSIVE_COLOR = 0xffaa33
const BRAKE_EMISSIVE_COLOR = 0xff2020
const HEADLIGHT_EMISSIVE_COLOR = 0xfff2c8
const TURN_EMISSIVE_INTENSITY = 1.4
const BRAKE_EMISSIVE_INTENSITY = 1.4
const HEADLIGHT_EMISSIVE_INTENSITY = 4
const HEADLIGHT_SPOT_COLOR = 0xfff6da
const HEADLIGHT_SPOT_INTENSITY = 55
const HEADLIGHT_SPOT_DISTANCE = 34
const HEADLIGHT_SPOT_ANGLE = Math.PI / 6
const HEADLIGHT_SPOT_PENUMBRA = 0.5
// "Stops"パーツの上から何割をウインカー（オレンジ）領域とみなすか。実車の写真参照で
// 上段が細いオレンジ帯、下段が赤（＋反射板）という構成だったため上30%を切り出す。
const STOPS_TURN_SIGNAL_HEIGHT_FRACTION = 0.7

/** 車体の全長（スズキ・キャリイ実車相当）。停止線判定の「前端」算出にも使う（仕様v3 §9）。 */
export const CAR_LENGTH = 3.4

const MODEL_URL = '/models/suzuki_carry_minivan.glb'
// ヘッドライト／テールランプのワールド座標から実測した補正角。これを掛けるとモデルの前面が
// ちょうどこのゲームの前方(+Z)を向く（見た目だけで判断せず、パーツ位置から算出した値）。
const MODEL_FORWARD_CORRECTION_Y = Math.PI / 4

/** 実車モデル（GLB）を非同期ロードし、届くまではPrimitive Geometryの仮モデルを表示する。 */
export class PlayerCar {
  readonly object3D: THREE.Group
  readonly controller = new VehicleController()
  readonly turnSignal = new TurnSignalController()

  private placeholderBody: THREE.Group | null
  // 実車モデル自身のライトパーツ（前面"Signal"・後面"Stops"）のマテリアルを直接点滅させる。
  // 位置合わせ用の別パーツは置かない（車体に貼り付けた偽物のランプは廃止した）。
  private turnSignalMaterials: { left: THREE.MeshStandardMaterial[]; right: THREE.MeshStandardMaterial[] } = {
    left: [],
    right: [],
  }
  private brakeMaterials: THREE.MeshStandardMaterial[] = []
  // 開発中のHMRでuseEffectが後始末なしに再実行されるケースがあり、破棄済みの古いPlayerCarの
  // GLTFLoaderが後から完了して二重にパーツを追加してしまう事故が実際に起きた。dispose()済みなら
  // 読み込み完了後の処理を一切行わないようにする。
  private disposed = false

  constructor() {
    const { group, placeholderBody } = buildPlaceholderMesh()
    this.object3D = group
    this.placeholderBody = placeholderBody
    this.loadModel()
  }

  dispose() {
    this.disposed = true
  }

  private loadModel() {
    new GLTFLoader().load(
      MODEL_URL,
      (gltf) => {
        if (this.disposed) return
        const model = gltf.scene
        model.rotateY(MODEL_FORWARD_CORRECTION_Y)
        hideBrokenParts(model)
        model.updateMatrixWorld(true)

        const rawSize = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3())
        const scale = CAR_LENGTH / rawSize.z
        model.scale.setScalar(scale)
        model.updateMatrixWorld(true)

        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.x -= center.x
        model.position.z -= center.z
        model.position.y -= box.min.y // 車輪が接地するようY方向のオフセットを調整
        model.updateMatrixWorld(true)

        // "Signal"（前面）・"Stops"（後面）とも、左右のパーツが1メッシュにまとまっている
        // （実測: X軸のプラス側とマイナス側の両方にまたがる1つのジオメトリ）ため、
        // ワールドX=0（車体中心線）でさらに左右に分割し、片側だけ独立して点灯できるようにする。
        const signalMesh = findMesh(model, 'Signal')
        if (signalMesh) {
          const { left, right } = splitMeshByWorldAxis(signalMesh, 'x', 0)
          signalMesh.parent?.add(left, right)
          signalMesh.removeFromParent()
          this.turnSignalMaterials.left.push(left.material as THREE.MeshStandardMaterial)
          this.turnSignalMaterials.right.push(right.material as THREE.MeshStandardMaterial)
        }

        // "Stops"は1メッシュの中に上段（ウインカー用オレンジ）・下段（ブレーキ用赤＋反射板）が
        // ひとつながりのジオメトリとして含まれている（テクスチャなし、単色白マテリアル）。
        // まず高さで上下に分け、上側（ウインカー）はさらに左右にも分割する。
        // ブレーキ（下側）は実車同様、左右まとめて連動でよいため分割しない。
        const stopsMesh = findMesh(model, 'Stops')
        if (stopsMesh) {
          const stopsParent = stopsMesh.parent
          const { upper, lower } = splitMeshByWorldAxis(stopsMesh, 'y', stopsHeightThreshold(stopsMesh))
          // upperをさらに左右へ割るには正しいmatrixWorldが要る。一旦同じ親に加えてから分割する。
          stopsParent?.add(upper)
          upper.updateMatrixWorld(true)
          const { left: upperLeft, right: upperRight } = splitMeshByWorldAxis(upper, 'x', 0)
          upper.removeFromParent()
          stopsParent?.add(upperLeft, upperRight, lower)
          stopsMesh.removeFromParent()
          this.turnSignalMaterials.left.push(upperLeft.material as THREE.MeshStandardMaterial)
          this.turnSignalMaterials.right.push(upperRight.material as THREE.MeshStandardMaterial)
          this.brakeMaterials = [lower.material as THREE.MeshStandardMaterial]
        }

        // ヘッドライトは常時点灯。レンズ自体を発光させる（ブルームでハロが乗る）のに加え、
        // 実際に前方を照らすSpotLightも同じ位置から追加する。
        const headlightsMesh = findMesh(model, 'Headlights')
        if (headlightsMesh) {
          const material = headlightsMesh.material as THREE.MeshStandardMaterial
          applyGlow(material, true, HEADLIGHT_EMISSIVE_COLOR, HEADLIGHT_EMISSIVE_INTENSITY)
          const box = new THREE.Box3().setFromObject(headlightsMesh)
          const center = box.getCenter(new THREE.Vector3())
          this.addHeadlightSpotlight(center)
        }

        this.object3D.add(model)
        if (this.placeholderBody) {
          this.object3D.remove(this.placeholderBody)
          this.placeholderBody = null
        }
      },
      undefined,
      (error) => {
        console.error('Failed to load car model, keeping placeholder box', error)
      },
    )
  }

  update(input: InputState, dt: number, constrainPosition?: (position: THREE.Vector3) => THREE.Vector3) {
    this.controller.update(input, dt)
    this.turnSignal.update(input, this.controller.heading, dt)

    if (constrainPosition) this.controller.position.copy(constrainPosition(this.controller.position))

    this.object3D.position.copy(this.controller.position)
    this.object3D.rotation.y = this.controller.heading

    this.syncLights(input.brake)
  }

  /**
   * "Headlights"パーツのワールド中心(centerはthis.object3D基準のローカル座標)から、
   * その位置が原点からオフセットしている向き（＝車体前方）へさらに伸ばした点をターゲットにして
   * SpotLightを1つ追加する。前方の符号をモデルごとに決め打ちしない（モデル差し替えに強くするため）。
   */
  private addHeadlightSpotlight(center: THREE.Vector3) {
    const forwardSign = Math.sign(center.z) || 1
    const light = new THREE.SpotLight(
      HEADLIGHT_SPOT_COLOR,
      HEADLIGHT_SPOT_INTENSITY,
      HEADLIGHT_SPOT_DISTANCE,
      HEADLIGHT_SPOT_ANGLE,
      HEADLIGHT_SPOT_PENUMBRA,
    )
    light.position.copy(center)
    this.object3D.add(light)

    const target = new THREE.Object3D()
    target.position.set(center.x, Math.max(0, center.y - 1.5), center.z + forwardSign * 15)
    this.object3D.add(target)
    light.target = target
  }

  private syncLights(braking: boolean) {
    const leftOn = this.turnSignal.side === 'left' && this.turnSignal.blinkOn
    const rightOn = this.turnSignal.side === 'right' && this.turnSignal.blinkOn
    for (const material of this.turnSignalMaterials.left) {
      applyGlow(material, leftOn, TURN_EMISSIVE_COLOR, TURN_EMISSIVE_INTENSITY)
    }
    for (const material of this.turnSignalMaterials.right) {
      applyGlow(material, rightOn, TURN_EMISSIVE_COLOR, TURN_EMISSIVE_INTENSITY)
    }
    // "Stops"下段はブレーキとテールランプを兼ねる後面パーツ。左右は分割していない。
    for (const material of this.brakeMaterials) {
      applyGlow(material, braking, BRAKE_EMISSIVE_COLOR, BRAKE_EMISSIVE_INTENSITY)
    }
  }
}

// この配布モデル（Sketchfab, 3ds由来）は一部のノードの座標が壊れており、車体から離れた場所に
// 浮いて表示される。Blenderに読み込み、パーツを1つずつ赤くハイライトして実際にレンダリングし、
// 視覚的に特定した（名前からの推測ではない）。
//   - "_Front_Li0"      : 車体前方に浮いていた棒状のパーツ
//   - "Back_Door_"      : ナンバープレート本体（テールゲート本体の"Back__Door"とはアンダースコアの
//                          数が違う別グループなので要注意。誤って正規のテールゲートを消さないこと）
//   - "S_Logo_LB*"       : SUZUKIバッジ×4。実測でX=3.33m（本来0.1m未満のはず）まで飛んでいた個体を確認
// visible=falseではなくシーングラフから物理的に削除する（描画・Box3計算の両方から確実に除外するため）。
const BROKEN_PART_NAME_PATTERNS = ['front_li', 'back_door_', 's_logo']

function hideBrokenParts(model: THREE.Object3D) {
  const toRemove: THREE.Object3D[] = []
  model.traverse((obj) => {
    const name = obj.name.toLowerCase()
    if (BROKEN_PART_NAME_PATTERNS.some((pattern) => name.includes(pattern))) {
      toRemove.push(obj)
    }
  })
  for (const obj of toRemove) obj.removeFromParent()
}

function findMesh(model: THREE.Object3D, partName: string): THREE.Mesh | null {
  const ref = model.getObjectByName(partName)
  if (!ref) return null
  let found: THREE.Mesh | null = null
  ref.traverse((child) => {
    if (!found && child instanceof THREE.Mesh) found = child
  })
  return found
}

/** "Stops"の上30%をウインカー（オレンジ）領域とみなすための、ワールドY方向のしきい値を求める。 */
function stopsHeightThreshold(mesh: THREE.Mesh): number {
  mesh.updateMatrixWorld(true)
  const worldBox = new THREE.Box3().setFromObject(mesh)
  return worldBox.min.y + (worldBox.max.y - worldBox.min.y) * STOPS_TURN_SIGNAL_HEIGHT_FRACTION
}

/**
 * 1枚のメッシュを、ワールド空間での指定軸の座標をしきい値で三角形単位に2分割する。
 * テクスチャもUVも持たない単色パーツで、領域ごとに別の色（ウインカーのオレンジ／
 * ブレーキの赤、あるいは左右）に光らせる必要があるが物理的に1メッシュしか存在しないため、
 * ジオメトリそのものを分割して独立制御できるようにする。
 * ローカル座標ではなくワールド座標を使う点が重要：このモデルは3ds由来の入れ子transform
 * （"3DSMeshMatrix"系ノード）を経由しており、パーツごとのローカル軸が実際の上下・左右と
 * 一致していない（ローカルYで上下分割したところ左右に割れてしまうことを実測で確認した）。
 * positiveは軸のプラス側（'x'なら仕様v2 §2で確立した左側、'y'なら上側）。
 */
function splitMeshByWorldAxis(
  mesh: THREE.Mesh,
  axis: 'x' | 'y',
  threshold: number,
): { left: THREE.Mesh; right: THREE.Mesh; upper: THREE.Mesh; lower: THREE.Mesh } {
  mesh.updateMatrixWorld(true)

  const geometry = mesh.geometry as THREE.BufferGeometry
  const position = geometry.getAttribute('position')
  const index = geometry.getIndex()
  const triangleCount = index ? index.count / 3 : position.count / 3
  const positiveIndices: number[] = []
  const negativeIndices: number[] = []
  const v = new THREE.Vector3()
  const worldAxisValue = (i: number): number => {
    v.fromBufferAttribute(position, i)
    return mesh.localToWorld(v)[axis]
  }

  for (let t = 0; t < triangleCount; t++) {
    const a = index ? index.getX(t * 3) : t * 3
    const b = index ? index.getX(t * 3 + 1) : t * 3 + 1
    const c = index ? index.getX(t * 3 + 2) : t * 3 + 2
    const avg = (worldAxisValue(a) + worldAxisValue(b) + worldAxisValue(c)) / 3
    ;(avg >= threshold ? positiveIndices : negativeIndices).push(a, b, c)
  }

  const buildPart = (indices: number[]): THREE.Mesh => {
    const partGeometry = geometry.clone()
    partGeometry.setIndex(indices)
    const partMesh = new THREE.Mesh(partGeometry, (mesh.material as THREE.MeshStandardMaterial).clone())
    partMesh.position.copy(mesh.position)
    partMesh.rotation.copy(mesh.rotation)
    partMesh.scale.copy(mesh.scale)
    return partMesh
  }

  const positive = buildPart(positiveIndices)
  const negative = buildPart(negativeIndices)
  return { left: positive, right: negative, upper: positive, lower: negative }
}

/**
 * ベースカラーは変更せず、emissiveだけ足す。ベースカラー自体を塗り替えると（以前の実装の
 * 問題点）パーツ内の他の色（例：ブレーキランプの赤とウインカーの黄が同じパーツ内にある場合）
 * まで塗りつぶしてしまうため、常時emissiveIntensity=0⇔点灯時の値、の切り替えのみ行う。
 */
function applyGlow(material: THREE.MeshStandardMaterial, on: boolean, color: number, intensity: number) {
  material.emissive.setHex(on ? color : 0x000000)
  material.emissiveIntensity = on ? intensity : 0
}

function buildPlaceholderMesh(): { group: THREE.Group; placeholderBody: THREE.Group } {
  const group = new THREE.Group()

  // 実車モデルの読み込みが終わり次第、まとめて取り除けるようサブグループにする。
  const placeholderBody = new THREE.Group()
  group.add(placeholderBody)

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3b4a5a, roughness: 0.55, metalness: 0.2 })
  const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0x1c232c, roughness: 0.4, metalness: 0.1 })

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.55, CAR_LENGTH), bodyMaterial)
  body.position.y = 0.45
  placeholderBody.add(body)

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.45, 2.1), cabinMaterial)
  cabin.position.set(0, 0.92, -0.15)
  placeholderBody.add(cabin)

  const headlightMaterial = new THREE.MeshStandardMaterial({ color: 0xfff2c8, emissive: 0xfff2c8, emissiveIntensity: 1.2 })
  const tailLightMaterial = new THREE.MeshStandardMaterial({ color: 0xff2c2c, emissive: 0xff2c2c, emissiveIntensity: 1.2 })

  for (const side of [-1, 1] as const) {
    const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.08), headlightMaterial)
    headlight.position.set(side * 0.58, 0.5, -1.98)
    placeholderBody.add(headlight)

    const tailLight = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.08), tailLightMaterial)
    tailLight.position.set(side * 0.58, 0.5, 1.98)
    placeholderBody.add(tailLight)
  }

  return { group, placeholderBody }
}
