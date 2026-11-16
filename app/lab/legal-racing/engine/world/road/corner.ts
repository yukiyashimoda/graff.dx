import * as THREE from 'three'

const CURVE_SEGMENTS = 16
const LINE_WIDTH = 0.15
const LINE_COLOR = 0xe8e8e2
const UP = new THREE.Vector3(0, 1, 0)

export type EdgeEndpoint = { point: THREE.Vector3; tangent: THREE.Vector3; roadId: string }

/**
 * 2本の道路の外側線端点を、それぞれの直線と接線が一致する3次ベジェで滑らかに接続する
 * （仕様v2 §15-20: 角を直角/鋭角のまま放置せず、Position/Tangent Continuityを満たすRで繋ぐ）。
 * 個別に回転させた短冊を並べると曲がり角の継ぎ目に隙間ができるため、1枚の連続したリボン
 * メッシュとして生成する（頂点をカーブに沿って直接積む）。
 */
export function buildCornerConnector(group: THREE.Group, a: EdgeEndpoint, b: EdgeEndpoint) {
  const distance = a.point.distanceTo(b.point)
  if (distance < 0.05) return
  const handle = Math.max(0.5, distance * 0.55)
  const c1 = a.point.clone().addScaledVector(a.tangent, handle)
  const c2 = b.point.clone().addScaledVector(b.tangent, handle)
  const curve = new THREE.CubicBezierCurve3(a.point, c1, c2, b.point)

  const positions: number[] = []
  const indices: number[] = []
  const halfWidth = LINE_WIDTH / 2

  for (let i = 0; i <= CURVE_SEGMENTS; i++) {
    const t = i / CURVE_SEGMENTS
    const point = curve.getPointAt(t)
    const tangent = curve.getTangentAt(t)
    const side = UP.clone().cross(tangent).normalize()
    const left = point.clone().addScaledVector(side, halfWidth)
    const right = point.clone().addScaledVector(side, -halfWidth)
    positions.push(left.x, 0.03, left.z, right.x, 0.03, right.z)

    if (i < CURVE_SEGMENTS) {
      const base = i * 2
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()

  const material = new THREE.MeshStandardMaterial({ color: LINE_COLOR, roughness: 0.6, side: THREE.DoubleSide })
  group.add(new THREE.Mesh(geometry, material))
}

/** 交差点に集まる外側線端点を最近傍同士で貪欲にペアリングする（同一道路同士は除外）。 */
export function connectNearestEdgePairs(group: THREE.Group, candidates: EdgeEndpoint[]) {
  const remaining = [...candidates]

  while (remaining.length >= 2) {
    let bestI = -1
    let bestJ = -1
    let bestDistance = Infinity

    for (let i = 0; i < remaining.length; i++) {
      for (let j = i + 1; j < remaining.length; j++) {
        if (remaining[i].roadId === remaining[j].roadId) continue
        const distance = remaining[i].point.distanceTo(remaining[j].point)
        if (distance < bestDistance) {
          bestDistance = distance
          bestI = i
          bestJ = j
        }
      }
    }

    if (bestI === -1) break // 残り全てが同一道路同士（ペア不能）

    const [b] = remaining.splice(bestJ, 1)
    const [a] = remaining.splice(bestI, 1)
    buildCornerConnector(group, a, b)
  }
}
