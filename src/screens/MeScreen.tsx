import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Crown,
  Flower2,
  Gift,
  Grid3X3,
  Heart,
  MapPin,
  Settings as SettingsIcon,
  Shirt,
  Sparkles,
} from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Avatar } from '../components/Avatar'
import { Artwork } from '../components/Artwork'
import { FlowerPill } from '../components/UI'
import { BADGES } from '../theme'
import { activeVipTier, cn, formatDateCN, guanxinId, isVipActive, regionLabel, vipName } from '../utils'

export function MeScreen() {
  const { state, currentUser } = useStore()
  const nav = useNav()
  if (!currentUser) return null

  const myPosts = state.posts.filter((p) => p.authorId === currentUser.id)
  const upcoming = state.bookings.filter((b) => b.status === 'upcoming')
  const likedCount = myPosts.reduce((sum, p) => sum + p.likes, 0)
  const badge = currentUser.equippedBadge ? BADGES[currentUser.equippedBadge] : null
  const vip = isVipActive(currentUser)
  const tier = activeVipTier(currentUser)
  const remainingDays = currentUser.vipExpiresAt
    ? Math.max(0, Math.ceil((new Date(currentUser.vipExpiresAt).getTime() - Date.now()) / 86400_000))
    : 0

  const joinDays = Math.max(1, Math.ceil((Date.now() - new Date(currentUser.createdAt).getTime()) / 86400_000))

  return (
    <div className="page me-page">
      <section className="me-hero">
        <div className="me-hero-glow" />
        <div className="me-hero-orbit" />
        <header className="me-topbar">
          <span className="me-topbar-brand">我的观心</span>
          <div className="me-topbar-actions">
            <FlowerPill count={currentUser.flowers} onClick={() => nav.navigate({ name: 'shop' })} />
            <button onClick={() => nav.navigate({ name: 'settings' })} aria-label="设置" className="me-settings-button">
              <SettingsIcon size={19} />
            </button>
          </div>
        </header>

        <div className="me-profile">
          <button className="me-avatar-button" onClick={() => nav.navigate({ name: 'dressup' })}>
            <Avatar
              variant={currentUser.avatar}
              name={currentUser.nickname}
              size={92}
              frame={currentUser.equippedFrame}
              online
            />
            <span className="me-avatar-edit">
              <Sparkles size={12} />
            </span>
          </button>
          <div className="me-profile-copy">
            <div className="me-name-line">
              <h1>{currentUser.nickname}</h1>
              {vip && (
                <span className={cn('me-vip-tag', `tier-${tier}`)}>
                  <Crown size={11} />
                  {vipName(tier)}
                </span>
              )}
              {badge && <span className="me-badge-tag">{badge.emoji} {badge.name}</span>}
            </div>
            <p className="me-handle">观心号 {guanxinId(currentUser.id)}</p>
            <p className="me-bio">{currentUser.bio}</p>
            <div className="me-meta">
              <span>
                <MapPin size={12} />
                {regionLabel(currentUser.region)}
              </span>
              <span>{currentUser.age} 岁</span>
              <span>在观心第 {joinDays} 天</span>
            </div>
          </div>
          <button className="me-edit-button" onClick={() => nav.navigate({ name: 'edit-profile' })}>
            编辑资料
          </button>
        </div>

        <div className="me-stats">
          <button onClick={() => nav.navigate({ name: 'connections', kind: 'following' })}>
            <strong>{currentUser.followingUserIds.length}</strong>
            <span>关注</span>
          </button>
          <span className="me-stat-divider" />
          <button onClick={() => nav.navigate({ name: 'connections', kind: 'friends' })}>
            <strong>{currentUser.friendIds.length}</strong>
            <span>朋友</span>
          </button>
          <span className="me-stat-divider" />
          <button onClick={() => nav.navigate({ name: 'connections', kind: 'counselors' })}>
            <strong>{currentUser.followingCounselorIds.length}</strong>
            <span>咨询师</span>
          </button>
          <span className="me-stat-divider" />
          <button onClick={() => nav.navigate({ name: 'my-posts' })}>
            <strong>{likedCount}</strong>
            <span>获赞</span>
          </button>
        </div>
      </section>

      <div className="me-body">
        <button className="me-vip-banner" onClick={() => nav.navigate({ name: 'vip' })}>
          <div className="me-vip-left">
            <span className="me-vip-crown">
              <Crown size={21} />
            </span>
            <div>
              <strong>{vip ? `${vipName(tier)} · 还剩 ${remainingDays} 天` : '开通观心 VIP'}</strong>
              <p>{vip ? '连麦、咨询折扣、专属装扮正在生效' : '连麦机会 · 咨询折扣 · 专属装扮'}</p>
            </div>
          </div>
          <span className="me-vip-action">
            {vip ? '查看权益' : '了解'}
            <ChevronRight size={14} />
          </span>
          <span className="me-vip-decoration">✦</span>
        </button>

        <div className="me-quick-cards">
          <button className="me-quick-card flower" onClick={() => nav.navigate({ name: 'shop' })}>
            <span className="me-quick-icon">
              <Flower2 size={20} />
            </span>
            <div>
              <strong>{currentUser.flowers}</strong>
              <span>小红花</span>
            </div>
            <ArrowUpRight size={14} />
          </button>
          <button className="me-quick-card booking" onClick={() => nav.navigate({ name: 'bookings' })}>
            <span className="me-quick-icon">
              <CalendarDays size={20} />
            </span>
            <div>
              <strong>{upcoming.length}</strong>
              <span>待赴约</span>
            </div>
            <ArrowUpRight size={14} />
          </button>
          <button className="me-quick-card friend" onClick={() => nav.navigate({ name: 'chat' })}>
            <span className="me-quick-icon">
              <Heart size={20} />
            </span>
            <div>
              <strong>{currentUser.friendIds.length}</strong>
              <span>朋友</span>
            </div>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="me-menu-grid">
          <button onClick={() => nav.navigate({ name: 'dressup' })} className="me-menu-item">
            <span className="me-menu-icon tone-peach">
              <Shirt size={20} />
            </span>
            <strong>装扮中心</strong>
            <small>头像框 · 徽章</small>
          </button>
          <button onClick={() => nav.navigate({ name: 'vip' })} className="me-menu-item">
            <span className="me-menu-icon tone-gold">
              <Crown size={20} />
            </span>
            <strong>VIP 中心</strong>
            <small>{vip ? '会员权益' : '解锁更多陪伴'}</small>
          </button>
          <button onClick={() => nav.navigate({ name: 'shop' })} className="me-menu-item">
            <span className="me-menu-icon tone-sage">
              <Gift size={20} />
            </span>
            <strong>礼物商店</strong>
            <small>周边 · 限定装扮</small>
          </button>
          <button onClick={() => nav.navigate({ name: 'bookings' })} className="me-menu-item">
            <span className="me-menu-icon tone-blue">
              <CalendarDays size={20} />
            </span>
            <strong>我的预约</strong>
            <small>{upcoming.length} 个待赴约</small>
          </button>
        </div>

        <section className="me-posts-section">
          <div className="me-section-head">
            <div>
              <h2>我的日常</h2>
              <p>{myPosts.length} 条记录 · 仅按你的设置展示</p>
            </div>
            <button onClick={() => nav.navigate({ name: 'my-posts' })}>
              全部
              <ChevronRight size={14} />
            </button>
          </div>

          {myPosts.length === 0 ? (
            <button className="me-posts-empty" onClick={() => nav.switchTab('square')}>
              <span>🌱</span>
              <div>
                <strong>还没有发布过日常</strong>
                <p>去广场记录一个此刻吧</p>
              </div>
              <ChevronRight size={16} />
            </button>
          ) : (
            <div className="me-post-grid">
              {myPosts.slice(0, 3).map((post) => (
                <button key={post.id} className="me-post-tile" onClick={() => nav.navigate({ name: 'my-posts' })}>
                  {post.images[0] ? (
                    post.images[0].startsWith('art:') ? (
                      <Artwork variant={post.images[0].slice(4)} />
                    ) : (
                      <img src={post.images[0]} alt="日常配图" />
                    )
                  ) : post.videoUrl ? (
                    <div className="me-post-video">
                      <span>▶</span>
                      <small>视频</small>
                    </div>
                  ) : (
                    <div className="me-post-text">
                      <p>{post.content}</p>
                    </div>
                  )}
                  <span className="me-post-date">{formatDateCN(post.createdAt)}</span>
                </button>
              ))}
              {Array.from({ length: Math.max(0, 3 - myPosts.length) }).map((_, i) => (
                <button className="me-post-add" key={`add-${i}`} onClick={() => nav.switchTab('square')}>
                  <span>＋</span>
                  <small>记录此刻</small>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="me-following">
          <div className="me-section-head">
            <div>
              <h2>关注的咨询师</h2>
              <p>他们一直在你身边</p>
            </div>
            <button onClick={() => nav.navigate({ name: 'connections', kind: 'counselors' })}>
              全部
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="me-counselor-row">
            {state.counselors
              .filter((c) => currentUser.followingCounselorIds.includes(c.id))
              .map((c) => (
                <button key={c.id} className="me-counselor" onClick={() => nav.navigate({ name: 'counselor', id: c.id })}>
                  <Avatar variant={c.avatar} name={c.name} size={52} online={c.online} />
                  <strong>{c.name}</strong>
                  <small>{c.specialties[0]}</small>
                </button>
              ))}
            <button className="me-counselor me-counselor-more" onClick={() => nav.navigate({ name: 'counseling' })}>
              <span className="me-counselor-plus">＋</span>
              <strong>发现更多</strong>
              <small>专业陪伴</small>
            </button>
          </div>
        </section>

        <button className="me-invite" onClick={() => nav.navigate({ name: 'settings' })}>
          <Grid3X3 size={16} />
          <span>观心用户端 · 内测版本 v1.0</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
