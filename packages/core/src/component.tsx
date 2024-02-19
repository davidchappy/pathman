import { useRef, useEffect } from "react"
import createPathsman from "./game"

const PathsmanComponent = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const pathsman = createPathsman(canvas)
    pathsman.run()

    return () => {
      pathsman.quit()
    }
  }, [canvasRef.current])

  return <canvas id="pathsman" ref={canvasRef} />
}

export default PathsmanComponent
