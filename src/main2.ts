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
                const res = worldSystem.update()
                if (res !== undefined) {
                    clearInterval(interval)
                    interval = null!
                    pause.innerText = 'Start'
                    const overlay = document.createElement('div')
                    overlay.style.position = 'absolute'
                    overlay.style.top = '0'
                    overlay.style.left = '0'
                    overlay.style.width = '100%'
                    overlay.style.height = '100%'
                    overlay.style.backgroundColor = 'rgba(255,255,255,0.6)'
                    overlay.style.backdropFilter = 'blur(20px)'
                    overlay.style.display = 'flex'
                    overlay.style.justifyContent = 'center'
                    overlay.style.alignItems = 'center'
                    overlay.style.flexDirection = 'column'
                    overlay.style.gap = '2rem'

                    const finishedTitle = document.createElement('h1')
                    finishedTitle.innerText = 'Finished!'

                    const finishedSubTitle = document.createElement('h2')
                    finishedSubTitle.innerText =
                        'Rover ' + res + ' reached the target!'

                    const restartButton = document.createElement('button')
                    restartButton.innerText = 'Restart'
                    restartButton.onclick = () => {
                        document.body.removeChild(overlay)
                        document.body.removeChild(wrap)
                        document.body.removeChild(canvas)

                        Main()
                    }

                    overlay.appendChild(finishedTitle)
                    overlay.appendChild(finishedSubTitle)
                    overlay.appendChild(restartButton)
                    document.body.appendChild(overlay)
                } else {
                    renderingSystem.update()
                }
            }, 500)
        }
    }

    wrap.appendChild(pause)
    document.body.appendChild(wrap)
}

Main()
