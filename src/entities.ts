import config from "./config"
import {
  CellType,
  Entity,
  PathmanEntity,
  GhostEntity,
  PowerPelletEntity,
} from "./types"

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
        entities.push({
          x: entityX,
          y: entityY,
          currentCell,
          startPoint: { x: entityX, y: entityY },
          ...attributes,
        })
      }
    })
  })

  return entities
}

export const createPellets = (): Entity[] => createEntities(CellType.Pellet)
export const createPowerPellets = (): PowerPelletEntity[] =>
  createEntities(CellType.PowerPellet).map((entity) => ({
    ...entity,
    flashOn: true,
  }))

export const createGhosts = (): GhostEntity[] => {
  const attributes: Partial<Entity> = { direction: "none", isMoving: false }
  return createEntities(CellType.Ghost, attributes).map((entity, index) => {
    return {
      id: `ghost-${index}`,
      ...entity,
      path: [],
      speed: config.ghosts.speed,
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
    speed: config.pathman.speed,
    extraLives: config.pathman.startingLives,
  }
}
