"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Play, ExternalLink } from "lucide-react"
import { getFrictionPoints, type FrictionPoint } from "@/lib/api"

export function FrictionPointsList() {
  const [filter, setFilter] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [frictionPoints, setFrictionPoints] = useState<FrictionPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFrictionPoints = async () => {
      try {
        const data = await getFrictionPoints()
        setFrictionPoints(data)
        setLoading(false)
      } catch (err) {
        setError("Failed to load friction points")
        setLoading(false)
        console.error(err)
      }
    }

    fetchFrictionPoints()
  }, [])

  const filteredPoints = frictionPoints.filter(
    (point) =>
      (severityFilter === "all" || point.severity === severityFilter) &&
      (point.page.toLowerCase().includes(filter.toLowerCase()) ||
        point.element.toLowerCase().includes(filter.toLowerCase()) ||
        point.issue.toLowerCase().includes(filter.toLowerCase())),
  )

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "medium":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      case "low":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      default:
        return ""
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading friction points...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filter friction points..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page / Element</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Occurrences</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPoints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No friction points found
                </TableCell>
              </TableRow>
            ) : (
              filteredPoints.map((point) => (
                <TableRow key={point.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{point.page}</div>
                      <div className="text-sm text-muted-foreground">{point.element}</div>
                    </div>
                  </TableCell>
                  <TableCell>{point.issue}</TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(point.severity)}>{point.severity}</Badge>
                  </TableCell>
                  <TableCell>{point.occurrences}</TableCell>
                  <TableCell>{point.lastSeen}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost">
                        <Play className="h-4 w-4" />
                        <span className="sr-only">View Session</span>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => window.open(point.url, "_blank")}>
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Open URL</span>
                      </Button>
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
