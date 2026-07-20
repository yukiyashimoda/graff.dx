'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const GRID = 40 // 一辺のキューブ数（40x40 = 1600）
const SPACING = 0.62 // キューブ間隔
const CUBE = 0.3 // キューブの一辺

/** 波の基準色（地に沈む色）とピーク色（サイトのアクセント）。 */
const BASE_COLOR = new THREE.Color('#1c1f21')
const PEAK_COLOR = new THREE.Color('#40ffd4')

function Cubes() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const { viewport } = useThree()

  // 行列・色の使い回し用。毎フレームの new を避ける。
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const color = useMemo(() => new THREE.Color(), [])

  /** マウス位置（グリッド座標）。追従は useFrame 側で補間する。 */
  const pointer = useRef(new THREE.Vector2(0, 0))
  const pointerTarget = useRef(new THREE.Vector2(0, 0))

  useFrame(({ clock, pointer: p }) => {
    const mesh = meshRef.current
    if (!mesh) return

    // 画面座標 → グリッド座標へ。急に飛ばず滑らかに追う。
    pointerTarget.current.set((p.x * viewport.width) / 2, (-p.y * viewport.height) / 2)
    pointer.current.lerp(pointerTarget.current, 0.06)

    const t = clock.getElapsedTime()
    const half = (GRID - 1) / 2
    let i = 0

    for (let ix = 0; ix < GRID; ix++) {
      for (let iz = 0; iz < GRID; iz++) {
        const x = (ix - half) * SPACING
        const z = (iz - half) * SPACING

        // 1) 中心から広がる定常波
        const d = Math.sqrt(x * x + z * z)
        let y = Math.sin(d * 0.55 - t * 1.4) * 0.55

        // 2) 斜めに流れるうねりを重ねて、単調な同心円にしない
        y += Math.sin(x * 0.28 + z * 0.18 + t * 0.7) * 0.35

        // 3) マウス周辺のリップル。近いほど強く、離れると減衰
        const md = Math.hypot(x - pointer.current.x, z - pointer.current.y)
        y += Math.cos(md * 0.9 - t * 3.2) * Math.exp(-md * 0.28) * 0.9

        dummy.position.set(x, y, z)
        dummy.scale.setScalar(CUBE)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)

        // 高いキューブほどアクセント色へ寄せる（波頭が光って見える）
        const lift = THREE.MathUtils.clamp((y + 0.9) / 2.2, 0, 1)
        color.copy(BASE_COLOR).lerp(PEAK_COLOR, lift * lift * 0.85)
        mesh.setColorAt(i, color)

        i++
      }
    }

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, GRID * GRID]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}

export default function WaveGrid({ active }: { active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 7.5, 13], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
    >
      <Cubes />
    </Canvas>
  )
}
