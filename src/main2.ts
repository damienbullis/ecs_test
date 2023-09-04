// class RoverComponent extends Component {}
// class TargetComponent extends Component {}
// class ObstacleComponent extends Component {}

import { RenderingSystem, WorldSystem, INITIAL_WORLD } from './ecs'

// function createWorldEntities(worldMatrix: WorldType[][]) {
//   const entities: Entity[][] = []

//   for (let y = 0; y < worldMatrix.length; y++) {
//     const rowEntities: Entity[] = []

//     for (let x = 0; x < worldMatrix[y].length; x++) {
//       const entityType = worldMatrix[y][x]

//       const entity = new Entity()
//       if (entityType === WORLD_ENUM.ROVER) {
//         entity.components.push(new RoverComponent())
//       } else if (entityType === WORLD_ENUM.TARGET) {
//         entity.components.push(new TargetComponent())
//       } else if (entityType === WORLD_ENUM.OBSTACLE) {
//         entity.components.push(new ObstacleComponent())
//       }

//       rowEntities.push(entity)
//     }

//     entities.push(rowEntities)
//   }

//   return entities
// }

/**
 * MAIN
 * MAIN
 * MAIN
 */

function Main() {
    let count = 0
    const canvas = document.createElement('canvas')
    const titleEl = document.createElement('h4')
    const wrap = document.createElement('div')
    wrap.appendChild(titleEl)
    document.body.appendChild(wrap)
    document.body.appendChild(canvas)

    wrap.style.height = 'auto'
    wrap.style.display = 'flex'
    wrap.style.padding = '1rem'
    wrap.style.flexDirection = 'row'
    wrap.style.justifyContent = 'center'
    wrap.style.alignItems = 'center'
    wrap.style.gap = '1rem'
    wrap.style.marginBottom = 'auto'

    canvas.style.imageRendering = 'pixelated'
    canvas.style.width = '100%'

    titleEl.innerText = 'Update Count: ' + count

    const renderingSystem = new RenderingSystem(canvas)
    const worldSystem = new WorldSystem(INITIAL_WORLD)

    worldSystem.init()
    renderingSystem.init(worldSystem)

    console.log({ worldSystem, renderingSystem })

    let interval: NodeJS.Timeout
    // interval = setInterval(() => {
    //     titleEl.innerText = 'Update Count: ' + count++
    //     worldSystem.update()
    //     renderingSystem.update()
    // }, 1000)

    const pause = document.createElement('button')
    pause.innerText = 'Start'
    pause.onclick = () => {
        if (interval) {
            clearInterval(interval)
            interval = null!
            pause.innerText = 'Resume'
        } else {
            pause.innerText = 'Pause'
            interval = setInterval(() => {
                titleEl.innerText = 'Update Count: ' + count++
                worldSystem.update()
                renderingSystem.update()
            }, 500)
        }
    }

    wrap.appendChild(pause)
    document.body.appendChild(wrap)
}

Main()
