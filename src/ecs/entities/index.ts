import {
    WORLD_ENUM,
    Component,
    EntityType,
    Movement,
    Position,
    Target,
    Style,
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
        this.addComponent(new Target())
        this.addComponent(new Style(WORLD_ENUM.ROVER))
        this.addComponent(new EntityType(WORLD_ENUM.ROVER))
        this.addComponent(new Movement(this))
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
