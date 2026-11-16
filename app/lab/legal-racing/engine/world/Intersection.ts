import * as THREE from 'three'
import { TrafficLight } from '../traffic/TrafficLight'
import type { LightPhase } from '../traffic/SignalController'

const ASPHALT_COLOR = 0x2a2e33
const STOP_LINE_COLOR = 0xe8e8e2
const CROSSWALK_BAR_COUNT = 5
const CROSSWALK_BAR_WIDTH = 0.5
const CROSSWALK_GAP = 0.5

export type IntersectionControl = 'none' | 'light' | 'stop'

/**
 * 停止線（ゲームロジック用データ）。仕様v3 §10-11: 判定は信号機の位置ではなく、
 * このStopLineをプレイヤー車両の前端が通過したかどうかを基準にする。
 * directionはこの線を「越えて交差点へ進む」正しい進行方向。
 */
export type StopLine = {
  id: string
  position: THREE.Vector3
  direction: THREE.Vector3
  width: number
  intersection: Intersection
  /** SignalControllerと連動する信号がある場合のみ設定。赤信号無視判定はこれを優先する。 */
  getPhase?: () => LightPhase
}

/** point-in-polygon（レイキャスト法）。polygonはローカルXZ座標の配列。 */
function pointInPolygon(x: number, z: number, polygon: [number, number][]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, zi] = polygon[i]
    const [xj, zj] = polygon[j]
    const intersect = zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

/** 点から多角形の輪郭までの最短距離（margin判定用）。 */
function distanceToPolygonBoundary(x: number, z: number, polygon: [number, number][]): number {
  let min = Infinity
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, zi] = polygon[i]
    const [xj, zj] = polygon[j]
    const dx = xj - xi
    const dz = zj - zi
    const lengthSq = dx * dx + dz * dz
    const t = lengthSq === 0 ? 0 : THREE.MathUtils.clamp(((x - xi) * dx + (z - zi) * dz) / lengthSq, 0, 1)
    const px = xi + dx * t
    const pz = zi + dz * t
    min = Math.min(min, Math.hypot(x - px, z - pz))
  }
  return min
}

/** 多角形（ローカルXZ座標、扇状分割）から水平なパッドメッシュを作る。凹多角形は角で三角形が乱れうるが小面積のため許容する。 */
function buildPolygonPad(polygon: [number, number][]): THREE.Mesh {
  const positions: number[] = []
  for (const [x, z] of polygon) positions.push(x, 0.025, z)
  const indices: number[] = []
  for (let i = 1; i < polygon.length - 1; i++) indices.push(0, i, i + 1)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color: ASPHALT_COLOR, roughness: 0.9, side: THREE.DoubleSide }),
  )
}

const FALLBACK_HALF_SIZE = 4

/**
 * 道路が交わる交差点パッド（仕様§45 world/Intersection.ts相当）。
 * polygonを渡すと実データ由来の実際の交差点形状でcontains()判定・見た目のパッドを作る
 * （軸並行の矩形とは限らないため、判定はpoint-in-polygonで行う）。
 * polygonがない場合は正方形パッドにフォールバックする。
 */
export class Intersection {
  readonly object3D = new THREE.Group()
  readonly center: THREE.Vector3
  readonly control: IntersectionControl
  light: TrafficLight | null = null
  /** center からのローカルXZオフセット配列。 */
  private readonly polygonLocal: [number, number][]
  /** 停止線・標識の配置オフセット計算に使う概算半径（中心から頂点までの最大距離）。 */
  private readonly approxRadius: number

  constructor(center: THREE.Vector3, polygon: Array<{ x: number; z: number }> | null = null, control: IntersectionControl = 'none') {
    this.center = center.clone()
    this.control = control

    if (polygon && polygon.length >= 3) {
      this.polygonLocal = polygon.map((p) => [p.x - this.center.x, p.z - this.center.z])
    } else {
      const half = FALLBACK_HALF_SIZE
      this.polygonLocal = [
        [-half, -half],
        [half, -half],
        [half, half],
        [-half, half],
      ]
    }
    this.approxRadius = Math.max(...this.polygonLocal.map(([x, z]) => Math.hypot(x, z)))

    this.object3D.add(buildPolygonPad(this.polygonLocal))
    this.object3D.position.copy(this.center)
  }

  update(dt: number) {
    this.light?.update(dt)
  }

  /**
   * 停止線（道路標示＋ロジックデータ）を追加する。approachDirectionは進入してくる車から見て
   * 交差点の外側＝手前方向（進行方向の逆）を指す単位ベクトル。
   * CAR → STOP LINE → CROSSWALK → INTERSECTION の順に並べる（仕様v3 §10, §20）。
   */
  addStopLine(approachDirection: THREE.Vector3, laneWidth: number, getPhase?: () => LightPhase): StopLine {
    const gap = 1.0 // 交差点端から停止線までの余裕
    const perpendicular = new THREE.Vector3(0, 1, 0).cross(approachDirection).normalize()
    const angle = Math.atan2(perpendicular.x, perpendicular.z)
    const stopLineOffset = approachDirection.clone().multiplyScalar(this.approxRadius + gap)

    const line = new THREE.Mesh(
      new THREE.PlaneGeometry(0.4, laneWidth * 0.92),
      new THREE.MeshStandardMaterial({ color: STOP_LINE_COLOR, roughness: 0.6 }),
    )
    line.rotation.x = -Math.PI / 2
    line.rotation.z = -angle
    line.position.set(stopLineOffset.x, 0.035, stopLineOffset.z)
    this.object3D.add(line)

    this.addCrosswalk(approachDirection, perpendicular, laneWidth, gap)

    return {
      id: `${this.center.x},${this.center.z},${approachDirection.x.toFixed(2)},${approachDirection.z.toFixed(2)}#stopline`,
      position: this.center.clone().add(stopLineOffset),
      direction: approachDirection.clone().negate(),
      width: laneWidth,
      intersection: this,
      getPhase,
    }
  }

