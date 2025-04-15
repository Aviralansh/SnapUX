// API client for interacting with the UX Insight backend

export interface Session {
  id: string
  user: string
  date: string
  time: string
  duration: string
  frictionPoints: number
  browser: string
  device: string
  url: string
}

export interface FrictionPoint {
  id: string
  page: string
  element: string
  issue: string
  severity: "high" | "medium" | "low"
  occurrences: number
  lastSeen: string
  url: string
}

export interface DashboardStats {
  totalSessions: number
  activeSessions: number
  frictionPoints: number
  avgSessionDuration: string
  completionRate: number
  timeOnTask: string
}

// Base API URL - will be different in development vs production
const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || window.location.origin
}

// Fetch dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${getApiUrl()}/api/stats`)

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats")
  }

  return response.json()
}

// Fetch all sessions
export async function getSessions(): Promise<Session[]> {
  const response = await fetch(`${getApiUrl()}/api/sessions`)

  if (!response.ok) {
    throw new Error("Failed to fetch sessions")
  }

  return response.json()
}

// Fetch friction points
export async function getFrictionPoints(): Promise<FrictionPoint[]> {
  const response = await fetch(`${getApiUrl()}/api/friction-points`)

  if (!response.ok) {
    throw new Error("Failed to fetch friction points")
  }

  return response.json()
}

// Get session recording
export async function getSessionRecording(sessionId: string): Promise<any> {
  const response = await fetch(`${getApiUrl()}/api/recordings/${sessionId}`)

  if (!response.ok) {
    throw new Error("Failed to fetch recording")
  }

  return response.json()
}

// Get project settings
export async function getProjectSettings(projectId: string): Promise<any> {
  const response = await fetch(`${getApiUrl()}/api/projects/${projectId}`)

  if (!response.ok) {
    throw new Error("Failed to fetch project settings")
  }

  return response.json()
}

// Update project settings
export async function updateProjectSettings(projectId: string, settings: any): Promise<any> {
  const response = await fetch(`${getApiUrl()}/api/projects/${projectId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ settings }),
  })

  if (!response.ok) {
    throw new Error("Failed to update project settings")
  }

  return response.json()
}
