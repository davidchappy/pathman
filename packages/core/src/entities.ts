import config from "./config"
import { CellType, Entity } from "./types"

const createEntities = (type: CellType): Entity[] => {
  const entities: Entity[] = []

  config.maze.cells.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === type) {
        const entityX = x * config.cellSize + config.cellSize / 2
        const entityY = y * config.cellSize + config.cellSize / 2
        entities.push({ x: entityX, y: entityY, type })
      }
    })
  })

  return entities
}

export const createPellets = (): Entity[] => createEntities(CellType.Pellet)
export const createPowerPellets = (): Entity[] =>
  createEntities(CellType.PowerPellet)
export const createGhosts = (): Entity[] => createEntities(CellType.Ghost)
export const createPathman = (): Entity[] =>
  createEntities(CellType.Pathman)
