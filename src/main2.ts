import {
    RenderingSystem,
    WorldSystem,
    INITIAL_WORLD,
    TargetEntity,
} from './ecs'

/**
 * MAIN
 * MAIN
 * MAIN
 */

function Main(roverCount = 1) {
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

    for (let i = 0; i < roverCount; i++) {
        worldSystem.addRover()
    }
    worldSystem.addEntity(new TargetEntity(9, 4))
    worldSystem.init()
    renderingSystem.init(worldSystem)

    console.log({ worldSystem, renderingSystem })

    const addRover = document.createElement('button')

    const addRoverWrap = document.createElement('div')
    const addRoverCount = document.createElement('span')
    addRover.innerText = 'Add Rover'
    addRover.onclick = () => {
        const nextCount = roverCount + 1
        // addRoverCount.innerText = roverCount.toString()
        document.body.removeChild(wrap)
        document.body.removeChild(canvas)
        Main(nextCount)
    }
    addRoverWrap.style.display = 'flex'
    addRoverWrap.style.flexDirection = 'row'
    addRoverWrap.style.gap = '1rem'
    addRoverCount.innerText = roverCount.toString()
    addRoverWrap.appendChild(addRover)
    addRoverWrap.appendChild(addRoverCount)
    wrap.appendChild(addRoverWrap)

    let interval: NodeJS.Timeout

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
