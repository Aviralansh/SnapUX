"use client"

import { useEffect, useRef, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Eye, MousePointer, Hand, Clock } from "lucide-react"

export function HeatmapViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [heatmapType, setHeatmapType] = useState("clicks")
  const [page, setPage] = useState("homepage")
  const [opacity, setOpacity] = useState([50])

  const pages = [
    { value: "homepage", label: "Homepage" },
    { value: "product", label: "Product Page" },
    { value: "checkout", label: "Checkout" },
    { value: "cart", label: "Cart" },
  ]

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

      drawHeatmap(ctx, canvas.width, canvas.height)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [heatmapType, page, opacity])

  const drawHeatmap = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height)

    // Draw page mockup background
    ctx.fillStyle = "#f9fafb"
    ctx.fillRect(0, 0, width, height)

    // Draw header
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, 60)
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1
    ctx.strokeRect(0, 60, width, 1)

    // Draw logo placeholder
    ctx.fillStyle = "#d1d5db"
    ctx.fillRect(20, 15, 100, 30)

    // Draw navigation items
    ctx.fillStyle = "#9ca3af"
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(width - 300 + i * 70, 20, 50, 20)
    }

    // Draw main content area based on page
    if (page === "homepage") {
      // Hero section
      ctx.fillStyle = "#e5e7eb"
      ctx.fillRect(width * 0.1, 100, width * 0.8, 200)

      // Featured items
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = "#d1d5db"
        ctx.fillRect(width * 0.1 + i * ((width * 0.8) / 3 + 10), 320, (width * 0.8) / 3 - 10, 150)
      }

      // CTA button
      ctx.fillStyle = "#4b5563"
      ctx.fillRect(width / 2 - 75, 500, 150, 40)
    } else if (page === "product") {
      // Product image
      ctx.fillStyle = "#e5e7eb"
      ctx.fillRect(width * 0.1, 100, width * 0.4, 300)

      // Product details
      ctx.fillStyle = "#d1d5db"
      ctx.fillRect(width * 0.6, 100, width * 0.3, 50) // Title
      ctx.fillRect(width * 0.6, 170, width * 0.3, 100) // Description

      // Price and add to cart
      ctx.fillStyle = "#9ca3af"
      ctx.fillRect(width * 0.6, 290, 100, 30) // Price
      ctx.fillStyle = "#4b5563"
      ctx.fillRect(width * 0.6, 340, 150, 40) // Add to cart button
    } else if (page === "checkout") {
      // Form fields
      ctx.fillStyle = "#e5e7eb"
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(width * 0.2, 100 + i * 60, width * 0.6, 40)
      }

      // Submit button
      ctx.fillStyle = "#4b5563"
      ctx.fillRect(width * 0.2, 400, 150, 40)
    } else if (page === "cart") {
      // Cart items
      ctx.fillStyle = "#e5e7eb"
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(width * 0.1, 100 + i * 100, width * 0.8, 80)
      }

      // Checkout button
      ctx.fillStyle = "#4b5563"
      ctx.fillRect(width * 0.7, 400, 150, 40)
    }

    // Draw heatmap overlay
    const heatmapOpacity = opacity[0] / 100

    if (heatmapType === "clicks") {
      drawClickHeatmap(ctx, width, height, heatmapOpacity, page)
    } else if (heatmapType === "movement") {
      drawMovementHeatmap(ctx, width, height, heatmapOpacity, page)
    } else if (heatmapType === "attention") {
      drawAttentionHeatmap(ctx, width, height, heatmapOpacity, page)
    }
  }

  const drawClickHeatmap = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    opacity: number,
    page: string,
  ) => {
    // Generate click points based on page
    const clickPoints = []

    if (page === "homepage") {
      // More clicks on CTA and first featured item
      for (let i = 0; i < 30; i++) {
        clickPoints.push({
          x: width / 2 + (Math.random() * 100 - 50),
          y: 520 + (Math.random() * 30 - 15),
          intensity: 0.7 + Math.random() * 0.3,
        })
      }

      // Clicks on first featured item
      for (let i = 0; i < 20; i++) {
        clickPoints.push({
          x: width * 0.1 + (width * 0.8) / 6 + (Math.random() * 50 - 25),
          y: 395 + (Math.random() * 50 - 25),
          intensity: 0.6 + Math.random() * 0.4,
        })
      }

      // Some clicks on navigation
      for (let i = 0; i < 15; i++) {
        const navItem = Math.floor(Math.random() * 4)
        clickPoints.push({
          x: width - 300 + navItem * 70 + 25 + (Math.random() * 20 - 10),
          y: 30 + (Math.random() * 10 - 5),
          intensity: 0.5 + Math.random() * 0.3,
        })
      }
    } else if (page === "product") {
      // Lots of clicks on add to cart
      for (let i = 0; i < 40; i++) {
        clickPoints.push({
          x: width * 0.6 + 75 + (Math.random() * 50 - 25),
          y: 360 + (Math.random() * 20 - 10),
          intensity: 0.8 + Math.random() * 0.2,
        })
      }

      // Clicks on product image
      for (let i = 0; i < 25; i++) {
        clickPoints.push({
          x: width * 0.1 + (width * 0.4) / 2 + (Math.random() * 100 - 50),
          y: 250 + (Math.random() * 100 - 50),
          intensity: 0.6 + Math.random() * 0.3,
        })
      }
    } else if (page === "checkout") {
      // Clicks on form fields
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 10; j++) {
          clickPoints.push({
            x: width * 0.2 + (width * 0.6) / 2 + (Math.random() * 100 - 50),
            y: 120 + i * 60 + (Math.random() * 20 - 10),
            intensity: 0.5 + Math.random() * 0.3,
          })
        }
      }

      // Lots of clicks on submit button
      for (let i = 0; i < 30; i++) {
        clickPoints.push({
          x: width * 0.2 + 75 + (Math.random() * 50 - 25),
          y: 420 + (Math.random() * 20 - 10),
          intensity: 0.7 + Math.random() * 0.3,
        })
      }
    } else if (page === "cart") {
      // Clicks on checkout button
      for (let i = 0; i < 35; i++) {
        clickPoints.push({
          x: width * 0.7 + 75 + (Math.random() * 50 - 25),
          y: 420 + (Math.random() * 20 - 10),
          intensity: 0.8 + Math.random() * 0.2,
        })
      }

      // Clicks on cart items (quantity adjustments)
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 15; j++) {
          clickPoints.push({
            x: width * 0.8 - 50 + (Math.random() * 30 - 15),
            y: 140 + i * 100 + (Math.random() * 20 - 10),
            intensity: 0.6 + Math.random() * 0.3,
          })
        }
      }
    }

    // Draw heat points
    clickPoints.forEach((point) => {
      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 30)

      gradient.addColorStop(0, `rgba(255, 0, 0, ${point.intensity * opacity})`)
      gradient.addColorStop(1, "rgba(255, 0, 0, 0)")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(point.x, point.y, 30, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  const drawMovementHeatmap = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    opacity: number,
    page: string,
  ) => {
    // Draw mouse movement paths
    ctx.strokeStyle = `rgba(0, 128, 255, ${opacity * 0.7})`
    ctx.lineWidth = 3

    if (page === "homepage") {
      // Path from top to CTA
      ctx.beginPath()
      ctx.moveTo(width / 2, 60)
      ctx.bezierCurveTo(width / 2 + 50, 150, width / 2 - 100, 300, width / 2, 520)
      ctx.stroke()

      // Path to featured items
      ctx.beginPath()
      ctx.moveTo(width / 2, 520)
      ctx.bezierCurveTo(width / 2 - 50, 450, width * 0.3, 400, width * 0.2, 395)
      ctx.stroke()
    } else if (page === "product") {
      // Path from image to add to cart
      ctx.beginPath()
      ctx.moveTo(width * 0.3, 250)
      ctx.bezierCurveTo(width * 0.4, 280, width * 0.5, 320, width * 0.6 + 75, 360)
      ctx.stroke()

      // Path from price to add to cart
      ctx.beginPath()
      ctx.moveTo(width * 0.6 + 50, 305)
      ctx.lineTo(width * 0.6 + 75, 360)
      ctx.stroke()
    } else if (page === "checkout") {
      // Path through form fields to submit
      ctx.beginPath()
      ctx.moveTo(width * 0.5, 120)
      ctx.lineTo(width * 0.5, 180)
      ctx.lineTo(width * 0.5, 240)
      ctx.lineTo(width * 0.5, 300)
      ctx.lineTo(width * 0.5, 360)
      ctx.bezierCurveTo(width * 0.4, 380, width * 0.3, 400, width * 0.2 + 75, 420)
      ctx.stroke()
    } else if (page === "cart") {
      // Path from cart items to checkout
      ctx.beginPath()
      ctx.moveTo(width * 0.5, 140)
      ctx.bezierCurveTo(width * 0.6, 200, width * 0.65, 300, width * 0.7 + 75, 420)
      ctx.stroke()
    }
  }

  const drawAttentionHeatmap = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    opacity: number,
    page: string,
  ) => {
    // Create attention heatmap
    const attentionPoints = []

    if (page === "homepage") {
      // High attention on hero section
      for (let x = width * 0.2; x < width * 0.8; x += 20) {
        for (let y = 120; y < 280; y += 20) {
          const distFromCenter = Math.sqrt(Math.pow(x - width / 2, 2) + Math.pow(y - 200, 2))
          const maxDist = Math.sqrt(Math.pow(width * 0.3, 2) + Math.pow(80, 2))
          const intensity = 1 - distFromCenter / maxDist

          if (intensity > 0) {
            attentionPoints.push({
              x,
              y,
              intensity: intensity * 0.8,
            })
          }
        }
      }

      // Some attention on CTA
      for (let x = width / 2 - 75; x < width / 2 + 75; x += 10) {
        for (let y = 500; y < 540; y += 10) {
          attentionPoints.push({
            x,
            y,
            intensity: 0.7,
          })
        }
      }
    } else if (page === "product") {
      // High attention on product image
      for (let x = width * 0.1; x < width * 0.5; x += 20) {
        for (let y = 100; y < 400; y += 20) {
          const distFromCenter = Math.sqrt(Math.pow(x - width * 0.3, 2) + Math.pow(y - 250, 2))
          const maxDist = Math.sqrt(Math.pow(width * 0.2, 2) + Math.pow(150, 2))
          const intensity = 1 - distFromCenter / maxDist

          if (intensity > 0) {
            attentionPoints.push({
              x,
              y,
              intensity: intensity * 0.9,
            })
          }
        }
      }

      // Attention on add to cart button
      for (let x = width * 0.6; x < width * 0.6 + 150; x += 10) {
        for (let y = 340; y < 380; y += 10) {
          attentionPoints.push({
            x,
            y,
            intensity: 0.8,
          })
        }
      }
    } else if (page === "checkout") {
      // Attention on form fields
      for (let i = 0; i < 5; i++) {
        for (let x = width * 0.2; x < width * 0.8; x += 20) {
          for (let y = 100 + i * 60; y < 140 + i * 60; y += 10) {
            attentionPoints.push({
              x,
              y,
              intensity: 0.6,
            })
          }
        }
      }

      // High attention on submit button
      for (let x = width * 0.2; x < width * 0.2 + 150; x += 10) {
        for (let y = 400; y < 440; y += 10) {
          attentionPoints.push({
            x,
            y,
            intensity: 0.9,
          })
        }
      }
    } else if (page === "cart") {
      // Attention on cart items
      for (let i = 0; i < 3; i++) {
        for (let x = width * 0.1; x < width * 0.9; x += 20) {
          for (let y = 100 + i * 100; y < 180 + i * 100; y += 20) {
            const intensity = i === 0 ? 0.8 : i === 1 ? 0.6 : 0.4
            attentionPoints.push({
              x,
              y,
              intensity,
            })
          }
        }
      }

      // High attention on checkout button
      for (let x = width * 0.7; x < width * 0.7 + 150; x += 10) {
        for (let y = 400; y < 440; y += 10) {
          attentionPoints.push({
            x,
            y,
            intensity: 0.9,
          })
        }
      }
    }

    // Draw attention heatmap
    attentionPoints.forEach((point) => {
      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 40)

      gradient.addColorStop(0, `rgba(255, 165, 0, ${point.intensity * opacity})`)
      gradient.addColorStop(1, "rgba(255, 165, 0, 0)")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(point.x, point.y, 40, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Select value={page} onValueChange={setPage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select page" />
          </SelectTrigger>
          <SelectContent>
            {pages.map((page) => (
              <SelectItem key={page.value} value={page.value}>
                {page.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs value={heatmapType} onValueChange={setHeatmapType} className="w-auto">
          <TabsList>
            <TabsTrigger value="clicks">
              <MousePointer className="h-4 w-4 mr-2" />
              Clicks
            </TabsTrigger>
            <TabsTrigger value="movement">
              <Hand className="h-4 w-4 mr-2" />
              Movement
            </TabsTrigger>
            <TabsTrigger value="attention">
              <Eye className="h-4 w-4 mr-2" />
              Attention
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 ml-auto">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Last 7 days</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Heatmap Opacity</label>
          <span className="text-sm text-muted-foreground">{opacity[0]}%</span>
        </div>
        <Slider value={opacity} onValueChange={setOpacity} max={100} step={1} />
      </div>

      <div className="relative border rounded-md overflow-hidden" style={{ height: "500px" }}>
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </div>
  )
}
