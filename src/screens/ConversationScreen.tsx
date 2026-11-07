import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, CalendarDays, Info, Send, ShieldCheck, Sparkles } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Avatar } from '../components/Avatar'
import { Button, Sheet, Tag } from '../components/UI'
import { cn, formatClock, formatDateCN } from '../utils'

const replies: Record<string, string[]> = {
  counselor: [
    '我看到了。谢谢你愿意告诉我这些，我们可以慢慢聊。',
    '听起来这阵子你承担了很多。你愿意说说，最让你难受的是哪一部分吗？',
    '不用急着把话说完整。此刻的你，已经足够真诚了。',
    '如果愿意，我们可以约一次完整的 50 分钟咨询，更仔细地聊聊。',
  ],
  friend: ['抱抱你，我在呢。', '嗯嗯，我听着，你慢慢说。', '要不要晚点一起去解压房坐坐？', '今天也辛苦了，先喝口水吧。'],
  system: [
    '我收到啦。你可以去首页看看 AI 心情匹配，或直接预约一位咨询师。',
    '如果不知道怎么开始，可以先做一次心情打卡。我会一直在这里。',
  ],
}

export function ConversationScreen({ id }: { id: string }) {
  const { state, currentUser, sendMessage, receiveMessage, markConversationRead, ensureCounselorConversation, serverMode } = useStore()
  const nav = useNav()
  const conversation = state.conversations.find((c) => c.id === id)
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  const replyIndex = useRef(0)

  useEffect(() => {
    markConversationRead(id)
    return () => timers.current.forEach((timer) => window.clearTimeout(timer))
  }, [id, markConversationRead])

  useEffect(() => {
    if (conversation) markConversationRead(id)
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [conversation?.messages.length, id, markConversationRead])

  if (!conversation) return null

  const counselor = state.counselors.find((c) => c.id === conversation.participantId)
  const send = () => {
    if (!text.trim()) return
    sendMessage(id, text)
    setText('')
    if (!serverMode) {
      const pool = replies[conversation.participantType] ?? replies.system
      const reply = pool[replyIndex.current % pool.length]
      replyIndex.current += 1
      const typingTimer = window.setTimeout(() => setTyping(true), 500)
      const replyTimer = window.setTimeout(() => {
        setTyping(false)
        receiveMessage(id, reply)
      }, 1700)
      timers.current.push(typingTimer, replyTimer)
    }
  }

  const quickReplies =
    conversation.participantType === 'counselor'
      ? ['我最近有点焦虑', '想了解咨询方式', '谢谢老师']
      : conversation.participantType === 'friend'
        ? ['抱抱你', '我在听', '一起玩吗']
        : ['怎么匹配咨询师？', '小红花怎么获得？']

  const openCounselor = () => {
    if (!counselor) return
    setInfoOpen(false)
    nav.navigate({ name: 'counselor', id: counselor.id })
  }

  const openBooking = () => {
    if (!counselor) return
    setInfoOpen(false)
    nav.navigate({ name: 'booking', counselorId: counselor.id })
  }

  const dayLabel = conversation.messages.length > 0 ? formatDateCN(conversation.messages[0].createdAt) : '今天'

  return (
    <div className="page conversation-page">
      <header className="conversation-header">
        <button onClick={nav.back} aria-label="返回" className="conversation-back">
          <ArrowLeft size={21} />
        </button>
        <Avatar variant={conversation.avatar} name={conversation.name} size={38} online={conversation.online} />
        <div className="conversation-header-copy">
          <strong>
            {conversation.name}
            {conversation.participantType === 'counselor' && <ShieldCheck size={13} />}
          </strong>
          <span>{typing ? '正在输入…' : conversation.online ? '在线' : conversation.subtitle}</span>
        </div>
        <button className="conversation-info" onClick={() => setInfoOpen(true)} aria-label="聊天信息">
          <Info size={19} />
        </button>
      </header>

      <div className="conversation-context-strip">
        {conversation.participantType === 'counselor' ? (
          <>
            <ShieldCheck size={14} />
            <span>咨询师已通过观心资质审核 · 咨询内容保密</span>
            <button onClick={openBooking}>
              <CalendarDays size={13} />
              预约
            </button>
          </>
        ) : (
          <>
            <Sparkles size={14} />
            <span>{conversation.subtitle} · 请友善交流，保护彼此隐私</span>
          </>
        )}
      </div>

      <div className="conversation-messages">
        <div className="conversation-day">
          <span>{dayLabel}</span>
        </div>
        {conversation.messages.map((message, index) => {
          const previous = conversation.messages[index - 1]
          const grouped = previous && previous.sender === message.sender
          if (message.sender === 'system') {
            return (
              <div className="conversation-system" key={message.id}>
                <span>{message.content}</span>
              </div>
            )
          }
          return (
            <div
              key={message.id}
              className={cn('message-row', message.sender === 'me' ? 'is-mine' : 'is-other', grouped && 'is-grouped')}
            >
              {message.sender === 'other' && (
                <Avatar
                  variant={conversation.avatar}
                  name={conversation.name}
                  size={30}
                  className={grouped ? 'is-hidden' : ''}
                />
              )}
              <div className="message-content">
                <div className="message-bubble">{message.content}</div>
                <span className="message-time">{formatClock(message.createdAt)}</span>
              </div>
              {message.sender === 'me' && (
                <Avatar variant={currentUser?.avatar} size={30} className={grouped ? 'is-hidden' : ''} />
              )}
            </div>
          )
        })}
        {typing && (
          <div className="message-row is-other">
            <Avatar variant={conversation.avatar} name={conversation.name} size={30} />
            <div className="message-typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="conversation-quick">
        {quickReplies.map((reply) => (
          <button key={reply} onClick={() => setText(reply)}>
            {reply}
          </button>
        ))}
      </div>

      <div className="conversation-composer-wrap">
        <div className="conversation-composer">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="写下你想说的话…"
            rows={1}
            maxLength={500}
          />
          <button onClick={send} disabled={!text.trim()} aria-label="发送">
            <Send size={18} />
          </button>
        </div>
        <p className="conversation-composer-hint">
          <ShieldCheck size={11} />
          请勿发送银行卡、验证码等敏感信息
        </p>
      </div>

      <Sheet open={infoOpen} onClose={() => setInfoOpen(false)} title="聊天信息">
        <div className="conversation-info-card">
          <Avatar variant={conversation.avatar} name={conversation.name} size={68} online={conversation.online} />
          <h2>{conversation.name}</h2>
          <p>{conversation.subtitle}</p>
          {counselor && (
            <div className="conversation-info-tags">
              {counselor.specialties.map((s) => (
                <Tag key={s} tone="sage">
                  {s}
                </Tag>
              ))}
            </div>
          )}
        </div>
        {counselor ? (
          <div className="conversation-info-actions">
            <Button variant="secondary" onClick={openCounselor}>
              查看咨询师主页
            </Button>
            <Button onClick={openBooking}>预约咨询</Button>
          </div>
        ) : (
          <div className="conversation-info-note">
            <ShieldCheck size={15} />
            你们在观心相识。聊天内容仅彼此可见，观心不会用于推荐或广告。
          </div>
        )}
      </Sheet>
    </div>
  )
}
