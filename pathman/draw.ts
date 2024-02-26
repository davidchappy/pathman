import { GameState, CellType } from "./types"
import config from "./config"

const useDraw = (canvas: HTMLCanvasElement, state: GameState) => {
  const ctx = canvas.getContext("2d")!

  const backgroundCanvas = document.createElement("canvas")
  backgroundCanvas.width = canvas.width
  backgroundCanvas.height = canvas.height
  const backgroundCtx = backgroundCanvas.getContext("2d")!

  let mazePosition = { x: 0, y: 0, width: 0, height: 0 }

  const drawBackground = () => {
    backgroundCtx.fillStyle = config.colors.background
    ctx.fillRect(
      0,
      0,
      window.innerWidth / state.scale,
      window.innerHeight / state.scale
    )
  }

  const calculateMazePosition = () => {
    const mazeWidth = config.maze.cells[0].length * config.cellSize
    const mazeHeight = config.maze.cells.length * config.cellSize

    return {
      x: canvas.width / 2 - mazeWidth / 2,
      y: canvas.height / 2 - mazeHeight / 2,
      width: mazeWidth,
      height: mazeHeight,
    }
  }

  mazePosition = calculateMazePosition()

  window.addEventListener("resize", () => {
    mazePosition = calculateMazePosition()
  })

  window.document.addEventListener("DOMContentLoaded", () => {
    mazePosition = calculateMazePosition()
  })

  const drawMaze = () => {
    const cellSize = config.cellSize

    const cells = config.maze.cells

    ctx.save()
    ctx.translate(mazePosition.x, mazePosition.y)

    cells.forEach((row, y) => {
      row.forEach((cell, x) => {
        const cellX = x * cellSize
        const cellY = y * cellSize

        if (config.debug) {
          // draw a box around each cell
          ctx.strokeStyle = "green"
          ctx.lineWidth = 1
          ctx.strokeRect(cellX, cellY, cellSize, cellSize)
        }

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
      })
    })

    ctx.restore()
  }

  const drawRulers = () => {
    const padding = config.cellSize

    ctx.save()
    ctx.translate(mazePosition.x - padding, mazePosition.y - padding)

    ctx.strokeStyle = "red"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(mazePosition.width + padding * 2, 0)
    ctx.stroke()
    // add numbers for x cells, 1 above each cell
    ctx.fillStyle = "red"
    config.maze.cells[0].forEach((cell, x) => {
      ctx.fillText(
        x.toString(),
        config.cellSize + x * config.cellSize + config.cellSize / 4,
        -padding / 2
      )
    })
    ctx.fill()

    ctx.strokeStyle = "green"
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, mazePosition.height + padding * 2)
    ctx.stroke()
    // add numbers for y cells, 1 left of each cell
    ctx.fillStyle = "green"
    config.maze.cells.forEach((row, y) => {
      ctx.fillText(
        y.toString(),
        -padding,
        config.cellSize + y * config.cellSize + config.cellSize / 2
      )
    })
    ctx.fill()

    ctx.restore()
  }

  const drawEntityRelativeToMaze = (drawFunction: () => void) => {
    ctx.save()
    ctx.translate(mazePosition.x, mazePosition.y)
    drawFunction()
    ctx.restore()
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
    drawEntityRelativeToMaze(() => {
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
    })
  }

  const drawPellets = () => {
    drawEntityRelativeToMaze(() => {
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
    })
  }

  const drawGhosts = () => {
    drawEntityRelativeToMaze(() => {
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
    if (state.debug.clickLocation === null) return

    const { x, y } = state.debug.clickLocation
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2, true)
    ctx.fillStyle = "red"
    ctx.fill()
  }

  const drawCurrentPathmanCell = () => {
    if (state.debug.currentPathmanPosition === null) return

    const { x, y } = state.debug.currentPathmanPosition
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
    if (config.debug) {
      drawRulers()
    }
    drawStats()
    drawPathman()
    drawPellets()
    drawGhosts()
    drawOverlay()
    // drawCurrentPathmanCell()
    // drawClickLocation()

    ctx.restore()
  }

  return {
    draw,
    drawCurrentPathmanCell,
    drawClickLocation,
    drawOverlay,
    drawGhosts,
    drawPellets,
    drawPathman,
    drawStats,
    drawMaze,
    drawBackground,
  }
}

export default useDraw
