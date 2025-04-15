"use client"

import { useEffect, useRef } from "react"

export function UserJourneyMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (!parent) return

      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight

      drawJourneyMap(ctx, canvas.width, canvas.height)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  const drawJourneyMap = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height)

    // Define nodes
    const nodes = [
      { id: 1, label: "Homepage", x: width * 0.1, y: height * 0.5 },
      { id: 2, label: "Product List", x: width * 0.3, y: height * 0.3 },
      { id: 3, label: "Product Detail", x: width * 0.5, y: height * 0.2 },
      { id: 4, label: "Cart", x: width * 0.7, y: height * 0.3 },
      { id: 5, label: "Checkout", x: width * 0.9, y: height * 0.5 },
      { id: 6, label: "Category Page", x: width * 0.3, y: height * 0.7 },
      { id: 7, label: "Search Results", x: width * 0.5, y: height * 0.8 },
    ]

    // Define edges with weights
    const edges = [
      { from: 1, to: 2, weight: 0.6 },
      { from: 1, to: 6, weight: 0.4 },
      { from: 2, to: 3, weight: 0.8 },
      { from: 3, to: 4, weight: 0.5 },
      { from: 4, to: 5, weight: 0.9 },
      { from: 6, to: 3, weight: 0.3 },
      { from: 6, to: 7, weight: 0.7 },
      { from: 7, to: 3, weight: 0.6 },
      { from: 2, to: 1, weight: 0.2 }, // Back to homepage
      { from: 3, to: 2, weight: 0.3 }, // Back to product list
    ]

    // Draw edges
    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from)
      const toNode = nodes.find((n) => n.id === edge.to)

      if (fromNode && toNode) {
        ctx.beginPath()
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.lineTo(toNode.x, toNode.y)

        // Line width based on weight
        const lineWidth = edge.weight * 5
        ctx.lineWidth = lineWidth

        // Gradient from blue to green based on weight
        const gradient = ctx.createLinearGradient(fromNode.x, fromNode.y, toNode.x, toNode.y)
        gradient.addColorStop(0, `rgba(59, 130, 246, ${edge.weight})`)
        gradient.addColorStop(1, `rgba(16, 185, 129, ${edge.weight})`)
        ctx.strokeStyle = gradient

        ctx.stroke()

        // Draw arrow
        const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x)
        const arrowLength = 10
        const arrowX = toNode.x - arrowLength * Math.cos(angle)
        const arrowY = toNode.y - arrowLength * Math.sin(angle)

        ctx.beginPath()
        ctx.moveTo(arrowX, arrowY)
        ctx.lineTo(
          arrowX - arrowLength * Math.cos(angle - Math.PI / 6),
          arrowY - arrowLength * Math.sin(angle - Math.PI / 6),
        )
        ctx.lineTo(
          arrowX - arrowLength * Math.cos(angle + Math.PI / 6),
          arrowY - arrowLength * Math.sin(angle + Math.PI / 6),
        )
        ctx.closePath()
        ctx.fillStyle = `rgba(59, 130, 246, ${edge.weight})`
        ctx.fill()
      }
    })

    // Draw nodes
    nodes.forEach((node) => {
      // Node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, 15, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(59, 130, 246, 0.8)"
      ctx.fill()

      // Node label
      ctx.font = "12px sans-serif"
      ctx.fillStyle = "#000"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(node.label, node.x, node.y + 30)
    })
  }

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
