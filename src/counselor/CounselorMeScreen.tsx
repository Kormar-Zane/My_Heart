import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Crown,
  FileCheck2,
  Heart,
  LogOut,
  MessageCircle,
  PenLine,
  Radio,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import { useStore } from '../store'
import { useCounselorNav } from './navigation'
import { Avatar } from '../components/Avatar'
import { Artwork } from '../components/Artwork'
import { VerifiedTag } from './components'
import { cn, formatDateCN } from '../utils'

export function CounselorMeScreen({ onPublish, onExit }: { onPublish: () => void; onExit: () => void }) {
  const { state, currentCounselorAccount, currentCounselorProfile, logoutCounselor, showToast } = useStore()
  const nav = useCounselorNav()
  if (!currentCounselorAccount) return null
  const account = currentCounselorAccount
  const profile = currentCounselorProfile
  const posts = state.posts.filter((post) => post.authorId === account.counselorId)
  const chats = state.counselorChats.filter((chat) => chat.counselorId === account.counselorId)
  const unread = chats.reduce((sum, chat) => sum + chat.unread, 0)
  const likes = posts.reduce((sum, post) => sum + post.likes, 0)
  const upcomingBookings = state.bookings.filter(
    (booking) => booking.counselorId === account.counselorId && booking.status === 'upcoming',
  ).length

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`观心认证咨询师 · ${account.name}｜${account.title}`)
      showToast('咨询师名片摘要已复制')
    } catch {
      showToast('暂时无法复制，请稍后再试', 'info')
    }
  }

  return (
    <div className="page ca-page ca-me-page">
      <section className="ca-me-hero">
        <div className="ca-me-hero-glow" />
        <header className="ca-me-top">
          <span className="ca-home-brand">
            <span className="ca-brand-dot" />
            我的工作空间
          </span>
          <div>
            <button onClick={share} aria-label="分享名片">
              <ArrowUpRight size={18} />
            </button>
            <button onClick={() => showToast('设置将在正式版开放', 'info')} aria-label="设置">
              <Settings size={18} />
            </button>
          </div>
        </header>
        <div className="ca-me-profile">
          <Avatar variant={account.avatar} name={account.name} size={86} online />
          <div className="ca-me-profile-copy">
            <div>
              <h1>{account.name}</h1>
              <BadgeCheck size={18} />
            </div>
            <p>{account.title}</p>
            <span>{account.years} 年从业 · {account.institution}</span>
            <VerifiedTag>平台资质已认证</VerifiedTag>
          </div>
        </div>
        <p className="ca-me-bio">{account.bio}</p>
        <div className="ca-me-specialties">
          {account.specialties.map((specialty) => (
            <span key={specialty}>{specialty}</span>
          ))}
        </div>
        <div className="ca-me-stats">
          <button>
            <strong>{profile?.followers ?? 0}</strong>
            <span>关注者</span>
          </button>
          <span />
          <button>
            <strong>{profile?.sessions ?? 0}</strong>
            <span>累计来访</span>
          </button>
          <span />
          <button onClick={() => nav.navigate({ name: 'posts' })}>
            <strong>{likes}</strong>
            <span>获赞</span>
          </button>
          <span />
          <button>
            <strong>{profile?.rating.toFixed(1) ?? '5.0'}</strong>
            <span>评分</span>
          </button>
        </div>
      </section>

      <div className="ca-me-body">
        <section className="ca-me-quick-grid">
          <button onClick={onPublish}>
            <span className="ca-me-quick-icon tone-post">
              <PenLine size={19} />
            </span>
            <strong>发布日常</strong>
            <small>去用户端广场</small>
          </button>
          <button onClick={() => nav.navigate({ name: 'live' })}>
            <span className="ca-me-quick-icon tone-live">
              <Radio size={19} />
            </span>
            <strong>我的直播</strong>
            <small>{state.lives.some((l) => l.hostId === account.counselorId && l.status === 'live') ? '正在直播' : '准备开播'}</small>
          </button>
          <button onClick={() => nav.switchTab('messages')}>
            <span className="ca-me-quick-icon tone-message">
              <MessageCircle size={19} />
              {unread > 0 && <em>{unread}</em>}
            </span>
            <strong>来访者消息</strong>
            <small>{unread > 0 ? `${unread} 条未读` : '暂无未读'}</small>
          </button>
        </section>

        <section className="ca-me-section">
          <div className="ca-section-head">
            <div>
              <h2>我的日常</h2>
              <p>分享专业观察，也分享真实生活</p>
            </div>
            <button onClick={() => nav.navigate({ name: 'posts' })}>
              全部
              <ChevronRight size={14} />
            </button>
          </div>
          {posts.length === 0 ? (
            <button className="ca-me-post-empty" onClick={onPublish}>
              <span>“</span>
              <p>写下一句想对来访者说的话，<br />它会被更多人看见。</p>
              <small>发布第一条日常</small>
            </button>
          ) : (
            <div className="ca-me-post-grid">
              {posts.slice(0, 3).map((post) => (
                <button key={post.id} className="ca-me-post-tile" onClick={() => nav.navigate({ name: 'posts' })}>
                  {post.images[0] ? (
                    post.images[0].startsWith('art:') ? (
                      <Artwork variant={post.images[0].slice(4)} />
                    ) : (
                      <img src={post.images[0]} alt="日常配图" />
                    )
                  ) : (
                    <p>{post.content}</p>
                  )}
                  <span>{formatDateCN(post.createdAt)}</span>
                </button>
              ))}
              {Array.from({ length: Math.max(0, 3 - posts.length) }).map((_, index) => (
                <button key={index} className="ca-me-post-add" onClick={onPublish}>
                  <PenLine size={17} />
                  <span>记录</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="ca-me-section">
          <div className="ca-section-head">
            <div>
              <h2>工作与资质</h2>
              <p>你的专业资料与工作数据</p>
            </div>
            <ShieldCheck size={17} />
          </div>
          <div className="ca-me-menu">
            <button onClick={() => nav.navigate({ name: 'schedule' })}>
              <span className="tone-schedule"><CalendarDays size={18} /></span>
              <div>
                <strong>咨询日程</strong>
                <small>{upcomingBookings > 0 ? `${upcomingBookings} 个待咨询安排` : '查看预约与历史咨询'}</small>
              </div>
              <ChevronRight size={16} />
            </button>
            <button onClick={() => nav.navigate({ name: 'credential' })}>
              <span className="tone-credential"><FileCheck2 size={18} /></span>
              <div>
                <strong>认证资料</strong>
                <small>{account.credential.certificateType}</small>
              </div>
              <span className="ca-me-menu-badge">
                <BadgeCheck size={12} />
                已认证
              </span>
              <ChevronRight size={16} />
            </button>
            <button onClick={() => nav.navigate({ name: 'live' })}>
              <span className="tone-live"><Radio size={18} /></span>
              <div>
                <strong>直播数据</strong>
                <small>查看当前直播与开播入口</small>
              </div>
              <ChevronRight size={16} />
            </button>
            <button onClick={() => showToast('专业培训与督导将在正式版开放', 'info')}>
              <span className="tone-growth"><Sparkles size={18} /></span>
              <div>
                <strong>专业成长</strong>
                <small>督导、培训与同辈支持</small>
              </div>
              <span className="ca-me-soon">即将开放</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </section>

        <section className="ca-me-cert-card" onClick={() => nav.navigate({ name: 'credential' })}>
          <div className="ca-me-cert-icon">
            <ShieldCheck size={22} />
          </div>
          <div>
            <strong>观心认证咨询师</strong>
            <p>{account.credential.certificateType}</p>
            <span>{account.credential.issuingAuthority}</span>
          </div>
          <VerifiedTag>已核验</VerifiedTag>
        </section>

        <section className="ca-me-section">
          <div className="ca-me-account-actions">
            <button onClick={onExit}>
              <Users size={17} />
              切换到用户端
              <ChevronRight size={15} />
            </button>
            <button
              className="danger"
              onClick={() => {
                logoutCounselor()
                showToast('已退出咨询师账号', 'info')
              }}
            >
              <LogOut size={17} />
              退出咨询师登录
              <ChevronRight size={15} />
            </button>
          </div>
          <p className="ca-me-account-note">真实模式下，认证资料、预约与咨询记录保存在服务端数据库。</p>
        </section>

        <div className="ca-me-footer">
          <span>观心咨询师端 · 内测 v1.2</span>
          <span>
            <Star size={11} fill="currentColor" />
            专业、保密、有边界
          </span>
        </div>
      </div>
    </div>
  )
}
