import {
  createGhosts,
  createPellets,
  createPowerPellets,
  createPathman,
} from "./entities"
import { GameState } from "./types"
import config from "./config"

export const getInitialState = (): GameState => {
  const pellets = createPellets()
  const powerPellets = createPowerPellets()
  const ghosts = createGhosts()
  const pathman = createPathman()

  return {
    scale: 1,
    pathman,
    previousAnimationTimestamp: undefined,
    ghosts,
    pellets,
    powerPellets,
    currentFPS: 0,
    phase: "playing",
    overlayText: "",
    debug: {
      clickLocation: null,
      currentPathmanPosition: null,
    },
  }
}
