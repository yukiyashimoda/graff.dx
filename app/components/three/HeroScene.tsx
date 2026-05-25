'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, MeshReflectorMaterial, BakeShadows } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing'
import { easing } from 'maath'
import { suspend } from 'suspend-react'
import { Instances, Computers } from './Computers'
import * as THREE from 'three'

useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')

const suzi = import('@pmndrs/assets/models/bunny.glb')

export default function HeroScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [-1.5, 1, 5.5], fov: 45, near: 1, far: 20 }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#050505']} />
      <hemisphereLight intensity={0.6} color="#88aacc" groundColor="#111111" />
      <spotLight position={[10, 20, 10]} angle={0.12} penumbra={1} intensity={3} castShadow shadow-mapSize={1024} />
      <ambientLight intensity={0.15} />
      <group position={[0, -1, 0]}>
        <Instances>
          <Computers scale={0.5} />
        </Instances>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <MeshReflectorMaterial
            blur={[0, 0]}
            resolution={512}
            mixBlur={0}
            mixStrength={40}
            roughness={1}
            depthScale={0}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#202020"
            metalness={0.8}
          />
        </mesh>
        <Bun scale={0.4} position={[0, 0.3, 0.5]} rotation={[0, -Math.PI * 0.85, 0]} />
        <pointLight distance={2} intensity={2} position={[-0.15, 0.7, 0]} color={0xffa500} />
      </group>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <EffectComposer disableNormalPass {...({} as any)}>
        <Bloom luminanceThreshold={0.15} mipmapBlur luminanceSmoothing={0.05} intensity={3.5} />
      </EffectComposer>
      <CameraRig />
      <BakeShadows />
    </Canvas>
  )
}

function Bun(props: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { nodes } = useGLTF((suspend(suzi) as any).default as string) as unknown as { nodes: Record<string, THREE.Mesh> }
  return (
    <mesh receiveShadow castShadow geometry={nodes.mesh.geometry} {...props}>
      <meshStandardMaterial color="#222" roughness={0.5} />
    </mesh>
  )
}

function CameraRig() {
  useFrame((state, delta) => {
    easing.damp3(
      state.camera.position,
      [-1 + (state.pointer.x * state.viewport.width) / 3, (1 + state.pointer.y) / 2, 5.5],
      0.5,
      delta,
    )
    state.camera.lookAt(0, 0, 0)
  })
  return null
}
