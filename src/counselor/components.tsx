import type { ButtonHTMLAttributes, ReactNode } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  MessageCircle,
  PenLine,
  Plus,
  Radio,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useStore } from '../store'
import { Artwork } from '../components/Artwork'
import { Sheet } from '../components/UI'
import { cn } from '../utils'
import { useCounselorNav, type CounselorTab } from './navigation'

export function CounselorTopBar({
  title,
  subtitle,
  back,
  right,
}: {
  title?: string
  subtitle?: string
  back?: boolean
  right?: ReactNode
}) {
  const nav = useCounselorNav()
  return (
    <header className="topbar ca-topbar">
      <div className="topbar-side topbar-left">
        {back ? (
          <button className="icon-button topbar-back" onClick={nav.back} aria-label="返回">
            <ChevronLeft size={22} strokeWidth={1.8} />
          </button>
        ) : (
          <span className="topbar-spacer" />
        )}
      </div>
      <div className="topbar-title-wrap">
        {title && <h1 className="topbar-title">{title}</h1>}
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>
      <div className="topbar-side topbar-right">{right ?? <span className="topbar-spacer" />}</div>
    </header>
  )
}

export function VerifiedTag({ children = '资质已认证' }: { children?: ReactNode }) {
  return (
    <span className="ca-verified-tag">
      <BadgeCheck size={12} />
      {children}
    </span>
  )
}

export function MaskedLicense({ license }: { license: string }) {
  const visible = license.slice(-6)
  return <span>••••••{visible}</span>
}

export function CertificateImage({
  src,
  className,
}: {
  src?: string
  className?: string
}) {
  if (src?.startsWith('data:')) {
    return <img className={cn('ca-cert-image', className)} src={src} alt="咨询师资质证件" />
  }
  return (
    <div className={cn('ca-cert-image ca-cert-fallback', className)}>
      <Artwork variant="certificate" />
      <span className="ca-cert-stamp">
        <ShieldCheck size={14} />
        观心已核验
      </span>
    </div>
  )
}

export function CounselorBottomNav({ onCompose }: { onCompose: () => void }) {
  const nav = useCounselorNav()
  const { state, currentCounselorAccount } = useStore()
  const unread = state.counselorChats
    .filter((chat) => chat.counselorId === currentCounselorAccount?.counselorId)
    .reduce((sum, chat) => sum + chat.unread, 0)
  const active = nav.screen.name
  const items: Array<{ tab: CounselorTab; label: string; icon: typeof LayoutDashboard }> = [
    { tab: 'home', label: '工作台', icon: LayoutDashboard },
    { tab: 'live', label: '直播', icon: Radio },
    { tab: 'messages', label: '消息', icon: MessageCircle },
    { tab: 'me', label: '我', icon: UserRound },
  ]

  return (
    <nav className="ca-bottom-nav" aria-label="咨询师端主导航">
      <div className="ca-bottom-nav-inner">
        {items.slice(0, 2).map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.tab}
              className={cn('ca-nav-item', active === item.tab && 'is-active')}
              onClick={() => nav.switchTab(item.tab)}
            >
              <span className="ca-nav-icon">
                <Icon size={21} strokeWidth={active === item.tab ? 2.1 : 1.7} />
              </span>
              <span>{item.label}</span>
            </button>
          )
        })}
        <div className="ca-compose-wrap">
          <button className="ca-compose-button" onClick={onCompose} aria-label="创建">
            <Plus size={25} strokeWidth={1.9} />
          </button>
          <span>创建</span>
        </div>
        {items.slice(2).map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.tab}
              className={cn('ca-nav-item', active === item.tab && 'is-active')}
              onClick={() => nav.switchTab(item.tab)}
            >
              <span className="ca-nav-icon">
                <Icon size={21} strokeWidth={active === item.tab ? 2.1 : 1.7} />
                {item.tab === 'messages' && unread > 0 && <span className="ca-nav-badge">{unread > 9 ? '9+' : unread}</span>}
              </span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export function CounselorComposeSheet({
  open,
  onClose,
  onPublish,
  onLive,
  hasLive,
}: {
  open: boolean
  onClose: () => void
  onPublish: () => void
  onLive: () => void
  hasLive: boolean
}) {
  const nav = useCounselorNav()
  return (
    <Sheet open={open} onClose={onClose} title="创建" subtitle="分享一个此刻，或与来访者聊聊">
      <div className="ca-compose-options">
        <button
          className="ca-compose-option ca-compose-publish"
          onClick={() => {
            onClose()
            onPublish()
          }}
        >
          <span className="ca-compose-option-icon">
            <PenLine size={21} />
          </span>
          <div>
            <strong>发布日常</strong>
            <p>写下一段话或一张照片，发布到用户端广场</p>
          </div>
          <ChevronRight size={18} />
        </button>
        <button
          className="ca-compose-option ca-compose-live"
          onClick={() => {
            onClose()
            onLive()
          }}
        >
          <span className="ca-compose-option-icon">
            <Radio size={21} />
          </span>
          <div>
            <strong>{hasLive ? '进入当前直播' : '开启直播'}</strong>
            <p>{hasLive ? '你已有一场直播正在进行' : '发起一场免费公开直播，与大家聊聊'}</p>
          </div>
          <ChevronRight size={18} />
        </button>
        <button
          className="ca-compose-option"
          onClick={() => {
            onClose()
            nav.navigate({ name: 'schedule' })
          }}
        >
          <span className="ca-compose-option-icon ca-compose-option-icon-soft">
            <CalendarDays size={20} />
          </span>
          <div>
            <strong>查看咨询日程</strong>
            <p>今天的预约和接下来的安排</p>
          </div>
          <ChevronRight size={18} />
        </button>
      </div>
      <p className="ca-compose-note">
        <ShieldCheck size={13} />
        发布内容会展示“认证心理咨询师”标识。请遵守心理咨询职业伦理，不公开来访者隐私。
      </p>
    </Sheet>
  )
}

export function CTopBarButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="ca-topbar-button" {...props}>
      {children}
    </button>
  )
}

export function BackIcon() {
  return <ArrowLeft size={20} />
}
