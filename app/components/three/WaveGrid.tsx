'use client'

/**
 * franky-adl/3d-wave-grid (MIT License, Copyright (c) 2026 franky-adl) (https://github.com/franky-adl/3d-wave-grid) の忠実な移植。
 * デモ: https://projects.arkon.digital/threejs/wavy-cubes/
 *
 * 仕組み（原典どおり）:
 * - 40x40 の背の高い柱 BoxGeometry(0.8, 3, 0.8) を InstancedMesh で敷き詰める
 * - 動くのは柱ではなく「天面の頂点」。MeshPhongMaterial の頂点シェーダに割り込み、
 *   position.y > 0 の頂点だけをマウス軌跡からの波で変位させる
 * - マウス軌跡は 128x1 の DataTexture(RGBA float)。texel = (worldX, worldZ, age, distDelta)
 *   各点から波紋（ガウス窓 + cos 振動 + 時間フェード + 距離減衰）を加重平均
 * - customDepthMaterial にも同じ頂点変形を注入して影を波に追従させる
 * - 変位量で白 → #0055ff に色が乗る（fragment）
 * - カメラは真上からで、マウスに合わせて ±数度だけ傾く
 * - 後段は Vignette + RGB シフトの ShaderPass（画面端ほど色ズレ・減光）
 *
 * 原典からの変更点は2つだけ:
 * - lil-gui / Debug を持ち込まない（パラメータは原典の既定値で固定）
 * - 背景キャンバスは pointer-events: none のため、pointermove を canvas でなく
 *   window で拾う（キャンバスは全画面なので座標系は同じ）
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

const MAX_TRAIL = 128

const VignetteRGBShiftShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    shiftAmount: { value: 0.005 },
    vignetteRadius: { value: 0.3 },
    vignetteSoftness: { value: 0.3 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float shiftAmount;
    uniform float vignetteRadius;
    uniform float vignetteSoftness;
    varying vec2 vUv;

    void main() {
      vec2 center = vec2(0.5);
      float dist = distance(vUv, center);
      float horzQuadrant = sign(vUv.x - center.x);
      float vertQuadrant = sign(vUv.y - center.y);

      float vignetteFactor = smoothstep(vignetteRadius, vignetteRadius + vignetteSoftness, dist);
      float currentShift = shiftAmount * vignetteFactor;

      float r = texture2D(tDiffuse, vUv + vec2(currentShift * horzQuadrant, currentShift * vertQuadrant)).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - vec2(currentShift * horzQuadrant, currentShift * vertQuadrant)).b;

      float darken = 1.0 - vignetteFactor * 0.5;
      gl_FragColor = vec4(vec3(r, g, b) * darken, 1.0);
    }
  `,
}

/** 原典 Stage.js の overrideVertexShader をそのまま。 */
function overrideVertexShader(vertexShader: string): string {
  return vertexShader
    .replace(
      '#include <common>',
      `#include <common>
      varying float vHeight;
      attribute vec2 aOffset;
      uniform sampler2D uTrailTexture;
      uniform int       uTrailCount;
      uniform float     uWaveSpeed;
      uniform float     uWaveFreq;
      uniform float     uWaveWidth;
      uniform float     uFadeTime;
      uniform float     uAmplitude;
      uniform float     uJitter;
      uniform float     uMaxHeight;

      vec2 hash2( vec2 p ) {
          p = vec2(
              dot( p, vec2( 127.1, 311.7 ) ),
              dot( p, vec2( 269.5, 183.3 ) )
          );
          return fract( sin( p ) * 43758.5453123 ) - 0.5;
      }`,
    )
    .replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>

      vHeight = 0.0;

      if ( position.y > 0.0 ) {
          vec2 jitter  = hash2( aOffset ) * uJitter;
          vec2 worldXZ = aOffset + jitter;
          float waveHeight  = 0.0;
          float totalWeight = 0.0;

          for ( int i = 0; i < uTrailCount; i++ ) {
              vec4 td = texture2D(
                  uTrailTexture,
                  vec2( ( float(i) + 0.5 ) / 128.0, 0.5 )
              );
              float dist      = length( worldXZ - td.rg );
              float wavefront = uWaveSpeed * td.b;
              float relDist   = dist - wavefront;

              float window = exp( -( relDist * relDist ) / ( uWaveWidth * uWaveWidth ) );
              float fade   = exp( -td.b / uFadeTime );
              float atten  = 1.0 / ( 1.0 + dist * 0.1 );
              float weight = fade * window * atten * td.a;

              waveHeight  += weight * cos( uWaveFreq * relDist );
              totalWeight += weight;
          }

          waveHeight /= max( totalWeight, 1.0 );

          float displacement = clamp( waveHeight * uAmplitude, -uMaxHeight, uMaxHeight );
          transformed.y += displacement;
          vHeight = displacement;
      }`,
    )
}

export default function WaveGrid({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef(active)

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // ── パラメータ（原典 Stage.js の既定値） ─────────────────────────
    const gridSize = 40
    const cubeWidth = 0.8
    const cubeHeight = 3
    const params = {
      gap: 0.01,
      waveAmplitude: 0.4,
      waveSpeed: 6.0,
      waveFrequency: 1.2,
      waveWidth: 3.0,
      waveJitter: 0.2,
      waveMaxHeight: 0.4,
      colorBase: '#ffffff',
      // 原典は #0055ff。GRAFF.LAB アプリのキー押下発光と同じアンバーに差し替え
      colorHigh: '#ff6a00',
    }
    const bounds = gridSize * (cubeWidth + params.gap)

    let width = window.innerWidth
    let height = window.innerHeight
    let pixelRatio = Math.min(window.devicePixelRatio, 2)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(params.colorBase).multiplyScalar(0.5)

    // ── カメラ（原典 Camera.js: 真上から、マウスで数度だけ傾く） ──────
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 200)
    const camRadius = 12
    const alphaRange = Math.PI * 0.03
    const betaRange = Math.PI * 0.05
    const camMouse = new THREE.Vector2(0, 0)
    const camLerped = new THREE.Vector2(0, 0)
    const updateCamera = (mx: number, my: number) => {
      const alpha = my * alphaRange
      const beta = mx * betaRange
      camera.position.set(
        -camRadius * Math.cos(alpha) * Math.sin(beta),
        camRadius * Math.cos(alpha) * Math.cos(beta),
        camRadius * Math.sin(alpha),
      )
      camera.up.set(0, 0, -1)
      camera.lookAt(0, 0, 0)
    }
    updateCamera(0, 0)
    scene.add(camera)

    // ── ライティング（原典 Stage.setLighting） ───────────────────────
    scene.add(new THREE.AmbientLight('#ffffff', 0.5))

    const keyLight = new THREE.DirectionalLight('#ffffff', 4.0)
    keyLight.position.set(-20, 10, 6)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    keyLight.shadow.radius = 6
    keyLight.shadow.camera.near = 0.1
    keyLight.shadow.camera.far = 60
    keyLight.shadow.camera.left = -22
    keyLight.shadow.camera.right = 22
    keyLight.shadow.camera.top = 22
    keyLight.shadow.camera.bottom = -22
    keyLight.shadow.bias = 0.0001
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight('#ffffff', 1.0)
    fillLight.position.set(10, 5, -3)
    scene.add(fillLight)

    // ── マウス軌跡（原典 MouseTrail.js） ─────────────────────────────
    const trailParams = { fadeTime: 2.0, trailSpacing: 0.1 }
    const trail: { x: number; z: number; age: number; distDelta: number }[] = []
    let lastPoint: { x: number; z: number } | null = null
    let timeSinceLastMove = 0
    let randomPointTimer = 0
    let isPlacingRandomPoints = true
    const randomPointStrength = 0.8

    const trailData = new Float32Array(MAX_TRAIL * 4)
    const trailTexture = new THREE.DataTexture(trailData, MAX_TRAIL, 1, THREE.RGBAFormat, THREE.FloatType)
    trailTexture.needsUpdate = true
    const trailUniforms = {
      uTrailTexture: { value: trailTexture },
      uTrailCount: { value: 0 },
      uFadeTime: { value: trailParams.fadeTime },
    }

    const raycaster = new THREE.Raycaster()
    const mouseCoords = new THREE.Vector2()
    const rayPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(bounds, bounds),
      new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, visible: false }),
    )
    rayPlane.rotation.x = -Math.PI / 2
    rayPlane.updateMatrixWorld(true)

    const addRandomPoint = () => {
      const x = (Math.random() * 0.5 - 0.25) * bounds
      const z = (Math.random() * 0.5 - 0.25) * bounds
      const distDelta = randomPointStrength + Math.random() * 0.2
      if (trail.length >= MAX_TRAIL) trail.shift()
      trail.push({ x, z, age: 0, distDelta })
    }

    // 背景キャンバスは pointer-events: none なので window で拾う（全画面なので座標は同じ）
    const onPointerMove = (e: PointerEvent) => {
      mouseCoords.set((e.clientX / width) * 2 - 1, -(e.clientY / height) * 2 + 1)
      camMouse.set(mouseCoords.x, mouseCoords.y)

      raycaster.setFromCamera(mouseCoords, camera)
      const hits = raycaster.intersectObject(rayPlane)
      if (hits.length === 0) return
      const { x, z } = hits[0].point

      let distDelta = 0
      if (lastPoint) {
        const dx = x - lastPoint.x
        const dz = z - lastPoint.z
        distDelta = Math.sqrt(dx * dx + dz * dz)
        if (distDelta < trailParams.trailSpacing) return
      }
      if (trail.length >= MAX_TRAIL) trail.shift()
      trail.push({ x, z, age: 0, distDelta })
      lastPoint = { x, z }
      timeSinceLastMove = 0
      isPlacingRandomPoints = false
      randomPointTimer = 0
    }
    window.addEventListener('pointermove', onPointerMove)

    const updateTrail = (delta: number) => {
      const expiry = trailParams.fadeTime * 4
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].age += delta
        if (trail[i].age > expiry) trail.splice(i, 1)
      }

      timeSinceLastMove += delta
      if (timeSinceLastMove >= 3.0 && !isPlacingRandomPoints) {
        isPlacingRandomPoints = true
        randomPointTimer = 0
      }
      if (isPlacingRandomPoints) {
        randomPointTimer += delta
        if (randomPointTimer >= 1.5) {
          addRandomPoint()
          randomPointTimer = 0
        }
      }

      const count = Math.min(trail.length, MAX_TRAIL)
      if (count > 0 || trailUniforms.uTrailCount.value > 0) {
        for (let i = 0; i < count; i++) {
          const ti = i * 4
          trailData[ti] = trail[i].x
          trailData[ti + 1] = trail[i].z
          trailData[ti + 2] = trail[i].age
          trailData[ti + 3] = trail[i].distDelta
        }
        trailTexture.needsUpdate = true
        trailUniforms.uTrailCount.value = count
      }
    }

    // ── グリッド（原典 Stage.setGrid / updateGrid） ──────────────────
    const count = gridSize * gridSize
    const geometry = new THREE.BoxGeometry(cubeWidth, cubeHeight, cubeWidth)
    const offsetAttribute = new THREE.InstancedBufferAttribute(new Float32Array(count * 2), 2)
    geometry.setAttribute('aOffset', offsetAttribute)

    const material = new THREE.MeshPhongMaterial({ color: 0xffffff })
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTrailTexture = trailUniforms.uTrailTexture
      shader.uniforms.uTrailCount = trailUniforms.uTrailCount
      shader.uniforms.uFadeTime = trailUniforms.uFadeTime
      shader.uniforms.uWaveSpeed = { value: params.waveSpeed }
      shader.uniforms.uWaveFreq = { value: params.waveFrequency }
      shader.uniforms.uWaveWidth = { value: params.waveWidth }
      shader.uniforms.uAmplitude = { value: params.waveAmplitude }
      shader.uniforms.uJitter = { value: params.waveJitter }
      shader.uniforms.uMaxHeight = { value: params.waveMaxHeight }
      shader.uniforms.uColorBase = { value: new THREE.Color(params.colorBase) }
      shader.uniforms.uColorHigh = { value: new THREE.Color(params.colorHigh) }

      shader.vertexShader = overrideVertexShader(shader.vertexShader)
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
          varying float vHeight;
          uniform vec3  uColorBase;
          uniform vec3  uColorHigh;
          uniform float uMaxHeight;`,
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
          float t = clamp( vHeight / uMaxHeight, 0.0, 1.0 );
          diffuseColor.rgb = mix( uColorBase, uColorHigh, t );`,
        )
    }

    // 影にも同じ変形を適用（これが無いと影だけ平らなまま浮く）
    const depthMaterial = new THREE.MeshDepthMaterial()
    depthMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTrailTexture = trailUniforms.uTrailTexture
      shader.uniforms.uTrailCount = trailUniforms.uTrailCount
      shader.uniforms.uFadeTime = trailUniforms.uFadeTime
      shader.uniforms.uWaveSpeed = { value: params.waveSpeed }
      shader.uniforms.uWaveFreq = { value: params.waveFrequency }
      shader.uniforms.uWaveWidth = { value: params.waveWidth }
      shader.uniforms.uAmplitude = { value: params.waveAmplitude }
      shader.uniforms.uJitter = { value: params.waveJitter }
      shader.uniforms.uMaxHeight = { value: params.waveMaxHeight }
      shader.vertexShader = overrideVertexShader(shader.vertexShader)
    }

    const instancedMesh = new THREE.InstancedMesh(geometry, material, count)
    instancedMesh.customDepthMaterial = depthMaterial
    instancedMesh.castShadow = true
    instancedMesh.receiveShadow = true
    scene.add(instancedMesh)

    const dummy = new THREE.Object3D()
    const spacing = cubeWidth + params.gap
    const gridOffset = ((gridSize - 1) * spacing) / 2
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j
        const x = i * spacing - gridOffset
        const z = j * spacing - gridOffset
        dummy.position.set(x, 0, z)
        dummy.updateMatrix()
        instancedMesh.setMatrixAt(index, dummy.matrix)
        offsetAttribute.setXY(index, x, z)
      }
    }
    instancedMesh.instanceMatrix.needsUpdate = true
    offsetAttribute.needsUpdate = true

    // ── レンダラ + ポストプロセス（原典 Renderer.js） ────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.95
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.setClearColor('#808080')
    renderer.setSize(width, height)
    renderer.setPixelRatio(pixelRatio)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const vignettePass = new ShaderPass(VignetteRGBShiftShader)
    vignettePass.uniforms.shiftAmount.value = 0.005
    vignettePass.uniforms.vignetteRadius.value = 0.3
    vignettePass.uniforms.vignetteSoftness.value = 0.3
    composer.addPass(vignettePass)
    composer.addPass(new OutputPass())

    const onResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      pixelRatio = Math.min(window.devicePixelRatio, 2)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      renderer.setPixelRatio(pixelRatio)
      composer.setSize(width, height)
      composer.setPixelRatio(pixelRatio)
    }
    window.addEventListener('resize', onResize)

    // ── ループ ───────────────────────────────────────────────────────
    const clock = new THREE.Clock()
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const delta = clock.getDelta()
      if (!activeRef.current) return
      updateTrail(delta)
      camLerped.x += (camMouse.x - camLerped.x) * 0.04
      camLerped.y += (camMouse.y - camLerped.y) * 0.04
      updateCamera(camLerped.x, camLerped.y)
      composer.render()
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', onResize)
      trailTexture.dispose()
      geometry.dispose()
      material.dispose()
      depthMaterial.dispose()
      rayPlane.geometry.dispose()
      ;(rayPlane.material as THREE.Material).dispose()
      composer.dispose()
      renderer.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}
