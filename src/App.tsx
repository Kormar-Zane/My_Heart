import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react'
import { StoreProvider, useStore } from './store'
import { NavProvider, useNav } from './navigation'
import { AuthScreen } from './screens/AuthScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { HomeScreen } from './screens/HomeScreen'
import { CounselingScreen } from './screens/CounselingScreen'
import { AIAssistantScreen } from './screens/AIAssistantScreen'
import { CounselorDetailScreen } from './screens/CounselorDetailScreen'
import { InstitutionDetailScreen } from './screens/InstitutionDetailScreen'
import { BookingScreen } from './screens/BookingScreen'
import { LiveListScreen } from './screens/LiveListScreen'
import { LiveRoomScreen } from './screens/LiveRoomScreen'
import { RelaxScreen } from './screens/RelaxScreen'
import { RoomScreen } from './screens/RoomScreen'
import { GamesScreen } from './screens/GamesScreen'
import { GameScreen } from './screens/GameScreen'
import { ShopScreen } from './screens/ShopScreen'
import { SquareScreen } from './screens/SquareScreen'
import { PublishSheet } from './screens/PublishSheet'
import { ChatListScreen } from './screens/ChatListScreen'
import { ConversationScreen } from './screens/ConversationScreen'
import { MeScreen } from './screens/MeScreen'
import { VipScreen } from './screens/VipScreen'
import { DressUpScreen } from './screens/DressUpScreen'
import { EditProfileScreen } from './screens/EditProfileScreen'
import { ConnectionsScreen } from './screens/ConnectionsScreen'
import { MyPostsScreen } from './screens/MyPostsScreen'
import { MyBookingsScreen } from './screens/MyBookingsScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { BottomNav } from './components/BottomNav'
import { BrandMark } from './components/BrandMark'
import { cn } from './utils'

function ToastHost() {
  const { toast, dismissToast } = useStore()
  if (!toast) return null
  return (
    <button className={cn('app-toast', `is-${toast.kind}`)} onClick={dismissToast}>
      <span className="app-toast-icon">
        {toast.kind === 'success' ? <Check size={14} /> : toast.kind === 'error' ? '!' : 'i'}
      </span>
      {toast.message}
    </button>
  )
}

function DesktopShowcase() {
  return (
    <aside className="desktop-showcase">
      <div className="desktop-brand">
        <BrandMark size={48} />
        <div>
          <strong>观心</strong>
          <span>GUANXIN · 心理陪伴空间</span>
        </div>
      </div>

      <div className="desktop-copy">
        <p className="desktop-eyebrow">
          <span />
          给心一个停靠的地方
        </p>
        <h1>
          看见情绪，
          <br />
          <em>也看见自己。</em>
        </h1>
        <p className="desktop-desc">
          专业心理咨询、温柔的解压空间、真实的同频连接。
          <br />
          不必急着变好，先好好待在此刻。
        </p>
      </div>

      <div className="desktop-features">
        <div>
          <span>
            <ShieldCheck size={16} />
          </span>
          <p>
            <strong>专业咨询师</strong>
            <small>资质审核 · 地区匹配 · 自由预约</small>
          </p>
        </div>
        <div>
          <span>
            <MessageCircle size={16} />
          </span>
          <p>
            <strong>解压与连接</strong>
            <small>主题房间 · 小游戏 · 小红花礼物</small>
          </p>
        </div>
        <div>
          <span>
            <Sparkles size={16} />
          </span>
          <p>
            <strong>温柔的陪伴</strong>
            <small>免费直播 · AI 匹配 · 日常分享</small>
          </p>
        </div>
      </div>

      <blockquote className="desktop-quote">
        <span>“</span>
        你不需要变得完美，才值得被理解。
        <cite>— 观心 · 林知夏</cite>
      </blockquote>

      <footer className="desktop-footer">
        <span>用户端 · 内测版本 1.0</span>
        <span>© 2026 观心 GUANXIN</span>
      </footer>
    </aside>
  )
}

