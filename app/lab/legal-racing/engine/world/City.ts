import * as THREE from 'three'
import { Road } from './Road'
import { Intersection, type StopLine } from './Intersection'
import { SpatialGrid } from './SpatialIndex'
import { RoadKit, type RoadTileName } from './RoadKit'
import { PropKit, type PropName } from './PropKit'
import { SignalController, type SignalGroup } from '../traffic/SignalController'
import { SignalHead } from '../traffic/SignalHead'

const ROAD_SOFT_MARGIN = 2.5 // 道路端からさらにこの距離までは出られる（操作が難しいための緩和）
const SPATIAL_CELL_SIZE = 20
const ROAD_QUERY_RADIUS = 40
const INTERSECTION_QUERY_RADIUS = 50

const TILE_SIZE = 20 // RoadUnitタイル1マスの一辺（m）
const ROAD_ASPHALT_WIDTH = 8 // Road_TwoLane_*タイルの車道部実測幅（m）
const SPEED_LIMIT_KMH = 30

type TilePlacement = { tile: RoadTileName; col: number; row: number; rotationYDeg: number }

/**
 * JapaneseStreetPack（RoadUnit.glb）のタイルを並べた手作りコース。
 * PLATEAU実データではなく、素直な「日本の平均的な道路」の見た目をタイルキットから組み立てる。
 * ゲームロジック（Road/Intersection/RuleSystem）はタイルの実寸に合わせた最小限のデータとして
 * 別途構築し、見た目はRoadKitのクローンのみをシーンに追加する（Road/Intersectionの
 * 自動生成メッシュは使わない）。
 *
 * 5列(col 0-4) × 4行(row 0-3)の外周ループ＋中央を東西に横断する道（T字路2つで分岐）。
 * 外周だけの単純な四角ループより一回り広く、分岐のぶんだけ経路選択の余地がある。
 */
const INTERSECTION_TILES: TilePlacement[] = [
  { tile: 'RoadUnit_Corner', col: 0, row: 0, rotationYDeg: 0 }, // SW: 北+東が開口（デフォルト）
  { tile: 'RoadUnit_Corner', col: 4, row: 0, rotationYDeg: 270 }, // SE: 北+西
  { tile: 'RoadUnit_Corner', col: 0, row: 3, rotationYDeg: 90 }, // NW: 南+東
  { tile: 'RoadUnit_Corner', col: 4, row: 3, rotationYDeg: 180 }, // NE: 南+西
  { tile: 'RoadUnit_T-Junction', col: 0, row: 1, rotationYDeg: 0 }, // 西辺のT字路: 南北通過＋東へ分岐
  { tile: 'RoadUnit_T-Junction', col: 4, row: 1, rotationYDeg: 180 }, // 東辺のT字路: 南北通過＋西へ分岐
]

const STRAIGHT_TILES: TilePlacement[] = [
  { tile: 'Road_TwoLane_20m', col: 1, row: 0, rotationYDeg: 90 }, // 南辺
  { tile: 'Road_TwoLane_20m', col: 2, row: 0, rotationYDeg: 90 },
  { tile: 'Road_TwoLane_20m', col: 3, row: 0, rotationYDeg: 90 },
  { tile: 'Road_TwoLane_20m', col: 1, row: 3, rotationYDeg: 90 }, // 北辺
  { tile: 'Road_TwoLane_20m', col: 2, row: 3, rotationYDeg: 90 },
  { tile: 'Road_TwoLane_20m', col: 3, row: 3, rotationYDeg: 90 },
  { tile: 'Road_TwoLane_20m', col: 0, row: 2, rotationYDeg: 0 }, // 西辺（T字路の先）
  { tile: 'Road_TwoLane_20m', col: 4, row: 2, rotationYDeg: 0 }, // 東辺（T字路の先）
  { tile: 'Road_TwoLane_20m', col: 1, row: 1, rotationYDeg: 90 }, // 中央横断
  { tile: 'Road_TwoLane_20m', col: 2, row: 1, rotationYDeg: 90 },
  { tile: 'Road_TwoLane_20m', col: 3, row: 1, rotationYDeg: 90 },
]

