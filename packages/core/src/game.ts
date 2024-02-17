type GameState = {
  scale: number
  pacman: {
    x: number
    y: number
    direction: "right" | "left" | "up" | "down"
    isMoving: boolean
    mouthOpening: boolean
    mouthAngle: number
  }
  previousAnimationTimestamp: number | undefined
  cookies: { x: number; y: number }[]
  currentFPS: number
  clickLocation?: { x: number; y: number }
  isPaused: boolean
}

const getInitialState = (): GameState => ({
  scale: 1,
  pacman: {
    x: 75,
    y: 75,
    direction: "right",
    isMoving: false,
    mouthOpening: false,
    mouthAngle: 0,
  },
  previousAnimationTimestamp: undefined,
  cookies: [],
  currentFPS: 60,
  clickLocation: undefined,
  isPaused: false,
})

const createCookies = (canvas: HTMLCanvasElement) => {
  // Create 10 random cookies
  const cookies = []
  for (let i = 0; i < 10; i++) {
    const x = Math.ceil(Math.random() * (window.innerWidth - 120)) // Random x position
    const y = Math.ceil(Math.random() * window.innerHeight) // Random y position

    // Ensure cookies are not placed too close to the edges
    cookies.push({ x, y })
  }

  return cookies
}

const createGame = (canvas: HTMLCanvasElement) => {
  const state: GameState = getInitialState()

  const ctx = canvas.getContext("2d")!

  const resizeCanvas = (width?: number, height?: number) => {
    canvas.width = width || window.innerWidth
    canvas.height = height || window.innerHeight
  }

  state.cookies = createCookies(canvas)

  const drawBackground = () => {
    ctx.fillStyle = "black"
    ctx.fillRect(
      0,
      0,
      window.innerWidth / state.scale,
      window.innerHeight / state.scale
    )
  }

  const drawStats = () => {
    // Box dimensions and position
    const boxWidth = 120
    const boxHeight = 120
    const boxX = ctx.canvas.width - boxWidth - 10 // 10px from the right edge
    const boxY = 10 // 10px from the top edge

    // Draw the box
    ctx.strokeStyle = "yellow" // Box border color
    ctx.lineWidth = 2
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)

    // Set text properties
    ctx.font = "16px Helvetica, Arial, sans-serif"
    ctx.fillStyle = "yellow" // Text color
    ctx.lineWidth = 2

    // Calculate text position for vertical center alignment
    const textX = boxX + 15 // 10px padding from the left edge of the box
    const textY = boxY + (boxHeight - 50) / 2 // Vertically center the text

    // Write the text
    ctx.textAlign = "left"
    ctx.fillText(`FPS: ${state.currentFPS.toFixed(0)}`, textX, textY)

    // Record number of remaining cookies
    ctx.fillText(`Cookies: ${state.cookies.length}`, textX, textY + 20)

    // Add reset button
    const buttonX = boxX + 10
    const buttonY = textY + 40
    const buttonWidth = boxWidth - 20
    const buttonHeight = 30
    ctx.fillStyle = "yellow"
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight)
    ctx.fillStyle = "black"
    ctx.fillText("Reset", buttonX + 10, buttonY + 20)
  }

  const drawPacman = () => {
    const { x, y, mouthAngle, direction } = state.pacman
    const size = 60
    const radius = size / 2
    const eyeSize = size / 12

    ctx.save()
    ctx.translate(x, y)

    switch (direction) {
      case "right":
        // No rotation needed
        break
      case "down":
        ctx.rotate(Math.PI / 2) // Rotate 90 degrees clockwise
        break
      case "left":
        ctx.rotate(Math.PI) // Rotate 180 degrees
        break
      case "up":
        ctx.rotate(-Math.PI / 2) // Rotate 90 degrees counter-clockwise
        break
    }

    ctx.strokeStyle = "yellow"
    ctx.beginPath()

    // Outer circle
    ctx.arc(0, 0, radius, mouthAngle, Math.PI * 2 - mouthAngle, true)

    // Mouth
    ctx.lineTo(0, 0) // Lower lip

    const upperLipEndX = radius * Math.cos(Math.PI * 2 - mouthAngle)
    const upperLipEndY = -radius * Math.sin(Math.PI * 2 - mouthAngle)

    ctx.moveTo(upperLipEndX, upperLipEndY) // Move to the right
    ctx.lineTo(0, 0) // Upper lip

    // Eye
    // ctx.moveTo(x + 10, y - 15)
    // ctx.arc(x + 5, y - 17, eyeSize, 0, Math.PI * 2, true)

    ctx.stroke()

    ctx.restore()
  }

  const drawCookies = () => {
    const radius = 6
    for (const cookie of state.cookies) {
      ctx.beginPath()
      ctx.arc(cookie.x, cookie.y, radius, 0, Math.PI * 2, true)
      ctx.fillStyle = "yellow"
      ctx.fill()
    }
  }

  const drawClickLocation = () => {
    if (state.clickLocation === undefined) return

    const { x, y } = state.clickLocation
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2, true)
    ctx.fillStyle = "red"
    ctx.fill()
  }

  const drawOverlay = () => {
    if (state.isPaused) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = "48px Helvetica, Arial, sans-serif"
      ctx.fillStyle = "white"

      ctx.textAlign = "center"
      ctx.fillText("Paused. Press spacebar to continue.", canvas.width / 2, canvas.height / 2)
    }
  }

  const draw = () => {
    drawBackground()
    drawStats()
    drawPacman()
    drawCookies()
    drawClickLocation()
    drawOverlay()
  }

  const updatePacman = () => {
    // Animate
    const mouthSpeed = 0.02 // Speed of mouth opening/closing
    const maxLowestAngle = -0.6 // Maximum mouth angle in radians

    if (state.pacman.mouthOpening) {
      state.pacman.mouthAngle -= mouthSpeed // Increase the mouth angle
      if (state.pacman.mouthAngle < maxLowestAngle) {
        state.pacman.mouthAngle = maxLowestAngle // Limit the mouth angle
        state.pacman.mouthOpening = false // Start closing the mouth
      }
    } else {
      state.pacman.mouthAngle += mouthSpeed // Decrease the mouth angle
      if (state.pacman.mouthAngle > 0) {
        state.pacman.mouthAngle = 0
        state.pacman.mouthOpening = true // Start opening the mouth
      }
    }

    // Move
    if (!state.pacman.isMoving) return

    const speed = 4
    let newX = state.pacman.x
    let newY = state.pacman.y

    if (state.pacman.direction === "right") {
      newX += speed
    }
    if (state.pacman.direction === "left") {
      newX -= speed
    }
    if (state.pacman.direction === "up") {
      newY -= speed
    }
    if (state.pacman.direction === "down") {
      newY += speed
    }

    const radius = 60 / 2
    if (newX - radius >= 0 && newX + radius <= canvas.width) {
      state.pacman.x = newX
    }
    if (newY - radius >= 0 && newY + radius <= canvas.height) {
      state.pacman.y = newY
    }
  }

  const updateCookies = () => {
    // Check for collisions
    const pacmanRadius = 60 / 2

    for (let i = 0; i < state.cookies.length; i++) {
      const cookie = state.cookies[i]
      const distance = Math.sqrt(
        Math.pow(state.pacman.x - cookie.x, 2) +
          Math.pow(state.pacman.y - cookie.y, 2)
      )

      if (distance < pacmanRadius + 6) {
        state.cookies.splice(i, 1)
        i--
      }
    }
  }

  const updateStats = (deltaTime: number) => {
    state.currentFPS = 1000 / deltaTime
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    // Toggle pause
    if (event.key === " ") {
      state.isPaused = !state.isPaused
      if (!state.isPaused) {
        requestAnimationFrame(animate)
      }
    }

    if (state.isPaused) return

    if (event.key === "ArrowRight" || event.key === "d") {
      state.pacman.direction = "right"
      state.pacman.isMoving = true
    }

    if (event.key === "ArrowLeft" || event.key === "a") {
      state.pacman.direction = "left"
      state.pacman.isMoving = true
    }

    if (event.key === "ArrowUp" || event.key === "w") {
      state.pacman.direction = "up"
      state.pacman.isMoving = true
    }

    if (event.key === "ArrowDown" || event.key === "s") {
      state.pacman.direction = "down"
      state.pacman.isMoving = true
    }
  }

  const handleClick = (event: MouseEvent) => {
    const clickLocation = {
      x: event.clientX,
      y: event.clientY,
    }

    setTimeout(() => {
      state.clickLocation = undefined
    }, 4000)

    state.clickLocation = clickLocation

    console.log("click", clickLocation)

    const resetButton = {
      x: ctx.canvas.width - 120,
      y: 86,
      width: 100,
      height: 30,
    }

    if (
      event.clientX >= resetButton.x &&
      event.clientX <= resetButton.x + resetButton.width &&
      event.clientY >= resetButton.y &&
      event.clientY <= resetButton.y + resetButton.height
    ) {
      reset()
    }
  }

  const attachEvents = () => {
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("click", handleClick)
  }

  const detachEvents = () => {
    window.removeEventListener("keyup", handleKeyUp)
    window.removeEventListener("click", handleClick)
  }

  const animate = (timestamp: number) => {
    // Initialize the previous timestamp
    if (state.previousAnimationTimestamp === undefined) {
      state.previousAnimationTimestamp = timestamp
      requestAnimationFrame(animate)
      return
    }

    const deltaTime = timestamp - state.previousAnimationTimestamp

    // Update stuff
    updatePacman()
    updateCookies()
    updateStats(deltaTime)

    // Draw stuff
    draw()

    state.previousAnimationTimestamp = timestamp

    if (state.isPaused) return

    requestAnimationFrame(animate)
  }

  const start = () => {
    console.log("Starting Pacman game...", canvas)

    // Initialize the canvas
    resizeCanvas()
    attachEvents()
    draw() // Use a milisecond as the initial deltaTime

    // Start the animation loop
    requestAnimationFrame(animate)
  }

  const stop = () => {
    console.log("Stopping Pacman game...")

    state.previousAnimationTimestamp = undefined
    detachEvents()
  }

  const reset = () => {
    console.log("Resetting Pacman game...")
    stop()
    Object.assign(state, { ...getInitialState() })
    state.cookies = createCookies(canvas)
    start()
  }

  return {
    start,
    stop,
    reset,
  }
}

export default createGame
