"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Sun, Moon } from "lucide-react"
import { useAppDispatch } from "@/lib/redux/hooks"
import { logoutUser } from "@/lib/redux/authSlice"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import * as React from "react"

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [loggingOut, setLoggingOut] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  // Get the current page name from the pathname
  const getPageName = () => {
    // Remove leading slash and split by slash
    const segments = pathname.split('/').filter(segment => segment)
    
    if (segments.length === 0) return 'Dashboard'
    
    // Get the last segment and format it
    const lastSegment = segments[segments.length - 1]
    // Capitalize first letter and replace hyphens with spaces
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await dispatch(logoutUser())
    toast.success("Logged out successfully")
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{getPageName()}</h1>
        <div className="ml-auto flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{loggingOut ? "Logging out..." : "Logout"}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}