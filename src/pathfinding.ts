import { CellType, Maze, PathNode, Node } from "./types"

export const aStar = (
  startPos: Node,
  targetPos: Node,
  grid: Maze["cells"],
  randomize = true
) => {
  const openSet: PathNode[] = []
  const closedSet: PathNode[] = []
  const path: PathNode[] = []
  const startNode: PathNode = {
    x: startPos.x,
    y: startPos.y,
    gCost: 0,
    hCost: 0,
    fCost: 0,
  }
  const targetNode = { x: targetPos.x, y: targetPos.y }
  openSet.push(startNode)

  while (openSet.length > 0) {
    let currentNode = openSet[0]
    openSet.forEach((node: PathNode) => {
      if (
        node.fCost < currentNode.fCost ||
        (node.fCost === currentNode.fCost && node.hCost < currentNode.hCost)
      ) {
        currentNode = node
      }
    })

    openSet.splice(openSet.indexOf(currentNode), 1)
    closedSet.push(currentNode)

    // Target found
    if (currentNode.x === targetNode.x && currentNode.y === targetNode.y) {
      let temp: PathNode | undefined = currentNode
      while (temp !== undefined) {
        path.push({ x: temp.x, y: temp.y, fCost: 0, gCost: 0, hCost: 0 })
        temp = temp.parent
      }
      return path.reverse()
    }

    const neighbors = randomize
      ? getShuffledNeighbors(currentNode, grid)
      : getNeighbors(currentNode, grid)

    for (const neighbor of neighbors) {
      if (
        closedSet.some((node) => node.x === neighbor.x && node.y === neighbor.y)
      ) {
        continue
      }

      const gCost = currentNode.gCost + 1 // Assuming uniform cost for simplicity
      const hCost =
        Math.abs(neighbor.x - targetNode.x) +
        Math.abs(neighbor.y - targetNode.y)
      const fCost = gCost + hCost

      if (
        !openSet.some(
          (node) => node.x === neighbor.x && node.y === neighbor.y
        ) ||
        gCost < neighbor.gCost
      ) {
        neighbor.gCost = gCost
        neighbor.hCost = hCost
        neighbor.fCost = fCost
        neighbor.parent = currentNode

        if (
          !openSet.some(
            (node) => node.x === neighbor.x && node.y === neighbor.y
          )
        ) {
          openSet.push(neighbor)
        }
      }
    }
  }

  return [] // No path found
}

const getShuffledNeighbors = (node: PathNode, grid: Maze["cells"]) => {
  const neighbors = getNeighbors(node, grid)
  // Shuffle the neighbors array
  for (let i = neighbors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]]
  }
  return neighbors
}

const getNeighbors = (node: PathNode, grid: Maze["cells"]): PathNode[] => {
  const neighbors: PathNode[] = []
  const directions = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ] // Up, Right, Down, Left

  for (const [dx, dy] of directions) {
    const x = node.x + dx
    const y = node.y + dy

    if (
      x >= 0 &&
      x < grid[0].length &&
      y >= 0 &&
      y < grid.length &&
      grid[y][x].type !== CellType.WallHorizontal &&
      grid[y][x].type !== CellType.WallVertical &&
      grid[y][x].type !== CellType.WallCornerTopLeft &&
      grid[y][x].type !== CellType.WallCornerTopRight &&
      grid[y][x].type !== CellType.WallCornerBottomLeft &&
      grid[y][x].type !== CellType.WallCornerBottomRight &&
      !neighbors.some((neighbor) => neighbor.x === x && neighbor.y === y) &&
      !(node.x === x && node.y === y)
    ) {
      neighbors.push({ x, y, fCost: 0, gCost: 0, hCost: 0 })
    }
  }

  return neighbors
}
