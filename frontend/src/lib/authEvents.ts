type Listener = () => void

const listeners = new Set<Listener>()

export const authEvents = {
  emitUnauthorized() {
    listeners.forEach(l => l())
  },
  onUnauthorized(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
