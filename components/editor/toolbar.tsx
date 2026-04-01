"use client"

import React from "react"
import { type Editor } from "@tiptap/react"
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Undo,
  Redo
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ToolbarProps {
  editor: Editor | null
}

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) {
    return null
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run()
  const toggleItalic = () => editor.chain().focus().toggleItalic().run()
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run()

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex items-center gap-1 p-1 md:p-2 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-0.5 border-r pr-1 mr-1">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-md hover:bg-muted disabled:opacity-30 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-md hover:bg-muted disabled:opacity-30 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-0.5">
        <button
          onClick={toggleBold}
          className={cn(
            "p-2 rounded-md transition-colors hover:bg-muted",
            editor.isActive("bold") ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground"
          )}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={toggleItalic}
          className={cn(
            "p-2 rounded-md transition-colors hover:bg-muted",
            editor.isActive("italic") ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground"
          )}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={toggleUnderline}
          className={cn(
            "p-2 rounded-md transition-colors hover:bg-muted",
            editor.isActive("underline") ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground"
          )}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex items-center gap-0.5 border-l pl-1 ml-1">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(
            "p-2 rounded-md transition-colors hover:bg-muted",
            editor.isActive("heading", { level: 1 }) ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground"
          )}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "p-2 rounded-md transition-colors hover:bg-muted",
            editor.isActive("heading", { level: 2 }) ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground"
          )}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
