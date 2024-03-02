import {
  createGhosts,
  createPellets,
  createPowerPellets,
  createPathman,
} from "./entities"
import { createMaze, calculateMazeDimensions } from "./maze"
import {
  GameState,
  CellType,
  Entity,
  Cell,
  Node,
  PathNode,
  Direction,
  UseStateReturnType,
  Action,
} from "./types"
import config from "./config"
import { findPath } from "./pathfinding"

const getInitialState = (canvas: HTMLCanvasElement): GameState => {
  const maze = createMaze()
  const pellets = createPellets()
  const powerPellets = createPowerPellets()
  const pathman = createPathman()
  const ghosts = createGhosts()

  return {
    canvas,
    score: {
      score: 0,
      livesFlashOn: true,
    },
    maze,
    pellets,
    powerPellets,
    powerPelletRemainingTime: 0,
    pathman,
    ghosts,
    phase: "intro",
    overlayText: "Welcome to Pathman! Press any key to Start.",
    scale: 1,
    previousAnimationTimestamp: undefined,
    debug: {
      currentFPS: 0,
      clickLocation: null,
      currentPathmanPosition: null,
    },
  }
}

const useState = (canvas: HTMLCanvasElement): UseStateReturnType => {
  let state = getInitialState(canvas)

  const updatePathman = () => {
    // First, find the cell that pathman is in currently
    const cellX = Math.floor(state.pathman.x / config.cellSize)
    const cellY = Math.floor(state.pathman.y / config.cellSize)
    state.pathman.currentCell = { x: cellX, y: cellY }

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
      newX += state.pathman.speed
    }
    if (state.pathman.direction === "left") {
      newX -= state.pathman.speed
    }
    if (state.pathman.direction === "up") {
      newY -= state.pathman.speed
    }
    if (state.pathman.direction === "down") {
      newY += state.pathman.speed
    }

    const pathmanRadius = config.pathman.size / 2

    // Check for collisions
    const maze = config.maze.cells
    const currentCell = { x: cellX, y: cellY }
    state.debug.currentPathmanPosition = {
      x: state.pathman.x,
      y: state.pathman.y,
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
    const { width: mazeWidth, height: mazeHeight } = state.maze.bounds

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
    state.pathman.currentCell = {
      x: Math.floor(newX / config.cellSize),
      y: Math.floor(newY / config.cellSize),
    }
  }

  const updateGhosts = () => {
    const ghosts = state.ghosts

    if (!state.pathman.currentCell) return

    ghosts.forEach((ghost, index) => {
      ghost.isMoving = true
      ghost.speed =
        state.powerPelletRemainingTime > 0
          ? config.ghosts.speed * 0.9
          : config.ghosts.speed
      // First, find the cell that ghost is in currently
      const cellX = Math.floor(ghost.x / config.cellSize)
      const cellY = Math.floor(ghost.y / config.cellSize)
      const currentCell = { x: cellX, y: cellY }
      ghost.currentCell = currentCell

      if (ghost.path.length === 0) {
        ghost.path = findPath(ghost, state)
      }

      // Move
      const ghostRadius = config.ghosts.size / 2
      const maze = config.maze.cells

      let newX = ghost.x
      let newY = ghost.y

      // Advance towards the next step in the path
      const calculateDirection = (
        entity: Entity,
        nextStep: PathNode
      ): Direction => {
        // check for same cell
        if (
          nextStep.x === entity.currentCell!.x &&
          nextStep.y === entity.currentCell!.y
        ) {
          return entity.direction!
        }

        // Calculate the center position of the next cell in absolute canvas coordinates
        const nextCellCenterX =
          nextStep.x * config.cellSize + config.cellSize / 2
        const nextCellCenterY =
          nextStep.y * config.cellSize + config.cellSize / 2

        // Calculate the difference in cell coordinates between the entity's current cell and the next step
        const cellDeltaX = nextStep.x - entity.currentCell!.x
        const cellDeltaY = nextStep.y - entity.currentCell!.y

        // Determine the primary axis of movement based on the larger delta
        const primaryAxis =
          Math.abs(cellDeltaX) > Math.abs(cellDeltaY) ? "x" : "y"

        // Initialize the direction as "none"
        let direction: Direction = "none"

        // Determine the direction based on the primary axis and the sign of the delta
        if (primaryAxis === "x") {
          direction = cellDeltaX > 0 ? "right" : "left"
        } else {
          direction = cellDeltaY > 0 ? "down" : "up"
        }

        if (entity.direction === "none") {
          return direction
        }

        // Check if the entity has reached the center of the next cell along the primary axis of movement
        // If not, continue in the current direction
        if (entity.direction === "right" && entity.x < nextCellCenterX)
          return entity.direction!
        if (entity.direction === "left" && entity.x > nextCellCenterX)
          return entity.direction!
        if (entity.direction === "up" && entity.y > nextCellCenterY)
          return entity.direction!
        if (entity.direction === "down" && entity.y < nextCellCenterY)
          return entity.direction!

        // Return the new direction if the entity has reached the center of the next cell
        return direction
      }

      if (ghost.path.length > 0) {
        if (
          ghost.path[0].x === ghost.currentCell.x &&
          ghost.path[0].y === ghost.currentCell.y
        ) {
          ghost.path.shift()
        }

        const nextStep: PathNode = ghost.path[0]! // Get the next step in the path

        // console.log(`ghost ${index} next step`, nextStep.x, nextStep.y, ghost.direction)

        if (!nextStep) return

        ghost.direction = calculateDirection(ghost, nextStep) // Calculate the new direction based on the next step
        // console.log(`ghost ${index} new direction`, ghost.direction)
      }

      // Move
      if (ghost.direction === "right") {
        newX += config.ghosts.speed
      }
      if (ghost.direction === "left") {
        newX -= config.ghosts.speed
      }
      if (ghost.direction === "up") {
        newY -= config.ghosts.speed
      }
      if (ghost.direction === "down") {
        newY += config.ghosts.speed
      }

      // Check for collisions
      const direction = ghost.direction
      let adjacentCellType
      let adjacentCell: Node | undefined

      let willColide = false

      if (
        direction === "right" &&
        ghost.x >= cellX * config.cellSize + config.cellSize - ghostRadius
      ) {
        adjacentCellType = maze[cellY]?.[cellX + 1]
        adjacentCell = { x: cellX + 1, y: cellY }
      }

      if (
        direction === "left" &&
        ghost.x <= cellX * config.cellSize + ghostRadius
      ) {
        adjacentCellType = maze[cellY]?.[cellX - 1]
        adjacentCell = { x: cellX - 1, y: cellY }
      }

      if (
        direction === "up" &&
        ghost.y <= cellY * config.cellSize + ghostRadius
      ) {
        adjacentCellType = maze[cellY - 1]?.[cellX]
        adjacentCell = { x: cellX, y: cellY - 1 }
      }

      if (
        direction === "down" &&
        ghost.y >= cellY * config.cellSize + config.cellSize - ghostRadius
      ) {
        adjacentCellType = maze[cellY + 1]?.[cellX]
        adjacentCell = { x: cellX, y: cellY + 1 }
      }

      // Check for collisions with walls
      if (
        adjacentCellType === CellType.WallHorizontal ||
        adjacentCellType === CellType.WallVertical ||
        adjacentCellType === CellType.WallCornerBottomLeft ||
        adjacentCellType === CellType.WallCornerBottomRight ||
        adjacentCellType === CellType.WallCornerTopLeft ||
        adjacentCellType === CellType.WallCornerTopRight
      ) {
        console.log(`ghost collided with wall`)
        willColide = true
      }

      if (
        adjacentCell?.x === state.pathman.currentCell?.x &&
        adjacentCell?.y === state.pathman.currentCell?.y
      ) {
        if (state.powerPelletRemainingTime > 0) {
          // Ghost is eaten
          ghost.x = ghost.startPoint.x
          ghost.y = ghost.startPoint.y
          ghost.currentCell = {
            x: Math.floor(ghost.x / config.cellSize),
            y: Math.floor(ghost.y / config.cellSize),
          }
          ghost.path = findPath(ghost, state)

          ghost.isMoving = false
          state.score.score += 100

          return
        }
        willColide = true
        if (state.pathman.extraLives > 0) {
          state.pathman.extraLives--
          state.pathman.x = state.pathman.startPoint.x
          state.pathman.y = state.pathman.startPoint.y
          state.pathman.currentCell = {
            x: Math.floor(state.pathman.x / config.cellSize),
            y: Math.floor(state.pathman.y / config.cellSize),
          }
        } else {
          state.phase = "game-over"
          state.overlayText = config.overlayMessages.gameOver
        }
      }

      const otherGhosts = ghosts.filter((g) => g.id !== ghost.id)
      otherGhosts.forEach((otherGhost) => {
        if (
          adjacentCell?.x === otherGhost.currentCell!.x &&
          adjacentCell?.y === otherGhost.currentCell!.y
        ) {
          console.log(`ghost collided with another ghost`)
          willColide = true
        }
      })

      if (willColide) {
        ghost.isMoving = false
        // reset path
        ghost.path = findPath(ghost, state)
        return
      }

      // Allow wrapping around the maze
      const { width: mazeWidth, height: mazeHeight } = state.maze.bounds

      // If going right, should wrap to the same x position on the left side of the maze
      if (direction === "right" && newX + ghostRadius > mazeWidth) {
        newX = 0 + ghostRadius
      }

      // If going left, should wrap to the same x position on the right side of the maze
      if (direction === "left" && newX - ghostRadius < 0) {
        newX = mazeWidth - ghostRadius
      }

      // If going up, should wrap to the same y position on the bottom side of the maze
      if (direction === "up" && newY - ghostRadius < 0) {
        newY = mazeHeight - ghostRadius
      }

      // If going down, should wrap to the same y position on the top side of the maze
      if (direction === "down" && newY + ghostRadius > mazeHeight) {
        newY = 0 + ghostRadius
      }

      // Here's where we actually move the ghost
      if (ghost.isMoving) {
        ghost.x = newX
        ghost.y = newY
        ghost.currentCell = {
          x: Math.floor(newX / config.cellSize),
          y: Math.floor(newY / config.cellSize),
        }
      }

      if (
        ghost.currentCell.x !== currentCell.x ||
        ghost.currentCell.y !== currentCell.y
      ) {
        ghost.path = findPath(ghost, state)
      }

      // Periodically or when Pathman moves, update the ghost's path
      // if (shouldUpdatePath(ghost)) {
      // const paths = getTopPaths(ghost, state.pathman, config.maze.cells, 3); // Get top 3 paths
      // const chosenPath = paths[Math.floor(Math.random() * paths.length)]; // Randomly choose one
      // ghost.path = chosenPath;

      // Set the next direction based on the path
      if (ghost.path?.length > 0) {
        // const nextStep = ghost.path.shift() // Get the next step in the path
        // ghost.direction = calculateDirection(ghost, nextStep) // Calculate the new direction based on the next step
      }
    })
  }

  const updatePathmanMovement = (direction: Direction, isMoving: boolean) => {
    state.pathman.direction = direction
    state.pathman.isMoving = true
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
        state.score.score += 10
        i--
      }
    }

    const lastAnimation = state.previousAnimationTimestamp

    for (let i = 0; i < state.powerPellets.length; i++) {
      const pellet = state.powerPellets[i]

      if (lastAnimation && lastAnimation % 300 < 150) {
        pellet.flashOn = false
      } else {
        pellet.flashOn = true
      }

      const distance = Math.sqrt(
        Math.pow(state.pathman.x - pellet.x, 2) +
          Math.pow(state.pathman.y - pellet.y, 2)
      )

      if (distance < pathmanRadius + config.powerPellets.size) {
        state.powerPellets.splice(i, 1)
        state.score.score += 50
        state.powerPelletRemainingTime = config.powerPellets.activeDuration
        i--
      }
    }
  }

  const updateActivePowerPellet = () => {
    if (state.powerPelletRemainingTime > 0) {
      state.pathman.speed = config.pathman.speed * 1.2
      state.powerPelletRemainingTime -= 1000 / 60
    } else {
      state.pathman.speed = config.pathman.speed
    }
  }

  const updateMazePosition = () => {
    const canvas = state.canvas

    const mazeWidth = config.maze.cells[0].length * config.cellSize
    const mazeHeight = config.maze.cells.length * config.cellSize

    state.maze.bounds = {
      x: canvas.width / 2 - mazeWidth / 2,
      y: canvas.height / 2 - mazeHeight / 2,
      width: mazeWidth,
      height: mazeHeight,
    }
  }

  const updateStats = (deltaTime: number) => {
    state.debug.currentFPS = 1000 / deltaTime
    state.score.livesFlashOn = state.previousAnimationTimestamp! % 500 < 250
    if (
      state.score.score >= config.scoreToExtraLife &&
      state.score.score % config.scoreToExtraLife === 0
    ) {
      state.pathman.extraLives++
      state.score.score += 10
    }
  }

  const calculateScale = () => {
    // TODO: calculate width based on the number of cells in the maze
    // const mazeWidth = 0 + config.sidebarWidth
    const scale = window.innerWidth / window.innerWidth
    state.scale = scale
  }

  const dispatch = (action: Action) => {
    switch (action.type) {
      case "init":
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        break
      case "updatePathman":
        updatePathman()
        break
      case "updatePathmanMovement":
        updatePathmanMovement(action.payload.direction, action.payload.isMoving)
        break
      case "updateGhosts":
        updateGhosts()
        break
      case "updatePellets":
        updatePellets()
        break
      case "updateActivePowerPellet":
        updateActivePowerPellet()
        break
      case "updatePhase":
        if (action.payload) {
          state.phase = action.payload
        } else {
          if (state.pellets.length === 0 && state.powerPellets.length === 0) {
            state.phase = "game-won"
            state.overlayText = config.overlayMessages.gameWon
          }
        }

        break
      case "updateOverlayText":
        state.overlayText = action.payload
        break
      case "updateMazePosition":
        updateMazePosition()
        break
      case "updateStats":
        updateStats(action.payload)
        break
      case "updateClickLocation":
        state.debug.clickLocation = action.payload
        break
      case "setPreviousAnimationTimestamp":
        state.previousAnimationTimestamp = action.payload
        break
      case "updateScale":
        calculateScale()
        break
      case "reset":
        state = getInitialState(canvas)
        break
      default:
        break
    }
  }

  return {
    state,
    dispatch,
  }
}

export default useState
