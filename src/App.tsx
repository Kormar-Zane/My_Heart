import { useEffect, useRef, useState, type ReactNode } from 'react'
import { BadgeCheck, Check, MessageCircle, Radio, ShieldCheck, Sparkles } from 'lucide-react'
import { CounselorApp } from './counselor/CounselorApp'
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

function DesktopShowcase({ mode }: { mode: 'user' | 'counselor' }) {
  const counselor = mode === 'counselor'
  return (
    <aside className="desktop-showcase">
      <div className="desktop-brand">
        <BrandMark size={48} />
        <div>
          <strong>观心</strong>
          <span>{counselor ? 'GUANXIN · 咨询师工作空间' : 'GUANXIN · 心理陪伴空间'}</span>
        </div>
      </div>

      <div className="desktop-copy">
        <p className="desktop-eyebrow">
          <span />
          {counselor ? '给专业一个从容的空间' : '给心一个停靠的地方'}
        </p>
        <h1>
          {counselor ? (
            <>
              让专业被看见，
              <br />
              <em>让陪伴更从容。</em>
            </>
          ) : (
            <>
              看见情绪，
              <br />
              <em>也看见自己。</em>
            </>
          )}
        </h1>
        <p className="desktop-desc">
          {counselor ? (
            <>
              资质认证、免费直播、来访者沟通与专业分享。
              <br />
              把更多精力，留给真正重要的陪伴。
            </>
          ) : (
            <>
              专业心理咨询、温柔的解压空间、真实的同频连接。
              <br />
              不必急着变好，先好好待在此刻。
            </>
          )}
        </p>
      </div>

      <div className="desktop-features">
        <div>
          <span>
            <ShieldCheck size={16} />
          </span>
          <p>
            <strong>{counselor ? '资质认证' : '专业咨询师'}</strong>
            <small>{counselor ? '证件核验 · 认证通过后开放工作台' : '资质审核 · 地区匹配 · 自由预约'}</small>
          </p>
        </div>
        <div>
          <span>
            {counselor ? <Radio size={16} /> : <MessageCircle size={16} />}
          </span>
          <p>
            <strong>{counselor ? '免费直播' : '解压与连接'}</strong>
            <small>{counselor ? '分享专业 · 回应问题 · 与来访者相遇' : '主题房间 · 小游戏 · 小红花礼物'}</small>
          </p>
        </div>
        <div>
          <span>
            {counselor ? <BadgeCheck size={16} /> : <Sparkles size={16} />}
          </span>
          <p>
            <strong>{counselor ? '专业分享' : '温柔的陪伴'}</strong>
            <small>{counselor ? '日常分享 · 来访者沟通 · 工作台' : '免费直播 · AI 匹配 · 日常分享'}</small>
          </p>
        </div>
      </div>

      <blockquote className="desktop-quote">
        <span>“</span>
        {counselor ? '先照顾好自己，再去照顾别人。' : '你不需要变得完美，才值得被理解。'}
        <cite>{counselor ? '— 观心咨询师端' : '— 观心 · 林知夏'}</cite>
      </blockquote>

      <footer className="desktop-footer">
        <span>{counselor ? '咨询师端 · 内测版本 1.0' : '用户端 · 内测版本 1.0'}</span>
        <span>© 2026 观心 GUANXIN</span>
      </footer>
    </aside>
  )
}

function AppStage({ children, mode = 'user' }: { children: ReactNode; mode?: 'user' | 'counselor' }) {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])
  const clock = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`

  return (
    <div className={cn('app-stage', mode === 'counselor' && 'is-counselor-stage')}>
      <div className="stage-atmosphere" />
      <div className="stage-watermark">观心</div>
      <DesktopShowcase mode={mode} />
      <div className="app-frame">
        <div className="fake-statusbar">
          <span>{clock}</span>
          <span className="fake-statusbar-title">{mode === 'counselor' ? '观心 · 咨询师端' : '观心'}</span>
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
      <p className="stage-caption">
        {mode === 'counselor' ? '咨询师专用端 · 测试认证流程' : '在手机浏览器打开，体验更佳 · 所有演示数据仅保存在本机'}
      </p>
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

function UserApp({ onOpenCounselor }: { onOpenCounselor: () => void }) {
  const { currentUser } = useStore()
  const [compose, setCompose] = useState(false)

  useEffect(() => {
    if (!currentUser) setCompose(false)
  }, [currentUser])

  if (!currentUser) {
    return <AuthScreen onOpenCounselor={onOpenCounselor} />
  }

  if (!currentUser.onboarded) {
    return <OnboardingScreen />
  }

  return (
    <NavProvider>
      <ScreenRenderer compose={compose} setCompose={setCompose} />
    </NavProvider>
  )
}

type AppMode = 'user' | 'counselor'

function readMode(): AppMode {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase()
  const query = new URLSearchParams(window.location.search).get('role')
  return hash === 'counselor' || query === 'counselor' ? 'counselor' : 'user'
}

function RoleApp() {
  const [mode, setMode] = useState<AppMode>(() => readMode())

  useEffect(() => {
    const onHashChange = () => setMode(readMode())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    document.title =
      mode === 'counselor' ? '观心 · 咨询师专用端' : '观心 · 看见情绪，也看见自己'
  }, [mode])

  const openCounselor = () => {
    window.location.hash = 'counselor'
    setMode('counselor')
  }

  const openUser = () => {
    const url = new URL(window.location.href)
    url.hash = ''
    url.searchParams.delete('role')
    window.history.replaceState(null, '', `${url.pathname}${url.search}`)
    setMode('user')
  }

  return (
    <AppStage mode={mode}>
      {mode === 'counselor' ? <CounselorApp onExit={openUser} /> : <UserApp onOpenCounselor={openCounselor} />}
    </AppStage>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <RoleApp />
    </StoreProvider>
  )
}
