"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { EditorSkeleton } from "@/components/editor/editor-skeleton"
import Editor from "@/components/editor/editor"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function EditorPage() {
  const { docId } = useParams()
  const [isLoading, setIsLoading] = React.useState(true)
  const [content, setContent] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)

  // Fetch initial content
  React.useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/documents/${docId}`)
        const data = await res.json()
        if (data.content !== undefined) setContent(data.content)
      } catch (err) {
        console.error("Failed to fetch content:", err)
        toast.error("Failed to load document")
      } finally {
        setIsLoading(false)
      }
    }
    fetchContent()
  }, [docId])

  // Debounced auto-save logic
  React.useEffect(() => {
    if (isLoading) return

    const saveTimeout = setTimeout(async () => {
      setIsSaving(true)
      try {
        const res = await fetch(`/api/documents/${docId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        })
        
        if (!res.ok) throw new Error("Failed to save content")
      } catch (err) {
        console.error("Auto-save failed:", err)
        // We don't toast on auto-save to avoid annoying the user, 
        // but perhaps show a visual error indicator in the future
      } finally {
        setIsSaving(false)
      }
    }, 2000) // 2 second debounce

    return () => clearTimeout(saveTimeout)
  }, [content, docId, isLoading])

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar docId={docId as string} />
      
      <div className="flex flex-1 overflow-hidden">
        <main className="relative flex-1 overflow-y-auto scroll-smooth bg-muted/30">
          <div className="mx-auto w-full max-w-5xl h-full p-4 md:p-8 animate-in fade-in zoom-in-95 duration-700">
            {isLoading ? (
              <EditorSkeleton />
            ) : (
              <Editor 
                docId={docId as string}
                content={content} 
                onChange={handleContentChange} 
              />
            )}
          </div>
        </main>
        
        <Sidebar />
      </div>

      {/* Saving Indicator */}
      {isSaving && (
        <div className="fixed bottom-4 left-4 flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full border shadow-lg border-primary/20 animate-in slide-in-from-bottom-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          Saving changes...
        </div>
      )}
    </div>
  )
}

