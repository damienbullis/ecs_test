import {
    WorldType,
    Entity,
    Component,
    RoverEntity,
    TargetEntity,
    ObstacleEntity,
    Style,
    Position,
    Target,
    History,
    getHistoryColor,
    Pathfinder,
} from '..'
import { World } from '../../main'

// System: Logic to process entities and components
export class System {
    // Entities and components are stored in the system
    // so that they can be processed

    // Entities are stored separately from components
    // Entities are just unique identifiers
    entities: Entity[] = []

    // Components are stored separately from entities
    // Components are data associated with entities
    components: Component[] = []

    // Implement update method to process entities and components
    update() {
        // Iterate through entities and components to update game logic
    }

    addEntity(entity: Entity) {
        this.entities.push(entity)
    }

    removeEntity(entity: Entity) {
        const index = this.entities.indexOf(entity)
        if (index !== -1) {
            this.entities.splice(index, 1)
        }
    }

    addComponent(component: Component) {
        this.components.push(component)
    }

    removeComponent(component: Component) {
        const index = this.components.indexOf(component)
        if (index !== -1) {
            this.components.splice(index, 1)
        }
    }
}

/**
 * SYSTEMS
 * SYSTEMS
 * SYSTEMS
 */

export class WorldSystem extends System {
    // World is a 2D array of entities
    world: [number, number]
    grid: WorldType[][] = null!
    constructor(initialWorld: WorldType[][]) {
        super()
        this.world = [initialWorld[0].length, initialWorld.length]
        this.initWorld(initialWorld)
        this.grid = initialWorld
    }

    init() {
        // Add all entities and components to the world
        this.initEntities()
        this.initComponents()
    }

    private initEntities() {
        // Add target to rover entities target
        const targetEntity = this.entities.find(
            (e) => e instanceof TargetEntity
        ) as TargetEntity

        for (const entity of this.entities.filter(
            (e) => e instanceof RoverEntity
        ) as RoverEntity[]) {
            const target = entity.getComp(Target)
            const pos = targetEntity.getComp(Position)
            target.setTarget({ x: pos.x, y: pos.y })
        }
    }

    private initComponents() {
        // Add all components to the world
        for (const entity of this.entities) {
            for (const component of entity.getComponents()) {
                this.addComponent(component)
            }
        }
    }

    private initWorld(initialWorld: WorldType[][]) {
        for (let y = 0; y < initialWorld.length; y++) {
            for (let x = 0; x < initialWorld[y].length; x++) {
                const type = initialWorld[y][x]
                if (type === 1) {
                    this.addEntity(new ObstacleEntity(x, y))
                }
            }
        }
    }

    getEntities() {
        return this.entities
    }

    private getRandomPosition() {
        const currentObjects = this.entities.map((e) => e.getComp(Position))

        const availablePositions: [number, number][] = []
        const x = this.grid[0].length
        const y = this.grid.length
        for (let i = 0; i < x; i++) {
            for (let j = 0; j < y; j++) {
                if (!currentObjects.find((p) => p.x === i && p.y === j)) {
                    availablePositions.push([i, j])
                }
            }
        }

        const randomIndex = Math.floor(
            Math.random() * availablePositions.length
        )
        return availablePositions[randomIndex]
    }

    addRover() {
        const [x, y] = this.getRandomPosition()
        const rover = new RoverEntity(x, y)
        rover.getComp(Pathfinder).setGrid(this.grid)
        this.addEntity(rover)
        return rover
    }

    update() {
        console.log('update')
        const rovers = this.entities.filter(
            (e) => e instanceof RoverEntity
        ) as RoverEntity[]
        const target = this.entities.find(
            (e) => e instanceof TargetEntity
        ) as TargetEntity

        for (const rover of rovers) {
            if (
                rover.getComp(Position).x === target.getComp(Position).x &&
                rover.getComp(Position).y === target.getComp(Position).y
            ) {
                return rover.id
            }
            rover.update(this.entities)
        }
    }
}

export class RenderingSystem extends System {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    world: WorldSystem = null!
    size = 50
    constructor(canvas: HTMLCanvasElement) {
        super()
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')!
        this.size = 24
    }

    init(world: WorldSystem) {
        this.world = world
        this.canvas.width = (world.world[0] + 2) * this.size
        this.canvas.height = (world.world[1] + 2) * this.size
        const entities = this.world.getEntities()
        // Implement logic to initialize rendering system
        for (const entity of entities) {
            this.addEntity(entity)
        }

        this.drawWorld()
    }

    private drawWorld() {
        const [x, y] = this.world.world
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        const entities = this.world.getEntities()
        // draw rectangles for each cell
        for (let i = 0; i < x + 2; i++) {
            for (let j = 0; j < y + 2; j++) {
                this.drawCell(i, j, entities)
            }
        }
    }

    private drawCell(x: number, y: number, entities: Entity[]) {
        if (this.checkBorder(x, y)) {
            this.ctx.fillStyle = '#111111'
        } else {
            let useHistory = false
            const entity = entities.find((entity) => {
                const pos = entity.getComp(Position)

                // first check position matches
                if (pos.x === x - 1 && pos.y === y - 1) {
                    return true
                }

                if (entity instanceof RoverEntity) {
                    const history = entity.getComp(History).getHistory()
                    // then check history
                    if (history) {
                        for (const pos of history) {
                            if (pos.x === x - 1 && pos.y === y - 1) {
                                useHistory = true
                                return true
                            }
                        }
                    }
                }
            })

            if (entity) {
                const style = entity.getComp(Style)

                if (useHistory) {
                    const history = entity.getComp(History).getHistory()
                    const index = history.findIndex(
                        (pos) => pos.x === x - 1 && pos.y === y - 1
                    )

                    this.ctx.fillStyle = getHistoryColor(
                        style.css.backgroundColor || '#111111',
                        index === -1 ? 0 : index
                    )
                } else {
                    this.ctx.fillStyle = style.css.backgroundColor || '#111111'
                }
            } else {
                this.ctx.fillStyle = '#e3e3e3'
            }
        }
        this.ctx.fillRect(x * this.size, y * this.size, this.size, this.size)
    }

    private checkBorder(x: number, y: number) {
        if (x === 0) return true
        if (y === 0) return true
        if (x === this.world.world[0] + 2 - 1) return true
        if (y === this.world.world[1] + 2 - 1) return true
        return false
    }

    update() {
        this.drawWorld()
    }
}
