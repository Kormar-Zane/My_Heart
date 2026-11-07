import { useState } from 'react'
import {
  Globe2,
  Heart,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
  Trash2,
  UserRoundCheck,
  UsersRound,
  X,
} from 'lucide-react'
import type { Post, Visibility } from '../types'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { cn, formatTimeAgo, getInitials } from '../utils'
import { Avatar } from './Avatar'
import { Artwork } from './Artwork'
import { Button, IconButton, Sheet } from './UI'

export const visibilityMeta: Record<Visibility, { label: string; icon: typeof Globe2 }> = {
  public: { label: '公开', icon: Globe2 },
  friends: { label: '朋友可见', icon: UsersRound },
  partial: { label: '部分人可见', icon: UserRoundCheck },
  private: { label: '仅自己可见', icon: Lock },
}

function PostMedia({ post }: { post: Post }) {
  if (post.videoUrl) {
    return (
      <div className="post-video">
        <video src={post.videoUrl} controls playsInline preload="metadata" />
        <span className="post-video-label">视频</span>
      </div>
    )
  }
  if (post.images.length === 0) return null
  return (
    <div className={cn('post-media', `post-media-${Math.min(post.images.length, 3)}`)}>
      {post.images.slice(0, 3).map((image, index) => (
        <div className="post-media-item" key={`${image.slice(0, 24)}-${index}`}>
          {image.startsWith('art:') ? (
            <Artwork variant={image.slice(4)} />
          ) : (
            <img src={image} alt={`日常配图 ${index + 1}`} />
          )}
          {index === 2 && post.images.length > 3 && <span className="post-media-more">+{post.images.length - 3}</span>}
        </div>
      ))}
    </div>
  )
}

export function PostCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  const { currentUser, toggleLike, addComment, deletePost, showToast } = useStore()
  const nav = useNav()
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [comment, setComment] = useState('')
  const liked = post.likedBy.includes(currentUser?.id ?? '')
  const isOwn = post.authorId === currentUser?.id
  const VisIcon = visibilityMeta[post.visibility].icon

  const openAuthor = () => {
    if (post.authorType === 'counselor') nav.navigate({ name: 'counselor', id: post.authorId })
    else if (isOwn) nav.switchTab('me')
  }

  const share = async () => {
    const text = `${post.authorName}在观心广场分享：${post.content.slice(0, 40)}…`
    try {
      if (navigator.share) await navigator.share({ title: '观心 · 广场', text })
      else {
        await navigator.clipboard.writeText(text)
        showToast('内容摘要已复制')
      }
    } catch {
      showToast('分享已取消', 'info')
    }
  }

  const submitComment = () => {
    if (!comment.trim()) return
    addComment(post.id, comment)
    setComment('')
  }

  return (
    <article className={cn('post-card', compact && 'post-card-compact')}>
      <div className="post-head">
        <button className="post-author" onClick={openAuthor}>
          <Avatar variant={post.authorAvatar} name={post.authorName} size={42} />
          <span className="post-author-meta">
            <span className="post-author-line">
              <strong>{post.authorName}</strong>
              {post.authorType === 'counselor' && <span className="verified-mark">✓</span>}
              {post.authorType === 'official' && <span className="official-mark">官方</span>}
            </span>
            <span className="post-meta-line">
              <span>{formatTimeAgo(post.createdAt)}</span>
              {post.authorTag && <span>{post.authorTag}</span>}
              {isOwn && (
                <span className="post-visibility">
                  <VisIcon size={11} />
                  {visibilityMeta[post.visibility].label}
                </span>
              )}
            </span>
          </span>
        </button>
        {isOwn ? (
          <IconButton label="更多" className="post-more" onClick={() => setMenuOpen(true)}>
            <MoreHorizontal size={19} />
          </IconButton>
        ) : (
          <span className="post-header-dot" />
        )}
      </div>

      <p className="post-content">{post.content}</p>
      <PostMedia post={post} />

      <div className="post-actions">
        <button className={cn('post-action', liked && 'is-liked')} onClick={() => toggleLike(post.id)}>
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} strokeWidth={1.8} />
          <span>{post.likes || '喜欢'}</span>
        </button>
        <button className="post-action" onClick={() => setCommentsOpen(true)}>
          <MessageCircle size={18} strokeWidth={1.8} />
          <span>{post.comments.length || '评论'}</span>
        </button>
        <button className="post-action post-action-share" onClick={share}>
          <Share2 size={17} strokeWidth={1.8} />
        </button>
      </div>

      {post.comments.length > 0 && (
        <button className="post-comment-preview" onClick={() => setCommentsOpen(true)}>
          {post.comments.slice(-2).map((c) => (
            <span key={c.id}>
              <strong>{c.authorName}：</strong>
              {c.content}
            </span>
          ))}
          {post.comments.length > 2 && <em>查看全部 {post.comments.length} 条评论</em>}
        </button>
      )}

      <Sheet
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        title="评论"
        subtitle={`${post.comments.length} 条温暖的回应`}
        footer={
          <div className="comment-composer">
            <Avatar variant={currentUser?.avatar} size={32} />
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitComment()
              }}
              placeholder="写下你的回应…"
              aria-label="评论内容"
            />
            <button className="comment-send" onClick={submitComment} disabled={!comment.trim()} aria-label="发送评论">
              <Send size={17} />
            </button>
          </div>
        }
      >
        <div className="comment-list">
          {post.comments.length === 0 ? (
            <div className="comment-empty">
              <span>🌱</span>
              <p>还没有评论，来做第一个回应的人吧。</p>
            </div>
          ) : (
            post.comments.map((c) => (
              <div className="comment-item" key={c.id}>
                <Avatar variant={c.authorAvatar} name={c.authorName} size={34} />
                <div>
                  <div className="comment-author">{c.authorName}</div>
                  <p>{c.content}</p>
                  <span className="comment-time">{formatTimeAgo(c.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Sheet>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="这条日常">
        <button
          className="sheet-action danger"
          onClick={() => {
            deletePost(post.id)
            setMenuOpen(false)
          }}
        >
          <Trash2 size={18} />
          删除这条日常
        </button>
        <button className="sheet-action" onClick={() => setMenuOpen(false)}>
          <X size={18} />
          取消
        </button>
      </Sheet>
    </article>
  )
}
