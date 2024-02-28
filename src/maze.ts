import config from "./config"
import mazes from "./mazes"
import { MazeBlueprint, Maze, Cell, GameState } from "./types"

export const calculateMazeDimensions = (): {
  width: number
  height: number
} => {
  const maze = config.maze.cells

  const width = maze[0].length * config.cellSize
  const height = maze.length * config.cellSize

  return { width, height }
}

export const createMaze = (): Maze => {
  const mazeBluePrint: MazeBlueprint = config.maze

  const cells: Cell[][] = mazeBluePrint.cells.map((row, y) => {
    return row.map((type, x) => {
      return {
        x,
        y,
        type,
        point: {
          x: x * config.cellSize + config.cellSize / 2,
          y: y * config.cellSize + config.cellSize / 2,
        },
      }
    })
  })

  const dimensions = calculateMazeDimensions()

  return {
    cells,
    name: mazeBluePrint.name,
    bounds: {
      x: 0,
      y: 0,
      width: dimensions.width,
      height: dimensions.height,
    },
  }
}
