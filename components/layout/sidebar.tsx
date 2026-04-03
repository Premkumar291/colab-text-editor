"use client"

import * as React from "react"
import { Loader2, X, Shield, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Settings, Trash2, SlidersHorizontal, Info, Users, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface User {
  id: string
  name: string
  avatar?: string
  status: "online" | "away"
  color: string
}

interface SidebarProps {
  docId?: string
  docName?: string
  activeUsers: any[]
  collaborators?: any[]
  isOwner?: boolean
  onSettingsClick?: () => void
  onCollaboratorChange?: () => void
}

export function Sidebar({ docId, docName = "Untitled Document", activeUsers, collaborators = [], isOwner, onSettingsClick, onCollaboratorChange }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!docId) return
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "PATCH",
        body: JSON.stringify({ updateCollaboratorId: userId, role: newRole }),
      })
      if (res.ok) {
        toast.success("Role updated")
        onCollaboratorChange?.()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to update role")
      }
    } catch (err) {
      toast.error("An error occurred")
    }
  }

  const handleRemove = async (userId: string) => {
    if (!docId || !confirm("Remove this collaborator?")) return
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "PATCH",
        body: JSON.stringify({ removeCollaboratorId: userId }),
      })
      if (res.ok) {
        toast.success("Collaborator removed")
        onCollaboratorChange?.()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to remove collaborator")
      }
    } catch (err) {
      toast.error("An error occurred")
    }
  }

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
        </div>
        <Separator />
        
        <ScrollArea className="flex-1 px-2 py-4">
          <div className="space-y-4 px-1">
            {activeUsers.map((user, index) => {
              const collab = collaborators.find(c => c.name === user.name)
              const isUserOwner = collab?.role === "owner" || (collab === undefined && user.name === "Owner") // heuristic
              
              return (
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
                      <span className="text-[10px] text-muted-foreground capitalize">{collab?.role || "online"}</span>
                    </div>
                  </div>
                  
                  {isOwner && collab && collab.userId !== "owner-id-logic" && (
                    <Popover>
                      <PopoverTrigger nativeButton={false} render={
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      } />
                      <PopoverContent side="left" align="center" className="w-40 p-1">
                         <div className="flex flex-col gap-1">
                            <div className="px-2 py-1 text-[9px] font-bold text-muted-foreground uppercase mb-1">Manage Access</div>
                            <Button variant="ghost" size="sm" className="justify-start gap-2 h-8 text-[11px]" onClick={() => handleUpdateRole(collab.userId, collab.role === "edit" ? "read" : "edit")}>
                               {collab.role === "edit" ? <Shield className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                               Set as {collab.role === "edit" ? "Viewer" : "Editor"}
                            </Button>
                            <Separator className="my-0.5" />
                            <Button variant="ghost" size="sm" className="justify-start gap-2 h-8 text-[11px] text-destructive hover:bg-destructive/5" onClick={() => handleRemove(collab.userId)}>
                               <X className="h-3 w-3" />
                               Remove
                            </Button>
                         </div>
                      </PopoverContent>
                    </Popover>
                  )}

                  {!isOwner && (
                    <div 
                       className="hidden h-2 w-2 rounded-full group-hover:block"
                       style={{ backgroundColor: user?.color }}
                    />
                  )}
                </div>
              )
            })}
            {activeUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground italic text-xs">
                Only you are here...
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 bg-muted/30">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Tooltip>
              <TooltipTrigger 
                render={<div />}
              >
                <DialogTrigger 
                  render={
                    <Button variant="outline" className="w-full text-xs gap-2 h-9 border-dashed">
                      <Users className="h-3 w-3" />
                      People
                    </Button>
                  } 
                />
              </TooltipTrigger>
              <TooltipContent side="top">Show all collaborators</TooltipContent>
            </Tooltip>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Document Collaborators</DialogTitle>
                <DialogDescription>
                  People with access to "{docName}"
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto pr-1">
                <div className="flex flex-col gap-3">
                  {collaborators.length > 0 ? (
                    collaborators.map((c: any) => (
                      <div key={c.userId} className="flex items-center justify-between p-2 rounded-xl border bg-card/50 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border shadow-sm">
                            <AvatarImage src={c.avatar} />
                            <AvatarFallback style={{ backgroundColor: (c.color || '#ccc') + '22', color: c.color || '#666' }}>
                              {c.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium leading-none">{c.name}</span>
                            <span className="text-[10px] text-muted-foreground mt-1">{c.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="h-5 text-[9px] uppercase font-bold tracking-tighter">
                            {c.role}
                          </Badge>

                          {isOwner && c.role !== "owner" && (
                            <Popover>
                              <PopoverTrigger render={
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                              } />
                              <PopoverContent side="left" align="center" className="w-40 p-1">
                                <div className="flex flex-col gap-1">
                                  <div className="px-2 py-1 text-[9px] font-bold text-muted-foreground uppercase mb-1">Manage Access</div>
                                  <Button variant="ghost" size="sm" className="justify-start gap-2 h-8 text-[11px]" onClick={() => handleUpdateRole(c.userId, c.role === "edit" ? "read" : "edit")}>
                                    {c.role === "edit" ? <Shield className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                                    Set as {c.role === "edit" ? "Viewer" : "Editor"}
                                  </Button>
                                  <Separator className="my-0.5" />
                                  <Button variant="ghost" size="sm" className="justify-start gap-2 h-8 text-[11px] text-destructive hover:bg-destructive/5" onClick={() => handleRemove(c.userId)}>
                                    <X className="h-3 w-3" />
                                    Remove
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground italic text-xs gap-2">
                       <Users className="h-8 w-8 opacity-20" />
                       No other collaborators found.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </aside>
  )
}
