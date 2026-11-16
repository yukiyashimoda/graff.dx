import * as THREE from 'three'

export type BuildingRecord = {
  east: number
  north: number
  width: number
  depth: number
  height: number
}

const BUILDING_COLOR = 0x3c4048

/**
 * PLATEAU実データ由来の建物群（数万棟規模）を1本のInstancedMeshで描画する。
 * 1棟ずつMeshを作るとドローコールが破綻するため、単位ボックス＋インスタンス変換で表現する。
 */
export class Buildings {
  readonly object3D: THREE.Object3D

  constructor(records: BuildingRecord[]) {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    geometry.translate(0, 0.5, 0) // ピボットを底面に揃える（Y=0が地面）
    const material = new THREE.MeshStandardMaterial({ color: BUILDING_COLOR, roughness: 0.85 })
    const mesh = new THREE.InstancedMesh(geometry, material, records.length)
    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage)

    const matrix = new THREE.Matrix4()
    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      matrix.makeScale(Math.max(0.1, record.width), Math.max(0.1, record.height), Math.max(0.1, record.depth))
      matrix.setPosition(record.east, 0, record.north)
      mesh.setMatrixAt(i, matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()

    this.object3D = mesh
  }
}
