import config from "./config"
import { CellType, Entity, PathmanEntity, GhostEntity, Cell } from "./types"

const createEntities = (
  type: CellType,
  attributes: Partial<Entity> = {}
): Entity[] => {
  const entities: Entity[] = []

  config.maze.cells.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === type) {
        const entityX = x * config.cellSize + config.cellSize / 2
        const entityY = y * config.cellSize + config.cellSize / 2
        const currentCell = { x, y }
        entities.push({ x: entityX, y: entityY, currentCell, ...attributes })
      }
    })
  })

  return entities
}

export const createPellets = (): Entity[] => createEntities(CellType.Pellet)
export const createPowerPellets = (): Entity[] =>
  createEntities(CellType.PowerPellet)
export const createGhosts = (): GhostEntity[] => {
  const attributes: Partial<Entity> = { direction: "none", isMoving: false }
  return createEntities(CellType.Ghost, attributes).map((entity, index) => {
    return {
      id: `ghost-${index}`,
      ...entity,
      path: [],
    }
  })
}
export const createPathman = (): PathmanEntity => {
  const entity = createEntities(CellType.Pathman, {
    direction: "none",
    isMoving: false,
  })[0]

  return {
    ...entity,
    mouthOpening: false,
    mouthAngle: 0,
  }
}
