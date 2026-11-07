import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export type CounselorScreen =
  | { name: 'home' }
  | { name: 'live' }
  | { name: 'messages' }
  | { name: 'me' }
  | { name: 'live-setup' }
  | { name: 'live-room'; id: string }
  | { name: 'chat'; id: string }
  | { name: 'posts' }
  | { name: 'credential' }
  | { name: 'schedule' }

export type CounselorTab = 'home' | 'live' | 'messages' | 'me'

interface CounselorNavValue {
  screen: CounselorScreen
  stack: CounselorScreen[]
  navigate: (screen: CounselorScreen) => void
  replace: (screen: CounselorScreen) => void
  back: () => void
  switchTab: (tab: CounselorTab) => void
  canGoBack: boolean
}

const CounselorNavContext = createContext<CounselorNavValue | null>(null)

export function CounselorNavProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<CounselorScreen[]>([{ name: 'home' }])
  const screen = stack[stack.length - 1]

  const navigate = useCallback((next: CounselorScreen) => {
    setStack((prev) => [...prev, next])
  }, [])

  const replace = useCallback((next: CounselorScreen) => {
    setStack((prev) => [...prev.slice(0, -1), next])
  }, [])

  const back = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))
  }, [])

  const switchTab = useCallback((tab: CounselorTab) => {
    setStack([{ name: tab }])
  }, [])

  return (
    <CounselorNavContext.Provider
      value={{ screen, stack, navigate, replace, back, switchTab, canGoBack: stack.length > 1 }}
    >
      {children}
    </CounselorNavContext.Provider>
  )
}

export function useCounselorNav() {
  const ctx = useContext(CounselorNavContext)
  if (!ctx) throw new Error('useCounselorNav must be used inside CounselorNavProvider')
  return ctx
}
