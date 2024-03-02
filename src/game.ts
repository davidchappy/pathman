import type { GameState, Direction } from "./types"
import { CellType, Entity, PathNode, Node } from "./types"
import config from "./config"
import useState from "./state"
import useDraw from "./draw"
import { aStar as findPath } from "./pathfinding"
import useEvents from "./events"

const createGame = (canvas: HTMLCanvasElement) => {
  // let state: GameState = getInitialState(canvas)
  const { state, dispatch } = useState(canvas)
  const { draw, drawOverlay } = useDraw(canvas, state)
  const { attachEvents, detachEvents, triggerResize } = useEvents(
    state,
    dispatch,
    {
      onClickReset: () => reset(),
      onRedrawOverlay: () => drawOverlay(),
      onRestartAnimation: () => requestAnimationFrame(animate),
    }
  )

  const init = () => {
    dispatch({ type: "init" })
    dispatch({ type: "updateScale" })
  }

  const update = () => {
    // Update stuff
    if (state.phase === "playing") {
      dispatch({ type: "updatePathman" })
      dispatch({ type: "updateGhosts" })
      dispatch({ type: "updatePellets" })
    }
  }

  // const updateInterval = setInterval(update, config.gameUpdateInterval.rate)
  // dispatch({ type: "setUpdateInterval", payload: updateInterval })

  const animate = (timestamp: number) => {
    // Initialize the previous timestamp
    if (state.previousAnimationTimestamp === undefined) {
      dispatch({ type: "setPreviousAnimationTimestamp", payload: timestamp })
      requestAnimationFrame(animate)
      return
    }

    const deltaTime = timestamp - state.previousAnimationTimestamp
    dispatch({ type: "updateStats", payload: deltaTime })

    update()

    draw()

    dispatch({ type: "setPreviousAnimationTimestamp", payload: timestamp })

    if (state.phase === "paused") return

    requestAnimationFrame(animate)
  }

  const run = () => {
    console.log("Starting Pathman game...", canvas)

    init()
    attachEvents()
    draw()

    // Ensure the canvas is the right size after drawing
    triggerResize()

    // Start the animation loop
    requestAnimationFrame(animate)
  }

  const quit = () => {
    console.log("Stopping Pathman game...")

    dispatch({ type: "reset" })
    detachEvents()
  }

  const reset = () => {
    console.log("Resetting Pathman game...")

    quit()
    run()
  }

  return {
    run,
    quit,
  }
}

export default createGame
