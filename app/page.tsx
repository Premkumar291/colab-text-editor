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
  List as ListIcon
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Navbar } from "@/components/layout/navbar"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const fetchDocuments = async () => {
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
  }

  React.useEffect(() => {
    if (user) fetchDocuments()
  }, [user])

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
                <Link key={doc.docId} href={`/editor/${doc.docId}`} className="group">
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
                    </div>
                    
                    {/* Info Footer */}
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-muted-foreground/10 opacity-60">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold">
                           {doc.isOwner ? "ME" : "OW"}
                        </div>
                        <span className="text-[10px] truncate">{doc.isOwner ? "Created by you" : "Shared with you"}</span>
                      </div>
                      <MoreVertical className="h-3.5 w-3.5" />
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </div>
                </Link>
              ))}
            </div>
          )}
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
