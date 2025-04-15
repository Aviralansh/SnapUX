import { NextResponse } from "next/server"

// Mock recording data
const recordings: Record<string, any> = {
  s1: {
    id: "s1",
    events: [
      { type: "pageLoad", url: "https://example.com/product/123", timestamp: "2025-04-14T14:32:00Z" },
      { type: "click", x: 150, y: 200, timestamp: "2025-04-14T14:32:10Z" },
      { type: "scroll", position: 300, timestamp: "2025-04-14T14:32:15Z" },
      // More events...
    ],
    duration: "4:32",
  },
  s2: {
    id: "s2",
    events: [
      { type: "pageLoad", url: "https://example.com/checkout", timestamp: "2025-04-14T13:18:00Z" },
      { type: "formFocus", element: { selector: "input#email" }, timestamp: "2025-04-14T13:18:05Z" },
      { type: "formBlur", element: { selector: "input#email" }, timestamp: "2025-04-14T13:18:15Z" },
      // More events...
    ],
    duration: "6:18",
  },
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  if (!recordings[id]) {
    return NextResponse.json({ error: "Recording not found" }, { status: 404 })
  }

  return NextResponse.json(recordings[id])
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    const body = await request.json()

    // In a real app, you would store this in a database
    recordings[id] = {
      id,
      events: body.events || [],
      duration: body.duration
        ? `${Math.floor(body.duration / 60)}:${(body.duration % 60).toString().padStart(2, "0")}`
        : "0:00",
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
