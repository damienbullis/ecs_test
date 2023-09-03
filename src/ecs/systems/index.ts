import {
    WorldType,
    Entity,
    Component,
    RoverEntity,
    TargetEntity,
    ObstacleEntity,
} from '..'
import { Position, Style } from '../components'

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
    constructor(initialWorld: WorldType[][]) {
        super()
        // this.world = createWorldEntities(initialWorld)
        this.world = [initialWorld[0].length, initialWorld.length]
        this.initWorld(initialWorld)
    }

    init() {
        // Add all entities and components to the world
        this.initEntities()

        this.initComponents()
    }

    private initEntities() {
        // Add all entities to the world
        this.addEntity(new RoverEntity())
        this.addEntity(new TargetEntity(9, 4))
    }

    private initComponents() {
        // Add all components to the world
        for (const entity of this.entities) {
            for (const component of entity.components) {
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

    update() {
        // Implement logic to update the world state
    }
}

export class RenderingSystem extends System {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    world: WorldSystem = null!

    constructor(canvas: HTMLCanvasElement) {
        super()
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')!
    }

    init(world: WorldSystem) {
        this.world = world
        this.canvas.width = (world.world[0] + 2) * 50
        this.canvas.height = (world.world[1] + 2) * 50
        const entities = this.world.getEntities()
        // Implement logic to initialize rendering system
        for (const entity of entities) {
            this.addEntity(entity)
        }

        this.drawWorld()
    }

    private drawWorld() {
        const [x, y] = this.world.world
        console.log({ x, y })
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
            const entity = entities.find((entity) => {
                const pos = entity.components.find(
                    (component) => component instanceof Position
                ) as Position
                return pos.x === x - 1 && pos.y === y - 1
            })

            if (entity) {
                const style = entity.components.find(
                    (component) => component instanceof Style
                ) as Style
                this.ctx.fillStyle = style.css.backgroundColor || 'yellow'
            } else {
                this.ctx.fillStyle = '#e3e3e3'
            }
        }

        this.ctx.fillRect(x * 50, y * 50, 50, 50)
    }

    private checkBorder(x: number, y: number) {
        if (x === 0) return true
        if (y === 0) return true
        if (x === this.world.world[0] + 2 - 1) return true
        if (y === this.world.world[1] + 2 - 1) return true
        return false
    }

    update() {
        // Implement rendering logic here
    }
}