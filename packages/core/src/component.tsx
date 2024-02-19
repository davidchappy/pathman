import { useRef, useEffect } from "react"
import createPacman from "./game"

const PacmanComponent = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const pathsman = createPacman(canvas)
    pathsman.run()

    return () => {
      pathsman.quit()
    }
  }, [canvasRef.current])

  return <canvas id="pathsman" ref={canvasRef} />
}

export default PacmanComponent
