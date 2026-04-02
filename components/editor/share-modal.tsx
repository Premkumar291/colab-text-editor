"use client"

import * as React from "react"
import { Share2, Search, UserPlus, Loader2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

interface ShareModalProps {
  docId: string
  docName: string
  trigger?: React.ReactElement
}

export function ShareModal({ docId, docName, trigger }: ShareModalProps) {
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<"read" | "edit">("read")
  const [isSearching, setIsSearching] = React.useState(false)
  const [foundUser, setFoundUser] = React.useState<any>(null)
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSending, setIsSending] = React.useState(false)

  const handleSearch = async () => {
    if (!email || !email.includes("@")) return
    
    setIsSearching(true)
    setFoundUser(null)
    try {
      const res = await fetch(`/api/users/find?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      
      if (res.ok && data.user) {
        setFoundUser(data.user)
      } else {
        toast.error(data.error || "User not found")
      }
    } catch (err) {
      toast.error("An error occurred during search")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSendInvite = async () => {
    if (!foundUser) return
    
    setIsSending(true)
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docId,
          inviteeId: foundUser.id,
          role,
        }),
      })
      
      const data = await res.json()
      if (res.ok) {
        toast.success(`Invitation sent to ${foundUser.name}!`)
        setIsOpen(false)
        resetForm()
      } else {
        toast.error(data.error || "Failed to send invitation")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setIsSending(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setFoundUser(null)
    setRole("read")
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) resetForm()
    }}>
      <DialogTrigger render={
        trigger || (
          <Button size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )
      } />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{docName}"</DialogTitle>
          <DialogDescription>
            Invite collaborators by their email address.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button 
                variant="secondary" 
                size="icon" 
                onClick={handleSearch}
                disabled={isSearching || !email}
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {foundUser && (
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border">
                  <AvatarImage src={foundUser.avatar} />
                  <AvatarFallback style={{ backgroundColor: foundUser.color + '33', color: foundUser.color }}>
                    {foundUser.name.split(" ").map((n: string) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{foundUser.name}</span>
                  <span className="text-xs text-muted-foreground">{foundUser.email}</span>
                </div>
              </div>
              
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Viewer</SelectItem>
                  <SelectItem value="edit">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button 
            disabled={!foundUser || isSending} 
            onClick={handleSendInvite}
            className="gap-2"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Send Invite
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
