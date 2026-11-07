import { useMemo, useState } from 'react'
import { Compass, Feather, Flame, MapPin, PenLine, Sparkles, Users } from 'lucide-react'
import { useStore } from '../store'
import { PostCard } from '../components/PostCard'
import { Segmented } from '../components/UI'
import type { Post, User } from '../types'
import { regionLabel } from '../utils'

type FeedTab = 'recommend' | 'following' | 'nearby'

function canView(post: Post, user: User, users: User[]) {
  if (post.authorId === user.id) return true
  if (post.visibility === 'public') return true
  if (post.visibility === 'private') return false
  if (post.visibility === 'partial') return post.visibleTo.includes(user.id)
  if (post.visibility === 'friends') {
    const author = users.find((u) => u.id === post.authorId)
    return Boolean(author?.friendIds.includes(user.id) || user.friendIds.includes(post.authorId))
  }
  return false
}

export function SquareScreen({ onCompose }: { onCompose: () => void }) {
  const { state, currentUser } = useStore()
  const [tab, setTab] = useState<FeedTab>('recommend')

  const authorCity = (post: Post) => {
    if (post.authorType === 'user') return state.users.find((u) => u.id === post.authorId)?.region.city
    if (post.authorType === 'counselor') return state.counselors.find((c) => c.id === post.authorId)?.city
    return undefined
  }

  const posts = useMemo(() => {
    if (!currentUser) return []
    const visible = state.posts.filter((p) => canView(p, currentUser, state.users))
    const sorted = [...visible].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    if (tab === 'following') {
      return sorted.filter(
        (p) =>
          currentUser.followingUserIds.includes(p.authorId) ||
          currentUser.followingCounselorIds.includes(p.authorId) ||
          p.authorId === currentUser.id,
      )
    }
    if (tab === 'nearby') {
      return sorted.filter((p) => authorCity(p) === currentUser.region.city)
    }
    return sorted
  }, [currentUser, state.posts, state.users, state.counselors, tab])

  return (
    <div className="page square-page">
      <header className="square-header">
        <div className="square-title-wrap">
          <p className="square-kicker">GUANXIN · MOMENTS</p>
          <h1>广场</h1>
          <p className="square-subtitle">真实的生活，不一定要精修。</p>
        </div>
        <div className="square-header-actions">
          <span className="square-weather">🌿 {regionLabel(currentUser?.region)}</span>
          <button className="square-compose-button" onClick={onCompose}>
            <PenLine size={17} />
            记录
          </button>
        </div>
        <span className="square-deco">❋</span>
      </header>

      <button className="square-prompt" onClick={onCompose}>
        <div className="square-prompt-avatar">
          <Feather size={18} />
        </div>
        <div>
          <strong>今天，想记录点什么？</strong>
          <span>一张照片、一段心情，或一件很小的事</span>
        </div>
        <span className="square-prompt-action">写下来</span>
      </button>

      <div className="square-topics">
        <span className="square-topics-label">
          <Flame size={13} />
          正在发生
        </span>
        <button onClick={onCompose}># 今日份治愈</button>
        <button onClick={onCompose}># 一件小事</button>
        <button onClick={onCompose}># 想问问大家</button>
      </div>

      <div className="square-tabs">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'recommend', label: '推荐' },
            { value: 'following', label: '关注' },
            { value: 'nearby', label: '同城' },
          ]}
        />
        <span className="square-feed-count">
          {tab === 'recommend' ? <Compass size={13} /> : tab === 'following' ? <Users size={13} /> : <MapPin size={13} />}
          {posts.length} 条
        </span>
      </div>

      <div className="feed">
        {posts.length === 0 ? (
          <div className="square-empty">
            <div className="square-empty-icon">🌱</div>
            <h3>{tab === 'following' ? '关注的人还没有新动态' : tab === 'nearby' ? '同城还很安静' : '广场还没有内容'}</h3>
            <p>{tab === 'following' ? '去心理咨询页面关注几位咨询师吧。' : '不如由你来写下第一条日常。'}</p>
            <button onClick={onCompose}>发布第一条日常</button>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      {posts.length > 0 && (
        <div className="feed-end">
          <span />
          <p>
            <Sparkles size={13} />
            这里的生活，慢一点也没关系
          </p>
          <span />
        </div>
      )}
    </div>
  )
}
