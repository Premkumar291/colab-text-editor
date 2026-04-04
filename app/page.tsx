"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  ArrowRight, 
  Zap, 
  Shield, 
  Users, 
  Loader2, 
  Plus, 
  Clock, 
  Globe, 
  MoreVertical,
  Search,
  LayoutGrid,
  List as ListIcon,
  Trash2,
  UserPlus,
  X
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Navbar } from "@/components/layout/navbar"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export default function LandingPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedDoc, setSelectedDoc] = React.useState<any>(null)
  const [isCollabOpen, setIsCollabOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const fetchDocuments = React.useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const res = await fetch("/api/documents")
      const data = await res.json()
      if (res.ok) {
        setDocuments(data.documents || [])
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  React.useEffect(() => {
    if (user) fetchDocuments()

    // Listen for global refresh events (from notification inbox)
    window.addEventListener("refresh-documents", fetchDocuments)
    return () => window.removeEventListener("refresh-documents", fetchDocuments)
  }, [user, fetchDocuments])

  const handleCreateDoc = async () => {
    setIsCreating(true)
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Untitled Document" }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push(`/editor/${data.document.docId}`)
      } else {
        toast.error(data.error || "Failed to create document")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Document deleted")
        fetchDocuments()
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || "Failed to delete document")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleShowCollaborators = async (doc: any) => {
    setSelectedDoc(doc)
    setIsCollabOpen(true)
    
    // Fetch hydrated collaborators
    try {
      const res = await fetch(`/api/documents/${doc.docId}`)
      const data = await res.json()
      if (res.ok && data.document) {
        setSelectedDoc({
          ...doc,
          collaborators: data.document.collaborators
        })
      }
    } catch (err) {
      console.error("Failed to fetch collaborator details")
    }
  }

  const handleUpdateCollaboratorRole = async (collabId: string, newRole: "read" | "edit") => {
    if (!selectedDoc) return
    try {
      const res = await fetch(`/api/documents/${selectedDoc.docId}`, {
        method: "PATCH",
        body: JSON.stringify({ updateCollaboratorId: collabId, role: newRole }),
      })
      if (res.ok) {
        toast.success("Role updated")
        // Refresh local state
        setSelectedDoc((prev: any) => ({
          ...prev,
          collaborators: prev.collaborators.map((c: any) => 
            c.userId === collabId ? { ...c, role: newRole } : c
          )
        }))
      } else {
        toast.error("Failed to update role")
      }
    } catch (err) {
      toast.error("An error occurred")
    }
  }

  const handleRemoveCollaborator = async (collabId: string, inviteId?: string) => {
    if (!selectedDoc) return
    if (!confirm(inviteId ? "Cancel this invitation?" : "Remove this collaborator?")) return
    
    try {
      let res;
      if (inviteId) {
        // Revoke pending invitation
        res = await fetch(`/api/invitations/${inviteId}`, {
          method: "DELETE",
        })
      } else {
        // Remove accepted collaborator
        res = await fetch(`/api/documents/${selectedDoc.docId}`, {
          method: "PATCH",
          body: JSON.stringify({ removeCollaboratorId: collabId }),
        })
      }

      if (res.ok) {
        toast.success(inviteId ? "Invitation revoked" : "Collaborator removed")
        
        // Refresh the documents list to update counts
        fetchDocuments()
        
        setSelectedDoc((prev: any) => ({
          ...prev,
          collaborators: prev.collaborators.filter((c: any) => 
            inviteId ? c.inviteId !== inviteId : c.userId !== collabId
          )
        }))
      } else {
        toast.error("Failed to update collaborators")
      }
    } catch (err) {
      toast.error("An error occurred")
    }
  }

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (user) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        
        <main className="flex-1 container max-w-7xl mx-auto px-4 py-8 md:px-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight">Your Workspace</h1>
              <p className="text-muted-foreground">Manage and collaborate on your documents.</p>
            </div>
            
            <Button 
              onClick={handleCreateDoc} 
              disabled={isCreating}
              className="h-11 px-6 shadow-lg shadow-primary/20 gap-2 font-bold animate-in fade-in slide-in-from-right-4"
            >
              {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
              New Document
            </Button>
          </div>

          {/* Stats/Quick Actions (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-xl border bg-card/40 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Docs</p>
                <p className="text-xl font-bold">{documents.length}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-card/40 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Shared</p>
                <p className="text-xl font-bold">{documents.filter(d => !d.isOwner).length}</p>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search documents..." 
                className="pl-9 h-10 bg-muted/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg border">
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-background shadow-sm">
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Document Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-12">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 rounded-2xl border bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed bg-muted/10">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">{searchQuery ? "No matches found" : "No documents yet"}</h3>
                <p className="text-sm text-muted-foreground">{searchQuery ? "Try a different search term." : "Create your first collaborative document to get started."}</p>
              </div>
              {!searchQuery && (
                <Button onClick={handleCreateDoc} variant="outline" className="mt-2">
                  Create Document
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredDocs.map((doc) => (
                <div key={doc.docId} className="group relative">
                  <Link href={`/editor/${doc.docId}`}>
                    <div className="relative h-48 rounded-2xl border bg-card hover:bg-accent/5 transition-all duration-300 flex flex-col p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                      {/* Role Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge variant={doc.isOwner ? "default" : "secondary"} className="h-5 text-[10px] uppercase font-bold tracking-tight">
                          {doc.role}
                        </Badge>
                      </div>
                      
                      {/* Icon */}
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 transition-colors group-hover:bg-primary/20">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      
                      {/* Content */}
                      <div className="space-y-1 flex-1">
                        <h3 className="font-bold text-base truncate pr-16">{doc.name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(doc.updatedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        {doc.collaboratorsCount > 0 && (
                          <p className="text-[10px] text-primary flex items-center gap-1 font-medium bg-primary/5 w-fit px-1.5 py-0.5 rounded">
                            <Users className="h-2.5 w-2.5" />
                            Shared with {doc.collaboratorsCount} {doc.collaboratorsCount === 1 ? "person" : "people"}
                          </p>
                        )}
                      </div>
                      
                      {/* Info Footer */}
                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-muted-foreground/10 opacity-60">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold">
                             {doc.isOwner ? "ME" : "OW"}
                          </div>
                          <span className="text-[10px] truncate">{doc.isOwner ? "Created by you" : "Shared with you"}</span>
                        </div>
                      </div>

                      {/* Gradient Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    </div>
                  </Link>

                  {/* Menu Options - Only for Owners */}
                  {doc.isOwner && (
                    <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Popover>
                        <PopoverTrigger 
                          render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm" />} 
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-48 p-1">
                          <div className="flex flex-col gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="justify-start gap-2 h-9 text-xs font-medium"
                              onClick={(e) => {
                                e.preventDefault()
                                handleShowCollaborators(doc)
                              }}
                            >
                              <Users className="h-3.5 w-3.5 text-blue-500" />
                              Show Collaborators
                            </Button>
                            <Separator className="my-0.5" />
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="justify-start gap-2 h-9 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={(e) => {
                                e.preventDefault()
                                handleDeleteDoc(doc.docId)
                              }}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete Document
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <Dialog open={isCollabOpen} onOpenChange={setIsCollabOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Document Collaborators</DialogTitle>
                <DialogDescription>
                  People who have access to "{selectedDoc?.name}"
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4 max-h-[300px] overflow-y-auto pr-1">
                 <div className="flex flex-col gap-3">
                    {/* Owner First */}
                    <div className="flex items-center justify-between p-2 rounded-xl border bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs ring-2 ring-primary/20">
                          {selectedDoc?.isOwner ? "ME" : "OW"}
                        </div>
                        <div>
                          <p className="font-semibold text-sm leading-none">{selectedDoc?.isOwner ? "You" : "Owner"}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Full Access</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="h-5 text-[9px]">OWNER</Badge>
                    </div>

                    <Separator className="my-1 opacity-50" />
                    
                    {/* Others */}
                    {selectedDoc?.collaborators && selectedDoc?.collaborators.length > 0 ? (
                      selectedDoc.collaborators.map((c: any) => (
                        <div key={c.userId} className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border shadow-sm">
                              <AvatarImage src={c.avatar} />
                              <AvatarFallback style={{ backgroundColor: c.color + '22', color: c.color }}>
                                {c.name?.split(" ").map((n: string) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{c.name}</span>
                              <span className="text-[10px] text-muted-foreground">{c.email}</span>
                            </div>
                          </div>
                            <div className="flex items-center gap-2">
                              {c.status === "pending" && (
                                <Badge variant="outline" className="h-5 text-[9px] uppercase font-medium bg-blue-50/5 text-blue-500 border-blue-200/50">
                                  Invited
                                </Badge>
                              )}
                              {selectedDoc?.isOwner ? (
                                <div className="flex items-center gap-1">
                                  <Select 
                                    value={c.role} 
                                    onValueChange={(v: any) => handleUpdateCollaboratorRole(c.userId, v)}
                                    disabled={c.status === "pending"}
                                  >
                                    <SelectTrigger className="h-7 w-20 text-[10px] uppercase font-bold">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="read">Viewer</SelectItem>
                                      <SelectItem value="edit">Editor</SelectItem>
                                    </SelectContent>
                                  </Select>

                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleRemoveCollaborator(c.userId, c.status === "pending" ? c.inviteId : undefined)}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ) : (
                                <Badge variant="secondary" className="h-5 text-[9px] uppercase font-bold tracking-tighter">
                                  {c.role}
                                </Badge>
                              )}
                            </div>
                        </div>
                      ))
                    ) : !selectedDoc?.collaborators ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <p className="text-sm text-center py-6 text-muted-foreground italic bg-muted/5 rounded-xl border border-dashed">
                        No other collaborators invited yet.
                      </p>
                    )}
                 </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsCollabOpen(false)}>Close</Button>
                {selectedDoc?.isOwner && (
                  <Link href={`/editor/${selectedDoc.docId}`}>
                    <Button className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add People
                    </Button>
                  </Link>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    )
  }

  // Guest Landing Page
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-12 animate-in fade-in duration-1000">
        <div className="space-y-4 max-w-2xl">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl ring-4 ring-primary/20">
              <FileText className="h-10 w-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            CollabDocs
          </h1>
          <p className="text-xl text-muted-foreground">
            A modern, high-performance collaborative text editor designed for speed and simplicity. 
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          {isAuthLoading ? (
            <Button size="lg" disabled className="w-full h-14 rounded-xl">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Initializing...
            </Button>
          ) : (
            <>
              <Link href="/register" className="flex-1">
                <Button size="lg" className="w-full h-14 text-lg rounded-xl gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  Start Collaborating
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login" className="flex-1">
                <Button size="lg" variant="outline" className="w-full h-14 text-lg rounded-xl">
                   Sign In
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl py-12">
          <div className="p-6 rounded-2xl border bg-card/50 text-left space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <Zap className="h-8 w-8 text-yellow-500" />
            <h3 className="font-bold text-lg">Real-time Sync</h3>
            <p className="text-sm text-muted-foreground">
              Experience lightning fast synchronization of your changes across all devices.
            </p>
          </div>
          <div className="p-6 rounded-2xl border bg-card/50 text-left space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <Users className="h-8 w-8 text-blue-500" />
            <h3 className="font-bold text-lg">Presence Control</h3>
            <p className="text-sm text-muted-foreground">
              See who's working with you in real-time with integrated presence avatars.
            </p>
          </div>
          <div className="p-6 rounded-2xl border bg-card/50 text-left space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <Shield className="h-8 w-8 text-green-500" />
            <h3 className="font-bold text-lg">Secure & Private</h3>
            <p className="text-sm text-muted-foreground">
              Your documents are encrypted and only accessible via secure JWT sessions.
            </p>
          </div>
        </div>
      </main>
      
      <footer className="text-muted-foreground text-sm flex justify-center gap-6 py-12 border-t mt-12">
        <span className="hover:text-primary transition-colors cursor-pointer underline-offset-4 hover:underline">Terms</span>
        <span className="hover:text-primary transition-colors cursor-pointer underline-offset-4 hover:underline">Privacy</span>
        <span className="hover:text-primary transition-colors cursor-pointer underline-offset-4 hover:underline">Support</span>
      </footer>
    </div>
  )
}