function AppStage({ children }: { children: ReactNode }) {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])
  const clock = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`

  return (
    <div className="app-stage">
      <div className="stage-atmosphere" />
      <div className="stage-watermark">观心</div>
      <DesktopShowcase />
      <div className="app-frame">
        <div className="fake-statusbar">
          <span>{clock}</span>
          <span className="fake-statusbar-title">观心</span>
          <span className="fake-statusbar-icons">
            <span className="signal-bars">
              <i />
              <i />
              <i />
            </span>
            <span className="wifi-dot" />
            <span className="battery-pill">
              <span />
            </span>
          </span>
        </div>
        <div className="app-viewport">{children}</div>
        <ToastHost />
      </div>
      <p className="stage-caption">在手机浏览器打开，体验更佳 · 所有演示数据仅保存在本机</p>
    </div>
  )
}

function ScreenRenderer({ compose, setCompose }: { compose: boolean; setCompose: (v: boolean) => void }) {
  const nav = useNav()
  const { screen } = nav
  const scrollRef = useRef<HTMLDivElement>(null)
  const key = JSON.stringify(screen)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [key])

  const isRoot = ['home', 'square', 'chat', 'me'].includes(screen.name)

  const render = () => {
    switch (screen.name) {
      case 'home':
        return <HomeScreen />
      case 'square':
        return <SquareScreen onCompose={() => setCompose(true)} />
      case 'chat':
        return <ChatListScreen />
      case 'me':
        return <MeScreen />
      case 'counseling':
        return <CounselingScreen />
      case 'ai':
        return <AIAssistantScreen />
      case 'counselor':
        return <CounselorDetailScreen id={screen.id} />
      case 'institution':
        return <InstitutionDetailScreen id={screen.id} />
      case 'booking':
        return <BookingScreen counselorId={screen.counselorId} />
      case 'lives':
        return <LiveListScreen />
      case 'live':
        return <LiveRoomScreen id={screen.id} />
      case 'bookings':
        return <MyBookingsScreen />
      case 'relax':
        return <RelaxScreen />
      case 'room':
        return <RoomScreen id={screen.id} />
      case 'games':
        return <GamesScreen />
      case 'game':
        return <GameScreen type={screen.type} />
      case 'shop':
        return <ShopScreen />
      case 'vip':
        return <VipScreen />
      case 'dressup':
        return <DressUpScreen />
      case 'edit-profile':
        return <EditProfileScreen />
      case 'connections':
        return <ConnectionsScreen kind={screen.kind} />
      case 'my-posts':
        return <MyPostsScreen onCompose={() => setCompose(true)} />
      case 'settings':
        return <SettingsScreen />
      case 'conversation':
        return <ConversationScreen id={screen.id} />
      default:
        return <HomeScreen />
    }
  }

  return (
    <div className={cn('app-shell', isRoot && 'has-bottom-nav')}>
      <div className="app-scroll" ref={scrollRef}>
        <div className="screen-fade" key={key}>
          {render()}
        </div>
      </div>
      {isRoot && <BottomNav onCompose={() => setCompose(true)} />}
      {compose && <PublishSheet onClose={() => setCompose(false)} />}
    </div>
  )
}

function AppInner() {
  const { currentUser } = useStore()
  const [compose, setCompose] = useState(false)

  useEffect(() => {
    if (!currentUser) setCompose(false)
  }, [currentUser])

  if (!currentUser) {
    return (
      <AppStage>
        <AuthScreen />
      </AppStage>
    )
  }

  if (!currentUser.onboarded) {
    return (
      <AppStage>
        <OnboardingScreen />
      </AppStage>
    )
  }

  return (
    <AppStage>
      <NavProvider>
        <ScreenRenderer compose={compose} setCompose={setCompose} />
      </NavProvider>
    </AppStage>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  )
}
