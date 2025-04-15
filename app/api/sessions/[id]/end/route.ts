import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const sessionId = params.id

  try {
    const body = await request.json()

    // In a real app, you would update the session in your database
    console.log(`Ending session ${sessionId} at ${body.endTime}`)

    return NextResponse.json({
      success: true,
      message: `Session ${sessionId} ended successfully`,
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
