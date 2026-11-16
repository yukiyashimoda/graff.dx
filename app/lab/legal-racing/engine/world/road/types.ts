import * as THREE from 'three'

/** 仕様v2 §29: 車線ごとの進行方向別通行区分。道路上の矢印はこの値から生成する。 */
export type TurnDirection = 'STRAIGHT' | 'LEFT' | 'RIGHT'

/** 仕様v2 §7: 中央線＝対向交通を分離する線。同方向の複数車線を分ける線とは別物。 */
export type CenterLineType = {
  color: 'WHITE' | 'YELLOW'
  style: 'SOLID' | 'DASHED'
  prohibitCrossingForOvertake: boolean
}

/** 仕様v2 §8: 車線境界線＝同方向の車線同士を分ける線。中央線とは完全に別オブジェクト。 */
export type LaneDividerType = {
  color: 'WHITE' | 'YELLOW'
  style: 'SOLID' | 'DASHED'
  laneChangeAllowed: boolean
}

/** 仕様v2 §5: 各Laneは必ず自身の進行方向を持つ。NPC・プレイヤー判定で共通使用する。 */
export type Lane = {
  id: string
  roadId: string
  direction: THREE.Vector3
  indexFromLeft: number
  allowedDirections: TurnDirection[]
  laneChangeLeft: boolean
  laneChangeRight: boolean
  speedLimit: number
  /** 直線区間のみ対応（Stage 1）。v1=始点, v2=終点。 */
  centerPath: THREE.LineCurve3
}

/** 仕様v2 §11-12: 車道外側線（歩道側）と路側帯（歩道なし）は別物として扱う。 */
export type RoadEdgeMarking = {
  side: 'LEFT' | 'RIGHT'
  rule: 'ROAD_EDGE_LINE' | 'ROADSIDE_STRIP'
  start: THREE.Vector3
  end: THREE.Vector3
}

/**
 * 仕様v2 §9: 黄色線を色だけで「侵入禁止」と判定してはいけない。ここでは逆に、
 * 道路交通法の道路標示ルールから中央線の色・様式を導出する（道幅6m未満のみ黄色）。
 */
export function deriveCenterLineType(roadWidthMeters: number, allowOvertake: boolean): CenterLineType {
  if (roadWidthMeters < 6) {
    return { color: 'YELLOW', style: 'SOLID', prohibitCrossingForOvertake: true }
  }
  return {
    color: 'WHITE',
    style: allowOvertake ? 'DASHED' : 'SOLID',
    prohibitCrossingForOvertake: !allowOvertake,
  }
}