/** ゲームロジック用の論理Road。タイル配置と一致するよう、隣接Intersection間を1本ずつ結ぶ。 */
const ROAD_RUNS: Array<{ from: [number, number]; to: [number, number] }> = [
  { from: [0, 0], to: [4, 0] }, // 南辺
  { from: [0, 3], to: [4, 3] }, // 北辺
  { from: [0, 0], to: [0, 1] }, // 西・下（SW→西T字路）
  { from: [0, 1], to: [0, 3] }, // 西・上（西T字路→NW）
  { from: [4, 0], to: [4, 1] }, // 東・下（SE→東T字路）
  { from: [4, 1], to: [4, 3] }, // 東・上（東T字路→NE）
  { from: [0, 1], to: [4, 1] }, // 中央横断（西T字路→東T字路）
]

function tileWorldPos(col: number, row: number): THREE.Vector3 {
  return new THREE.Vector3((col - 2) * TILE_SIZE, 0, (row - 1) * TILE_SIZE)
}

/** ローカルオフセット(x,z)をタイルの回転と同じ向きに回して、そのタイル基準の位置を返す。 */
function rotateOffset(x: number, z: number, rotationYDeg: number): THREE.Vector2 {
  const rad = THREE.MathUtils.degToRad(rotationYDeg)
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return new THREE.Vector2(x * cos + z * sin, -x * sin + z * cos)
}

/**
 * TrafficLightのレンズ面（ローカル+Z方向、アームの伸びる+Xとは直角）を、
 * 指定したワールド向き(dirX,dirZ)へ向けるための回転角。
 */
function facingRotationDeg(dirX: number, dirZ: number): number {
  return THREE.MathUtils.radToDeg(Math.atan2(dirX, dirZ))
}

function propPosition(
  placement: { col: number; row: number; rotationYDeg: number },
  localX: number,
  localZ: number,
): THREE.Vector3 {
  const base = tileWorldPos(placement.col, placement.row)
  const offset = rotateOffset(localX, localZ, placement.rotationYDeg)
  return new THREE.Vector3(base.x + offset.x, 0, base.z + offset.y)
}

type PropPlacement = { prop: PropName; col: number; row: number; rotationYDeg: number; localX: number; localZ: number }

/**
 * 街灯・信号機・標識・電柱の配置。角・T字路タイルは実測したアスファルト形状の外側
 * （歩道側）に置けるよう、タイルごとに安全なローカルオフセットを決め打ちしている。
 * 直線タイルは車道幅8mの外側、進行方向に対して右側の歩道に統一して並べる。
 */
const PROP_PLACEMENTS: PropPlacement[] = [
  // 角（4隅）：街灯と標識を交互に、タイルの外側の角（歩道）へ。
  { prop: 'StreetLight', col: 0, row: 0, rotationYDeg: 0, localX: -8, localZ: -8 },
  { prop: 'TrafficSign', col: 4, row: 0, rotationYDeg: 270, localX: -8, localZ: -8 },
  { prop: 'TrafficSign', col: 0, row: 3, rotationYDeg: 90, localX: -8, localZ: -8 },
  { prop: 'StreetLight', col: 4, row: 3, rotationYDeg: 180, localX: -8, localZ: -8 },
  // 直線区間：進行方向右側の歩道に電柱を1本ずつ。
  { prop: 'UtilityPole', col: 1, row: 0, rotationYDeg: 90, localX: 9, localZ: 0 },
  { prop: 'UtilityPole', col: 2, row: 0, rotationYDeg: 90, localX: 9, localZ: 0 },
  { prop: 'UtilityPole', col: 3, row: 0, rotationYDeg: 90, localX: 9, localZ: 0 },
  { prop: 'UtilityPole', col: 1, row: 3, rotationYDeg: 90, localX: 9, localZ: 0 },
  { prop: 'UtilityPole', col: 2, row: 3, rotationYDeg: 90, localX: 9, localZ: 0 },
  { prop: 'UtilityPole', col: 3, row: 3, rotationYDeg: 90, localX: 9, localZ: 0 },
  { prop: 'UtilityPole', col: 0, row: 2, rotationYDeg: 0, localX: 9, localZ: 0 },
  { prop: 'UtilityPole', col: 4, row: 2, rotationYDeg: 0, localX: 9, localZ: 0 },
  { prop: 'UtilityPole', col: 1, row: 1, rotationYDeg: 90, localX: 9, localZ: 0 },
  { prop: 'UtilityPole', col: 2, row: 1, rotationYDeg: 90, localX: 9, localZ: 0 },
  { prop: 'UtilityPole', col: 3, row: 1, rotationYDeg: 90, localX: 9, localZ: 0 },
]

