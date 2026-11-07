import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  BellRing,
  CalendarClock,
  Check,
  Crown,
  Eye,
  Heart,
  Mic,
  Send,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Avatar } from '../components/Avatar'
import { Artwork } from '../components/Artwork'
import { Button, Sheet, Tag } from '../components/UI'
import { activeVipTier, cn, formatClock, formatDateCN, isVipActive, weekdayCN } from '../utils'

export function LiveRoomScreen({ id }: { id: string }) {
  const { state, currentUser, addLiveChat, requestMic, followCounselor, showToast } = useStore()
  const nav = useNav()
  const live = state.lives.find((l) => l.id === id)
  const [message, setMessage] = useState('')
  const [vipOpen, setVipOpen] = useState(false)
  const [micQueued, setMicQueued] = useState(false)
  const [reminder, setReminder] = useState(false)
  const [hearts, setHearts] = useState<number[]>([])
  const chatEnd = useRef<HTMLDivElement>(null)
  const tier = activeVipTier(currentUser)
  const VIP = isVipActive(currentUser)

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [live?.chat.length])

  if (!live) return null

  const host = state.counselors.find((c) => c.id === live.hostId)
  const following = currentUser?.followingCounselorIds.includes(live.hostId) ?? false
  const micExhausted = tier === 'week' && (currentUser?.micChances ?? 0) <= 0
  const micHint = !VIP
    ? 'VIP 可申请连麦'
    : tier === 'week'
      ? `周卡剩余 ${currentUser?.micChances ?? 0} 次`
      : '无限次连麦'

  const send = () => {
    if (!message.trim()) return
    addLiveChat(live.id, message)
    setMessage('')
  }

  const handleMic = () => {
    if (!VIP) {
      setVipOpen(true)
      return
    }
    if (micExhausted) {
      setVipOpen(true)
      return
    }
    if (micQueued) {
      showToast('已经在排队啦，老师很快会邀请你', 'info')
      return
    }
    const result = requestMic()
    if (!result.ok) {
      setVipOpen(true)
      return
    }
    setMicQueued(true)
    showToast(result.message ?? '连麦申请已发送')
  }

  const sendHeart = () => {
    setHearts((prev) => [...prev, Date.now()])
    showToast('送出一颗小心心', 'success')
  }

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`观心免费直播｜${live.title}｜${live.hostName}`)
      showToast('直播间链接已复制')
    } catch {
      showToast('暂时无法分享', 'info')
    }
  }

  if (live.status === 'upcoming') {
    return (
      <div className="page live-room-page live-upcoming-page">
        <section className="live-upcoming-hero">
          <div className="live-upcoming-art">
            <Artwork variant={live.art} />
          </div>
          <div className="live-upcoming-shade" />
          <header className="live-stage-bar">
            <button onClick={nav.back} aria-label="返回" className="hero-icon-button light">
              <ArrowLeft size={21} />
            </button>
            <span className="live-status-pill upcoming">直播预告</span>
            <button onClick={share} aria-label="分享" className="hero-icon-button light">
              <Share2 size={19} />
            </button>
          </header>
          <div className="live-upcoming-content">
            <span className="eyebrow eyebrow-light">
              <CalendarClock size={13} />
              {formatDateCN(live.startsAt)} {weekdayCN(live.startsAt)} · {formatClock(live.startsAt)}
            </span>
            <h1>{live.title}</h1>
            <div className="live-upcoming-host">
              <Avatar variant={live.hostAvatar} name={live.hostName} size={44} />
              <div>
                <strong>{live.hostName}</strong>
                <small>{live.hostTitle}</small>
              </div>
            </div>
          </div>
        </section>

        <div className="live-upcoming-body">
          <div className="live-reminder-card">
            <span className="live-reminder-icon">
              <BellRing size={22} />
            </span>
            <div>
              <strong>{reminder ? '已设置开播提醒' : '不想错过？'}</strong>
              <p>{reminder ? '开播前 10 分钟，我们会提醒你。' : '预约后，开播前会收到一条温柔提醒。'}</p>
            </div>
            <button
              className={cn('live-reminder-button', reminder && 'is-done')}
              onClick={() => {
                setReminder(true)
                if (!reminder) showToast('已预约开播提醒')
              }}
            >
              {reminder ? (
                <>
                  <Check size={14} />
                  已预约
                </>
              ) : (
                '提醒我'
              )}
            </button>
          </div>

          <section className="detail-section">
            <h2>本场聊什么</h2>
            <p className="detail-paragraph">{live.description}</p>
            <div className="profile-tags live-topic-tags">
              {live.tags.map((t) => (
                <Tag key={t} tone={t === '免费' ? 'gold' : 'outline'}>
                  {t}
                </Tag>
              ))}
            </div>
          </section>

          <section className="detail-section">
            <h2>关于咨询师</h2>
            <button className="live-host-card" onClick={() => nav.navigate({ name: 'counselor', id: live.hostId })}>
              <Avatar variant={live.hostAvatar} name={live.hostName} size={56} />
              <div>
                <strong>{live.hostName}</strong>
                <p>{live.hostTitle}</p>
                <span>{host?.quote}</span>
              </div>
            </button>
          </section>

          <div className="live-free-note">
            <Sparkles size={15} />
            本场直播免费。普通互动为打字，VIP 可申请连麦。
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page live-room-page">
      <section className="live-stage">
        <div className="live-stage-bg">
          <Artwork variant={live.art} />
        </div>
        <div className="live-stage-shade" />
        <header className="live-stage-bar">
          <button onClick={nav.back} aria-label="返回" className="hero-icon-button light">
            <ArrowLeft size={21} />
          </button>
          <div className="live-stage-status">
            <span className="live-status-pill live">
              <span className="live-dot" /> 直播中
            </span>
            <span className="live-viewers-pill">
              <Eye size={12} />
              {live.viewers.toLocaleString()}
            </span>
          </div>
          <button onClick={share} aria-label="分享" className="hero-icon-button light">
            <Share2 size={19} />
          </button>
        </header>

        <div className="live-stage-avatar">
          <span className="live-ring live-ring-1" />
          <span className="live-ring live-ring-2" />
          <Avatar variant={live.hostAvatar} name={live.hostName} size={108} />
          <span className="live-on-air">ON AIR</span>
        </div>

        <div className="live-stage-copy">
          <span className="live-host-label">
            {live.hostName} · {live.hostTitle.split(' · ')[0]}
          </span>
          <h1>{live.title}</h1>
          <div className="live-stage-tags">
            {live.tags.slice(0, 2).map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>

        <div className="live-floating-hearts" aria-hidden="true">
          {hearts.slice(-7).map((h, i) => (
            <span key={h} style={{ left: `${16 + (i % 5) * 15}%`, animationDelay: `${(i % 3) * 0.7}s` }}>
              ♥
            </span>
          ))}
        </div>

        <div className="live-stage-actions">
          <button onClick={sendHeart} className="live-heart-button" aria-label="送一颗心">
            <Heart size={18} fill="currentColor" />
          </button>
          <span>轻触送出一颗心</span>
        </div>
      </section>

      <section className="live-host-strip">
        <Avatar variant={live.hostAvatar} name={live.hostName} size={44} online />
        <div>
          <div className="live-host-name">
            <strong>{live.hostName}</strong>
            {host && <span>{host.title}</span>}
          </div>
          <p>{live.description}</p>
        </div>
        <button className={cn('follow-button small', following && 'is-following')} onClick={() => followCounselor(live.hostId)}>
          {following ? '已关注' : '关注'}
        </button>
      </section>

      <section className="live-chat-section">
        <div className="live-chat-head">
          <h2>直播互动</h2>
          <span>
            <Users size={13} />
            {live.chat.length} 条互动
          </span>
        </div>
        <div className="live-chat-list">
          <div className="live-system-message">
            <Sparkles size={13} />
            欢迎来到直播间。请尊重彼此，不录屏、不传播他人发言。
          </div>
          {live.chat.map((msg) =>
            msg.sender === 'me' ? (
              <div className="live-chat-item is-mine" key={msg.id}>
                <div className="live-chat-bubble">
                  <span className="live-chat-name">我</span>
                  <p>{msg.content}</p>
                </div>
                <Avatar variant={currentUser?.avatar} size={28} />
              </div>
            ) : (
              <div className="live-chat-item" key={msg.id}>
                <Avatar variant={msg.avatar ?? 'official'} name={msg.name} size={28} />
                <div className="live-chat-bubble">
                  <span className="live-chat-name">
                    {msg.name ?? '观心伙伴'}
                    <small>{formatClock(msg.createdAt)}</small>
                  </span>
                  <p>{msg.content}</p>
                </div>
              </div>
            ),
          )}
          <div ref={chatEnd} />
        </div>
      </section>

      <div className="live-composer-wrap">
        <div className="live-composer">
          <button
            className={cn('live-mic-button', VIP && !micExhausted && 'is-vip', micQueued && 'is-queued')}
            onClick={handleMic}
          >
            {VIP && !micExhausted ? <Mic size={17} /> : <Crown size={16} />}
            <span>{micQueued ? '排队中' : micExhausted ? '升级' : VIP ? '连麦' : 'VIP'}</span>
          </button>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send()
            }}
            placeholder="说点什么，给老师一点回应…"
            maxLength={100}
          />
          <button className="live-send-button" onClick={send} disabled={!message.trim()} aria-label="发送">
            <Send size={17} />
          </button>
        </div>
        <div className="live-composer-hint">
          <span>{micHint}</span>
          <span>文字互动 · 全部免费</span>
        </div>
      </div>

      <Sheet
        open={vipOpen}
        onClose={() => setVipOpen(false)}
        title={micExhausted ? '本周连麦次数已用完' : '连麦是 VIP 专属权益'}
        subtitle={micExhausted ? '升级月卡，即可无限次和咨询师连麦' : '普通互动打字参与，VIP 可直接申请连麦'}
      >
        <div className="live-vip-sheet">
          <div className="live-vip-crown">
            <Crown size={30} />
          </div>
          <div className="live-vip-options">
            <div className="live-vip-option">
              <span>周卡</span>
              <strong>¥9</strong>
              <small>2 次连麦机会</small>
            </div>
            <div className="live-vip-option is-featured">
              <span>月卡</span>
              <strong>¥29</strong>
              <small>无限次连麦</small>
            </div>
            <div className="live-vip-option">
              <span>年卡</span>
              <strong>¥299</strong>
              <small>连麦 + 面对面</small>
            </div>
          </div>
          <Button
            full
            size="lg"
            onClick={() => {
              setVipOpen(false)
              nav.navigate({ name: 'vip' })
            }}
          >
            去开通 VIP
          </Button>
          <p className="live-vip-fineprint">VIP 连麦机会可用于所有咨询师直播间，面对面权益由年卡赠送。</p>
        </div>
      </Sheet>
    </div>
  )
}
