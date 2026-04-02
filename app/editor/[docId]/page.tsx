import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import EditorClient from "./editor-client"

interface PageProps {
  params: Promise<{
    docId: string
  }>
}

export default async function EditorPage({ params }: PageProps) {
  const { docId } = await params
  
  // Read session cookie securely on the server
  const cookieStore = await cookies()
  const token = cookieStore.get("collab_auth_token")?.value
  
  // If no token, redirect to login (the proxy should catch this but we have a safety check)
  if (!token) {
    redirect(`/login?callbackUrl=/editor/${docId}`)
  }

  return <EditorClient docId={docId} token={token} />
}
