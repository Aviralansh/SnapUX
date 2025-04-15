import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"
import { Search } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <span className="h-6 w-6 rounded-full bg-primary"></span>
        <span>UX Insight</span>
      </Link>

      <div className="ml-auto flex items-center gap-4">
        <Button variant="outline" size="icon">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
        <ModeToggle />
        <UserNav />
      </div>
    </header>
  )
}
