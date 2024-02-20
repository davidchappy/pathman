import { useRef, useEffect } from "react"
import createPathman from "./game"

const PathmanComponent = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const pathman = createPathman(canvas)
    pathman.run()

    return () => {
      pathman.quit()
    }
  }, [canvasRef.current])

  return <canvas id="pathman" ref={canvasRef} />
}

export default PathmanComponent
