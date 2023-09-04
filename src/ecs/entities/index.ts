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
    History,
} from '..'

// Entity: Unique identifier for each game object
export class Entity {
    static lastId = 0
    id: number
    private visible = false
    private components: Component[] = []

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
        const _class = this.components.find(
            (comp) => comp instanceof ComponentClass
        )

        if (!_class || !(_class instanceof ComponentClass)) {
            throw new Error(
                `Component ${ComponentClass.name} not found on entity ${this.id}`
            )
        }

        return _class
    }

    getComponents() {
        return this.components
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
        this.addComponent(new History())
        this.addComponent(new Pathfinder(movement, target))
    }

    update(entities: Entity[]) {
        const target = this.getComp(Target)
        const movement = this.getComp(Movement)
        const pathfinder = this.getComp(Pathfinder)
        const history = this.getComp(History)

        const targetPos = target.getTarget()
        const { x, y } = movement.getPosition()
        history.addHistory({ x, y })
        if (targetPos) {
            const { x: x2, y: y2 } = targetPos
            if (x === x2 && y === y2) {
                target.setTarget(null)
                return
            }

            const path = pathfinder.findPath(entities)

            if (path.length > 0) {
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