  /**
   * 停止線と交差点の間に横断歩道（見た目のみ、判定なし：仕様v3 §20）を配置する。
   * 各バーは道路を横切る向き（perpendicular）に長く伸び、進行方向（approachDirection）に
   * 一定間隔で並べる（ピアノの鍵盤状）。バーの向きと縞の並ぶ向きを混同しないこと。
   */
  private addCrosswalk(approachDirection: THREE.Vector3, perpendicular: THREE.Vector3, laneWidth: number, stopLineGap: number) {
    const angle = Math.atan2(perpendicular.x, perpendicular.z)
    const barSpan = laneWidth * 0.85
    const nearEdge = approachDirection.clone().multiplyScalar(this.approxRadius + stopLineGap * 0.4)
    const material = new THREE.MeshStandardMaterial({ color: STOP_LINE_COLOR, roughness: 0.6 })

    for (let i = 0; i < CROSSWALK_BAR_COUNT; i++) {
      const alongOffset = i * (CROSSWALK_BAR_WIDTH + CROSSWALK_GAP) + CROSSWALK_BAR_WIDTH / 2
      const bar = new THREE.Mesh(new THREE.PlaneGeometry(CROSSWALK_BAR_WIDTH, barSpan), material)
      bar.rotation.x = -Math.PI / 2
      bar.rotation.z = -angle
      // 停止線側の縁から交差点中心へ向かって（approachDirectionの逆）並べる
      const center = nearEdge.clone().addScaledVector(approachDirection, -alongOffset)
      bar.position.set(center.x, 0.035, center.z)
      this.object3D.add(bar)
    }
  }

  /**
   * 信号機／一時停止標識を、実際の進入車線を基準に設置する。
   * approachDirectionは停止線と同じ「交差点の外側＝手前方向」を指す単位ベクトル。
   * 日本では規制標識・信号機とも車道の左側（進入してくる車から見て左）に立てるため、
   * World座標のX/Zで固定せず、必ずapproachDirectionから見た左方向を計算する（仕様v2 §2, §6）。
   */
  placeControlDevice(approachDirection: THREE.Vector3, laneWidth: number) {
    const travelDirection = approachDirection.clone().negate()
    const left = new THREE.Vector3(0, 1, 0).cross(travelDirection).normalize()
    const shoulderOffset = left.clone().multiplyScalar(laneWidth / 2 + 1.2)

    if (this.control === 'light') {
      // 信号機は交差点の奥、進入方向の左側に設置する（停止線の先、通過しながら見える位置）。
      const farOffset = travelDirection.clone().multiplyScalar(this.approxRadius + 1.5)
      const localPosition = farOffset.add(shoulderOffset)
      this.light = new TrafficLight(localPosition)
      this.object3D.add(this.light.object3D)
    } else if (this.control === 'stop') {
      // 一時停止標識は停止線のすぐそば、進入方向の左側（手前）に設置する。
      const nearOffset = approachDirection.clone().multiplyScalar(this.approxRadius + 1.0)
      const localPosition = nearOffset.add(shoulderOffset)
      this.object3D.add(buildStopSign(localPosition))
    }
  }

  /** 実際の交差点ポリゴンに対するpoint-in-polygon判定（軸並行矩形を仮定しない）。marginは輪郭からの許容距離。 */
  contains(position: THREE.Vector3, margin = 0): boolean {
    const x = position.x - this.center.x
    const z = position.z - this.center.z
    if (pointInPolygon(x, z, this.polygonLocal)) return true
    if (margin <= 0) return false
    return distanceToPolygonBoundary(x, z, this.polygonLocal) <= margin
  }
}

/** 一時停止標識（規制標識330）：白縁の逆三角形、地は赤。丸い板ではない。 */
function buildStopSign(position: THREE.Vector3): THREE.Group {
  const group = new THREE.Group()
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.7 }),
  )
  pole.position.y = 1.1
  group.add(pole)

  const white = new THREE.Mesh(
    new THREE.ShapeGeometry(invertedTriangle(0.42)),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, side: THREE.DoubleSide }),
  )
  white.position.y = 2.2
  group.add(white)

  const red = new THREE.Mesh(
    new THREE.ShapeGeometry(invertedTriangle(0.34)),
    new THREE.MeshStandardMaterial({ color: 0xc23b2e, roughness: 0.5, side: THREE.DoubleSide }),
  )
  red.position.set(0, 2.2, 0.01)
  group.add(red)

  group.position.copy(position)
  return group
}

/** 頂点を下に向けた正三角形（止まれ標識の形）。halfSizeは中心から各辺までのおおよその半径。 */
function invertedTriangle(halfSize: number): THREE.Shape {
  const shape = new THREE.Shape()
  shape.moveTo(-halfSize, halfSize)
  shape.lineTo(halfSize, halfSize)
  shape.lineTo(0, -halfSize)
  shape.closePath()
  return shape
}
