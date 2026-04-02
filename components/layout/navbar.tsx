"use client"

import * as React from "react"
import Link from "next/link"
import { FileText, Share2, Users, Loader2, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { ShareModal } from "@/components/editor/share-modal"
import { NotificationInbox } from "./notification-inbox"

interface NavbarProps {
  docId?: string
  docName?: string
  userRole?: "owner" | "edit" | "read"
}

export function Navbar({ docId, docName = "Untitled Document", userRole = "read" }: NavbarProps) {
  const [title, setTitle] = React.useState(docName)
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  
  const { user, logout, isLoading } = useAuth()

  // Sync title with prop
  React.useEffect(() => {
    setTitle(docName)
  }, [docName])

  const canEdit = userRole === "owner" || userRole === "edit"

  const handleTitleSave = async () => {
    if (!docId || !canEdit) return
    setIsEditing(false)
    if (!title.trim() || title === docName) return

    setIsSaving(true)
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: title }),
      })
      
      if (!res.ok) throw new Error("Failed to save title")
      toast.success("Title updated")
    } catch (err) {
      toast.error("Failed to update title")
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <FileText className="h-5 w-5" />
            </div>
            <span className="hidden font-bold sm:inline-block">CollabDocs</span>
          </Link>
          
          {docId && (
            <div className="flex items-center border-l pl-4 gap-2">
              {isEditing && canEdit ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
                  autoFocus
                  className="h-8 max-w-[200px] border-none bg-accent/50 px-2 font-medium focus-visible:ring-1"
                />
              ) : (
                <div className="flex items-center gap-2">
                   <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <h1
                          onClick={() => canEdit && setIsEditing(true)}
                          className={cn(
                            "truncate rounded-md px-2 py-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                            canEdit ? "cursor-pointer" : "cursor-default"
                          )}
                        >
                          {title || "Untitled Document"}
                        </h1>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {canEdit ? "Click to rename" : "You don't have permission to rename"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {isSaving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                  
                  {userRole === "read" && (
                    <div className="flex items-center gap-1 rounded bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-bold text-yellow-600 border border-yellow-500/20 uppercase tracking-tight">
                      Read Only
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {docId && userRole === "owner" && (
                <ShareModal 
                  docId={docId} 
                  docName={title} 
                  trigger={
                    <Button 
                      size="sm" 
                      className="gap-2 px-4 shadow-sm transition-all hover:shadow-md h-9"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Share</span>
                    </Button>
                  } 
                />
              )}
              
              <div className="flex items-center gap-3 ml-2 pl-2 border-l border-muted/50 h-9">
                <NotificationInbox />
                
                <div className="flex items-center gap-2 pr-1">
                  <Avatar className="h-8 w-8 border shadow-sm" style={{ borderColor: user.color }}>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-[10px] font-bold">{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col md:flex">
                    <span className="text-xs font-bold leading-none tracking-tight">{user.name}</span>
                    <span className="text-[10px] text-muted-foreground leading-none mt-1">{user.email}</span>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={logout} 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-full"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : !isLoading && (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
