import { useRef, useEffect } from "react"
import createPacman from "./game"

const PacmanComponent = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const pacman = createPacman(canvas)
    pacman.start()

    return () => {
      pacman.stop()
    }
  }, [canvasRef.current])

  return <canvas id="pacman" ref={canvasRef} />
}

export default PacmanComponent
