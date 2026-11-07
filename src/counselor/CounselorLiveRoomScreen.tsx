import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  Camera,
  Check,
  Clock3,
  Eye,
  Heart,
  Mic,
  Radio,
  Send,
  Sparkles,
  Users,
  Video,
} from 'lucide-react'
import { useStore } from '../store'
import { useCounselorNav } from './navigation'
import { Avatar } from '../components/Avatar'
import { Artwork } from '../components/Artwork'
import { Button, Modal, Tag } from '../components/UI'
import { cn, formatClock } from '../utils'

interface LiveSummary {
  title: string
  duration: number
  peakViewers: number
  messages: number
  viewers: number
}

function durationText(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function CounselorLiveRoomScreen({ id }: { id: string }) {
  const { state, currentCounselorAccount, sendCounselorLiveMessage, endCounselorLive } = useStore()
  const nav = useCounselorNav()
  const live = state.lives.find((item) => item.id === id)
  const [text, setText] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [endOpen, setEndOpen] = useState(false)
  const [summary, setSummary] = useState<LiveSummary | null>(null)
  const chatEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!live || summary) return
    setElapsed(Math.max(0, Math.floor((Date.now() - new Date(live.startsAt).getTime()) / 1000)))
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [live?.id, summary])

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [live?.chat.length])

  if (!currentCounselorAccount) return null

  if (summary) {
    return (
      <div className="page ca-page ca-live-summary-page">
        <div className="ca-live-summary-card">
          <div className="ca-live-summary-orbit" />
          <div className="ca-live-summary-icon">
            <Check size={30} />
          </div>
          <span className="ca-eyebrow">直播已结束</span>
          <h1>谢谢你，<br /><em>把这段时间留给大家。</em></h1>
          <p className="ca-live-summary-sub">{summary.title}</p>
          <div className="ca-live-summary-stats">
            <div>
              <strong>{durationText(summary.duration)}</strong>
              <span>直播时长</span>
            </div>
            <div>
              <strong>{summary.peakViewers}</strong>
              <span>峰值观看</span>
            </div>
            <div>
              <strong>{summary.messages}</strong>
              <span>互动消息</span>
            </div>
          </div>
          <div className="ca-live-summary-note">
            <Sparkles size={15} />
            <p>直播间已从用户端下线。真实推流、回放和数据报表将在正式版接入。</p>
          </div>
          <Button full size="lg" onClick={() => nav.switchTab('live')}>
            返回我的直播
          </Button>
          <button className="ca-live-summary-again" onClick={() => nav.replace({ name: 'live-setup' })}>
            再开一场
          </button>
        </div>
      </div>
    )
  }

  if (!live) {
    return (
      <div className="page ca-page ca-live-summary-page">
        <div className="ca-live-summary-card">
          <div className="ca-live-summary-icon">
            <Radio size={28} />
          </div>
          <span className="ca-eyebrow">直播已下线</span>
          <h1>这场直播已经结束</h1>
          <p className="ca-live-summary-sub">可以回到直播页，开启下一场分享。</p>
          <Button full size="lg" onClick={() => nav.switchTab('live')}>
            返回我的直播
          </Button>
        </div>
      </div>
    )
  }

  const viewers = live.viewers + Math.min(120, Math.floor(elapsed / 28))
  const myMessages = live.chat.filter((msg) => msg.name === currentCounselorAccount.name).length

  const send = () => {
    if (!text.trim()) return
    sendCounselorLiveMessage(live.id, text)
    setText('')
  }

  const endLive = () => {
    setEndOpen(false)
    setSummary({
      title: live.title,
      duration: elapsed,
      peakViewers: viewers,
      messages: live.chat.length,
      viewers,
    })
    endCounselorLive(live.id)
  }

  return (
    <div className="page ca-page ca-live-room-page">
      <section className="ca-live-stage">
        <div className="ca-live-stage-art">
          <Artwork variant={live.art} />
        </div>
        <div className="ca-live-stage-shade" />
        <header className="ca-live-stage-bar">
          <button onClick={nav.back} aria-label="返回">
            <ArrowLeft size={21} />
          </button>
          <div className="ca-live-stage-status">
            <span className="ca-live-status">
              <span className="live-dot" />
              直播中
            </span>
            <span className="ca-live-timer">
              <Clock3 size={12} />
              {durationText(elapsed)}
            </span>
          </div>
          <button onClick={() => setEndOpen(true)} className="ca-live-end-top">
            结束
          </button>
        </header>

        <div className="ca-live-stage-avatar">
          <span className="ca-live-ring ca-live-ring-1" />
          <span className="ca-live-ring ca-live-ring-2" />
          <Avatar variant={currentCounselorAccount.avatar} name={currentCounselorAccount.name} size={104} />
          <span className="ca-live-onair">ON AIR</span>
        </div>

        <div className="ca-live-stage-copy">
          <span className="ca-live-host-label">
            {currentCounselorAccount.name} · {currentCounselorAccount.title}
          </span>
          <h1>{live.title}</h1>
          <div className="ca-live-stage-tags">
            {live.tags.slice(0, 3).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>

        <div className="ca-live-stage-meta">
          <span>
            <Eye size={13} />
            {viewers} 人正在看
          </span>
          <span>
            <Heart size={12} />
            直播互动 {live.chat.length}
          </span>
          <span className="ca-live-demo">演示直播间</span>
        </div>
      </section>

      <section className="ca-live-controls">
        <button>
          <span>
            <Mic size={17} />
          </span>
          麦克风
        </button>
        <button>
          <span>
            <Camera size={17} />
          </span>
          摄像头
        </button>
        <button onClick={() => nav.navigate({ name: 'live' })}>
          <span>
            <Users size={17} />
          </span>
          观众
        </button>
        <button className="ca-live-control-danger" onClick={() => setEndOpen(true)}>
          <span>
            <Radio size={17} />
          </span>
          结束直播
        </button>
      </section>

      <section className="ca-live-chat">
        <div className="ca-live-chat-head">
          <div>
            <h2>直播互动</h2>
            <span>普通互动为打字 · VIP 可申请连麦</span>
          </div>
          <span>
            <Eye size={12} />
            {viewers}
          </span>
        </div>
        <div className="ca-live-chat-list">
          {live.chat.map((message) => {
            if (message.sender === 'system') {
              return (
                <div className="ca-live-system" key={message.id}>
                  {message.content}
                </div>
              )
            }
            const mine = message.name === currentCounselorAccount.name
            return (
              <div className={cn('ca-live-chat-message', mine && 'is-mine')} key={message.id}>
                {!mine && <Avatar variant={message.avatar ?? 'nanzhi'} name={message.name} size={30} />}
                <div>
                  {!mine && <span className="ca-live-chat-name">{message.name ?? '观心用户'}</span>}
                  <p>{message.content}</p>
                  <small>{formatClock(message.createdAt)}</small>
                </div>
                {mine && <Avatar variant={currentCounselorAccount.avatar} size={30} />}
              </div>
            )
          })}
          <div ref={chatEnd} />
        </div>
      </section>

      <div className="ca-live-composer-wrap">
        <div className="ca-live-quick">
          {['谢谢你的分享', '慢慢说，我在听', '可以试着深呼吸一下'].map((reply) => (
            <button key={reply} onClick={() => setText(reply)}>
              {reply}
            </button>
          ))}
        </div>
        <div className="ca-live-composer">
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') send()
            }}
            placeholder="作为咨询师回应一下…"
            maxLength={160}
          />
          <button onClick={send} disabled={!text.trim()} aria-label="发送">
            <Send size={17} />
          </button>
        </div>
        <p className="ca-live-composer-note">
          <Camera size={11} />
          演示环境不采集真实音视频；请勿公开来访者隐私。
        </p>
      </div>

      <Modal open={endOpen} onClose={() => setEndOpen(false)} className="ca-end-live-modal">
        <div className="ca-end-live-icon">
          <Radio size={27} />
        </div>
        <p className="success-eyebrow">结束直播</p>
        <h2>要和大家说再见了吗？</h2>
        <p className="success-sub">
          结束后，本场直播将从用户端下线。当前共有 {viewers} 人在听，已收到 {live.chat.length} 条互动。
        </p>
        <div className="ca-end-live-actions">
          <Button variant="secondary" onClick={() => setEndOpen(false)}>
            继续直播
          </Button>
          <Button onClick={endLive}>结束并查看小结</Button>
        </div>
      </Modal>
    </div>
  )
}
