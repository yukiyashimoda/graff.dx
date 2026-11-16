import * as THREE from 'three'

const SIGN_RADIUS = 0.4
const RING_COLOR = '#c23b2e'
const POLE_COLOR = 0x888888

/**
 * 最高速度標識（規制標識、赤丸に速度数字）。仕様v3 §16-17: 制限速度が変わる地点付近に置き、
 * ゲーム判定そのものはSpeedLimitZone（Road.speedLimitKmh）側で行う。標識はあくまで視覚表現。
 * facing方向の計算ミスで数字が裏返って見える事故を避けるため、表裏それぞれに独立した
 * （片方は鏡像の）テクスチャを貼った板を背中合わせに配置し、どちらの向きから見ても
 * 正しく読めるようにする（実物の標識は片面のみだが、視認性を優先する）。
 */
export function buildSpeedLimitSign(position: THREE.Vector3, facing: THREE.Quaternion, speedLimitKmh: number): THREE.Group {
  const group = new THREE.Group()

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8),
    new THREE.MeshStandardMaterial({ color: POLE_COLOR, roughness: 0.5 }),
  )
  pole.position.y = 1.1
  group.add(pole)

  const front = new THREE.Mesh(
    new THREE.CircleGeometry(SIGN_RADIUS, 32),
    new THREE.MeshStandardMaterial({ map: buildSpeedLimitTexture(speedLimitKmh, false), roughness: 0.5, side: THREE.FrontSide }),
  )
  front.quaternion.copy(facing)
  front.position.y = 2.2
  group.add(front)

  const back = new THREE.Mesh(
    new THREE.CircleGeometry(SIGN_RADIUS, 32),
    new THREE.MeshStandardMaterial({ map: buildSpeedLimitTexture(speedLimitKmh, true), roughness: 0.5, side: THREE.FrontSide }),
  )
  back.quaternion.copy(facing)
  back.rotateY(Math.PI)
  back.position.y = 2.2
  group.add(back)

  group.position.copy(position)
  return group
}

function buildSpeedLimitTexture(speedLimitKmh: number, mirrored: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (ctx) {
    if (mirrored) {
      ctx.translate(128, 0)
      ctx.scale(-1, 1)
    }
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(64, 64, 62, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = RING_COLOR
    ctx.lineWidth = 12
    ctx.beginPath()
    ctx.arc(64, 64, 56, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = '#1c1c1c'
    ctx.font = 'bold 44px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(speedLimitKmh), 64, 68)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
