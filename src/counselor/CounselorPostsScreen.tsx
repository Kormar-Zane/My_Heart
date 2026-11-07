import { useState } from 'react'
import {
  Globe2,
  Heart,
  MessageCircle,
  MoreHorizontal,
  PenLine,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useStore } from '../store'
import { useCounselorNav } from './navigation'
import { Artwork } from '../components/Artwork'
import { Avatar } from '../components/Avatar'
import { Button, Sheet } from '../components/UI'
import { CounselorTopBar } from './components'
import type { Post } from '../types'
import { formatDateCN, formatTimeAgo } from '../utils'

export function CounselorPostsScreen({ onPublish }: { onPublish: () => void }) {
  const { state, currentCounselorAccount, deletePost, showToast } = useStore()
  const nav = useCounselorNav()
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null)
  if (!currentCounselorAccount) return null
  const posts = state.posts
    .filter((post) => post.authorId === currentCounselorAccount.counselorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const likes = posts.reduce((sum, post) => sum + post.likes, 0)
  const comments = posts.reduce((sum, post) => sum + post.comments.length, 0)

  return (
    <div className="page ca-page ca-posts-page">
      <CounselorTopBar
        title="我的日常"
        subtitle="专业之外，也有真实的生活"
        back
        right={
          <button className="ca-topbar-button" onClick={onPublish}>
            <PenLine size={14} />
            发布
          </button>
        }
      />

      <section className="ca-posts-summary">
        <div>
          <strong>{posts.length}</strong>
          <span>篇分享</span>
        </div>
        <span />
        <div>
          <strong>{likes}</strong>
          <span>次喜欢</span>
        </div>
        <span />
        <div>
          <strong>{comments}</strong>
          <span>条回应</span>
        </div>
        <em>公开在用户端广场</em>
      </section>

      {posts.length === 0 ? (
        <div className="ca-posts-empty">
          <span>“</span>
          <h2>还没有分享过日常</h2>
          <p>一段话、一张照片，都可能成为某个人今天的微光。</p>
          <Button onClick={onPublish}>
            <PenLine size={15} />
            写第一篇
          </Button>
        </div>
      ) : (
        <div className="ca-post-list">
          {posts.map((post) => (
            <article className="ca-post-card" key={post.id}>
              <div className="ca-post-head">
                <Avatar variant={currentCounselorAccount.avatar} name={currentCounselorAccount.name} size={38} />
                <div>
                  <strong>{currentCounselorAccount.name}</strong>
                  <span>
                    {formatTimeAgo(post.createdAt)} · <Globe2 size={10} /> 公开
                  </span>
                </div>
                <button onClick={() => setDeleteTarget(post)} aria-label="管理日常">
                  <MoreHorizontal size={18} />
                </button>
              </div>
              <p className="ca-post-content">{post.content}</p>
              {post.images.length > 0 && (
                <div className={`ca-post-media ca-post-media-${Math.min(post.images.length, 3)}`}>
                  {post.images.slice(0, 3).map((image, index) => (
                    <div key={`${image.slice(0, 24)}-${index}`}>
                      {image.startsWith('art:') ? <Artwork variant={image.slice(4)} /> : <img src={image} alt="日常配图" />}
                    </div>
                  ))}
                </div>
              )}
              <div className="ca-post-actions">
                <span>
                  <Heart size={15} /> {post.likes}
                </span>
                <span>
                  <MessageCircle size={15} /> {post.comments.length}
                </span>
                <span className="ca-post-date">{formatDateCN(post.createdAt)}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="ca-posts-note">
        <Sparkles size={13} />
        你的日常会以「认证心理咨询师」身份展示。发布前请确认不包含来访者可识别信息。
      </div>

      {posts.length > 0 && (
        <button className="ca-posts-back-live" onClick={() => nav.switchTab('home')}>
          回到工作台
          <ArrowRightIcon />
        </button>
      )}

      <Sheet open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="管理这条日常">
        <button
          className="ca-post-delete"
          onClick={() => {
            if (deleteTarget) {
              deletePost(deleteTarget.id)
              setDeleteTarget(null)
              showToast('日常已删除', 'info')
            }
          }}
        >
          <Trash2 size={17} />
          删除这条日常
        </button>
        <button className="ca-post-cancel" onClick={() => setDeleteTarget(null)}>
          取消
        </button>
      </Sheet>
    </div>
  )
}

function ArrowRightIcon() {
  return <span>→</span>
}
