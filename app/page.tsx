"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, ArrowRight, Zap, Shield, Users, Loader2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Navbar } from "@/components/layout/navbar"

export default function LandingPage() {
  const { user, isLoading } = useAuth()
  const demoDocId = "welcome-to-collabdocs"

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
          {isLoading ? (
            <Button size="lg" disabled className="w-full h-14 rounded-xl">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Initializing...
            </Button>
          ) : user ? (
            <Link href={`/editor/${demoDocId}`} className="flex-1">
              <Button size="lg" className="w-full h-14 text-lg rounded-xl gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Enter Workspace
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
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
