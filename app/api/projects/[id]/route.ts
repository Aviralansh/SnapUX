import { NextResponse } from "next/server"

// Mock project data
const projects = {
  "ux-insight-123456": {
    id: "ux-insight-123456",
    name: "E-commerce Website",
    domain: "example.com",
    createdAt: "2025-03-01T00:00:00Z",
    settings: {
      clicks: true,
      movement: true,
      scrolling: true,
      formInteractions: true,
      pageTransitions: true,
      consoleErrors: true,
      networkRequests: false,
    },
  },
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  if (!projects[id]) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json(projects[id])
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  if (!projects[id]) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  try {
    const body = await request.json()

    // Update project settings
    if (body.settings) {
      projects[id].settings = {
        ...projects[id].settings,
        ...body.settings,
      }
    }

    return NextResponse.json(projects[id])
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
