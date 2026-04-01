"use client"

import * as React from "react"
import Link from "next/link"
import { FileText, Share2, Users, Loader2, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface NavbarProps {
  docId?: string
}

export function Navbar({ docId }: NavbarProps) {
  const [title, setTitle] = React.useState("")
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  
  const { user, logout, isLoading } = useAuth()

  // Fetch initial title if in editor
  React.useEffect(() => {
    if (!docId) return
    
    const fetchTitle = async () => {
      try {
        const res = await fetch(`/api/documents/${docId}`)
        const data = await res.json()
        if (data.title) setTitle(data.title)
      } catch (err) {
        console.error("Failed to fetch title:", err)
      }
    }
    fetchTitle()
  }, [docId])

  const handleTitleSave = async () => {
    if (!docId) return
    setIsEditing(false)
    if (!title.trim()) return

    setIsSaving(true)
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
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
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <span className="hidden font-bold sm:inline-block">CollabDocs</span>
          </Link>
          
          {docId && (
            <div className="flex items-center border-l pl-4 gap-2">
              {isEditing ? (
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
                  <h1
                    onClick={() => setIsEditing(true)}
                    className="cursor-pointer truncate rounded-md px-2 py-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    {title || "Untitled Document"}
                  </h1>
                  {isSaving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button size="sm" className="gap-2 px-4 shadow-sm transition-all hover:shadow-md">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <div className="flex items-center gap-2 ml-2">
                <Avatar className="h-8 w-8 border" style={{ borderColor: user.color }}>
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-[10px]">{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div className="hidden flex-col md:flex">
                  <span className="text-xs font-semibold leading-none">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground">{user.email}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8 ml-1 text-muted-foreground hover:text-destructive transition-colors">
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
