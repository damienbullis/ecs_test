import { World, Rover, WORLD_ENUM } from './main'
import { expect, describe, it, beforeEach, vi } from 'vitest'

describe('Rover', () => {
  it('should create a rover', () => {
    const rover = new Rover()
    expect(rover).toBeInstanceOf(Rover)
  })
  it('w/ no props', () => {
    const rover = new Rover()
    expect(rover.getLocation()).toEqual({ x: 0, y: 0 })
    expect(rover.getDirection()).toEqual('N')
  })
  it('w/ props', () => {
    const rover = new Rover({ x: 1, y: 2 })
    expect(rover.getLocation()).toEqual({ x: 1, y: 2 })
    expect(rover.getDirection()).toEqual('N')
  })
})

describe('World w/ no initial props', () => {
  let world: World
  beforeEach(() => {
    world = new World()
  })

  it('should have no players', () => {
    expect(world.getPlayers()).toEqual([])
  })

  it('should have a world', () => {
    const result = world.getWorldSize()
    expect(result).toEqual({ x: 10, y: 5 })
  })

  it('should return obstacle for off the map', () => {
    const result = world.getWorldCell({ x: -1, y: -1 })
    expect(result).toEqual(WORLD_ENUM.OBSTACLE)

    const result2 = world.getWorldCell({ x: 100, y: 58 })
    expect(result2).toEqual(WORLD_ENUM.OBSTACLE)
  })

  it('should have a default target', () => {
    const result = world.getWorldCell({ x: 9, y: 4 })
    expect(result).toEqual(WORLD_ENUM.TARGET)
  })
})

describe('The Game w/ single player', () => {
  const initialLocation = { x: 0, y: 0 }
  const targetLocation = { x: 0, y: 2 }
  let world: World
  let player: Rover
  beforeEach(() => {
    player = new Rover()
    world = new World([player])
  })

  it('should have a player', () => {
    expect(world.getPlayers()).toEqual([player])
  })

  it('The Rover exists at the initial location', () => {
    expect(world.getWorldCell(initialLocation)).toEqual(WORLD_ENUM.ROVER)
  })

  describe('Checking Rover.navigateTo() works with game ticker', () => {
    const player = new Rover()
    const world = new World([player])
    player.navigateTo(targetLocation)
    it('After a single tick, rover turns', () => {
      world.updateWorld()
      expect(world.getWorldCell(initialLocation)).toEqual(WORLD_ENUM.ROVER)
      expect(player.getDirection()).toEqual('E')
    })
    it('After two ticks, rover turns', () => {
      world.updateWorld()
      expect(world.getWorldCell(initialLocation)).toEqual(WORLD_ENUM.ROVER)
      expect(player.getDirection()).toEqual('S')
    })
    it('After three ticks, rover moves forward', () => {
      world.updateWorld()
      expect(world.getWorldCell(initialLocation)).toEqual(WORLD_ENUM.EMPTY)
      expect(player.getDirection()).toEqual('S')
      expect(player.getTarget()).toEqual(targetLocation)
      expect(player.getLocation()).toEqual({ x: 0, y: 1 })
    })
    it('After four ticks, rover moves forward', () => {
      world.updateWorld()
      expect(world.getWorldCell(initialLocation)).toEqual(WORLD_ENUM.EMPTY)
      expect(world.getWorldCell(targetLocation)).toEqual(WORLD_ENUM.ROVER)
      expect(player.getTarget()).toEqual(null)
      expect(player.getLocation()).toEqual(targetLocation)
    })
    it('After five ticks, rover does nothing', () => {
      world.updateWorld()
      expect(world.getWorldCell(targetLocation)).toEqual(WORLD_ENUM.ROVER)
      expect(player.getTarget()).toEqual(null)
    })
  })
})

describe('The Rover can navigateTo the target', () => {
  const initialLocation = { x: 0, y: 0 }
  const targetLocation = { x: 9, y: 4 } // the default target

  let world: World
  let player: Rover
  let tickCount = 0
  beforeEach(() => {
    player = new Rover()
    world = new World([player])
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  it('The Rover exists at the initial location', () => {
    expect(world.getWorldCell(initialLocation)).toEqual(WORLD_ENUM.ROVER)
  })

  it('The Rover can navigateTo the target', () => {
    console.log({ targetLocation })
    player.navigateTo(targetLocation)
    expect(player.getTarget()).toEqual(targetLocation)

    const interval = setInterval(() => {
      console.log('player.getTarget()', player.getTarget())
      if (player.getTarget() === null) {
        clearInterval(interval)
      }
      tickCount++
      console.log('tickCount', tickCount)
      world.updateWorld()
    }, 1000)

    vi.advanceTimersByTime(1000)
    expect(player.getDirection()).toEqual('E')
    vi.advanceTimersByTime(5000)
    expect(tickCount).toEqual(6)

    vi.advanceTimersByTime(20000)
    expect(player.getTarget()).toEqual(null)
  })
})
