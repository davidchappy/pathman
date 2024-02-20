import { CellType } from "./types"

import type { GameConfig, GameState } from "./types"
import { defaultMaze } from "./mazes"
import config from "./config"

const getInitialPathmanPosition = () => {
  let pathmanPosition = {
    x: config.pathman.startX,
    y: config.pathman.startY,
  }
  config.maze.cells.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === CellType.Pathman) {
        pathmanPosition = {
          x: x * config.cellSize + config.cellSize / 2,
          y: y * config.cellSize + config.cellSize / 2,
        }
      }
    })
  })

  return pathmanPosition
}

const getInitialState = (): GameState => {
  const pathmanPosition = getInitialPathmanPosition()

  return {
    scale: 1,
    pathman: {
      x: pathmanPosition.x,
      y: pathmanPosition.y,
      direction: config.pathman.startDirection,
      isMoving: false,
      mouthOpening: false,
      mouthAngle: 0,
    },
    previousAnimationTimestamp: undefined,
    ghosts: [],
    pellets: [],
    powerPellets: [],
    currentFPS: 0,
    clickLocation: undefined,
    phase: "playing",
    overlayText: "",
    currentCellPosition: null,
  }
}

const game = (canvas: HTMLCanvasElement) => {
  const state: GameState = getInitialState()
  const ctx = canvas.getContext("2d")!

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

  const calculateMazeDimensions = (): { x: number; y: number } => {
    const maze = config.maze.cells

    const x = maze[0].length * config.cellSize
    const y = maze.length * config.cellSize

    return { x, y }
  }

  const createPellets = () => {
    const maze = config.maze.cells

    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        const cell = maze[y][x]
        if (cell === CellType.Pellet) {
          const pelletX = x * config.cellSize + config.cellSize / 2
          const pelletY = y * config.cellSize + config.cellSize / 2

          state.pellets.push({ x: pelletX, y: pelletY })
        }

        if (cell === CellType.PowerPellet) {
          const pelletX = x * config.cellSize + config.cellSize / 2
          const pelletY = y * config.cellSize + config.cellSize / 2

          state.powerPellets.push({ x: pelletX, y: pelletY })
        }
      }
    }
  }

  createPellets()

  const createGhosts = () => {
    const maze = config.maze.cells

    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        const cell = maze[y][x]
        if (cell === CellType.Ghost) {
          const ghostX = x * config.cellSize + config.cellSize / 2
          const ghostY = y * config.cellSize + config.cellSize / 2

          state.ghosts.push({
            x: ghostX,
            y: ghostY,
            direction: "none",
            isMoving: false,
          })
        }
      }
    }
  }

  createGhosts()

  const drawBackground = () => {
    ctx.fillStyle = config.colors.background
    ctx.fillRect(
      0,
      0,
      window.innerWidth / state.scale,
      window.innerHeight / state.scale
    )
  }

  const drawMaze = () => {
    const cellSize = config.cellSize
    const maze = config.maze.cells
    const mazeWidth = maze[0].length * cellSize
    const mazeHeight = maze.length * cellSize

    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        const cell = maze[y][x]
        const cellX = x * cellSize
        const cellY = y * cellSize

        if (cell === CellType.WallHorizontal) {
          ctx.fillStyle = config.colors.wall
          ctx.fillRect(
            cellX,
            cellY + (cellSize / 2 - config.wallWidth / 2),
            cellSize,
            config.wallWidth
          )
        }

        if (cell === CellType.WallVertical) {
          ctx.fillStyle = config.colors.wall
          ctx.fillRect(
            cellX + (cellSize / 2 - config.wallWidth / 2),
            cellY,
            config.wallWidth,
            cellSize
          )
        }

        if (cell === CellType.WallCornerTopLeft) {
          ctx.fillStyle = config.colors.wall
          ctx.fillRect(
            cellX + (config.cellSize / 2 - config.wallWidth / 2),
            cellY + (config.cellSize / 2 - config.wallWidth / 2),
            config.cellSize / 2 + config.wallWidth / 2,
            config.wallWidth
          )
          ctx.fillRect(
            cellX + (config.cellSize / 2 - config.wallWidth / 2),
            cellY + (config.cellSize / 2 - config.wallWidth / 2),
            config.wallWidth,
            config.cellSize / 2 + config.wallWidth / 2
          )
        }

        if (cell === CellType.WallCornerTopRight) {
          ctx.fillStyle = config.colors.wall
          ctx.fillRect(
            cellX,
            cellY + (config.cellSize / 2 - config.wallWidth / 2),
            config.cellSize / 2 + config.wallWidth / 2,
            config.wallWidth
          )
          ctx.fillRect(
            cellX + (config.cellSize / 2 - config.wallWidth / 2),
            cellY + config.cellSize / 2,
            config.wallWidth,
            config.cellSize / 2
          )
        }

        if (cell === CellType.WallCornerBottomLeft) {
          ctx.fillStyle = config.colors.wall
          ctx.fillRect(
            cellX + (config.cellSize / 2 - config.wallWidth / 2),
            cellY,
            config.wallWidth,
            config.cellSize / 2 + config.wallWidth / 2
          )
          ctx.fillRect(
            cellX + (config.cellSize / 2 - config.wallWidth / 2),
            cellY + (config.cellSize / 2 - config.wallWidth / 2),
            config.cellSize / 2 + config.wallWidth / 2,
            config.wallWidth
          )
        }

        if (cell === CellType.WallCornerBottomRight) {
          ctx.fillStyle = config.colors.wall
          ctx.fillRect(
            cellX,
            cellY + (config.cellSize / 2 - config.wallWidth / 2),
            config.cellSize / 2 + config.wallWidth / 2,
            config.wallWidth
          )
          ctx.fillRect(
            cellX + (config.cellSize / 2 - config.wallWidth / 2),
            cellY,
            config.wallWidth,
            config.cellSize / 2 + config.wallWidth / 2
          )
        }
      }
    }
  }

  const drawStats = () => {
    const boxPadding = 10

    // Box dimensions and position
    const boxWidth = config.sidebarWidth - boxPadding
    const boxHeight = config.sidebarWidth - boxPadding
    const boxX = ctx.canvas.width - boxWidth - boxPadding
    const boxY = boxPadding

    ctx.strokeStyle = config.colors.primary
    ctx.lineWidth = 2
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)

    ctx.font = "16px Helvetica, Arial, sans-serif"
    ctx.fillStyle = config.colors.primary
    ctx.lineWidth = 2

    const textX = boxX + boxPadding
    const textY = boxY + (boxHeight - 50) / 2

    ctx.textAlign = "left"
    ctx.fillText(`FPS: ${state.currentFPS.toFixed(0)}`, textX, textY)
    ctx.fillText(
      `Pellets: ${state.pellets.length}`,
      textX,
      textY + boxPadding * 2
    )

    // Add reset button
    const buttonX = boxX + boxPadding
    const buttonY = textY + (boxPadding * 2 + 20)
    const buttonWidth = boxWidth - boxPadding * 2
    const buttonHeight = 30
    ctx.fillStyle = config.colors.primary
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight)
    ctx.fillStyle = config.colors.secondaryText

    ctx.fillText("Reset", buttonX + boxPadding, buttonY + boxPadding * 2)
  }

  const drawPathman = () => {
    const { x, y, mouthAngle, direction } = state.pathman
    const { size } = config.pathman

    const radius = size / 2

    ctx.save()
    ctx.translate(x, y)

    switch (direction) {
      case "right":
        ctx.rotate(0) // No rotation
        break
      case "down":
        ctx.rotate(Math.PI / 2) // Rotate 90 degrees clockwise
        break
      case "left":
        ctx.rotate(Math.PI) // Rotate 180 degrees
        break
      case "up":
        ctx.rotate(-Math.PI / 2) // Rotate 90 degrees counter-clockwise
        break
    }

    ctx.beginPath()

    // Outer circle
    ctx.arc(0, 0, radius, mouthAngle, Math.PI * 2 - mouthAngle, true)
    ctx.fillStyle = config.colors.primary

    // Mouth
    ctx.lineTo(-3, 0)

    const upperLipEndX = radius * Math.cos(Math.PI * 2 - mouthAngle)
    const upperLipEndY = -radius * Math.sin(Math.PI * 2 - mouthAngle)

    ctx.moveTo(upperLipEndX, upperLipEndY)
    ctx.lineTo(0, 0)

    // Draw it and reset the context
    ctx.fill()
    ctx.restore()
  }

  const drawPellets = () => {
    for (const pellet of state.pellets) {
      ctx.beginPath()
      ctx.arc(pellet.x, pellet.y, config.pellets.size, 0, Math.PI * 2, true)
      ctx.fillStyle = config.colors.primary
      ctx.fill()
    }

    for (const pellet of state.powerPellets) {
      ctx.beginPath()
      ctx.arc(
        pellet.x,
        pellet.y,
        config.powerPellets.size,
        0,
        Math.PI * 2,
        true
      )
      ctx.fillStyle = config.colors.primary
      ctx.fill()
    }
  }

  const drawGhosts = () => {
    const size = config.ghosts.size
    const radius = size / 2

    const colors = ["red", "blue", "pink", "orange"]

    state.ghosts.forEach((ghost, index) => {
      // REturn index to 0 if it's greater than 3
      const color = colors[index % colors.length]
      ctx.fillStyle = color

      ctx.beginPath()
      ctx.arc(
        ghost.x + 1,
        ghost.y,
        radius,
        Math.PI * -0.5,
        Math.PI + Math.PI * -0.2,
        true
      )

      ctx.arc(
        ghost.x - 1,
        ghost.y,
        radius,
        Math.PI * 0.2,
        Math.PI + Math.PI * 0.5,
        true
      )

      ctx.fillRect(ghost.x - radius + 1, ghost.y - 2, size - 2, size / 2)
      ctx.fill()

      ctx.beginPath()
      ctx.lineWidth = 1
      ctx.strokeStyle = "black"
      ctx.fillStyle = "black"
      ctx.moveTo(ghost.x - 6, ghost.y + radius)
      ctx.lineTo(ghost.x - 4, ghost.y + radius - 6)
      ctx.lineTo(ghost.x, ghost.y + radius)
      ctx.lineTo(ghost.x + 4, ghost.y + radius - 6)
      ctx.lineTo(ghost.x + 6, ghost.y + radius)
      ctx.stroke()
      ctx.fill()

      // add eyes
      ctx.beginPath()
      ctx.fillStyle = "white"
      ctx.arc(ghost.x - 4, ghost.y - 3, 3, 0, Math.PI * 2, true)
      ctx.arc(ghost.x + 4, ghost.y - 3, 3, 0, Math.PI * 2, true)
      ctx.fill()

      // add pupils
      ctx.beginPath()
      ctx.fillStyle = "black"
      ctx.arc(ghost.x - 4, ghost.y - 3.5, 1.5, 0, Math.PI * 2, true)
      ctx.arc(ghost.x + 4, ghost.y - 3.5, 1.5, 0, Math.PI * 2, true)
      ctx.fill()
    })
  }

  const drawOverlay = () => {
    if (state.phase === "playing") return

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.font = "48px Helvetica, Arial, sans-serif"
    ctx.fillStyle = "white"

    ctx.textAlign = "center"
    ctx.fillText(state.overlayText, canvas.width / 2, canvas.height / 2)
  }

  const drawClickLocation = () => {
    if (state.clickLocation === undefined) return

    const { x, y } = state.clickLocation
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2, true)
    ctx.fillStyle = "red"
    ctx.fill()
  }

  const drawCurrentCell = () => {
    if (state.currentCellPosition === null) return

    const { x, y } = state.currentCellPosition
    const cellX = x * config.cellSize
    const cellY = y * config.cellSize

    ctx.strokeStyle = "red"
    ctx.lineWidth = 2
    ctx.strokeRect(cellX, cellY, config.cellSize, config.cellSize)
  }

  const draw = () => {
    ctx.save()

    ctx.scale(1, 1)

    // Adapt to the current scale
    ctx.scale(state.scale, state.scale)

    drawBackground()
    drawMaze()
    drawStats()
    drawPathman()
    drawPellets()
    drawGhosts()
    drawOverlay()
    // drawCurrentCell()
    // drawClickLocation()

    ctx.restore()
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
      state.clickLocation = undefined
    }, 4000)

    state.clickLocation = clickLocation

    const resetButton = {
      x: ctx.canvas.width - 120,
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
    Object.assign(state, { ...getInitialState() })
    createPellets()
    run()
  }

  return {
    run,
    quit,
    reset,
  }
}

export default game
