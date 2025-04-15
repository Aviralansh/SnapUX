import { NextResponse } from "next/server"

// Mock database for events
const events: Record<string, any[]> = {}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Initialize events array for this session if it doesn't exist
    if (!events[body.sessionId]) {
      events[body.sessionId] = []
    }

    // Add event to the session
    events[body.sessionId].push({
      ...body,
      timestamp: body.timestamp || new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId")

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
  }

  return NextResponse.json(events[sessionId] || [])
}
