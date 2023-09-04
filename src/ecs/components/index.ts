import { Entity, RoverEntity, WORLD_ENUM, WorldType } from '..'

// Components are data associated with entities
export class Component {}

export type AllComponents =
    | Position
    | Target
    | EntityType
    | Style
    | Movement
    | Pathfinder
    | History

export class Position extends Component {
    constructor(
        public x: number,
        public y: number
    ) {
        super()
    }
}
export type PosType = { x: number; y: number }
export class Target extends Component {
    private target: PosType | null = null
    constructor() {
        super()
    }

    setTarget(target: PosType | null) {
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

export class History extends Component {
    private history: PosType[] = []

    addHistory(pos: PosType) {
        if (this.history.length > 2) {
            this.history.pop()
        }

        this.history.unshift(pos)
    }

    getHistory() {
        return this.history
    }
}

export class Movement extends Component {
    private entity: RoverEntity
    constructor(entity: RoverEntity) {
        super()
        this.entity = entity
    }

    getPosition() {
        const pos = this.entity.getComp(Position)
        return pos
    }

    upDown(command: 'F' | 'B') {
        const pos = this.getPosition()
        if (pos) {
            if (command === 'F') {
                pos.y++
            } else {
                pos.y--
            }
        }
    }

    leftRight(command: 'L' | 'R') {
        const pos = this.getPosition()
        if (pos) {
            if (command === 'L') {
                pos.x--
            } else {
                pos.x++
            }
        }
    }

    moveAlongPath(path: PosType[]) {
        const currentPos = path[0]
        const nextPos = path[1 % path.length]

        // Calculate the movement direction
        const dx = nextPos.x - currentPos.x
        const dy = nextPos.y - currentPos.y

        if (dx > 0) {
            this.leftRight('R') // Move right
        } else if (dx < 0) {
            this.leftRight('L') // Move left
        }

        if (dy > 0) {
            this.upDown('F') // Move forward
        } else if (dy < 0) {
            this.upDown('B') // Move backward
        }
    }
}

export class Pathfinder extends Component {
    private grid: number[][] | null = null
    constructor(
        private move: Movement,
        private target: Target
    ) {
        super()
    }

    initGrid(entities: Entity[]) {
        // build the world size
        const maxX = Math.max(
            ...entities.map((e) => {
                const pos = e.getComp(Position)
                if (pos) {
                    return pos.x + 1
                }
                return 0
            })
        )
        const maxY = Math.max(
            ...entities.map((e) => {
                const pos = e.getComp(Position)
                if (pos) {
                    return pos.y + 1
                }
                return 0
            })
        )
        this.grid = Array(maxY)
            .fill(0)
            .map(() => Array(maxX).fill(0))

        for (const entity of entities) {
            const pos = entity.getComp(Position)
            const type = entity.getComp(EntityType)
            if (pos && type) {
                this.grid[pos.y][pos.x] = type.type
            }
        }
    }

    // A* algorithm
    findPath(entities: Entity[]) {
        if (this.grid === null) {
            // build the grid once
            this.initGrid(entities)
        }

        // Get the start and goal positions
        const grid = this.grid!
        const start = this.move.getPosition()
        const goal = this.target.getTarget()

        // Define the A* data structures: open set, closed set, came-from map, and g-score
        const openSet: PosType[] = [start]
        const cameFrom: { [key: string]: PosType } = {}
        const gScore: { [key: string]: number } = {}

        // Initialize g-score for start position
        gScore[`${start.x},${start.y}`] = 0

        let current: PosType = start
        // Implement the A* algorithm logic here
        while (openSet.length > 0) {
            // Find the node with the lowest f-score in the open set and set it as the current node
            current = this.findLowestFScoreNode(
                openSet,
                gScore,
                goal ?? { x: 0, y: 0 }
            )

            // If the current node is the goal, reconstruct the path and return it
            if (current.x === goal?.x && current.y === goal.y) {
                return this.reconstructPath(cameFrom, goal)
            }

            // Remove the current node from the open set and mark it as visited
            const currentIndex = openSet.findIndex(
                (node) => node.x === current.x && node.y === current.y
            )
            if (currentIndex !== -1) {
                openSet.splice(currentIndex, 1)
            }

            // Explore the neighbors of the current node
            const neighbors = this.getNeighbors(current, grid)

            // Iterate through the neighbors of the current node
            for (const neighbor of neighbors) {
                // Calculate tentative g-score for the neighbor
                const neighborGScore =
                    gScore[`${current.x},${current.y}`] +
                    this.calculateDistance(current, neighbor)

                // Check if the neighbor is not in the closed set or has a lower g-score
                const neighborKey = `${neighbor.x},${neighbor.y}`
                if (
                    !gScore.hasOwnProperty(neighborKey) ||
                    neighborGScore < gScore[neighborKey]
                ) {
                    // Update g-score for the neighbor
                    gScore[neighborKey] = neighborGScore

                    // Update came-from for the neighbor (to remember how we got there)
                    cameFrom[neighborKey] = { x: current.x, y: current.y }

                    // Add the neighbor to the open set if not already present
                    if (
                        !openSet.some(
                            (node) =>
                                node.x === neighbor.x && node.y === neighbor.y
                        )
                    ) {
                        openSet.push(neighbor)
                    }
                }
            }
        }

        // If the open set is empty and the goal was not reached, return an empty path
        return []
    }

    private reconstructPath(
        cameFrom: { [key: string]: PosType },
        goal: PosType
    ): PosType[] {
        const path: PosType[] = []
        let current: PosType = goal

        while (cameFrom[`${current.x},${current.y}`]) {
            path.unshift(current) // Add the current node to the beginning of the path
            current = cameFrom[`${current.x},${current.y}`] // Move to the previous node
        }

        // Add the start node to the path
        path.unshift(current)

        return path
    }

    private findLowestFScoreNode(
        openSet: PosType[],
        gScore: { [key: string]: number },
        goal: PosType
    ): PosType {
        let lowestFScoreNode = openSet[0] // Initialize with the first node in openSet

        for (const node of openSet) {
            const nodeGScore = gScore[`${node.x},${node.y}`]

            // Calculate the f-score for the current node (f = g + h, where h is the heuristic)
            const fScore = nodeGScore + this.calculateHeuristic(node, goal)

            // Calculate the f-score for the lowestFScoreNode
            const lowestGScore =
                gScore[`${lowestFScoreNode.x},${lowestFScoreNode.y}`]
            const lowestFScore =
                lowestGScore + this.calculateHeuristic(lowestFScoreNode, goal)

            // If the current node has a lower f-score, update lowestFScoreNode
            if (fScore < lowestFScore) {
                lowestFScoreNode = node
            }
        }

        return lowestFScoreNode
    }

    private calculateDistance(point1: PosType, point2: PosType): number {
        return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y)
    }

    private calculateHeuristic(node: PosType, goal: PosType): number {
        // Implement a heuristic function to estimate the cost from node to goal
        // You can use Manhattan distance, Euclidean distance, or any suitable heuristic
        // For example, using Manhattan distance:
        return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y)
    }

    private getNeighbors(node: PosType, grid: number[][]): PosType[] {
        const neighbors: PosType[] = []
        const x = node.x
        const y = node.y

        // Define possible neighbor offsets (4-way movement)
        const offsets = [
            { dx: 0, dy: -1 }, // Up
            { dx: 0, dy: 1 }, // Down
            { dx: -1, dy: 0 }, // Left
            { dx: 1, dy: 0 }, // Right
        ]

        for (const offset of offsets) {
            const neighborX = x + offset.dx
            const neighborY = y + offset.dy

            // Check if the neighbor is within the grid boundaries
            if (
                neighborX >= 0 &&
                neighborX < grid[0].length &&
                neighborY >= 0 &&
                neighborY < grid.length
            ) {
                // Check if the neighbor is not an obstacle (you may have obstacle representation in your grid)
                if (grid[neighborY][neighborX] !== WORLD_ENUM.OBSTACLE) {
                    neighbors.push({ x: neighborX, y: neighborY })
                }
            }
        }

        return neighbors
    }
}
