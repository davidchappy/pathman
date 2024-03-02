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

export type Point = Node & {}

export type Cell = Node & {
  type?: CellType
  point?: Point
  entity?: Entity
}

export type MazeBlueprint = {
  cells: CellType[][]
  name: string
}

export type Maze = {
  cells: Cell[][]
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
  name: string
}

export type GameConfig = {
  debug: boolean
  pathman: {
    speed: number
    startDirection: Direction
    size: number
    mouthSpeed: number
    maxLowestAngle: number
    startingLives: number
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
    activeDuration: number
  }
  cellSize: number
  screenPadding: number
  sidebarWidth: number
  overlayMessages: {
    paused: string
    gameOver: string
    gameWon: string
  }
  maze: MazeBlueprint
  wallWidth: number
  scoreToExtraLife: number
}

export type Entity = Point & {
  currentCell?: Cell
  id?: number | string
  direction?: Direction
  isMoving?: boolean
  startPoint: Point
}

export type PowerPelletEntity = Entity & {
  flashOn: boolean
}

export type PathmanEntity = Entity & {
  mouthOpening: boolean
  mouthAngle: number
  speed: number
  extraLives: number
}

export type GhostEntity = Entity & {
  path: PathNode[]
  speed: number
}

export type PathNode = Node & {
  gCost: number
  hCost: number
  fCost: number
  parent?: PathNode
}

export type GamePhase = "playing" | "game-over" | "game-won" | "paused" | "intro"

export type GameScore = {
  score: number
  livesFlashOn: boolean
}

export type GameState = {
  canvas: HTMLCanvasElement
  score: GameScore
  scale: number
  pathman: PathmanEntity
  ghosts: GhostEntity[]
  pellets: Entity[]
  powerPellets: PowerPelletEntity[]
  powerPelletRemainingTime: number
  previousAnimationTimestamp: number | undefined
  phase: GamePhase
  overlayText: string
  debug: {
    currentFPS: number
    clickLocation: Point | null
    currentPathmanPosition: Point | null
  },
  maze: Maze
}


export type ActionType =
  | "updatePathman"
  | "updateGhosts"
  | "updatePellets"
  | "updateActivePowerPellet"
  | "updatePhase"
  | "updateOverlayText"
  | "updateStats"
  | "updateClickLocation"
  | "updateMazePosition"
  | "setPreviousAnimationTimestamp"
  | "updateScale"
  | "reset"
  | "init"
  | "updatePathmanMovement"

export type Action = {
  type: ActionType
  payload?: any
}

export type UseStateReturnType = {
  state: GameState
  dispatch: (action: Action) => void
}
