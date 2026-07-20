'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

/**
 * 白地に敷き詰めた平板（瓦）のグリッド。
 * うねりで各タイルが傾き、光の当たり方が変わることで陰影が生まれる。
 * 隙間はごく僅かに空けるだけで、ほぼ面として繋がって見えるようにする。
 */
const COLS = 22
const ROWS = 15
const TILE = 1.0 // タイル一辺
const GAP = 0.03 // 継ぎ目（背景色が覗いて瓦の輪郭になる）

function Tiles() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const { viewport } = useThree()

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const pointer = useRef(new THREE.Vector2(0, 0))
  const pointerTarget = useRef(new THREE.Vector2(0, 0))

  /** 位置 (x,y) と時刻 t における面の高さ。 */
  const heightAt = (x: number, y: number, t: number, px: number, py: number) => {
    // 斜めに流れる大きなうねり
    let h = Math.sin(x * 0.34 + y * 0.16 + t * 0.55) * 0.5
    h += Math.sin(x * 0.13 - y * 0.29 - t * 0.38) * 0.42
    // カーソル周辺の盛り上がり
    const d = Math.hypot(x - px, y - py)
    h += Math.cos(d * 0.7 - t * 2.4) * Math.exp(-d * 0.22) * 0.75
    return h
  }

  useFrame(({ clock, pointer: p }) => {
    const mesh = meshRef.current
    if (!mesh) return

    pointerTarget.current.set((p.x * viewport.width) / 2, (p.y * viewport.height) / 2)
    pointer.current.lerp(pointerTarget.current, 0.05)
    const px = pointer.current.x
    const py = pointer.current.y

    const t = clock.getElapsedTime()
    const step = TILE + GAP
    const halfC = (COLS - 1) / 2
    const halfR = (ROWS - 1) / 2
    let i = 0

    for (let cx = 0; cx < COLS; cx++) {
      for (let cy = 0; cy < ROWS; cy++) {
        const x = (cx - halfC) * step
        const y = (cy - halfR) * step

        const h = heightAt(x, y, t, px, py)
        // 面の傾きは高さの勾配から求める（隣との差分）。瓦が波に沿って寝る。
        const e = 0.45
        const dhx = heightAt(x + e, y, t, px, py) - heightAt(x - e, y, t, px, py)
        const dhy = heightAt(x, y + e, t, px, py) - heightAt(x, y - e, t, px, py)

        dummy.position.set(x, y, h)
        dummy.rotation.set(dhy * 1.05, -dhx * 1.05, 0)
        dummy.scale.set(TILE, TILE, 1)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        i++
      }
    }

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COLS * ROWS]}>
      <planeGeometry args={[1, 1]} />
      {/* 白い紙のような面。粗さを高めにして反射をぼかす */}
      <meshStandardMaterial color="#ffffff" roughness={0.62} metalness={0.05} />
    </instancedMesh>
  )
}

export default function WaveGrid({ active }: { active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 11.5], fov: 46 }}
      gl={{ antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#dcdce1']} />
      {/* 全体を明るく起こす */}
      <ambientLight intensity={0.85} />
      {/* 左上からの主光源。傾いた瓦の陰影はこれが作る */}
      <directionalLight position={[-5, 7, 7]} intensity={2.6} color="#ffffff" />
      {/* 右手前から青紫を差して、うねりの強い所に色を乗せる */}
      <pointLight position={[8, -1, 4.5]} intensity={55} distance={24} color="#7c7ffb" />
      <Tiles />
      <EffectComposer>
        {/* 参考デザインに見られる RGB のにじみ */}
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0016, 0.0011)}
          radialModulation={false}
          modulationOffset={0}
        />
      </EffectComposer>
    </Canvas>
  )
}