/**
 * T字路タイル自身のローカル座標系（回転前、開口＝北+南+東）を基準にした3方向分の
 * 信号アプローチ定義。タイルのrotationYDegをそのままrotateOffsetに渡せば、
 * 西・東どちらのT字路にも同じ定義を使い回せる。
 */
type TJunctionApproach = {
  group: SignalGroup
  approachLocalDir: [number, number] // 交差点の外側＝手前方向（進行方向の逆）
  stopLocal: [number, number]
  signalLocal: [number, number]
}
// 分岐路（東から進入）用の信号。停止線のすぐ先・進行方向左側
// （up.cross(進行方向)、レーン配置と同じ検証済みの式）に配置。
const TJUNCTION_APPROACHES: TJunctionApproach[] = [
  { group: 'branch', approachLocalDir: [1, 0], stopLocal: [8, 0], signalLocal: [5, 3] },
]
const TJUNCTION_LANE_WIDTH = 8

export class City {
  readonly object3D = new THREE.Group()
  readonly roads: Road[] = []
  readonly intersections: Intersection[] = []
  /** T字路の3方向ぶんの停止線（赤信号無視判定に使う）。 */
  readonly stopLines: StopLine[] = []
  readonly spawn: { position: THREE.Vector3; heading: number }

  private readonly roadIndex = new SpatialGrid<Road>(SPATIAL_CELL_SIZE)
  private readonly intersectionIndex = new SpatialGrid<Intersection>(SPATIAL_CELL_SIZE)
  private readonly signalControllers: SignalController[] = []
  private readonly signalHeads: Array<{ head: SignalHead; controller: SignalController; group: SignalGroup }> = []

  static async load(): Promise<City> {
    const [roadKit, propKit] = await Promise.all([RoadKit.load(), PropKit.load()])
    return new City(roadKit, propKit)
  }

  private constructor(kit: RoadKit, props: PropKit) {
    const intersectionAt = new Map<string, Intersection>()
    for (const placement of INTERSECTION_TILES) {
      const center = tileWorldPos(placement.col, placement.row)
      const intersection = new Intersection(center, null, 'none')
      this.addIntersectionInstance(intersection)
      intersectionAt.set(`${placement.col},${placement.row}`, intersection)
    }

    for (const run of ROAD_RUNS) {
      const start = tileWorldPos(run.from[0], run.from[1])
      const end = tileWorldPos(run.to[0], run.to[1])
      this.addRoadInstance(new Road(start, end, ROAD_ASPHALT_WIDTH, SPEED_LIMIT_KMH, false))
    }

    for (const placement of [...INTERSECTION_TILES, ...STRAIGHT_TILES]) {
      const position = tileWorldPos(placement.col, placement.row)
      this.object3D.add(kit.place(placement.tile, position, placement.rotationYDeg))
    }

    for (const placement of PROP_PLACEMENTS) {
      const position = propPosition(placement, placement.localX, placement.localZ)
      this.object3D.add(props.place(placement.prop, position, placement.rotationYDeg))
    }

    for (const placement of INTERSECTION_TILES) {
      if (placement.tile !== 'RoadUnit_T-Junction') continue
      const intersection = intersectionAt.get(`${placement.col},${placement.row}`)
      if (intersection) this.buildTJunctionSignals(intersection, placement, props)
    }

    this.spawn = this.deriveSpawn()
  }

  update(dt: number) {
    for (const intersection of this.intersections) intersection.update(dt)
    for (const controller of this.signalControllers) controller.update(dt)
    for (const { head, controller, group } of this.signalHeads) head.applyPhase(controller.getPhase(group))
  }

  /**
   * T字路1つぶんの信号一式を作る。通過側（南北）2灯＋分岐側1灯を、
   * 互いに排他的なSignalControllerで駆動する（仕様どおり同時に両方が青にならない）。
   */
  private buildTJunctionSignals(
    intersection: Intersection,
    placement: TilePlacement,
    props: PropKit,
  ) {
    const controller = new SignalController()
    this.signalControllers.push(controller)

    for (const approach of TJUNCTION_APPROACHES) {
      const approachDirOffset = rotateOffset(approach.approachLocalDir[0], approach.approachLocalDir[1], placement.rotationYDeg)
      const approachDirection = new THREE.Vector3(approachDirOffset.x, 0, approachDirOffset.y).normalize()
      const stopLine = intersection.addStopLine(approachDirection, TJUNCTION_LANE_WIDTH, () => controller.getPhase(approach.group))
      this.stopLines.push(stopLine)

      const signalPosition = propPosition(placement, approach.signalLocal[0], approach.signalLocal[1])
      const signalRotationYDeg = placement.rotationYDeg + facingRotationDeg(approach.approachLocalDir[0], approach.approachLocalDir[1])
      const signalObject = props.place('TrafficLight', signalPosition, signalRotationYDeg)
      this.object3D.add(signalObject)
      const head = new SignalHead(signalObject)
      this.signalHeads.push({ head, controller, group: approach.group })
    }
  }

