import { Loader2 } from 'lucide-react'

export function Spinner({ size = 18 }: { size?: number }) {
  return <Loader2 className="animate-spin" size={size} aria-label="Loading" />
}

export function FullPageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[40vh] text-slate-500">
      <Spinner size={28} />
    </div>
  )
}
