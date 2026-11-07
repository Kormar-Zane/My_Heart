import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  Info,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useStore } from '../store'
import { useCounselorNav } from './navigation'
import { Avatar } from '../components/Avatar'
import { Button, Sheet, Tag } from '../components/UI'
import { cn, formatClock, formatDateCN } from '../utils'

const clientReplies = [
  '嗯嗯，我明白了。谢谢老师愿意听我说。',
  '我好像有一点理解自己了，但还需要慢慢消化。',
  '谢谢老师，我会试着按你说的做一次。',
  '其实我还有点害怕，不过想继续聊聊。',
]

export function CounselorChatScreen({ id }: { id: string }) {
  const {
    state,
    currentCounselorAccount,
    sendCounselorChatMessage,
    receiveCounselorClientMessage,
    markCounselorChatRead,
  } = useStore()
  const nav = useCounselorNav()
  const chat = state.counselorChats.find((item) => item.id === id)
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const scrollEnd = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  const replyIndex = useRef(0)

  useEffect(() => {
    markCounselorChatRead(id)
    return () => timers.current.forEach((timer) => window.clearTimeout(timer))
  }, [id, markCounselorChatRead])

  useEffect(() => {
    if (chat) markCounselorChatRead(id)
    scrollEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [chat?.messages.length, id, markCounselorChatRead])

  if (!chat || !currentCounselorAccount) return null
  const client = chat.clientId ? state.users.find((user) => user.id === chat.clientId) : null

  const send = () => {
    if (!text.trim()) return
    sendCounselorChatMessage(chat.id, text)
    setText('')
    const reply = clientReplies[replyIndex.current % clientReplies.length]
    replyIndex.current += 1
    const typingTimer = window.setTimeout(() => setTyping(true), 650)
    const replyTimer = window.setTimeout(() => {
      setTyping(false)
      receiveCounselorClientMessage(chat.id, reply)
    }, 1900)
    timers.current.push(typingTimer, replyTimer)
  }

  const quickReplies = ['我听到你的感受了', '我们可以慢慢来', '你愿意多说一点吗？', '下次咨询可以继续聊']

  return (
    <div className="page ca-page ca-chat-detail-page">
      <header className="ca-chat-header">
        <button onClick={nav.back} aria-label="返回">
          <ArrowLeft size={21} />
        </button>
        <Avatar variant={chat.clientAvatar} name={chat.clientName} size={38} online={chat.online} />
        <div className="ca-chat-header-copy">
          <strong>{chat.clientName}</strong>
          <span>{typing ? '正在输入…' : chat.online ? '在线 · 来访者' : '离线 · 可留言'}</span>
        </div>
        <button onClick={() => setInfoOpen(true)} aria-label="来访者信息">
          <Info size={19} />
        </button>
      </header>

      <div className="ca-chat-context">
        <ShieldCheck size={13} />
        <span>{chat.clientTag} · 会话内容仅彼此可见</span>
        <button onClick={() => setInfoOpen(true)}>来访者档案</button>
      </div>

      <div className="ca-chat-messages">
        <div className="ca-chat-day">
          {formatDateCN(chat.messages[0]?.createdAt ?? new Date().toISOString())}
        </div>
        {chat.messages.map((message, index) => {
          const previous = chat.messages[index - 1]
          const grouped = previous?.sender === message.sender
          return (
            <div
              key={message.id}
              className={cn(
                'ca-chat-message',
                message.sender === 'counselor' ? 'is-mine' : 'is-client',
                grouped && 'is-grouped',
              )}
            >
              {message.sender === 'client' && (
                <Avatar variant={chat.clientAvatar} name={chat.clientName} size={30} className={grouped ? 'is-hidden' : ''} />
              )}
              <div className="ca-chat-bubble-wrap">
                <div className="ca-chat-bubble">{message.content}</div>
                <span>{formatClock(message.createdAt)}</span>
              </div>
              {message.sender === 'counselor' && (
                <Avatar
                  variant={currentCounselorAccount.avatar}
                  name={currentCounselorAccount.name}
                  size={30}
                  className={grouped ? 'is-hidden' : ''}
                />
              )}
            </div>
          )
        })}
        {typing && (
          <div className="ca-chat-message is-client">
            <Avatar variant={chat.clientAvatar} name={chat.clientName} size={30} />
            <div className="ca-chat-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={scrollEnd} />
      </div>

      <div className="ca-chat-quick">
        {quickReplies.map((reply) => (
          <button key={reply} onClick={() => setText(reply)}>
            {reply}
          </button>
        ))}
      </div>

      <div className="ca-chat-composer-wrap">
        <div className="ca-chat-composer">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                send()
              }
            }}
            rows={1}
            maxLength={500}
            placeholder="作为咨询师，写下你的回应…"
          />
          <button onClick={send} disabled={!text.trim()} aria-label="发送">
            <Send size={17} />
          </button>
        </div>
        <p>
          <ShieldCheck size={11} />
          请保护来访者隐私 · 不索取联系方式或进行私下交易
        </p>
      </div>

      <Sheet open={infoOpen} onClose={() => setInfoOpen(false)} title="来访者档案">
        <div className="ca-client-profile">
          <Avatar variant={chat.clientAvatar} name={chat.clientName} size={70} online={chat.online} />
          <h2>{chat.clientName}</h2>
          <p>{chat.clientTag}</p>
          <div className="ca-client-tags">
            <Tag tone="sage">来访者</Tag>
            {chat.online && <Tag tone="outline">当前在线</Tag>}
            {client && <Tag tone="outline">{client.region.city}</Tag>}
          </div>
        </div>
        <div className="ca-client-info-grid">
          <div>
            <span>主要议题</span>
            <strong>{chat.clientTag.split(' · ')[0]}</strong>
          </div>
          <div>
            <span>关系</span>
            <strong>{client ? '观心用户' : '匿名来访者'}</strong>
          </div>
          <div>
            <span>最近联系</span>
            <strong>{formatDateCN(chat.updatedAt)}</strong>
          </div>
          <div>
            <span>沟通方式</span>
            <strong>文字留言</strong>
          </div>
        </div>
        <div className="ca-client-note">
          <Sparkles size={14} />
          <span>来访者档案为演示数据。正式版只能查看来访者主动授权的信息。</span>
        </div>
        <Button full onClick={() => setInfoOpen(false)}>
          <MessageCircle size={16} />
          回到对话
        </Button>
      </Sheet>
    </div>
  )
}
