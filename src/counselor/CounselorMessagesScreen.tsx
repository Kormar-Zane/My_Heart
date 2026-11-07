import { useMemo, useState } from 'react'
import { MessageCircle, Search, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { useStore } from '../store'
import { useCounselorNav } from './navigation'
import { Avatar } from '../components/Avatar'
import { Segmented } from '../components/UI'
import { cn, formatTimeAgo } from '../utils'

type Filter = 'all' | 'unread'

export function CounselorMessagesScreen() {
  const { state, currentCounselorAccount } = useStore()
  const nav = useCounselorNav()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const counselorId = currentCounselorAccount?.counselorId ?? ''
  const counselorChats = state.counselorChats.filter((chat) => chat.counselorId === counselorId)
  const unread = counselorChats.reduce((sum, chat) => sum + chat.unread, 0)
  const unreadChats = counselorChats.filter((chat) => chat.unread > 0).length

  const chats = useMemo(() => {
    return counselorChats
      .filter((chat) => filter === 'all' || chat.unread > 0)
      .filter((chat) => !search || chat.clientName.includes(search) || chat.messages.some((m) => m.content.includes(search)))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [counselorChats, filter, search])

  if (!currentCounselorAccount) return null

  return (
    <div className="page ca-page ca-messages-page">
      <header className="ca-messages-header">
        <span className="ca-home-brand">
          <span className="ca-brand-dot" />
          来访者沟通
        </span>
        <div className="ca-messages-title-row">
          <div>
            <h1>消息</h1>
            <p>{unread > 0 ? `${unread} 条需要回应的消息` : '今天暂时没有未读消息'}</p>
          </div>
          <span className="ca-messages-status">
            <span className="online-dot" />
            在线接诊
          </span>
        </div>
      </header>

      <div className="ca-messages-tip">
        <ShieldCheck size={14} />
        <span>与来访者的对话仅用于咨询沟通，请保护隐私，避免在公共场景查看。</span>
      </div>

      <div className="ca-messages-search">
        <Search size={16} />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索来访者或聊天内容" />
        {search && <button onClick={() => setSearch('')}>清除</button>}
      </div>

      <div className="ca-messages-filter">
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: '全部', count: counselorChats.length },
            { value: 'unread', label: '未读', count: unreadChats },
          ]}
        />
      </div>

      <div className="ca-chat-list">
        {chats.length === 0 ? (
          <div className="ca-messages-empty">
            <span>
              <MessageCircle size={27} />
            </span>
            <h3>{filter === 'unread' ? '没有未读消息' : '还没有来访者消息'}</h3>
            <p>当用户通过咨询师主页或预约页面联系你时，会话会出现在这里。</p>
          </div>
        ) : (
          chats.map((chat) => {
            const last = chat.messages[chat.messages.length - 1]
            return (
              <button
                key={chat.id}
                className={cn('ca-chat-item', chat.unread > 0 && 'has-unread')}
                onClick={() => nav.navigate({ name: 'chat', id: chat.id })}
              >
                <Avatar variant={chat.clientAvatar} name={chat.clientName} size={50} online={chat.online} />
                <div className="ca-chat-item-body">
                  <div className="ca-chat-item-top">
                    <strong>{chat.clientName}</strong>
                    {chat.online && <span className="ca-chat-online">在线</span>}
                    <time>{formatTimeAgo(chat.updatedAt)}</time>
                  </div>
                  <p className={chat.unread > 0 ? 'is-unread' : ''}>
                    {last?.sender === 'counselor' ? '我：' : ''}
                    {last?.content ?? '还没有消息'}
                  </p>
                  <span>{chat.clientTag}</span>
                </div>
                {chat.unread > 0 && <span className="ca-chat-unread">{chat.unread}</span>}
              </button>
            )
          })
        )}
      </div>

      {chats.length > 0 && (
        <div className="ca-messages-footer-note">
          <Sparkles size={13} />
          消息会保存在本机。未读消息角标会在你打开会话后清除。
        </div>
      )}

      <button className="ca-messages-static-card">
        <span>
          <Users size={18} />
        </span>
        <div>
          <strong>来访者沟通提示</strong>
          <p>先接住感受，再讨论问题；不急于给建议，也不做诊断结论。</p>
        </div>
      </button>
    </div>
  )
}
