import { paths } from "./mazes"
import { GameConfig } from "./types"

const config: GameConfig = {
  pathman: {
    speed: 1.5,
    startDirection: "none",
    size: 18,
    mouthSpeed: 0.1,
    maxLowestAngle: -0.6,
  },
  ghosts: {
    speed: 1,
    size: 20,
  },
  cellSize: 20,
  colors: {
    primary: "yellow",
    background: "black",
    text: "yellow",
    secondaryText: "black",
    wall: "blue",
  },
  pellets: {
    size: 2,
  },
  powerPellets: {
    size: 6,
  },
  sidebarWidth: 120,
  overlayMessages: {
    paused: "Paused. Press spacebar to continue.",
    gameOver: "Game over. Refresh to play again.",
    gameWon: "You won! Refresh to play again.",
  },
  maze: paths,
  screenPadding: 20,
  wallWidth: 2,
  debug: false,
}

export default config
