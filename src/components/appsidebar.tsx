"use client"

import { FileText, Network, Settings, Split, User } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { NavUser } from "./navuser"

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                            <Settings className="size-4" />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">
                                Oxid
                            </span>
                            <span className="truncate text-xs">API Gateway</span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Resources</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Network />
                                Upstreams
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <FileText />
                                Services
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Split />
                                Routes
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Access Control</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <User />
                                Consumers
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={{
                    name: "Gabriel",
                    email: "gabriel@gmail.com",
                    avatar: "/avatars/shadcn.jpg",
                }} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar >
    )
}
