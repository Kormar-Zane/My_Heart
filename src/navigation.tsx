import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { GameType } from './types'

export type Screen =
  | { name: 'home' }
  | { name: 'square' }
  | { name: 'chat' }
  | { name: 'me' }
  | { name: 'counseling' }
  | { name: 'ai' }
  | { name: 'counselor'; id: string }
  | { name: 'institution'; id: string }
  | { name: 'booking'; counselorId: string }
  | { name: 'lives' }
  | { name: 'live'; id: string }
  | { name: 'bookings' }
  | { name: 'relax' }
  | { name: 'room'; id: string }
  | { name: 'games' }
  | { name: 'game'; type: GameType }
  | { name: 'shop' }
  | { name: 'vip' }
  | { name: 'dressup' }
  | { name: 'edit-profile' }
  | { name: 'connections'; kind: 'following' | 'friends' | 'counselors' }
  | { name: 'my-posts' }
  | { name: 'settings' }
  | { name: 'conversation'; id: string }

export type TabName = 'home' | 'square' | 'chat' | 'me'
export const TAB_SCREENS: TabName[] = ['home', 'square', 'chat', 'me']

interface NavValue {
  screen: Screen
  stack: Screen[]
  navigate: (screen: Screen) => void
  replace: (screen: Screen) => void
  back: () => void
  switchTab: (tab: TabName) => void
  canGoBack: boolean
}

const NavContext = createContext<NavValue | null>(null)

export function NavProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Screen[]>([{ name: 'home' }])
  const screen = stack[stack.length - 1]

  const navigate = useCallback((next: Screen) => {
    setStack((prev) => [...prev, next])
  }, [])

  const replace = useCallback((next: Screen) => {
    setStack((prev) => [...prev.slice(0, -1), next])
  }, [])

  const back = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))
  }, [])

  const switchTab = useCallback((tab: TabName) => {
    setStack([{ name: tab }])
  }, [])

  return (
    <NavContext.Provider
      value={{ screen, stack, navigate, replace, back, switchTab, canGoBack: stack.length > 1 }}
    >
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNav must be used inside NavProvider')
  return ctx
}
