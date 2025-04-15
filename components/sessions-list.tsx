"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Play, Download, MoreHorizontal, AlertCircle, Filter } from "lucide-react"
import { getSessions, type Session } from "@/lib/api"

export function SessionsList() {
  const [filter, setFilter] = useState("")
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getSessions()
        setSessions(data)
        setLoading(false)
      } catch (err) {
        setError("Failed to load sessions")
        setLoading(false)
        console.error(err)
      }
    }

    fetchSessions()
  }, [])

  const filteredSessions = sessions.filter(
    (session) =>
      session.user.toLowerCase().includes(filter.toLowerCase()) ||
      session.url.toLowerCase().includes(filter.toLowerCase()) ||
      session.browser.toLowerCase().includes(filter.toLowerCase()) ||
      session.device.toLowerCase().includes(filter.toLowerCase()),
  )

  if (loading) {
    return <div className="flex justify-center p-4">Loading sessions...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filter sessions..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Friction Points</TableHead>
              <TableHead>Browser / Device</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No sessions found
                </TableCell>
              </TableRow>
            ) : (
              filteredSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.user}</TableCell>
                  <TableCell>
                    {session.date} {session.time}
                  </TableCell>
                  <TableCell>{session.duration}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <AlertCircle
                        className={`h-4 w-4 ${session.frictionPoints > 4 ? "text-red-500" : "text-amber-500"}`}
                      />
                      <span>{session.frictionPoints}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {session.browser} / {session.device}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{session.url}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`/sessions/${session.id}`, "_blank")}
                      >
                        <Play className="h-4 w-4" />
                        <span className="sr-only">Play</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Share</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
