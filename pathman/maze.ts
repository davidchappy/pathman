import config from "./config"

export const calculateMazeDimensions = (): { x: number; y: number } => {
  const maze = config.maze.cells

  const x = maze[0].length * config.cellSize
  const y = maze.length * config.cellSize

  return { x, y }
}
