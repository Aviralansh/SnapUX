"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Copy, Download, Check, Chrome, ChromeIcon as Firefox, DotIcon as Edge } from "lucide-react"

export function ExtensionSetup() {
  const [copied, setCopied] = useState(false)
  const [projectId, setProjectId] = useState("ux-insight-123456")
  const [trackingOptions, setTrackingOptions] = useState({
    clicks: true,
    movement: true,
    scrolling: true,
    formInteractions: true,
    pageTransitions: true,
    consoleErrors: true,
    networkRequests: false,
  })

  const handleCopy = () => {
    navigator.clipboard.writeText(`<script>
  (function(w,d,s,p,i,c,e) {
    w['UXInsightObject']=p;w[p]=w[p]||function(){
    (w[p].q=w[p].q||[]).push(arguments)},w[p].l=1*new Date();c=d.createElement(s),
    e=d.getElementsByTagName(s)[0];c.async=1;c.src=i;e.parentNode.insertBefore(c,e)
  })(window,document,'script','uxinsight','https://cdn.uxinsight.io/tracker.js?id=${projectId}');
  
  uxinsight('init', '${projectId}');
  uxinsight('trackPageView');
</script>`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggle = (option: string) => {
    setTrackingOptions({
      ...trackingOptions,
      [option]: !trackingOptions[option as keyof typeof trackingOptions],
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="extension" className="space-y-4">
        <TabsList>
          <TabsTrigger value="extension">Browser Extension</TabsTrigger>
          <TabsTrigger value="script">Script Installation</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="extension" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Chrome className="h-12 w-12 text-blue-500" />
                  <div>
                    <h3 className="font-medium">Chrome Extension</h3>
                    <p className="text-sm text-muted-foreground">For Chrome and Chromium browsers</p>
                  </div>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Firefox className="h-12 w-12 text-orange-500" />
                  <div>
                    <h3 className="font-medium">Firefox Extension</h3>
                    <p className="text-sm text-muted-foreground">For Firefox browsers</p>
                  </div>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Edge className="h-12 w-12 text-teal-500" />
                  <div>
                    <h3 className="font-medium">Edge Extension</h3>
                    <p className="text-sm text-muted-foreground">For Microsoft Edge</p>
                  </div>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Installation Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Download the extension for your browser</li>
              <li>Open your browser's extension management page</li>
              <li>Drag and drop the downloaded file into the browser window</li>
              <li>Click "Add Extension" when prompted</li>
              <li>Click on the extension icon in your toolbar</li>
              <li>
                Enter your Project ID: <span className="font-mono bg-muted px-1 py-0.5 rounded">{projectId}</span>
              </li>
              <li>Start recording user sessions!</li>
            </ol>
          </div>
        </TabsContent>

        <TabsContent value="script" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Installation Script</h3>
              <p className="text-sm text-muted-foreground">
                Add this script to your website's <code>&lt;head&gt;</code> section to start tracking user sessions.
              </p>
            </div>

            <div className="relative">
              <Textarea
                readOnly
                className="font-mono text-xs h-[180px] resize-none bg-muted"
                value={`<script>
  (function(w,d,s,p,i,c,e) {
    w['UXInsightObject']=p;w[p]=w[p]||function(){
    (w[p].q=w[p].q||[]).push(arguments)},w[p].l=1*new Date();c=d.createElement(s),
    e=d.getElementsByTagName(s)[0];c.async=1;c.src=i;e.parentNode.insertBefore(c,e)
  })(window,document,'script','uxinsight','https://cdn.uxinsight.io/tracker.js?id=${projectId}');
  
  uxinsight('init', '${projectId}');
  uxinsight('trackPageView');
</script>`}
              />
              <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy</span>
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Project ID</h3>
              <div className="flex gap-2">
                <Input
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="Enter your project ID"
                />
                <Button variant="outline">Generate New</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your Project ID connects your website to your UX Insight dashboard.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Tracking Settings</h3>
              <p className="text-sm text-muted-foreground">Configure what user interactions and events to track.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="clicks">Mouse Clicks</Label>
                  <p className="text-xs text-muted-foreground">Track where users click on your website</p>
                </div>
                <Switch id="clicks" checked={trackingOptions.clicks} onCheckedChange={() => handleToggle("clicks")} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="movement">Mouse Movement</Label>
                  <p className="text-xs text-muted-foreground">Track cursor paths and hovering behavior</p>
                </div>
                <Switch
                  id="movement"
                  checked={trackingOptions.movement}
                  onCheckedChange={() => handleToggle("movement")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="scrolling">Scrolling</Label>
                  <p className="text-xs text-muted-foreground">Track how far users scroll on each page</p>
                </div>
                <Switch
                  id="scrolling"
                  checked={trackingOptions.scrolling}
                  onCheckedChange={() => handleToggle("scrolling")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="formInteractions">Form Interactions</Label>
                  <p className="text-xs text-muted-foreground">Track form field interactions and validation errors</p>
                </div>
                <Switch
                  id="formInteractions"
                  checked={trackingOptions.formInteractions}
                  onCheckedChange={() => handleToggle("formInteractions")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="pageTransitions">Page Transitions</Label>
                  <p className="text-xs text-muted-foreground">Track navigation between pages</p>
                </div>
                <Switch
                  id="pageTransitions"
                  checked={trackingOptions.pageTransitions}
                  onCheckedChange={() => handleToggle("pageTransitions")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="consoleErrors">Console Errors</Label>
                  <p className="text-xs text-muted-foreground">Track JavaScript errors encountered by users</p>
                </div>
                <Switch
                  id="consoleErrors"
                  checked={trackingOptions.consoleErrors}
                  onCheckedChange={() => handleToggle("consoleErrors")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="networkRequests">Network Requests</Label>
                  <p className="text-xs text-muted-foreground">Track API calls and network performance</p>
                </div>
                <Switch
                  id="networkRequests"
                  checked={trackingOptions.networkRequests}
                  onCheckedChange={() => handleToggle("networkRequests")}
                />
              </div>
            </div>

            <Button className="mt-4">Save Settings</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
