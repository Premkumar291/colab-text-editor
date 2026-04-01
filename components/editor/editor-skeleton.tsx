import { Skeleton } from "@/components/ui/skeleton"

export function EditorSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl p-8 md:p-16 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>
      
      <div className="space-y-6 pt-8">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[95%]" />
        <Skeleton className="h-4 w-[40%]" />
      </div>
      
      <div className="space-y-6 pt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="h-4 w-[92%]" />
        <Skeleton className="h-4 w-[60%]" />
      </div>

      <div className="space-y-6 pt-4 text-center">
        <Skeleton className="h-4 w-[80%] mx-auto" />
        <Skeleton className="h-4 w-[75%] mx-auto" />
        <Skeleton className="h-4 w-[50%] mx-auto" />
      </div>
    </div>
  )
}
