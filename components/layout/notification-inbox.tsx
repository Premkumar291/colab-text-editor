"use client"

import * as React from "react"
import { Bell, Check, X, FileText, Loader2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-context"

export function NotificationInbox() {
  const [invitations, setInvitations] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [processingId, setProcessingId] = React.useState<string | null>(null)
  const { user } = useAuth()

  const fetchInvitations = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const res = await fetch("/api/invitations")
      const data = await res.json()
      if (res.ok) {
        setInvitations(data.invitations || [])
      }
    } catch (err) {
      console.error("Failed to fetch invitations:", err)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchInvitations()
    
    // Poll for new notifications periodically (unobtrusive)
    const interval = setInterval(fetchInvitations, 30000)
    return () => clearInterval(interval)
  }, [user])

  const handleAction = async (id: string, status: "accepted" | "rejected") => {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/invitations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message)
        setInvitations(prev => prev.filter(inv => inv._id !== id))
      } else {
        toast.error(data.error || "Action failed")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setProcessingId(null)
    }
  }

  const pendingCount = invitations.length

  return (
    <Popover onOpenChange={(open) => open && fetchInvitations()}>
      <PopoverTrigger render={
        <Button variant="ghost" size="icon" className="relative group">
          <Bell className="h-5 w-5 transition-transform group-hover:scale-110" />
          {pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center animate-bounce shadow-sm border-2 border-background">
              {pendingCount}
            </span>
          )}
        </Button>
      } />
      <PopoverContent className="w-80 p-0 overflow-hidden shadow-xl" align="end">
        <div className="p-4 bg-muted/30 flex items-center justify-between">
          <h4 className="font-bold text-sm tracking-tight">Invitations</h4>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="px-2 py-0.5 h-auto text-[10px] font-bold uppercase tracking-wider">
              {pendingCount} Pending
            </Badge>
          )}
        </div>
        <Separator />
        
        <ScrollArea className="h-80">
          {isLoading && invitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground gap-2 animate-pulse transition-all">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs font-medium uppercase tracking-widest font-sans px-4 text-center">Checking for Mail...</span>
            </div>
          ) : invitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground gap-3 animate-in fade-in transition-all">
              <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
                 <MessageSquare className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <span className="text-xs font-medium uppercase tracking-widest font-sans">Your inbox is empty</span>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-muted/50">
              {invitations.map((inv) => (
                <div key={inv._id} className="p-4 space-y-4 hover:bg-muted/10 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 animate-in zoom-in duration-300">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        <strong className="text-foreground font-semibold">{inv.inviterName}</strong> invited you to collaborate on:
                      </p>
                      <h4 className="text-sm font-bold truncate tracking-tight">{inv.docName}</h4>
                      <Badge variant="outline" className="text-[10px] capitalize font-medium px-2 py-0 border-primary/20 bg-primary/5">{inv.role}</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-1 animate-in slide-in-from-bottom-2 duration-500">
                    <Button 
                      size="sm" 
                      className="h-8 flex-1 bg-primary hover:bg-primary/90 text-xs font-bold gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                      onClick={() => handleAction(inv._id, "accepted")}
                      disabled={!!processingId}
                    >
                      {processingId === inv._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 flex-1 border-muted hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 text-xs font-semibold gap-1.5 transition-all"
                      onClick={() => handleAction(inv._id, "rejected")}
                      disabled={!!processingId}
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
