"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconCamera,
  IconCar,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconMail,
  IconMessageCircle,
  IconPhoto,
  IconReport,
  IconSearch,
  IconSettings,
  IconShield,
  IconUsers,
  IconId,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-Vrl23N_uke2OXapUMBcJWXJd8G94ZcYDbQ&s",
    url: "/profile",
  },
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Cars", url: "/cars", icon: IconCar },
    { title: "Banner", url: "/banner", icon: IconPhoto },
    { title: "Testimonials", url: "/testimonials", icon: IconMessageCircle },
    { title: "Blogs", url: "/blog", icon: IconFileDescription },
    { title: "Newsletter", url: "/newsletter", icon: IconMail },
    { title: "Car Plates", url: "/car-plates", icon: IconId },
    { title: "Insurance & Finance", url: "/insurance-finance", icon: IconShield },
    { title: "Team", url: "/team", icon: IconUsers },
  ],
  navSecondary: [
    { title: "Settings", url: "/settings", icon: IconSettings },
    { title: "Get Help", url: "/help", icon: IconHelp },
    { title: "Search", url: "/search", icon: IconSearch },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(url + "/")

  return (
    <Sidebar collapsible="offcanvas" className="z-50" {...props}>
      {/* Sidebar Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 hover:bg-gray-200 hover:text-gray-900 cursor-pointer transition-all duration-200"
            >
              <Link href="/" className="flex items-center gap-2">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        {/* Main Navigation */}
        <NavMain
          items={data.navMain.map((item) => ({
            ...item,
            isActive: isActive(item.url),
          }))}
        />

        {/* Secondary Navigation */}
        <NavSecondary
          items={data.navSecondary.map((item) => ({
            ...item,
            isActive: isActive(item.url),
          }))}
          className="mt-auto"
        />
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}