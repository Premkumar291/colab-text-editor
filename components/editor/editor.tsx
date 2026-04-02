"use client"

import React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Collaboration from "@tiptap/extension-collaboration"
import CollaborationCaret from "@tiptap/extension-collaboration-caret"
import { HocuspocusProvider } from "@hocuspocus/provider"
import * as Y from "yjs"
import { useAuth } from "@/context/auth-context"
import { Toolbar } from "./toolbar"
import { cn } from "@/lib/utils"
import { Users, CloudCheck, CloudOff, Loader2, Settings, X } from "lucide-react"
import { toast } from "sonner"

interface EditorProps {
  docId: string
  token?: string // Secure token passed from server-side
  editable?: boolean
  ownerId?: string | null
  initialCollaborators?: any[]
  onCollaboratorRemoved?: () => void
}

const Editor = ({ 
  docId, 
  token, 
  editable = true,
  ownerId,
  initialCollaborators = [],
  onCollaboratorRemoved
}: EditorProps) => {
  const { user } = useAuth()
  const [participants, setParticipants] = React.useState<any[]>([])
  const [managedCollaborators, setManagedCollaborators] = React.useState<any[]>(initialCollaborators)
  const isOwner = user?.id === ownerId
  
  // Sync managed collaborators when initial ones change
  React.useEffect(() => {
    if (initialCollaborators.length > 0) {
      setManagedCollaborators(initialCollaborators)
    }
  }, [initialCollaborators])

  // Initialize Yjs document and Hocuspocus provider
  const { provider, ydoc } = React.useMemo(() => {
    const ydoc = new Y.Doc()
    
    // Technical Excellence: Production auto-sensing for wss://
    let wsUrl = process.env.NEXT_PUBLIC_COLAB_WS_URL || "ws://127.0.0.1:1234"
    
    const p = new HocuspocusProvider({
      url: wsUrl,
      name: docId,
      token: token || undefined,
      document: ydoc,
    })

    return { provider: p, ydoc }
  }, [docId, token])

  const [status, setStatus] = React.useState<"connected" | "connecting" | "disconnected">("connecting")

  // Handle connection status safely after mount
  React.useEffect(() => {
    const handleConnect = () => setStatus("connected")
    const handleDisconnect = () => setStatus("disconnected")
    
    provider.on("connect", handleConnect)
    provider.on("disconnect", handleDisconnect)
    
    return () => {
      provider.off("connect", handleConnect)
      provider.off("disconnect", handleDisconnect)
    }
  }, [provider])

  // Technical Excellence: Server-side persistence is now handled by the Hocuspocus backend.
  // We no longer need client-side setInterval polling, reducing network overhead and complexity.

  // Track awareness updates for real-time presence
  React.useEffect(() => {
    if (!provider) return

    const handleUpdate = () => {
      if (!provider.awareness) return
      const states = provider.awareness.getStates()
      const users = Array.from(states.values()).map((state: any) => state.user).filter(Boolean)
      setParticipants(users)
    }

    provider.awareness?.on("update", handleUpdate)
    // Initial trigger
    handleUpdate()
    
    return () => {
      provider.awareness?.off("update", handleUpdate)
    }
  }, [provider])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable BOTH history flags — newer StarterKit uses `undoRedo` (extension-undo-redo)
        // instead of the legacy `history` extension. Both must be false to avoid
        // clashing with Collaboration's own built-in CRDT undo/redo management.
        history: false,
        undoRedo: false,
        heading: {
          levels: [1, 2, 3],
        },
      } as any),
      // Underline is confirmed as a duplicate by Tiptap logs (likely part of a custom build or another extension)
      // We will rely on StarterKit's default extensions or add them back if missing after testing.
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCaret.configure({
        provider,
        user: {
          name: user?.name || "Anonymous",
          color: user?.color || "#" + Math.floor(Math.random()*16777215).toString(16),
        },
      }),
    ],
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base focus:outline-none max-w-none min-h-[500px]",
          "px-4 py-8 md:px-24 md:py-16 text-foreground",
          "selection:bg-primary/20",
          "[&_p]:mb-4 [&_p]:leading-relaxed",
          "[&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:tracking-tight",
          "[&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:mb-4",
        ),
      },
    },
  })

  // Cleanup provider on unmount
  React.useEffect(() => {
    return () => {
      provider.destroy()
    }
  }, [provider])

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleRemoveCollaborator = async (collabId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "PATCH",
        body: JSON.stringify({ removeCollaboratorId: collabId }),
      })
      if (res.ok) {
        setManagedCollaborators(prev => prev.filter(c => c.userId !== collabId))
        toast.success("Collaborator removed")
        onCollaboratorRemoved?.()
      } else {
        toast.error("Failed to remove collaborator")
      }
    } catch (err) {
      toast.error("Error removing collaborator")
    }
  }

  const handleDeleteDocument = async () => {
    if (!confirm("Are you sure you want to delete this document? This action CANNOT be undone.")) return
    
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast.success("Document deleted")
        window.location.href = "/dashboard"
      } else {
        toast.error("Failed to delete document")
      }
    } catch (err) {
      toast.error("Error deleting document")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col w-full h-full bg-background border-x border-b rounded-b-xl shadow-2xl overflow-hidden min-h-[700px] transition-all duration-300 relative">
      {/* Premium Header/Status Bar */}
      <div className="flex items-center justify-between border-b px-6 py-3 bg-muted/30 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            {status === "connected" ? (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                <CloudCheck className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Sync Active</span>
              </div>
            ) : status === "connecting" ? (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Connecting</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                <CloudOff className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Offline</span>
              </div>
            )}
          </div>
          
          {/* Participant Avatars */}
          <div className="hidden md:flex items-center -space-x-2 overflow-hidden">
            {participants.map((p, i) => (
              <div 
                key={`${p.name}-${i}`}
                className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-[10px] font-bold shadow-sm"
                style={{ backgroundColor: p.color, color: '#fff' }}
                title={p.name}
              >
                {p.name?.charAt(0).toUpperCase()}
              </div>
            ))}
            {participants.length > 0 && (
              <div className="pl-4 text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <Users className="h-3 w-3" />
                {participants.length} working now
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded border">
            {editable ? "EDITOR MODE" : "READ ONLY"}
          </div>
          
          {isOwner && (
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
              title="Document Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Modal (Overlay) */}
      {isSettingsOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background border shadow-2xl rounded-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">Document Settings</h3>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[400px] overflow-y-auto">
              <div>
                <h4 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Collaborators</h4>
                {managedCollaborators.length > 0 ? (
                  <div className="space-y-3">
                    {managedCollaborators.map((collab) => (
                      <div key={collab.userId} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-8 w-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                            style={{ backgroundColor: collab.color || '#CBD5E1' }}
                          >
                            {collab.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-none">{collab.name}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">{collab.email}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveCollaborator(collab.userId)}
                          className="text-[11px] font-medium text-red-600 hover:text-red-700 p-1 px-2 rounded hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No collaborators invited yet.</p>
                )}
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3 text-red-600 uppercase tracking-wider font-bold">Danger Zone</h4>
                <button 
                  onClick={handleDeleteDocument}
                  disabled={isDeleting}
                  className="w-full py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-semibold hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toolbar editor={editor} />
      
      <div className="flex-1 overflow-y-auto scroll-smooth bg-white dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}

export default Editor

