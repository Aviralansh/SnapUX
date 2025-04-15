"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSessionRecording } from "@/lib/api"
import { Play, Pause, SkipBack, SkipForward, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function SessionPage() {
  const params = useParams()
  const sessionId = params.id as string
  const [recording, setRecording] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const fetchRecording = async () => {
      try {
        const data = await getSessionRecording(sessionId)
        setRecording(data)

        // Calculate duration in seconds
        if (data.events && data.events.length > 1) {
          const firstEvent = new Date(data.events[0].timestamp).getTime()
          const lastEvent = new Date(data.events[data.events.length - 1].timestamp).getTime()
          setDuration((lastEvent - firstEvent) / 1000)
        }

        setLoading(false)
      } catch (err) {
        setError("Failed to load recording")
        setLoading(false)
        console.error(err)
      }
    }

    fetchRecording()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [sessionId])

  useEffect(() => {
    if (!recording || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Draw initial frame
    drawFrame(0)

    function drawFrame(time: number) {
      if (!ctx || !recording) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw page mockup
      drawPageMockup(ctx, canvas.width, canvas.height)

      // Find events that should be visible at this time
      const eventsToShow = recording.events.filter((event: any) => {
        const eventTime = new Date(event.timestamp).getTime()
        const firstEventTime = new Date(recording.events[0].timestamp).getTime()
        const eventSeconds = (eventTime - firstEventTime) / 1000
        return eventSeconds <= time
      })

      // Draw the last mouse position
      const mouseEvents = eventsToShow.filter((event: any) => event.type === "click" || event.type === "mouseMovement")

      if (mouseEvents.length > 0) {
        const lastMouseEvent = mouseEvents[mouseEvents.length - 1]
        if (lastMouseEvent.x && lastMouseEvent.y) {
          // Draw cursor
          ctx.fillStyle = lastMouseEvent.type === "click" ? "rgba(255, 0, 0, 0.7)" : "rgba(0, 0, 255, 0.7)"
          ctx.beginPath()
          ctx.arc(lastMouseEvent.x, lastMouseEvent.y, 8, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Draw timeline
      drawTimeline(ctx, canvas.width, canvas.height, time)
    }

    function drawPageMockup(ctx: CanvasRenderingContext2D, width: number, height: number) {
      // Draw a simple page mockup
      ctx.fillStyle = "#f9fafb"
      ctx.fillRect(0, 0, width, height - 50) // Leave space for timeline

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

      // Draw content based on the URL
      const pageLoadEvents = recording.events.filter((event: any) => event.type === "pageLoad")
      if (pageLoadEvents.length > 0) {
        const url = pageLoadEvents[0].url || ""

        if (url.includes("product")) {
          // Product page mockup
          ctx.fillStyle = "#e5e7eb"
          ctx.fillRect(width * 0.1, 100, width * 0.4, 300) // Product image

          ctx.fillStyle = "#d1d5db"
          ctx.fillRect(width * 0.6, 100, width * 0.3, 50) // Title
          ctx.fillRect(width * 0.6, 170, width * 0.3, 100) // Description

          ctx.fillStyle = "#9ca3af"
          ctx.fillRect(width * 0.6, 290, 100, 30) // Price

          ctx.fillStyle = "#4b5563"
          ctx.fillRect(width * 0.6, 340, 150, 40) // Add to cart button
        } else if (url.includes("checkout")) {
          // Checkout page mockup
          ctx.fillStyle = "#e5e7eb"
          for (let i = 0; i < 5; i++) {
            ctx.fillRect(width * 0.2, 100 + i * 60, width * 0.6, 40) // Form fields
          }

          ctx.fillStyle = "#4b5563"
          ctx.fillRect(width * 0.2, 400, 150, 40) // Submit button
        } else {
          // Default/homepage mockup
          ctx.fillStyle = "#e5e7eb"
          ctx.fillRect(width * 0.1, 100, width * 0.8, 200) // Hero section

          for (let i = 0; i < 3; i++) {
            ctx.fillStyle = "#d1d5db"
            ctx.fillRect(width * 0.1 + i * ((width * 0.8) / 3 + 10), 320, (width * 0.8) / 3 - 10, 150) // Featured items
          }

          ctx.fillStyle = "#4b5563"
          ctx.fillRect(width / 2 - 75, 500, 150, 40) // CTA button
        }
      }
    }

    function drawTimeline(ctx: CanvasRenderingContext2D, width: number, height: number, currentTime: number) {
      const timelineHeight = 30
      const timelineY = height - timelineHeight - 10

      // Draw timeline background
      ctx.fillStyle = "#f3f4f6"
      ctx.fillRect(50, timelineY, width - 100, timelineHeight)

      // Draw progress
      const progress = duration > 0 ? currentTime / duration : 0
      ctx.fillStyle = "#4f46e5"
      ctx.fillRect(50, timelineY, (width - 100) * progress, timelineHeight)

      // Draw time text
      ctx.fillStyle = "#000000"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"

      const minutes = Math.floor(currentTime / 60)
      const seconds = Math.floor(currentTime % 60)
      const timeText = `${minutes}:${seconds.toString().padStart(2, "0")}`

      ctx.fillText(timeText, width / 2, timelineY + timelineHeight / 2 + 4)
    }

    // Animation loop for playback
    function animate() {
      if (isPlaying) {
        setCurrentTime((prev) => {
          const newTime = prev + 0.1
          if (newTime >= duration) {
            setIsPlaying(false)
            return duration
          }
          return newTime
        })
        drawFrame(currentTime)
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      drawFrame(currentTime)
    }
  }, [recording, isPlaying, currentTime, duration])

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const restart = () => {
    setCurrentTime(0)
    setIsPlaying(true)
  }

  const skipForward = () => {
    setCurrentTime((prev) => Math.min(prev + 10, duration))
  }

  const skipBackward = () => {
    setCurrentTime((prev) => Math.max(prev - 10, 0))
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading session recording...</div>
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Session Recording: {sessionId}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Replay</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative border rounded-md overflow-hidden" style={{ height: "600px" }}>
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>

            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={skipBackward}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button onClick={togglePlayback}>
                {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button variant="outline" size="sm" onClick={skipForward}>
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={restart}>
                Restart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="friction">Friction Points</TabsTrigger>
          <TabsTrigger value="info">Session Info</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {recording.events.map((event: any, index: number) => {
                  const eventTime = new Date(event.timestamp)
                  const firstEventTime = new Date(recording.events[0].timestamp)
                  const timeDiff = (eventTime.getTime() - firstEventTime.getTime()) / 1000

                  const minutes = Math.floor(timeDiff / 60)
                  const seconds = Math.floor(timeDiff % 60)
                  const timeText = `${minutes}:${seconds.toString().padStart(2, "0")}`

                  return (
                    <div key={index} className="flex items-start p-2 border-b last:border-0">
                      <div className="text-sm font-mono w-16">{timeText}</div>
                      <div className="flex-1">
                        <div className="font-medium">{event.type}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.type === "click" && `Click at (${event.x}, ${event.y})`}
                          {event.type === "pageLoad" && `Loaded ${event.url}`}
                          {event.type === "scroll" &&
                            `Scrolled to ${event.position}px (${Math.round(event.percentage)}%)`}
                          {event.type === "formFocus" && `Focused on ${event.element?.selector}`}
                          {event.type === "formBlur" && `Left field ${event.element?.selector}`}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="friction">
          <Card>
            <CardHeader>
              <CardTitle>Detected Friction Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recording.events
                  .filter((event: any) => event.type === "hesitation" || event.type.includes("friction"))
                  .map((event: any, index: number) => (
                    <div key={index} className="p-4 border rounded-md">
                      <div className="font-medium text-red-600">{event.type}</div>
                      <div className="text-sm mt-1">{event.message || "User experienced difficulty"}</div>
                      {event.element && (
                        <div className="text-sm text-muted-foreground mt-1">Element: {event.element.selector}</div>
                      )}
                    </div>
                  ))}

                {recording.events.filter((event: any) => event.type === "hesitation" || event.type.includes("friction"))
                  .length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No friction points detected in this session
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Session ID</div>
                  <div>{recording.id}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Duration</div>
                  <div>{recording.duration}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Browser</div>
                  <div>{recording.events[0]?.userAgent || "Unknown"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">URL</div>
                  <div>{recording.events.find((e: any) => e.type === "pageLoad")?.url || "Unknown"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Total Events</div>
                  <div>{recording.events.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
