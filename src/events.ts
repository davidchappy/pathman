import { GameState, Action } from "./types"
import config from "./config"

type EventHandlers = {
  onClickReset: () => void
  onRedrawOverlay: () => void
  onRestartAnimation: () => void
}

const useEvents = (
  state: GameState,
  dispatch: (action: Action) => void,
  { onClickReset, onRedrawOverlay, onRestartAnimation }: EventHandlers
) => {
  const canvas = state.canvas

  const onResize = () => {
    dispatch({ type: "updateMazePosition" })
    dispatch({ type: "updateScale" })
  }
  const onStartPlaying = () => {
    dispatch({ type: "updateOverlayText", payload: "" })
    dispatch({ type: "updatePhase", payload: "playing" })
    onRedrawOverlay()
  }
  const onTogglePause = () => {
    dispatch({
      type: "updatePhase",
      payload: state.phase === "paused" ? "playing" : "paused",
    })

    if (state.phase === "paused") {
      dispatch({
        type: "updateOverlayText",
        payload: config.overlayMessages.paused,
      })
      onRedrawOverlay()
    } else {
      dispatch({ type: "updateOverlayText", payload: "" })
      // If unpausing, re-start the animation loop
      onRestartAnimation()
    }
    onRedrawOverlay()
  }

  const handleResize = () => {
    // Resize the canvas
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    onResize()
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    // console.log("Key up", state.phase)
    if (
      state.phase === "intro" ||
      state.phase === "game-over" ||
      state.phase === "game-won"
    ) {
      // if (state.phase === "game-over" || state.phase === "game-won") {
      //   reset()
      //   state.phase = "playing"
      //   return
      // }

      onStartPlaying()
      return
    }

    // Toggle pause
    if (event.key === " ") {
      onTogglePause()
    }

    if (state.phase === "paused") return

    if (event.key === "ArrowRight" || event.key === "d") {
      dispatch({
        type: "updatePathmanMovement",
        payload: { direction: "right", isMoving: true },
      })
    }

    if (event.key === "ArrowLeft" || event.key === "a") {
      dispatch({
        type: "updatePathmanMovement",
        payload: { direction: "left", isMoving: true },
      })
    }

    if (event.key === "ArrowUp" || event.key === "w") {
      dispatch({
        type: "updatePathmanMovement",
        payload: { direction: "up", isMoving: true },
      })
    }

    if (event.key === "ArrowDown" || event.key === "s") {
      dispatch({
        type: "updatePathmanMovement",
        payload: { direction: "down", isMoving: true },
      })
    }
  }

  const handleClick = (event: MouseEvent) => {
    const clickLocation = {
      x: event.clientX,
      y: event.clientY,
    }

    setTimeout(() => {
      dispatch({ type: "updateClickLocation", payload: null })
    }, 4000)

    dispatch({ type: "updateClickLocation", payload: clickLocation })

    const resetButton = {
      x: canvas.width - 120,
      y: 86,
      width: 100,
      height: 30,
    }

    if (
      event.clientX >= resetButton.x &&
      event.clientX <= resetButton.x + resetButton.width &&
      event.clientY >= resetButton.y &&
      event.clientY <= resetButton.y + resetButton.height
    ) {
      onClickReset()
    }
  }

  const attachEvents = () => {
    window.addEventListener("resize", handleResize)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("click", handleClick)
  }

  const detachEvents = () => {
    window.removeEventListener("resize", handleResize)
    window.removeEventListener("keyup", handleKeyUp)
    window.removeEventListener("click", handleClick)
  }

  const triggerResize = () => {
    const resizeEvent = new Event("resize")
    window.dispatchEvent(resizeEvent)
  }

  return {
    attachEvents,
    detachEvents,
    triggerResize,
  }
}

export default useEvents
