import { useState } from 'react'
import { CalendarDays, Heart, MapPin, MessageCircle, ShieldCheck, Sparkles, UserPlus, Users } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Avatar } from '../components/Avatar'
import { Button, EmptyState, Segmented, Tag, TopBar } from '../components/UI'
import { cn, regionLabel } from '../utils'

type Kind = 'following' | 'friends' | 'counselors'

export function ConnectionsScreen({ kind }: { kind: Kind }) {
  const { state, currentUser, ensureUserConversation, followCounselor } = useStore()
  const nav = useNav()
  const [tab, setTab] = useState<Kind>(kind)
  if (!currentUser) return null

  const users = state.users.filter((u) => {
    if (tab === 'following') return currentUser.followingUserIds.includes(u.id)
    if (tab === 'friends') return currentUser.friendIds.includes(u.id)
    return false
  })
  const counselors = state.counselors.filter((c) => currentUser.followingCounselorIds.includes(c.id))

  const openUserChat = (userId: string) => {
    const id = ensureUserConversation(userId)
    if (id) nav.navigate({ name: 'conversation', id })
  }

  return (
    <div className="page connections-page">
      <TopBar title="我的关系" subtitle="那些与你产生连接的人" back />

      <div className="connections-tabs">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'following', label: '关注', count: currentUser.followingUserIds.length },
            { value: 'friends', label: '朋友', count: currentUser.friendIds.length },
            { value: 'counselors', label: '咨询师', count: currentUser.followingCounselorIds.length },
          ]}
        />
      </div>

      {tab !== 'counselors' ? (
        users.length === 0 ? (
          <EmptyState
            emoji={tab === 'friends' ? '🫧' : '🌿'}
            title={tab === 'friends' ? '还没有朋友' : '还没有关注的人'}
            description={tab === 'friends' ? '在广场和房间遇见同频的人，慢慢就会成为朋友。' : '去广场看看大家正在分享什么吧。'}
            action={
              <Button size="sm" onClick={() => nav.switchTab('square')}>
                去广场看看
              </Button>
            }
          />
        ) : (
          <div className="connection-list">
            <div className="connection-list-head">
              <span>{tab === 'friends' ? '互相陪伴的朋友' : '你关注的人'}</span>
              <span>{users.length} 位</span>
            </div>
            {users.map((user) => (
              <div className="connection-user" key={user.id}>
                <Avatar variant={user.avatar} name={user.nickname} size={52} online />
                <div className="connection-user-copy">
                  <strong>{user.nickname}</strong>
                  <p>{user.bio}</p>
                  <span>
                    <MapPin size={11} />
                    {regionLabel(user.region)}
                    {tab === 'friends' && <em>· 朋友</em>}
                  </span>
                </div>
                <button className="connection-message" onClick={() => openUserChat(user.id)}>
                  <MessageCircle size={15} />
                  发消息
                </button>
              </div>
            ))}
          </div>
        )
      ) : counselors.length === 0 ? (
        <EmptyState
          emoji="🌱"
          title="还没有关注咨询师"
          description="关注感兴趣的咨询师，他们的直播和分享会更常出现在你的首页。"
          action={
            <Button size="sm" onClick={() => nav.navigate({ name: 'counseling' })}>
              发现咨询师
            </Button>
          }
        />
      ) : (
        <div className="connection-list">
          <div className="connection-list-head">
            <span>你关注的咨询师</span>
            <span>{counselors.length} 位</span>
          </div>
          {counselors.map((counselor) => (
            <div className="connection-counselor" key={counselor.id}>
              <button className="connection-counselor-main" onClick={() => nav.navigate({ name: 'counselor', id: counselor.id })}>
                <Avatar variant={counselor.avatar} name={counselor.name} size={56} online={counselor.online} />
                <div>
                  <div className="connection-counselor-name">
                    <strong>{counselor.name}</strong>
                    <ShieldCheck size={13} />
                    {counselor.online && <span className="online-pill">在线</span>}
                  </div>
                  <p>{counselor.title}</p>
                  <div className="connection-counselor-tags">
                    {counselor.specialties.slice(0, 2).map((s) => (
                      <Tag key={s} tone="sage">
                        {s}
                      </Tag>
                    ))}
                  </div>
                </div>
              </button>
              <div className="connection-counselor-actions">
                <button onClick={() => followCounselor(counselor.id)}>已关注</button>
                <button className="primary" onClick={() => nav.navigate({ name: 'booking', counselorId: counselor.id })}>
                  <CalendarDays size={14} />
                  预约
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="connections-note">
        <Sparkles size={14} />
        <p>
          {tab === 'friends'
            ? '朋友是彼此确认后建立的关系，朋友发布的「朋友可见」日常会出现在你的广场里。'
            : '关注不会公开你的身份。你随时可以取消关注，关系可以慢慢来。'}
        </p>
      </div>

      {tab === 'friends' && (
        <button className="connections-find" onClick={() => nav.switchTab('square')}>
          <UserPlus size={16} />
          <span>去广场认识新朋友</span>
          <Users size={15} />
        </button>
      )}
    </div>
  )
}
