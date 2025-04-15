import { NextResponse } from "next/server"

export async function GET() {
  // In a real app, you would calculate these stats from your database
  const stats = {
    totalSessions: 1248,
    activeSessions: 3,
    frictionPoints: 42,
    avgSessionDuration: "4:32",
    completionRate: 68,
    timeOnTask: "2:45",
  }

  return NextResponse.json(stats)
}
