import { GameState, Action } from "./types"
import config from "./config"

type EventHandlers = {
  onClickReset: () => void
  onRestartAnimation: () => void
  draw: () => void
}

const useEvents = (
  state: GameState,
  dispatch: (action: Action) => void,
  { onClickReset, onRestartAnimation, draw }: EventHandlers
) => {
  const canvas = state.canvas

  const handleResize = () => {
    // dispatch({ type: "updateScale" })
    dispatch({ type: "updateMazePosition" })
    dispatch({ type: "resize" })
  }
  const handleStartPlaying = () => {
    dispatch({ type: "updateOverlayText", payload: "" })
    dispatch({ type: "updatePhase", payload: "playing" })
  }
  const handleTogglePause = () => {
    dispatch({
      type: "updatePhase",
      payload: state.phase === "paused" ? "playing" : "paused",
    })

    if (state.phase === "paused") {
      dispatch({
        type: "updateOverlayText",
        payload: config.overlayMessages.paused,
      })
    } else {
      dispatch({ type: "updateOverlayText", payload: "" })
      // If unpausing, re-start the animation loop
      onRestartAnimation()
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    // console.log("Key up", state.phase)
    if (
      state.phase === "intro" ||
      state.phase === "gameOver" ||
      state.phase === "gameWon"
    ) {
      handleStartPlaying()
      return
    }

    // Toggle pause
    if (event.key === " ") {
      handleTogglePause()
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

  let touchStart = { x: 0, y: 0 }
  let touchEnd = { x: 0, y: 0 }

  const handleTouchStart = (event: TouchEvent) => {
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY }
  }

  const handleTouchEnd = (event: TouchEvent) => {
    touchEnd = {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY,
    }

    if (state.phase === "playing") {
      const dx = touchEnd.x - touchStart.x
      const dy = touchEnd.y - touchStart.y
      const adx = Math.abs(dx)
      const ady = Math.abs(dy)

      if (adx > ady) {
        // Moving horizontally
        if (dx > 0) {
          dispatch({
            type: "updatePathmanMovement",
            payload: { direction: "right", isMoving: true },
          })
        } else {
          dispatch({
            type: "updatePathmanMovement",
            payload: { direction: "left", isMoving: true },
          })
        }
      } else {
        // Moving vertically
        if (dy > 0) {
          dispatch({
            type: "updatePathmanMovement",
            payload: { direction: "down", isMoving: true },
          })
        } else {
          dispatch({
            type: "updatePathmanMovement",
            payload: { direction: "up", isMoving: true },
          })
        }
      }
    }

    // Consider it a tap if the touch hasn't moved much
    if (
      state.phase === "intro" ||
      state.phase === "gameOver" ||
      state.phase === "gameWon" ||
      state.phase === "paused"
    ) {
      if (
        Math.abs(touchEnd.x - touchStart.x) < 30 &&
        Math.abs(touchEnd.y - touchStart.y) < 30
      ) {
        // Start or reload the game
        handleStartPlaying()
      }
    }
  }

  const handleChangeOrientation = () => {
    handleResize()
    dispatch({ type: "checkOrientation", payload: { isChange: true } })
    draw()
  }

  const attachEvents = () => {
    window.addEventListener("resize", handleResize)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("click", handleClick)
    window.addEventListener("touchstart", handleTouchStart)
    window.addEventListener("touchend", handleTouchEnd)
    window.addEventListener('orientationchange', handleChangeOrientation);
  }

  const detachEvents = () => {
    window.removeEventListener("resize", handleResize)
    window.removeEventListener("keyup", handleKeyUp)
    window.removeEventListener("click", handleClick)
    window.removeEventListener("touchstart", handleTouchStart)
    window.removeEventListener("touchend", handleTouchEnd)
    window.removeEventListener('orientationchange', handleChangeOrientation);
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
