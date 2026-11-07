import { Compass, Home, MessageCircle, Plus, UserRound } from 'lucide-react'
import { useStore } from '../store'
import { useNav, type TabName } from '../navigation'
import { cn } from '../utils'

const items: Array<{ tab: TabName; label: string; icon: typeof Home }> = [
  { tab: 'home', label: '首页', icon: Home },
  { tab: 'square', label: '广场', icon: Compass },
  { tab: 'chat', label: '聊天', icon: MessageCircle },
  { tab: 'me', label: '我', icon: UserRound },
]

export function BottomNav({ onCompose }: { onCompose: () => void }) {
  const nav = useNav()
  const { state } = useStore()
  const unread = state.conversations.reduce((sum, c) => sum + c.unread, 0)
  const active = nav.screen.name

  return (
    <nav className="bottom-nav" aria-label="主导航">
      <div className="bottom-nav-inner">
        {items.slice(0, 2).map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.tab}
              className={cn('nav-item', active === item.tab && 'is-active')}
              onClick={() => nav.switchTab(item.tab)}
            >
              <span className="nav-icon-wrap">
                <Icon size={22} strokeWidth={active === item.tab ? 2.1 : 1.7} />
              </span>
              <span>{item.label}</span>
            </button>
          )
        })}
        <div className="nav-compose-wrap">
          <button className="nav-compose" onClick={onCompose} aria-label="发布日常">
            <Plus size={27} strokeWidth={1.9} />
          </button>
          <span className="nav-compose-label">发布</span>
        </div>
        {items.slice(2).map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.tab}
              className={cn('nav-item', active === item.tab && 'is-active')}
              onClick={() => nav.switchTab(item.tab)}
            >
              <span className="nav-icon-wrap">
                <Icon size={22} strokeWidth={active === item.tab ? 2.1 : 1.7} />
                {item.tab === 'chat' && unread > 0 && <span className="nav-badge">{unread > 9 ? '9+' : unread}</span>}
              </span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