  /**
   * 道路からの逸脱を緩やかに制限する（ソフトなガードレール）。
   * 交差点内は自由に走行できる。それ以外は最寄りの道路の中心線から
   * 「道幅の半分＋ソフトマージン」より外へは出られないようクランプする。
   */
  keepOnRoad(position: THREE.Vector3): THREE.Vector3 {
    const nearbyIntersections = this.intersectionIndex.queryRadius(position.x, position.z, INTERSECTION_QUERY_RADIUS)
    if (nearbyIntersections.some((intersection) => intersection.contains(position, ROAD_SOFT_MARGIN))) {
      return position
    }

    const candidates = this.roadIndex.queryRadius(position.x, position.z, ROAD_QUERY_RADIUS)
    let nearest: { point: THREE.Vector3; distance: number; width: number } | null = null
    for (const road of candidates) {
      const candidate = road.closestPointAndDistance(position)
      if (!nearest || candidate.distance < nearest.distance) nearest = { ...candidate, width: road.width }
    }
    if (!nearest) return position

    const maxDistance = nearest.width / 2 + ROAD_SOFT_MARGIN
    if (nearest.distance <= maxDistance) return position

    const direction = new THREE.Vector3(position.x - nearest.point.x, 0, position.z - nearest.point.z).normalize()
    return nearest.point.clone().addScaledVector(direction, maxDistance).setY(position.y)
  }

  /** RuleSystem用: position付近のRoadだけを空間インデックス経由で返す（全件走査を避ける）。 */
  nearbyRoads(position: THREE.Vector3, radius = ROAD_QUERY_RADIUS): Road[] {
    return this.roadIndex.queryRadius(position.x, position.z, radius)
  }

  /** RuleSystem用: position付近のIntersectionだけを空間インデックス経由で返す。 */
  nearbyIntersections(position: THREE.Vector3, radius = INTERSECTION_QUERY_RADIUS): Intersection[] {
    return this.intersectionIndex.queryRadius(position.x, position.z, radius)
  }

  /** 原点に最も近い道路の第1レーン中点をスポーンとする。 */
  private deriveSpawn(): { position: THREE.Vector3; heading: number } {
    let road: Road | null = null
    let nearestDist = Infinity
    for (const candidate of this.roads) {
      const mid = candidate.start.clone().add(candidate.end).multiplyScalar(0.5)
      const dist = mid.length()
      if (dist < nearestDist) {
        nearestDist = dist
        road = candidate
      }
    }
    if (!road || road.lanes.length === 0) {
      return { position: new THREE.Vector3(0, 0, 0), heading: 0 }
    }
    const lane = road.lanes[0]
    return {
      position: lane.centerPath.getPoint(0.5),
      heading: Math.atan2(lane.direction.x, lane.direction.z),
    }
  }

  private addRoadInstance(road: Road) {
    this.roads.push(road)
    // 見た目はRoadKitのタイルが担うため、Roadの自動生成メッシュ(road.object3D)はシーンに追加しない。
    const minX = Math.min(road.start.x, road.end.x) - road.width / 2
    const maxX = Math.max(road.start.x, road.end.x) + road.width / 2
    const minZ = Math.min(road.start.z, road.end.z) - road.width / 2
    const maxZ = Math.max(road.start.z, road.end.z) + road.width / 2
    this.roadIndex.insert(road, minX, minZ, maxX, maxZ)
  }

  private addIntersectionInstance(intersection: Intersection) {
    this.intersections.push(intersection)
    // 見た目はRoadKitのタイルが担うため、Intersectionの自動生成パッドはシーンに追加しない。
    const margin = 30
    this.intersectionIndex.insert(
      intersection,
      intersection.center.x - margin,
      intersection.center.z - margin,
      intersection.center.x + margin,
      intersection.center.z + margin,
    )
  }
}
