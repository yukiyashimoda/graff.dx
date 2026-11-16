/**
 * 均一グリッドによる簡易空間インデックス。実データ規模（数百のRoad/Intersection）で
 * 毎フレームの線形スキャンを避けるために使う。cellSize は探索半径より十分小さくする。
 */
export class SpatialGrid<T> {
  private readonly cells = new Map<string, T[]>()

  constructor(private readonly cellSize: number) {}

  private key(cx: number, cz: number): string {
    return `${cx},${cz}`
  }

  private cellCoord(x: number, z: number): [number, number] {
    return [Math.floor(x / this.cellSize), Math.floor(z / this.cellSize)]
  }

  /** アイテムをXZ境界ボックスが重なる全セルへ登録する。 */
  insert(item: T, minX: number, minZ: number, maxX: number, maxZ: number) {
    const [cx0, cz0] = this.cellCoord(minX, minZ)
    const [cx1, cz1] = this.cellCoord(maxX, maxZ)
    for (let cx = cx0; cx <= cx1; cx++) {
      for (let cz = cz0; cz <= cz1; cz++) {
        const key = this.key(cx, cz)
        let bucket = this.cells.get(key)
        if (!bucket) {
          bucket = []
          this.cells.set(key, bucket)
        }
        bucket.push(item)
      }
    }
  }

  /** position中心、radius四方のセルに登録された候補を重複なく集める。 */
  queryRadius(x: number, z: number, radius: number): T[] {
    const [cx0, cz0] = this.cellCoord(x - radius, z - radius)
    const [cx1, cz1] = this.cellCoord(x + radius, z + radius)
    const seen = new Set<T>()
    for (let cx = cx0; cx <= cx1; cx++) {
      for (let cz = cz0; cz <= cz1; cz++) {
        const bucket = this.cells.get(this.key(cx, cz))
        if (!bucket) continue
        for (const item of bucket) seen.add(item)
      }
    }
    return [...seen]
  }
}
