export const WORLD_ENUM = {
  EMPTY: 0,
  OBSTACLE: 1,
  ROVER: 2,
  TARGET: 3,
} as const

type WorldType = (typeof WORLD_ENUM)[keyof typeof WORLD_ENUM]

const WORLD: WorldType[][] = [
  [2, 0, 1, 1, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
  [0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 3],
]
type CommandType = 'F' | 'L' | 'R'
type DirectionType = 'N' | 'E' | 'S' | 'W'

export type PosType = {
  x: number
  y: number
}

export type AdjacentCellsType = Record<'N' | 'E' | 'S' | 'W', WorldType>

export class Rover {
  private currentTarget: PosType | null = null
  private location: PosType
  private direction: DirectionType = 'N'
  private memory: (0 | 1)[][]

  constructor(initialLocation: PosType = { x: 0, y: 0 }) {
    this.location = initialLocation
    this.memory = []
  }

  public initializeMemory(world: World): void {
    const { x, y } = world.getWorldSize()
    for (let i = 0; i < y; i++) {
      this.memory.push([])
      for (let j = 0; j < x; j++) {
        this.memory[i].push(0)
      }
    }

    this.memory[this.location.y][this.location.x] = 1
  }

  private move(command: CommandType): void {
    const { x, y } = this.location
    const facing = this.direction

    switch (command) {
      case 'F':
        switch (facing) {
          case 'N':
            this.location = { x, y: y - 1 }
            break
          case 'E':
            this.location = { x: x + 1, y }
            break
          case 'S':
            this.location = { x, y: y + 1 }
            break
          case 'W':
            this.location = { x: x - 1, y }
            break
        }
        break
      case 'L':
        switch (facing) {
          case 'N':
            this.direction = 'W'
            break
          case 'E':
            this.direction = 'N'
            break
          case 'S':
            this.direction = 'E'
            break
          case 'W':
            this.direction = 'S'
            break
        }
        break
      case 'R':
        switch (facing) {
          case 'N':
            this.direction = 'E'
            break
          case 'E':
            this.direction = 'S'
            break
          case 'S':
            this.direction = 'W'
            break
          case 'W':
            this.direction = 'N'
            break
        }
        break
    }
  }

  public navigateTo(target: PosType): void {
    this.currentTarget = target
  }

  public getLocation(): PosType {
    return this.location
  }

  public getDirection(): DirectionType {
    return this.direction
  }

  public getTarget(): PosType | null {
    return this.currentTarget
  }

  public update(adjacentCells: AdjacentCellsType): PosType {
    if (this.currentTarget === null) return this.location
    const { x: targetX, y: targetY } = this.currentTarget
    const { x, y } = this.location
    const facing = this.direction
    const diffX = targetX - x
    const diffY = targetY - y

    if (diffX === 0 && diffY === 0) {
      this.currentTarget = null
      return this.location
    }
    const availableDirections: DirectionType[] = []
    if (adjacentCells.N !== WORLD_ENUM.OBSTACLE) availableDirections.push('N')
    if (adjacentCells.E !== WORLD_ENUM.OBSTACLE) availableDirections.push('E')
    if (adjacentCells.S !== WORLD_ENUM.OBSTACLE) availableDirections.push('S')
    if (adjacentCells.W !== WORLD_ENUM.OBSTACLE) availableDirections.push('W')

    if (availableDirections.length === 0) return this.location
    // determine out of available directions which is closest to target
    let nextCommand: CommandType | null = null
    const filteredDirections = availableDirections.filter(direction => {
      // TODO: FIX THIS SECTION

      // Add in memory to check if we've been here before
      switch (direction) {
        case 'N':
          return diffY < 0
        case 'E':
          return diffX > 0
        case 'S':
          return diffY > 0
        case 'W':
          return diffX < 0
      }
    })
    for (const direction of filteredDirections) {
      if (nextCommand === null) {
        nextCommand =
          direction === facing ? 'F' : this.getTurnCommand(direction)
        continue
      }
    }

    if (nextCommand !== null) this.move(nextCommand)
    console.log({
      command_issued: nextCommand,
      target: this.currentTarget,
      location: this.location,
    })
    if (
      this.location.x === this.currentTarget.x &&
      this.location.y === this.currentTarget.y
    ) {
      this.currentTarget = null
    }
    return this.location
  }

  private getTurnCommand(nextDirection: DirectionType): CommandType | null {
    switch (this.direction) {
      case 'N':
        switch (nextDirection) {
          case 'E':
            return 'R'
          case 'S':
            return 'R'
          case 'W':
            return 'L'
          default:
            return null
        }
      case 'E':
        switch (nextDirection) {
          case 'N':
            return 'L'
          case 'S':
            return 'R'
          case 'W':
            return 'R'
          default:
            return null
        }
      case 'S':
        switch (nextDirection) {
          case 'N':
            return 'R'
          case 'E':
            return 'L'
          case 'W':
            return 'R'
          default:
            return null
        }
      case 'W':
        switch (nextDirection) {
          case 'N':
            return 'R'
          case 'E':
            return 'R'
          case 'S':
            return 'L'
          default:
            return null
        }
    }
  }
}

export class World {
  private world: WorldType[][]
  private players: Rover[]
  constructor(players: Rover[] = [], goal: PosType = { x: 9, y: 4 }) {
    this.world = structuredClone(WORLD)
    this.players = players
    players.forEach(player => {
      const pos = player.getLocation()
      this.world[pos.y][pos.x] = WORLD_ENUM.ROVER
    })
    this.world[goal.y][goal.x] = WORLD_ENUM.TARGET
  }

  public getWorld(): WorldType[][] {
    return this.world
  }

  public getPlayers(): Rover[] {
    return this.players
  }

  public getWorldSize(): PosType {
    return {
      x: this.world[0].length,
      y: this.world.length,
    }
  }

  public getAdjacentCells(pos: PosType) {
    const { x, y } = pos
    const result: AdjacentCellsType = {
      N: this.getWorldCell({ x, y: y - 1 }),
      E: this.getWorldCell({ x: x + 1, y }),
      S: this.getWorldCell({ x, y: y + 1 }),
      W: this.getWorldCell({ x: x - 1, y }),
    }
    return result
  }

  public getWorldCell(pos: PosType): WorldType {
    if (pos.x < 0 || pos.y < 0) return WORLD_ENUM.OBSTACLE
    if (pos.x >= this.world[0].length || pos.y >= this.world.length)
      return WORLD_ENUM.OBSTACLE
    return this.world[pos.y][pos.x]
  }

  public setWorldCell(pos: PosType, value: WorldType): void {
    this.world[pos.y][pos.x] = value
  }

  public updateWorld(): void {
    for (const player of this.players) {
      const prevPos = player.getLocation()
      const pos = player.update(this.getAdjacentCells(prevPos))

      this.setWorldCell(prevPos, WORLD_ENUM.EMPTY)
      this.setWorldCell(pos, WORLD_ENUM.ROVER)
    }
  }
}
