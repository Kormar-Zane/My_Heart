import { useMemo, useState } from 'react'
import { MessageCircleMore, Plus, Search, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Avatar } from '../components/Avatar'
import { Segmented, Sheet } from '../components/UI'
import type { Conversation } from '../types'
import { cn, formatTimeAgo } from '../utils'

type ChatFilter = 'all' | 'friend' | 'counselor'

function lastPreview(conversation: Conversation) {
  const last = conversation.messages[conversation.messages.length - 1]
  if (!last) return '还没有消息'
  const prefix = last.sender === 'me' ? '我：' : ''
  return `${prefix}${last.content}`
}

export function ChatListScreen() {
  const { state, currentUser, ensureCounselorConversation, ensureUserConversation } = useStore()
  const nav = useNav()
  const [filter, setFilter] = useState<ChatFilter>('all')
  const [search, setSearch] = useState('')
  const [newChatOpen, setNewChatOpen] = useState(false)

  const conversations = useMemo(() => {
    return [...state.conversations]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .filter((c) => {
        if (filter === 'friend') return c.participantType === 'friend'
        if (filter === 'counselor') return c.participantType === 'counselor'
        return true
      })
      .filter((c) => !search || c.name.includes(search) || lastPreview(c).includes(search))
  }, [state.conversations, filter, search])

  const unreadTotal = state.conversations.reduce((sum, c) => sum + c.unread, 0)
  const friends = state.users.filter(
    (u) => u.id !== currentUser?.id && (currentUser?.friendIds.includes(u.id) || u.id === 'u_luye'),
  )

  const openCounselor = (id: string) => {
    const counselor = state.counselors.find((c) => c.id === id)
    if (!counselor) return
    const convId = ensureCounselorConversation(counselor)
    setNewChatOpen(false)
    nav.navigate({ name: 'conversation', id: convId })
  }

  const openUser = (userId: string) => {
    const id = ensureUserConversation(userId)
    setNewChatOpen(false)
    if (id) nav.navigate({ name: 'conversation', id })
  }

  return (
    <div className="page chat-list-page">
      <header className="chat-header">
        <div>
          <p className="chat-kicker">CONVERSATIONS</p>
          <h1>聊天</h1>
          <p className="chat-subtitle">有些话，不必一个人消化。</p>
        </div>
        <button className="chat-new-button" onClick={() => setNewChatOpen(true)} aria-label="发起新聊天">
          <Plus size={21} />
        </button>
        <span className="chat-header-deco">✦</span>
      </header>

      <div className="chat-care-strip">
        <Sparkles size={15} />
        <p>{unreadTotal > 0 ? `有 ${unreadTotal} 条未读消息，正在等你。` : '今天也有人愿意听你说话。'}</p>
        <span>在线 {state.counselors.filter((c) => c.online).length + 3}</span>
      </div>

      <div className="chat-search">
        <Search size={17} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索聊天或咨询师" />
        {search && <button onClick={() => setSearch('')}>清除</button>}
      </div>

      <div className="chat-filters">
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: '全部', count: state.conversations.length },
            { value: 'friend', label: '朋友' },
            { value: 'counselor', label: '咨询师' },
          ]}
        />
      </div>

      <div className="conversation-list">
        {conversations.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              <MessageCircleMore size={30} />
            </div>
            <h3>没有找到相关的聊天</h3>
            <p>换个关键词，或发起一段新的对话。</p>
            <button onClick={() => setNewChatOpen(true)}>发起聊天</button>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              className={cn('conversation-item', conv.unread > 0 && 'has-unread')}
              onClick={() => {
                nav.navigate({ name: 'conversation', id: conv.id })
              }}
            >
              <div className="conversation-avatar">
                <Avatar variant={conv.avatar} name={conv.name} size={52} online={conv.online} />
                {conv.participantType === 'counselor' && (
                  <span className="conversation-type-badge">
                    <ShieldCheck size={11} />
                  </span>
                )}
              </div>
              <div className="conversation-main">
                <div className="conversation-name-row">
                  <strong>{conv.name}</strong>
                  {conv.participantType === 'counselor' && <span className="conversation-role">咨询师</span>}
                  {conv.participantId === 'official' && <span className="conversation-role official">官方</span>}
                  <time>{formatTimeAgo(conv.updatedAt)}</time>
                </div>
                <p className={conv.unread > 0 ? 'is-unread' : ''}>{lastPreview(conv)}</p>
                <span className="conversation-subtitle">{conv.subtitle}</span>
              </div>
              {conv.unread > 0 && <span className="conversation-unread">{conv.unread > 9 ? '9+' : conv.unread}</span>}
            </button>
          ))
        )}
      </div>

      <div className="chat-safety">
        <ShieldCheck size={14} />
        <p>观心不会主动索要你的密码或转账。遇到让你不适的对话，可以随时结束并反馈。</p>
      </div>

      <Sheet
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        title="发起一段对话"
        subtitle="想和谁说说话？"
      >
        <div className="new-chat-section">
          <p className="new-chat-label">
            <ShieldCheck size={13} />
            心理咨询师
          </p>
          <div className="new-chat-list">
            {state.counselors.slice(0, 5).map((counselor) => (
              <button key={counselor.id} onClick={() => openCounselor(counselor.id)}>
                <Avatar variant={counselor.avatar} name={counselor.name} size={42} online={counselor.online} />
                <div>
                  <strong>{counselor.name}</strong>
                  <p>{counselor.title}</p>
                </div>
                <span>{counselor.online ? '在线' : '留言'}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="new-chat-section">
          <p className="new-chat-label">
            <Users size={13} />
            朋友和广场伙伴
          </p>
          <div className="new-chat-list">
            {friends.map((friend) => (
              <button key={friend.id} onClick={() => openUser(friend.id)}>
                <Avatar variant={friend.avatar} name={friend.nickname} size={42} online />
                <div>
                  <strong>{friend.nickname}</strong>
                  <p>{friend.region.city} · {friend.bio}</p>
                </div>
                <span>打招呼</span>
              </button>
            ))}
          </div>
        </div>
      </Sheet>
    </div>
  )
}
