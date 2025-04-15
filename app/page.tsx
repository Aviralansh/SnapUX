import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserJourneyMap } from "@/components/user-journey-map"
import { FrictionPointsList } from "@/components/friction-points-list"
import { SessionsList } from "@/components/sessions-list"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentSessions } from "@/components/recent-sessions"
import { HeatmapViewer } from "@/components/heatmap-viewer"
import { ExtensionSetup } from "@/components/extension-setup"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <DashboardHeader />

      <div className="flex-1 space-y-6 p-6 md:p-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">UX Testing Dashboard</h1>
          <p className="text-muted-foreground">Track live user journeys and identify usability friction points</p>
        </div>

        <DashboardStats />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="heatmaps">Heatmaps</TabsTrigger>
            <TabsTrigger value="friction">Friction Points</TabsTrigger>
            <TabsTrigger value="setup">Extension Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>Currently active user sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">+2 from yesterday</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Friction Points</CardTitle>
                  <CardDescription>Detected in the last 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">12 high severity</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avg. Session Duration</CardTitle>
                  <CardDescription>Time spent on your site</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">4:32</div>
                  <p className="text-xs text-muted-foreground">-0:45 from last week</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>User Journey Map</CardTitle>
                  <CardDescription>Most common user paths</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <UserJourneyMap />
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Recent Sessions</CardTitle>
                  <CardDescription>Latest user recordings</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSessions />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>All Sessions</CardTitle>
                <CardDescription>Browse and replay user session recordings</CardDescription>
              </CardHeader>
              <CardContent>
                <SessionsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="heatmaps">
            <Card>
              <CardHeader>
                <CardTitle>Interaction Heatmaps</CardTitle>
                <CardDescription>Visualize where users click and interact with your site</CardDescription>
              </CardHeader>
              <CardContent>
                <HeatmapViewer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="friction">
            <Card>
              <CardHeader>
                <CardTitle>Friction Points</CardTitle>
                <CardDescription>Identified usability issues and pain points</CardDescription>
              </CardHeader>
              <CardContent>
                <FrictionPointsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle>Extension Setup</CardTitle>
                <CardDescription>Install and configure the browser extension</CardDescription>
              </CardHeader>
              <CardContent>
                <ExtensionSetup />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
