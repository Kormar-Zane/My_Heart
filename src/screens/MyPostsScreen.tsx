import { useState } from 'react'
import { Feather, Heart, MessageCircle, PenLine, Sparkles } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { PostCard } from '../components/PostCard'
import { Button, EmptyState, TopBar } from '../components/UI'
import type { Visibility } from '../types'
import { cn } from '../utils'

type Filter = 'all' | Visibility

const filters: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'public', label: '公开' },
  { value: 'friends', label: '朋友' },
  { value: 'partial', label: '部分人' },
  { value: 'private', label: '仅自己' },
]

export function MyPostsScreen({ onCompose }: { onCompose: () => void }) {
  const { state, currentUser } = useStore()
  const nav = useNav()
  const [filter, setFilter] = useState<Filter>('all')
  const myPosts = currentUser
    ? state.posts
        .filter((p) => p.authorId === currentUser.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : []
  if (!currentUser) return null

  const posts = myPosts.filter((p) => filter === 'all' || p.visibility === filter)
  const likes = myPosts.reduce((sum, p) => sum + p.likes, 0)
  const comments = myPosts.reduce((sum, p) => sum + p.comments.length, 0)

  return (
    <div className="page my-posts-page">
      <TopBar
        title="我的日常"
        subtitle="生活不必精修，也值得被记住"
        back
        right={
          <button className="topbar-icon-text" onClick={onCompose}>
            <PenLine size={15} />
            发布
          </button>
        }
      />

      <section className="my-posts-summary">
        <div>
          <strong>{myPosts.length}</strong>
          <span>条日常</span>
        </div>
        <div>
          <strong>{likes}</strong>
          <span>次喜欢</span>
        </div>
        <div>
          <strong>{comments}</strong>
          <span>条回应</span>
        </div>
        <span className="my-posts-summary-deco">❋</span>
      </section>

      <div className="my-posts-filters">
        {filters.map((f) => (
          <button
            key={f.value}
            className={cn(filter === f.value && 'is-active')}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
            {f.value !== 'all' && <span>{myPosts.filter((p) => p.visibility === f.value).length}</span>}
          </button>
        ))}
      </div>

      {posts.length === 0 ? (
        <EmptyState
          emoji="🌱"
          title={myPosts.length === 0 ? '还没有发布过日常' : '这个可见范围下还没有内容'}
          description={myPosts.length === 0 ? '记录一张照片、一句话，或今天一个很小的瞬间。' : '切换其他可见范围看看吧。'}
          action={
            <Button size="sm" onClick={onCompose}>
              <Feather size={15} />
              写一条日常
            </Button>
          }
        />
      ) : (
        <div className="my-posts-feed">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <div className="my-posts-note">
        <Sparkles size={14} />
        <p>你可以在每条日常右上角管理可见范围或删除。选择「部分人可见」的日常，只有被选中的朋友能在广场看到。</p>
      </div>

      {posts.length > 0 && (
        <button className="my-posts-more" onClick={() => nav.switchTab('square')}>
          <Heart size={14} />
          去看看广场上的其他生活
          <MessageCircle size={14} />
        </button>
      )}
    </div>
  )
}
