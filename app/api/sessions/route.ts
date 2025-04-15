import { NextResponse } from "next/server"

// Mock database for demo purposes
// In a real app, you would use a database like MongoDB, Supabase, or Prisma
const sessions = [
  {
    id: "s1",
    user: "User 1",
    date: "2025-04-14",
    time: "14:32",
    duration: "4:32",
    frictionPoints: 3,
    browser: "Chrome",
    device: "Desktop",
    url: "https://example.com/product/123",
  },
  {
    id: "s2",
    user: "User 2",
    date: "2025-04-14",
    time: "13:18",
    duration: "6:18",
    frictionPoints: 5,
    browser: "Firefox",
    device: "Mobile",
    url: "https://example.com/checkout",
  },
  {
    id: "s3",
    user: "User 3",
    date: "2025-04-14",
    time: "12:45",
    duration: "2:45",
    frictionPoints: 1,
    browser: "Safari",
    device: "Tablet",
    url: "https://example.com/cart",
  },
  {
    id: "s4",
    user: "User 4",
    date: "2025-04-13",
    time: "16:22",
    duration: "5:12",
    frictionPoints: 7,
    browser: "Edge",
    device: "Desktop",
    url: "https://example.com/product/456",
  },
  {
    id: "s5",
    user: "User 5",
    date: "2025-04-13",
    time: "11:05",
    duration: "3:45",
    frictionPoints: 2,
    browser: "Chrome",
    device: "Mobile",
    url: "https://example.com/search?q=shoes",
  },
]

export async function GET() {
  return NextResponse.json(sessions)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // In a real app, you would validate the data and save to a database
    const newSession = {
      id: `s${sessions.length + 1}`,
      ...body,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().split(" ")[0].substring(0, 5),
    }

    sessions.push(newSession)

    return NextResponse.json(newSession, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
