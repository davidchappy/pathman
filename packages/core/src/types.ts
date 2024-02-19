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
  PathsmanStart = 9,
  GhostStart = 10,
}

export type Maze = {
  cells: CellType[][]
  name: string
}

type Direction = "right" | "left" | "up" | "down" | "none"

export type GameConfig = {
  pathsman: {
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

export type GameState = {
  scale: number
  pathsman: {
    x: number
    y: number
    direction: Direction
    isMoving: boolean
    mouthOpening: boolean
    mouthAngle: number
  }
  ghosts: {
    x: number
    y: number
    direction: Direction
    isMoving: boolean
  }[]
  previousAnimationTimestamp: number | undefined
  pellets: { x: number; y: number }[]
  powerPellets: { x: number; y: number }[]
  currentFPS: number
  clickLocation?: { x: number; y: number }
  phase: "playing" | "game-over" | "game-won" | "paused"
  overlayText: string
  currentCellPosition: {
    x: number
    y: number
  } | null
}
