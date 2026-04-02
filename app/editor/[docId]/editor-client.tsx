"use client"

import * as React from "react"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { EditorSkeleton } from "@/components/editor/editor-skeleton"
import dynamic from "next/dynamic"
import { toast } from "sonner"

const Editor = dynamic(() => import("@/components/editor/editor"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
})

interface EditorClientProps {
  docId: string
  token: string
}

export default function EditorClient({ docId, token }: EditorClientProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [userRole, setUserRole] = React.useState<"owner" | "edit" | "read">("read")
  const [docName, setDocName] = React.useState("Untitled Document")
  const [owner, setOwner] = React.useState<string | null>(null)
  const [collaborators, setCollaborators] = React.useState<any[]>([])

  /**
   * Technical Excellence:
   * We fetch metadata (name, role) via REST API, but the document content
   * is managed entirely through the Hocuspocus WebSocket synchronization.
   * This separation ensures fast initial loads and reliable real-time sync.
   */
  React.useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch(`/api/documents/${docId}`)
        if (res.status === 401 || res.status === 403) {
          toast.error("Access Denied: You do not have permission to view this document")
          return
        }
        if (res.status === 404) {
          toast.error("Document not found. It may have been deleted.")
          return
        }
        
        const data = await res.json()
        if (data.document) {
          setDocName(data.document.name)
          setUserRole(data.role)
          setOwner(data.document.owner)
          setCollaborators(data.document.collaborators || [])
        }
      } catch (err) {
        console.error("Metadata fetch failed:", err)
        toast.error("Connectivity issue: Failed to load document metadata")
      } finally {
        setIsLoading(false)
      }
    }
    fetchMetadata()
  }, [docId])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar docId={docId} docName={docName} userRole={userRole} />
      
      <div className="flex flex-1 overflow-hidden">
        <main className="relative flex-1 overflow-y-auto scroll-smooth bg-muted/5">
          <div className="mx-auto w-full max-w-5xl h-full p-4 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {isLoading ? (
              <EditorSkeleton />
            ) : (
              <div className="relative group shadow-2xl rounded-b-xl overflow-hidden border-t-4 border-primary">
                <Editor 
                  docId={docId}
                  token={token}
                  editable={userRole !== "read"}
                  ownerId={owner}
                  initialCollaborators={collaborators}
                  onCollaboratorRemoved={() => {
                    // Logic to refresh metadata after removal
                    window.location.reload()
                  }}
                />
              </div>
            )}
          </div>
        </main>
        
        {/* Sidebar can be used for version history or bookmarks in the future */}
        <Sidebar activeUsers={[]} />
      </div>
    </div>
  )
}

