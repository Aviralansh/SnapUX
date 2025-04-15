import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Play, AlertCircle } from "lucide-react"

export function RecentSessions() {
  const sessions = [
    {
      id: "s1",
      user: "User 1",
      timestamp: "10 minutes ago",
      duration: "4:32",
      frictionPoints: 3,
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "U1",
    },
    {
      id: "s2",
      user: "User 2",
      timestamp: "25 minutes ago",
      duration: "6:18",
      frictionPoints: 5,
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "U2",
    },
    {
      id: "s3",
      user: "User 3",
      timestamp: "1 hour ago",
      duration: "2:45",
      frictionPoints: 1,
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "U3",
    },
  ]

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div key={session.id} className="flex items-center justify-between space-x-4 rounded-md border p-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={session.avatar || "/placeholder.svg"} alt={session.user} />
              <AvatarFallback>{session.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{session.user}</p>
              <p className="text-xs text-muted-foreground">{session.timestamp}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-amber-500">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs">{session.frictionPoints}</span>
            </div>
            <div className="text-xs text-muted-foreground">{session.duration}</div>
            <Button size="sm" variant="ghost">
              <Play className="h-4 w-4 mr-1" />
              Play
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
