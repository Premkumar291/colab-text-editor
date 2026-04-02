"use client"

import * as React from "react"
import { Users, MoreVertical, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface User {
  id: string
  name: string
  avatar?: string
  status: "online" | "away"
  color: string
}

interface SidebarProps {
  activeUsers: any[]
}

export function Sidebar({ activeUsers }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 right-0 z-30 hidden w-64 border-l bg-background/50 backdrop-blur-sm lg:flex lg:flex-col pt-14">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Active Users</h2>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
              {activeUsers.length}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        <Separator />
        
        <ScrollArea className="flex-1 px-2 py-4">
          <div className="space-y-4 px-1">
            {activeUsers.map((user, index) => (
              <div
                key={user?.id || index}
                className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8 border-2" style={{ borderColor: user?.color || "#ccc" }}>
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="text-[10px]">
                        {user?.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span 
                      className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium leading-none">{user?.name || "Anonymous"}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">online</span>
                  </div>
                </div>
                <div 
                   className="hidden h-2 w-2 rounded-full group-hover:block"
                   style={{ backgroundColor: user?.color }}
                />
              </div>
            ))}
            {activeUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground italic text-xs">
                Only you are here...
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 bg-muted/30">
          <Tooltip>
            <TooltipTrigger>
              <Button variant="outline" className="w-full text-xs gap-2 h-9 border-dashed" render={<div />} nativeButton={false}>
                 <Users className="h-3 w-3" />
                 People
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Show all collaborators</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  )
}
