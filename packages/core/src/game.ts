import { CellType } from "./types"

import type { GameState } from "./types"
import config from "./config"
import { calculateMazeDimensions } from "./maze"
import { getInitialState } from "./state"
import getDraw from "./draw"

const game = (canvas: HTMLCanvasElement) => {
  let state: GameState = getInitialState()
  const { draw, drawOverlay } = getDraw(canvas, state)

  const init = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    calculateScale()
  }

  const calculateScale = () => {
    console.log("Calculating scale...")
    // TODO: calculate width based on the number of cells in the maze
    // const mazeWidth = 0 + config.sidebarWidth
    const scale = window.innerWidth / window.innerWidth
    state.scale = scale
  }

  const updatePathman = () => {
    // Animate mouth
    if (state.pathman.isMoving) {
      const mouthSpeed = config.pathman.mouthSpeed // Speed of mouth opening/closing
      const maxLowestAngle = config.pathman.maxLowestAngle // Maximum mouth angle in radians

      if (state.pathman.mouthOpening) {
        state.pathman.mouthAngle -= mouthSpeed // Increase the mouth angle
        if (state.pathman.mouthAngle < maxLowestAngle) {
          state.pathman.mouthAngle = maxLowestAngle // Limit the mouth angle
          state.pathman.mouthOpening = false // Start closing the mouth
        }
      } else {
        state.pathman.mouthAngle += mouthSpeed // Decrease the mouth angle
        if (state.pathman.mouthAngle > 0) {
          state.pathman.mouthAngle = 0
          state.pathman.mouthOpening = true // Start opening the mouth
        }
      }
    }

    // Move
    if (state.pathman.direction === "none" || !state.pathman.isMoving) return

    let newX = state.pathman.x
    let newY = state.pathman.y

    if (state.pathman.direction === "right") {
      newX += config.pathman.speed
    }
    if (state.pathman.direction === "left") {
      newX -= config.pathman.speed
    }
    if (state.pathman.direction === "up") {
      newY -= config.pathman.speed
    }
    if (state.pathman.direction === "down") {
      newY += config.pathman.speed
    }

    const pathmanRadius = config.pathman.size / 2

    // First, find the cell that pathman is in currently
    const cellX = Math.floor(state.pathman.x / config.cellSize)
    const cellY = Math.floor(state.pathman.y / config.cellSize)

    // Check for collisions
    const maze = config.maze.cells
    const currentCell = maze[cellY][cellX]
    state.currentCellPosition = {
      x: cellX,
      y: cellY,
    }

    const direction = state.pathman.direction
    let adjacentCell

    let willColide = false

    if (
      direction === "right" &&
      state.pathman.x >=
        cellX * config.cellSize + config.cellSize - pathmanRadius
    ) {
      adjacentCell = maze[cellY]?.[cellX + 1]
    }

    if (
      direction === "left" &&
      state.pathman.x <= cellX * config.cellSize + pathmanRadius
    ) {
      adjacentCell = maze[cellY]?.[cellX - 1]
    }

    if (
      direction === "up" &&
      state.pathman.y <= cellY * config.cellSize + pathmanRadius
    ) {
      adjacentCell = maze[cellY - 1]?.[cellX]
    }

    if (
      direction === "down" &&
      state.pathman.y >=
        cellY * config.cellSize + config.cellSize - pathmanRadius
    ) {
      adjacentCell = maze[cellY + 1]?.[cellX]
    }

    // Check for collisions with walls
    if (
      adjacentCell === CellType.WallHorizontal ||
      adjacentCell === CellType.WallVertical ||
      adjacentCell === CellType.WallCornerTopLeft ||
      adjacentCell === CellType.WallCornerTopRight ||
      adjacentCell === CellType.WallCornerBottomLeft ||
      adjacentCell === CellType.WallCornerBottomRight
    ) {
      willColide = true
    }

    // Check for collisions with canvas
    // if (newX - pathmanRadius < 0 || newX + pathmanRadius > canvas.width) {
    //   willColide = true
    // }

    // if (newY - pathmanRadius < 0 || newY + pathmanRadius > canvas.height) {
    //   willColide = true
    // }

    if (willColide) {
      state.pathman.isMoving = false
      return
    }

    // Allow wrapping around the maze
    const { x: mazeWidth, y: mazeHeight } = calculateMazeDimensions()

    // If going right, should wrap to the same x position on the left side of the maze
    if (direction === "right" && newX + pathmanRadius > mazeWidth) {
      newX = 0 + pathmanRadius
    }

    // If going left, should wrap to the same x position on the right side of the maze
    if (direction === "left" && newX - pathmanRadius < 0) {
      newX = mazeWidth - pathmanRadius
    }

    // If going up, should wrap to the same y position on the bottom side of the maze
    if (direction === "up" && newY - pathmanRadius < 0) {
      newY = mazeHeight - pathmanRadius
    }

    // If going down, should wrap to the same y position on the top side of the maze
    if (direction === "down" && newY + pathmanRadius > mazeHeight) {
      newY = 0 + pathmanRadius
    }

    state.pathman.x = newX
    state.pathman.y = newY
  }

  const updatePellets = () => {
    // Check for collisions
    const pathmanRadius = config.pathman.size / 2

    for (let i = 0; i < state.pellets.length; i++) {
      const pellet = state.pellets[i]
      const distance = Math.sqrt(
        Math.pow(state.pathman.x - pellet.x, 2) +
          Math.pow(state.pathman.y - pellet.y, 2)
      )

      if (distance < pathmanRadius + config.pellets.size) {
        state.pellets.splice(i, 1)
        i--
      }
    }

    for (let i = 0; i < state.powerPellets.length; i++) {
      const pellet = state.powerPellets[i]
      const distance = Math.sqrt(
        Math.pow(state.pathman.x - pellet.x, 2) +
          Math.pow(state.pathman.y - pellet.y, 2)
      )

      if (distance < pathmanRadius + config.powerPellets.size) {
        state.powerPellets.splice(i, 1)
        i--
      }
    }
  }

  const updateStats = (deltaTime: number) => {
    state.currentFPS = 1000 / deltaTime
  }

  const handleResize = (event: Event) => {
    // Resize the canvas
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    calculateScale()
    draw()
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    if (state.phase === "game-over" || state.phase === "game-won") return

    // Toggle pause
    if (event.key === " ") {
      console.log("Toggling pause...", state.phase)
      state.phase = state.phase === "paused" ? "playing" : "paused"

      if (state.phase === "paused") {
        state.overlayText = config.overlayMessages.paused
        drawOverlay()
      } else {
        state.overlayText = ""
        // If unpausing, re-start the animation loop
        requestAnimationFrame(animate)
      }
    }

    if (state.phase === "paused") return

    if (event.key === "ArrowRight" || event.key === "d") {
      state.pathman.direction = "right"
      state.pathman.isMoving = true
    }

    if (event.key === "ArrowLeft" || event.key === "a") {
      state.pathman.direction = "left"
      state.pathman.isMoving = true
    }

    if (event.key === "ArrowUp" || event.key === "w") {
      state.pathman.direction = "up"
      state.pathman.isMoving = true
    }

    if (event.key === "ArrowDown" || event.key === "s") {
      state.pathman.direction = "down"
      state.pathman.isMoving = true
    }
  }

  const handleClick = (event: MouseEvent) => {
    const clickLocation = {
      x: event.clientX,
      y: event.clientY,
    }

    setTimeout(() => {
      state.clickLocation = null
    }, 4000)

    state.clickLocation = clickLocation

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
      reset()
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

  const animate = (timestamp: number) => {
    // Initialize the previous timestamp
    if (state.previousAnimationTimestamp === undefined) {
      state.previousAnimationTimestamp = timestamp
      requestAnimationFrame(animate)
      return
    }

    const deltaTime = timestamp - state.previousAnimationTimestamp

    // Update stuff
    updatePathman()
    updatePellets()
    updateStats(deltaTime)

    // Draw stuff
    draw()

    state.previousAnimationTimestamp = timestamp

    if (state.phase === "paused") return

    requestAnimationFrame(animate)
  }

  const run = () => {
    console.log("Starting Pathman game...", canvas)

    init()
    attachEvents()
    draw()

    // Start the animation loop
    requestAnimationFrame(animate)
  }

  const quit = () => {
    console.log("Stopping Pathman game...")

    state.previousAnimationTimestamp = undefined
    detachEvents()
  }

  const reset = () => {
    console.log("Resetting Pathman game...")
    quit()
    state = getInitialState()
    run()
  }

  return {
    run,
    quit,
    reset,
  }
}

export default game
