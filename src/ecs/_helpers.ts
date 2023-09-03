export const WORLD_ENUM = {
  EMPTY: 0,
  OBSTACLE: 1,
  ROVER: 2,
  TARGET: 3,
} as const

export type WorldType = (typeof WORLD_ENUM)[keyof typeof WORLD_ENUM]

export const INITIAL_WORLD: WorldType[][] = [
  [0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
  [0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
]
