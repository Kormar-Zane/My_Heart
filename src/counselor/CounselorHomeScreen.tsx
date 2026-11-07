import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Clock3,
  MessageCircle,
  PenLine,
  Radio,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import { useStore } from '../store'
import { useCounselorNav } from './navigation'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/UI'
import { VerifiedTag } from './components'
import { cn, formatDateCN, getGreeting, isoDate } from '../utils'

const formatLabel = { video: '视频咨询', voice: '语音咨询', inperson: '面对面' }

export function CounselorHomeScreen({ onPublish }: { onPublish: () => void }) {
  const { state, currentCounselorAccount, currentCounselorProfile } = useStore()
  const nav = useCounselorNav()
  if (!currentCounselorAccount) return null
  const account = currentCounselorAccount
  const profile = currentCounselorProfile
  const counselorId = account.counselorId
  const chats = state.counselorChats.filter((chat) => chat.counselorId === counselorId)
  const unread = chats.reduce((sum, chat) => sum + chat.unread, 0)
  const posts = state.posts.filter((post) => post.authorId === counselorId)
  const bookings = state.bookings
    .filter((booking) => booking.counselorId === counselorId && booking.status === 'upcoming')
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
  const todayBookings = bookings.filter((booking) => booking.date === isoDate(new Date()))
  const activeLive = state.lives.find((live) => live.hostId === counselorId && live.status === 'live')
  const today = new Date()
  const dateText = `${today.getMonth() + 1}月${today.getDate()}日 · ${['周日', '周一', '周二', '周三', '周四', '周五', '周六'][today.getDay()]}`

  return (
    <div className="page ca-page ca-home-page">
      <header className="ca-home-top">
        <div className="ca-home-brand">
          <span className="ca-brand-dot" />
          观心 · 咨询师端
        </div>
        <span className="ca-home-date">{dateText}</span>
      </header>

      <section className="ca-home-hero">
        <div className="ca-home-hero-ring" />
        <span className="ca-home-kicker">PROFESSIONAL SPACE</span>
        <h1>
          {getGreeting()}，
          <br />
          <em>{account.name}老师</em>
        </h1>
        <p>今天也请先照顾好自己，再把自己的温柔留给来访者。</p>
        <div className="ca-home-profile-line">
          <Avatar variant={account.avatar} name={account.name} size={44} online />
          <div>
            <strong>{account.title}</strong>
            <VerifiedTag>资质已认证</VerifiedTag>
          </div>
          <span className="ca-home-followers">
            <Users size={12} />
            {profile?.followers ?? 0} 关注者
          </span>
        </div>
      </section>

      <section className="ca-home-stats">
        <div>
          <strong>{todayBookings.length}</strong>
          <span>今日预约</span>
        </div>
        <span />
        <div>
          <strong>{unread}</strong>
          <span>待回消息</span>
        </div>
        <span />
        <div>
          <strong>{profile?.sessions ?? 0}</strong>
          <span>累计来访</span>
        </div>
        <span />
        <div>
          <strong>{profile?.rating.toFixed(1) ?? '5.0'}</strong>
          <span>来访评分</span>
        </div>
      </section>

      {activeLive && (
        <button className="ca-home-live" onClick={() => nav.navigate({ name: 'live-room', id: activeLive.id })}>
          <span className="ca-home-live-pulse">
            <Radio size={17} />
          </span>
          <div>
            <span>正在直播</span>
            <strong>{activeLive.title}</strong>
            <small>{activeLive.viewers} 人正在听 · 点击进入直播控制台</small>
          </div>
          <ChevronRight size={18} />
        </button>
      )}

      <section className="ca-home-quick">
        <button onClick={() => (activeLive ? nav.navigate({ name: 'live-room', id: activeLive.id }) : nav.navigate({ name: 'live-setup' }))}>
          <span className="ca-quick-icon ca-quick-icon-live">
            <Radio size={19} />
          </span>
          <strong>{activeLive ? '继续直播' : '开启直播'}</strong>
          <small>{activeLive ? '直播进行中' : '和来访者聊聊'}</small>
        </button>
        <button onClick={onPublish}>
          <span className="ca-quick-icon ca-quick-icon-post">
            <PenLine size={19} />
          </span>
          <strong>分享日常</strong>
          <small>发布到用户端广场</small>
        </button>
        <button onClick={() => nav.switchTab('messages')}>
          <span className="ca-quick-icon ca-quick-icon-msg">
            <MessageCircle size={19} />
            {unread > 0 && <em>{unread}</em>}
          </span>
          <strong>回复消息</strong>
          <small>{unread > 0 ? `${unread} 条未读` : '暂时没有未读'}</small>
        </button>
      </section>

      <section className="ca-home-section">
        <div className="ca-section-head">
          <div>
            <h2>接下来的安排</h2>
            <p>预约与咨询日程</p>
          </div>
          <button onClick={() => nav.navigate({ name: 'schedule' })}>
            全部
            <ChevronRight size={14} />
          </button>
        </div>
        {bookings.length === 0 ? (
          <button className="ca-home-schedule-empty" onClick={() => nav.navigate({ name: 'schedule' })}>
            <span>
              <CalendarDays size={20} />
            </span>
            <div>
              <strong>今天暂时没有预约</strong>
              <p>可以先发一条日常，或准备下一次直播</p>
            </div>
            <ChevronRight size={16} />
          </button>
        ) : (
          <div className="ca-schedule-list">
            {bookings.slice(0, 2).map((booking) => (
              <button className="ca-schedule-card" key={booking.id} onClick={() => nav.navigate({ name: 'schedule' })}>
                <div className="ca-schedule-time">
                  <strong>{booking.time}</strong>
                  <span>{formatDateCN(booking.date)}</span>
                </div>
                <div className="ca-schedule-info">
                  <strong>{booking.clientName ?? '来访者'} · {formatLabel[booking.format]}</strong>
                  <p>{booking.format === 'inperson' ? '线下咨询室' : '观心线上咨询室'} · 50 分钟</p>
                  <span>
                    <Clock3 size={11} />
                    {booking.status === 'upcoming' ? '待咨询' : '已完成'}
                  </span>
                </div>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="ca-home-section">
        <div className="ca-section-head">
          <div>
            <h2>最近的分享</h2>
            <p>你的专业观察与生活日常</p>
          </div>
          <button onClick={() => nav.navigate({ name: 'posts' })}>
            全部
            <ChevronRight size={14} />
          </button>
        </div>
        {posts.length === 0 ? (
          <button className="ca-home-post-empty" onClick={onPublish}>
            <span>
              <Sparkles size={20} />
            </span>
            <div>
              <strong>还没有分享过日常</strong>
              <p>写一段想对来访者说的话吧</p>
            </div>
            <ChevronRight size={16} />
          </button>
        ) : (
          <div className="ca-home-posts">
            {posts.slice(0, 2).map((post) => (
              <button key={post.id} className="ca-home-post" onClick={() => nav.navigate({ name: 'posts' })}>
                <span className="ca-home-post-quote">“</span>
                <p>{post.content}</p>
                <span className="ca-home-post-meta">
                  {formatDateCN(post.createdAt)} · {post.likes} 喜欢
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="ca-home-credential">
        <div className="ca-home-credential-icon">
          <ShieldCheck size={20} />
        </div>
        <div>
          <strong>专业身份已认证</strong>
          <p>{account.credential.certificateType} · {account.credential.issuingAuthority}</p>
          <div>
            <VerifiedTag>平台审核通过</VerifiedTag>
            <span>资料仅用于资质核验</span>
          </div>
        </div>
        <button onClick={() => nav.navigate({ name: 'credential' })}>
          查看
          <ChevronRight size={14} />
        </button>
      </section>

      <button className="ca-home-inspiration" onClick={onPublish}>
        <span>“</span>
        <p>你不需要给出所有答案，<br />只要认真听见此刻。</p>
        <small>今日咨询师手记 · 分享给来访者</small>
        <ArrowRight size={15} />
      </button>

      <div className="ca-home-footnote">
        <BadgeCheck size={14} />
        <span>
          来访评分 {profile?.rating.toFixed(1) ?? '5.0'} · {profile?.sessions ?? 0} 次有效陪伴
        </span>
        <Star size={12} fill="currentColor" />
      </div>
    </div>
  )
}
