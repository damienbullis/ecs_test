import {
    WORLD_ENUM,
    Component,
    EntityType,
    Movement,
    Position,
    Target,
    Style,
    Pathfinder,
    AllComponents,
} from '..'

// Entity: Unique identifier for each game object
export class Entity {
    static lastId = 0
    id: number
    private visible = false
    components: Component[] = []

    constructor() {
        this.id = ++Entity.lastId
    }

    getVisible() {
        return this.visible
    }

    setVisible(visible: boolean) {
        this.visible = visible
    }

    getComp<T extends AllComponents>(
        ComponentClass: new (...args: any[]) => T
    ) {
        return this.components.find(
            (comp) => comp instanceof ComponentClass
        ) as T
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

export class RoverEntity extends Entity {
    constructor(x = 0, y = 0) {
        super()
        this.setVisible(true)
        this.addComponent(new Position(x, y))

        const target = new Target()
        this.addComponent(target)
        this.addComponent(new Style(WORLD_ENUM.ROVER))
        this.addComponent(new EntityType(WORLD_ENUM.ROVER))
        const movement = new Movement(this)
        this.addComponent(movement)
        this.addComponent(new Pathfinder(movement, target))
    }

    update(entities: Entity[]) {
        const movement = this.components.find((c) => c instanceof Movement) as
            | Movement
            | undefined
        const pathfinder = this.components.find(
            (c) => c instanceof Pathfinder
        ) as Pathfinder | undefined
        const target = this.components.find((c) => c instanceof Target) as
            | Target
            | undefined

        const targetPos = target?.getTarget()

        if (targetPos) {
            const { x, y } = targetPos
            console.log({ x, y, movement, pathfinder, target })
            const { x: x2, y: y2 } = movement?.getPosition() || { x: 0, y: 0 }
            if (x === x2 && y === y2) {
                target?.setTarget(null)
                return
            }

            const path = pathfinder?.findPath(entities) || []

            if (path.length > 0 && movement) {
                movement.moveAlongPath(path)
            }
        }
    }
}

export class TargetEntity extends Entity {
    constructor(x = 0, y = 0) {
        super()
        this.setVisible(true)
        this.addComponent(new Position(x, y))
        this.addComponent(new Style(WORLD_ENUM.TARGET))
        this.addComponent(new EntityType(WORLD_ENUM.TARGET))
    }
}

export class ObstacleEntity extends Entity {
    constructor(x = 0, y = 0) {
        super()
        this.setVisible(true)
        this.addComponent(new Position(x, y))
        this.addComponent(new Style(WORLD_ENUM.OBSTACLE))
        this.addComponent(new EntityType(WORLD_ENUM.OBSTACLE))
    }
}
