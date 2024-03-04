import { paths, small } from "./mazes"
import { GameConfig } from "./types"

const config: GameConfig = {
  pathman: {
    speed: 1.2,
    startDirection: "none",
    size: 18,
    mouthSpeed: 0.1,
    maxLowestAngle: -0.6,
    startingLives: 1
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
    activeDuration: 10000,
  },
  sidebarWidth: 120,
  overlayMessages: {
    playing: "",
    paused: "Paused. Press spacebar to continue.",
    gameOver: "Game over. Refresh to play again.",
    gameWon: "You won! Refresh to play again.",
    intro: "Press any key to start",
    orientation: "Please rotate your device"
  },
  maze: paths,
  screenPadding: 20,
  wallWidth: 2,
  debug: false,
  scoreToExtraLife: 2500,
}

export default config
