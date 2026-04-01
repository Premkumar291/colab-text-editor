"use client"

import React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Collaboration from "@tiptap/extension-collaboration"
import { HocuspocusProvider } from "@hocuspocus/provider"
import * as Y from "yjs"
import { Toolbar } from "./toolbar"
import { cn } from "@/lib/utils"

interface EditorProps {
  docId: string
  content: string
  onChange: (content: string) => void
  editable?: boolean
}

const Editor = ({ docId, content, onChange, editable = true }: EditorProps) => {
  const [status, setStatus] = React.useState<"connected" | "connecting" | "disconnected">("connecting")

  // Initialize Yjs document and Hocuspocus provider
  const provider = React.useMemo(() => {
    return new HocuspocusProvider({
      url: process.env.NEXT_PUBLIC_COLAB_WS_URL || "ws://localhost:1234",
      name: docId,
      onConnect: () => setStatus("connected"),
      onDisconnect: () => setStatus("disconnected"),
    })
  }, [docId])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Collaboration.configure({
        document: provider.document,
      }),
    ],
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    // Adding custom classes for better styling through TipTap
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base focus:outline-none max-w-none min-h-[500px]",
          "px-4 py-8 md:px-12 md:py-16 text-foreground",
          "selection:bg-primary/20",
          // Customizing paragraph, heading styles to look like a doc
          "[&_p]:mb-4 [&_p]:leading-relaxed",
          "[&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-6",
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

  return (
    <div className="flex flex-col w-full h-full bg-background border rounded-lg shadow-sm overflow-hidden min-h-[600px]">
      <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/20">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-2 w-2 rounded-full animate-pulse",
            status === "connected" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-yellow-500"
          )} />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {status === "connected" ? "Real-time Sync Active" : "Connecting..."}
          </span>
        </div>
      </div>
      <Toolbar editor={editor} />
      <div className="flex-1 overflow-y-auto scroll-smooth bg-card">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default Editor
