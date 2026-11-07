import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Gamepad2, Send, Share2, Sparkles, UserPlus, Users } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Avatar } from '../components/Avatar'
import { Artwork } from '../components/Artwork'
import { Sheet, Tag } from '../components/UI'
import { GAME_META } from '../theme'
import { cn, formatClock } from '../utils'

const autoReplies = [
  '嗯嗯，我在听。谢谢你愿意说出来。',
  '听起来这件事真的让你花了些力气，先抱抱你。',
  '不用急着找到答案，先在这里待一会儿也很好。',
  '我懂那种感觉。你已经做得很好了。',
  '要不要一起玩一局小游戏，换换脑子？',
]

export function RoomScreen({ id }: { id: string }) {
  const { state, currentUser, sendRoomMessage, receiveRoomMessage, showToast } = useStore()
  const nav = useNav()
  const room = state.rooms.find((r) => r.id === id)
  const [message, setMessage] = useState('')
  const [membersOpen, setMembersOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  const replyIndex = useRef(0)

  useEffect(() => {
    return () => timers.current.forEach((t) => window.clearTimeout(t))
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [room?.messages.length])

  if (!room) return null

  const send = () => {
    if (!message.trim()) return
    sendRoomMessage(room.id, message)
    setMessage('')
    if (!room.isMine) {
      const reply = autoReplies[replyIndex.current % autoReplies.length]
      replyIndex.current += 1
      const timer = window.setTimeout(() => receiveRoomMessage(room.id, reply), 1200)
      timers.current.push(timer)
    }
  }

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`观心解压房｜${room.title}｜${room.topic}`)
      showToast('房间邀请文案已复制')
    } catch {
      showToast('暂时无法分享', 'info')
    }
  }

  return (
    <div className="page room-page">
      <section className="room-hero">
        <div className="room-hero-art">
          <Artwork variant={room.art} />
        </div>
        <div className="room-hero-shade" />
        <header className="room-hero-bar">
          <button onClick={nav.back} aria-label="返回" className="hero-icon-button light">
            <ArrowLeft size={21} />
          </button>
          <div className="room-hero-actions">
            <button className="hero-icon-button light" onClick={() => setMembersOpen(true)} aria-label="房间成员">
              <Users size={19} />
            </button>
            <button className="hero-icon-button light" onClick={share} aria-label="分享房间">
              <Share2 size={19} />
            </button>
          </div>
        </header>
        <div className="room-hero-copy">
          <span className="room-hero-tag">{room.tag}</span>
          <h1>{room.title}</h1>
          <p>{room.topic}</p>
          <div className="room-hero-meta">
            <span className="room-host">
              <Avatar variant={room.hostAvatar} size={24} />
              房主 · {room.hostName}
            </span>
            <span className="room-online">
              <span className="online-dot" />
              {room.members} 人在房间里
            </span>
          </div>
        </div>
        <div className="room-hero-avatars">
          {['ali', 'nanzhi', 'luye', 'yangtao'].map((a, i) => (
            <span key={a} style={{ zIndex: 4 - i }}>
              <Avatar variant={a} size={28} />
            </span>
          ))}
          <span className="room-avatar-count">+{Math.max(0, room.members - 4)}</span>
        </div>
      </section>

      <div className="room-game-strip">
        <div className="room-game-strip-head">
          <span>
            <Gamepad2 size={15} />
            房间里一起玩
          </span>
          <small>完成游戏得小红花</small>
        </div>
        <div className="room-game-row">
          {GAME_META.map((game) => (
            <button key={game.type} onClick={() => nav.navigate({ name: 'game', type: game.type })}>
              <span>{game.emoji}</span>
              <strong>{game.title}</strong>
              <small>+{game.reward} 🌸</small>
            </button>
          ))}
        </div>
      </div>

      <div className="room-chat-head">
        <div>
          <span className="online-dot" />
          <strong>房间聊天</strong>
          <small>发言仅房间内可见</small>
        </div>
        <button onClick={() => setMembersOpen(true)}>
          <UserPlus size={14} />
          邀请
        </button>
      </div>

      <div className="room-messages">
        <div className="room-system-message">
          <Sparkles size={13} />
          欢迎来到「{room.title}」。这里没有评判，请温柔对待彼此。
        </div>
        {room.messages.map((msg, index) => {
          const previous = room.messages[index - 1]
          const grouped = previous && previous.senderId === msg.senderId && previous.senderAvatar === msg.senderAvatar
          if (msg.senderId === 'system') {
            return (
              <div className="room-system-message" key={msg.id}>
                {msg.content}
              </div>
            )
          }
          return (
            <div className={cn('room-message', msg.isMine && 'is-mine', grouped && 'is-grouped')} key={msg.id}>
              {!msg.isMine && !grouped && <Avatar variant={msg.senderAvatar} name={msg.senderName} size={34} />}
              {!msg.isMine && grouped && <span className="room-avatar-placeholder" />}
              <div className="room-message-content">
                {!msg.isMine && !grouped && (
                  <span className="room-message-name">
                    {msg.senderName}
                    {msg.senderName === room.hostName && <em>房主</em>}
                  </span>
                )}
                <div className="room-message-bubble">
                  {msg.content}
                  <small>{formatClock(msg.createdAt)}</small>
                </div>
              </div>
              {msg.isMine && <Avatar variant={currentUser?.avatar} size={34} />}
            </div>
          )
        })}
        <div ref={scrollRef} />
      </div>

      <div className="room-quick-replies">
        {['抱抱你', '我也是', '慢慢说', '一起玩吗'].map((reply) => (
          <button key={reply} onClick={() => setMessage(reply)}>
            {reply}
          </button>
        ))}
      </div>

      <div className="room-composer-wrap">
        <div className="room-composer">
          <button className="room-emoji-button" onClick={() => setMessage((m) => `${m}🌿`)}>
            🌿
          </button>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send()
            }}
            placeholder="说点什么，让房间暖一点…"
            maxLength={200}
          />
          <button className="room-send" onClick={send} disabled={!message.trim()} aria-label="发送">
            <Send size={17} />
          </button>
        </div>
        <p className="room-demo-note">演示房间 · 其他伙伴的发言为本地示例互动</p>
      </div>

      <Sheet open={membersOpen} onClose={() => setMembersOpen(false)} title="房间伙伴" subtitle={`${room.members} 人在房间里`}>
        <div className="room-member-list">
          <div className="room-member">
            <Avatar variant={room.hostAvatar} name={room.hostName} size={44} online />
            <div>
              <strong>{room.hostName}</strong>
              <p>房主 · 正在陪伴大家</p>
            </div>
            <Tag tone="sage">房主</Tag>
          </div>
          {['南栀', '鹿野', '杨桃', '小满'].map((name, i) => {
            const avatars = ['nanzhi', 'luye', 'yangtao', 'xiaoman']
            return (
              <div className="room-member" key={name}>
                <Avatar variant={avatars[i]} name={name} size={44} online={i < 3} />
                <div>
                  <strong>{name}</strong>
                  <p>{['在听', '正在泡茶', '刚画完一只猫', '今天也来了'][i]}</p>
                </div>
              </div>
            )
          })}
          <div className="room-member">
            <Avatar variant={currentUser?.avatar} name={currentUser?.nickname} size={44} online />
            <div>
              <strong>{currentUser?.nickname}（我）</strong>
              <p>在房间里</p>
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  )
}
