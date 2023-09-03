import { RoverEntity, WorldType } from '..'

// Components are data associated with entities
export class Component {}

export class Position extends Component {
    constructor(
        public x: number,
        public y: number
    ) {
        super()
    }
}
type PosType = { x: number; y: number }
export class Target extends Component {
    private target: PosType = { x: 0, y: 0 }
    constructor() {
        super()
    }

    setTarget(target: PosType) {
        this.target = target
    }

    getTarget() {
        return this.target
    }
}

export class EntityType extends Component {
    constructor(public type: WorldType) {
        super()
    }
}

export class Style extends Component {
    css: Partial<CSSStyleDeclaration>
    constructor(style: WorldType) {
        super()
        this.css = this.createStyle(style)
    }

    private createStyle(style: WorldType) {
        const styleSheet: Partial<CSSStyleDeclaration> = {
            backgroundColor: this.getColor(style),
        }
        return styleSheet
    }

    private getColor(style: WorldType) {
        switch (style) {
            case 0:
                return 'white'
            case 1:
                return '#333'
            case 2:
                return '#841bea'
            case 3:
                return '#25f871'
            default:
                return 'white'
        }
    }
}

export class Movement extends Component {
    private entity: RoverEntity
    constructor(entity: RoverEntity) {
        super()
        this.entity = entity
    }

    getPosition() {
        const pos = this.entity.components.find(
            (c) => c instanceof Position
        ) as Position
        return pos
    }

    move(command: 'F' | 'B') {
        const pos = this.getPosition()
        if (pos) {
            if (command === 'F') {
                pos.y++
            } else {
                pos.y--
            }
        }
    }

    turn(command: 'L' | 'R') {
        const pos = this.getPosition()
        if (pos) {
            if (command === 'L') {
                pos.x--
            } else {
                pos.x++
            }
        }
    }
}
