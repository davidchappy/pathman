export enum CellType {
  Empty = 0,
  Pellet = 1,
  PowerPellet = 2,
  WallHorizontal = 3,
  WallVertical = 4,
  WallCornerTopLeft = 5,
  WallCornerTopRight = 6,
  WallCornerBottomLeft = 7,
  WallCornerBottomRight = 8,
  Pathman = 9,
  Ghost = 10,
}

export type Direction = "right" | "left" | "up" | "down" | "none"

export type Node = {
  x: number
  y: number
}

export type Cell = Node & {
  type?: CellType
}

export type Maze = {
  cells: CellType[][]
  name: string
}

export type GameConfig = {
  debug: boolean
  pathman: {
    speed: number
    startX: number
    startY: number
    startDirection: Direction
    size: number
    mouthSpeed: number
    maxLowestAngle: number
  }
  ghosts: {
    speed: number
    size: number
  }
  colors: {
    primary: string
    background: string
    text: string
    secondaryText: string
    wall: string
  }
  pellets: {
    size: number
  }
  powerPellets: {
    size: number
  }
  cellSize: number
  sidebarWidth: number
  overlayMessages: {
    paused: string
    gameOver: string
    gameWon: string
  }
  maze: Maze
  wallWidth: number
}

export type Entity = {
  x: number // canvas x/y values
  y: number // canvas x/y values
  currentCell?: Cell
  id?: number | string
  direction?: Direction
  isMoving?: boolean
}

export type PathmanEntity = Entity & {
  mouthOpening: boolean
  mouthAngle: number
}

export type GhostEntity = Entity & {
  path: PathNode[]
}

export type PathNode = Node & {
  gCost: number
  hCost: number
  fCost: number
  parent?: PathNode
}

export type GameState = {
  scale: number
  pathman: PathmanEntity
  ghosts: GhostEntity[]
  pellets: Entity[]
  powerPellets: Entity[]
  previousAnimationTimestamp: number | undefined
  currentFPS: number
  phase: "playing" | "game-over" | "game-won" | "paused"
  overlayText: string
  debug: {
    clickLocation: Entity | null
    currentPathmanPosition: Entity | null
  }
}
