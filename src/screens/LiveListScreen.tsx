import { useMemo, useState } from 'react'
import { Bell, CalendarClock, ChevronRight, Eye, HeartHandshake, Play, Radio, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Avatar } from '../components/Avatar'
import { Artwork } from '../components/Artwork'
import { Segmented, Tag, TopBar } from '../components/UI'
import { activeVipTier, cn, formatClock, formatDateCN, isVipActive, weekdayCN } from '../utils'

type Filter = 'all' | 'live' | 'upcoming'

function startLabel(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return `今天 ${formatClock(iso)}`
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  if (d.toDateString() === tomorrow.toDateString()) return `明天 ${formatClock(iso)}`
  return `${formatDateCN(iso)} ${weekdayCN(iso)} ${formatClock(iso)}`
}

export function LiveListScreen() {
  const { state, currentUser } = useStore()
  const nav = useNav()
  const [filter, setFilter] = useState<Filter>('all')
  const featured = state.lives.find((l) => l.status === 'live')
  const filtered = useMemo(
    () => state.lives.filter((l) => filter === 'all' || l.status === filter),
    [filter, state.lives],
  )
  const liveCount = state.lives.filter((l) => l.status === 'live').length
  const vipTier = activeVipTier(currentUser)
  const VIP = isVipActive(currentUser)

  return (
    <div className="page live-list-page">
      <TopBar title="免费直播" subtitle="咨询师分享 · 温柔陪伴" back right={<span className="live-free-badge">全部免费</span>} />

      <section className="live-hero">
        <div className="live-hero-copy">
          <span className="eyebrow eyebrow-light">
            <span className="live-dot" /> {liveCount} 场正在直播
          </span>
          <h1>
            今晚，
            <br />
            一起坐一会儿。
          </h1>
          <p>心理学知识、情绪练习、读书分享。普通互动打字参与，VIP 可申请连麦。</p>
          <button className="live-hero-cta" onClick={() => featured && nav.navigate({ name: 'live', id: featured.id })}>
            <Play size={14} fill="currentColor" />
            进入直播间
          </button>
        </div>
        <div className="live-hero-art">
          <Artwork variant="live" />
          <div className="live-hero-host">
            <Avatar variant={featured?.hostAvatar ?? 'lin'} size={54} />
            <span>
              <strong>{featured?.hostName ?? '林知夏'}</strong>
              <small>正在直播</small>
            </span>
          </div>
        </div>
        <span className="live-hero-decoration">✦</span>
      </section>

      <div className="live-vip-note">
        <Sparkles size={14} />
        <span>
          {VIP && vipTier === 'week'
            ? `周卡会员剩余 ${currentUser?.micChances ?? 0} 次连麦机会`
            : VIP
              ? '你是 VIP，本场可无限次申请连麦'
              : '开通 VIP 可申请连麦，和咨询师直接对话'}
        </span>
        <button onClick={() => nav.navigate({ name: 'vip' })}>
          了解
          <ChevronRight size={13} />
        </button>
      </div>

      <div className="live-tabs">
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: '全部', count: state.lives.length },
            { value: 'live', label: '正在直播', count: liveCount },
            { value: 'upcoming', label: '直播预告' },
          ]}
        />
      </div>

      <div className="live-list">
        {filtered.map((live) => (
          <button className="live-list-card" key={live.id} onClick={() => nav.navigate({ name: 'live', id: live.id })}>
            <div className="live-list-art">
              <Artwork variant={live.art} />
              <span className={cn('live-status-pill', live.status)}>
                {live.status === 'live' ? (
                  <>
                    <span className="live-dot" /> 直播中
                  </>
                ) : (
                  '预告'
                )}
              </span>
              {live.status === 'upcoming' && (
                <span className="live-list-time">
                  <CalendarClock size={11} />
                  {startLabel(live.startsAt)}
                </span>
              )}
              {live.status === 'live' && (
                <span className="live-list-viewers">
                  <Eye size={12} />
                  {live.viewers.toLocaleString()}
                </span>
              )}
            </div>
            <div className="live-list-body">
              <div className="live-list-host">
                <Avatar variant={live.hostAvatar} name={live.hostName} size={30} />
                <span>{live.hostName}</span>
                <small>{live.hostTitle.split(' · ')[0]}</small>
              </div>
              <h3>{live.title}</h3>
              <div className="live-list-tags">
                {live.tags.map((t) => (
                  <Tag key={t} tone={t === '免费' ? 'gold' : 'outline'}>
                    {t}
                  </Tag>
                ))}
              </div>
              <div className="live-list-footer">
                <span>
                  <Users size={13} />
                  {live.status === 'live' ? `${live.viewers.toLocaleString()} 人正在听` : '预约开播提醒'}
                </span>
                <span className="live-list-action">
                  {live.status === 'live' ? '进入' : '预约'}
                  <ChevronRight size={14} />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <section className="live-guide">
        <div className="live-guide-title">
          <ShieldCheck size={16} />
          <strong>观心直播公约</strong>
        </div>
        <div className="live-guide-grid">
          <span>
            <HeartHandshake size={15} />
            尊重每一种感受
          </span>
          <span>
            <Bell size={15} />
            不录制、不传播
          </span>
          <span>
            <Radio size={15} />
            不替代专业诊断
          </span>
        </div>
      </section>
    </div>
  )
}
