import { ArrowLeft, BadgeCheck, CalendarDays, Heart, MapPin, MessageCircle, Share2, ShieldCheck, Star, Users } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Avatar } from '../components/Avatar'
import { Artwork } from '../components/Artwork'
import { Rating, Tag } from '../components/UI'
import { activeVipTier, cn, formatPrice, vipDiscount } from '../utils'

const formatLabels = { video: '视频咨询', voice: '语音咨询', inperson: '面对面' }

export function CounselorDetailScreen({ id }: { id: string }) {
  const { state, currentUser, followCounselor, ensureCounselorConversation, showToast } = useStore()
  const nav = useNav()
  const counselor = state.counselors.find((c) => c.id === id)
  if (!counselor) return null
  const institution = state.institutions.find((i) => i.id === counselor.institutionId)
  const following = currentUser?.followingCounselorIds.includes(counselor.id) ?? false
  const vipTier = activeVipTier(currentUser)
  const discount = vipDiscount(vipTier)
  const vipPrice = Math.round(counselor.price * discount)

  const openChat = () => {
    const conversationId = ensureCounselorConversation(counselor)
    nav.navigate({ name: 'conversation', id: conversationId })
  }

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`观心 · ${counselor.name}｜${counselor.title}｜${counselor.city}${counselor.district}`)
      showToast('咨询师名片已复制')
    } catch {
      showToast('暂时无法分享', 'info')
    }
  }

  return (
    <div className="page counselor-detail-page">
      <section className="counselor-profile-hero">
        <div className="profile-hero-bg">
          <Artwork variant="garden" />
        </div>
        <div className="profile-hero-orb profile-hero-orb-1" />
        <div className="profile-hero-orb profile-hero-orb-2" />
        <header className="profile-hero-bar">
          <button onClick={nav.back} aria-label="返回" className="hero-icon-button">
            <ArrowLeft size={21} />
          </button>
          <div className="profile-hero-bar-right">
            <button onClick={share} aria-label="分享" className="hero-icon-button">
              <Share2 size={19} />
            </button>
          </div>
        </header>
        <div className="profile-hero-main">
          <div className="profile-avatar-wrap">
            <Avatar variant={counselor.avatar} name={counselor.name} size={104} />
            {counselor.online && <span className="profile-online">在线</span>}
          </div>
          <div className="profile-simple">
            <span className="profile-eyebrow">观心认证咨询师</span>
            <div className="profile-name-row">
              <h1>{counselor.name}</h1>
              <BadgeCheck size={19} />
            </div>
            <p>{counselor.title}</p>
            <div className="profile-location">
              <MapPin size={12} />
              {counselor.city} · {counselor.district}
              <span>·</span>
              {counselor.years} 年从业
            </div>
          </div>
          <button className={cn('follow-button', following && 'is-following')} onClick={() => followCounselor(counselor.id)}>
            <Heart size={14} fill={following ? 'currentColor' : 'none'} />
            {following ? '已关注' : '关注'}
          </button>
        </div>
        <div className="profile-stat-strip">
          <div>
            <strong>{counselor.rating.toFixed(1)}</strong>
            <span>
              <Star size={10} fill="currentColor" /> 来访评分
            </span>
          </div>
          <span className="stat-divider" />
          <div>
            <strong>{counselor.sessions.toLocaleString()}</strong>
            <span>次陪伴</span>
          </div>
          <span className="stat-divider" />
          <div>
            <strong>{counselor.years}</strong>
            <span>年经验</span>
          </div>
          <span className="stat-divider" />
          <div>
            <strong>{counselor.formats.length}</strong>
            <span>种方式</span>
          </div>
        </div>
      </section>

      <div className="detail-sheet">
        <div className="profile-quote">
          <span>“</span>
          <p>{counselor.quote}</p>
        </div>

        <div className="profile-tags">
          {counselor.tags.map((tag) => (
            <Tag key={tag} tone="outline">
              {tag}
            </Tag>
          ))}
        </div>

        <section className="detail-section">
          <h2>关于我</h2>
          <p className="detail-paragraph">{counselor.intro}</p>
        </section>

        <section className="detail-section">
          <h2>擅长领域</h2>
          <div className="specialty-list">
            {counselor.specialties.map((s, i) => (
              <div className="specialty-item" key={s}>
                <span className="specialty-num">0{i + 1}</span>
                <strong>{s}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="detail-section">
          <h2>咨询方式</h2>
          <div className="format-list">
            {counselor.formats.map((f) => (
              <div className="format-item" key={f}>
                <span>{f === 'inperson' ? '🏡' : f === 'video' ? '📹' : '🎧'}</span>
                <div>
                  <strong>{formatLabels[f]}</strong>
                  <small>
                    {f === 'inperson' ? `${counselor.city} · ${institution?.name ?? '咨询室'}` : '线上进行 · 50 分钟'}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="detail-section">
          <div className="review-head">
            <h2>来访者说</h2>
            <Rating value={counselor.review.rating} size={13} />
          </div>
          <blockquote className="review-card">
            <p>{counselor.review.content}</p>
            <footer>— {counselor.review.author}</footer>
          </blockquote>
          <div className="trust-note">
            <ShieldCheck size={14} />
            来访评价经匿名处理，已获得授权展示
          </div>
        </section>

        {institution && (
          <section className="detail-section">
            <h2>所属机构</h2>
            <button className="detail-institution" onClick={() => nav.navigate({ name: 'institution', id: institution.id })}>
              <div className="detail-institution-art">
                <Artwork variant={institution.art} />
              </div>
              <div>
                <strong>{institution.name}</strong>
                <p>
                  <MapPin size={11} />
                  {institution.address}
                </p>
                <span>
                  <Users size={12} />
                  {institution.counselorIds.length} 位咨询师
                </span>
              </div>
            </button>
          </section>
        )}

        <div className="profile-safety-note">
          <CalendarDays size={15} />
          首次预约可提前 10 分钟进入咨询室，咨询内容严格保密
        </div>
      </div>

      <div className="detail-sticky-bar">
        <div className="detail-price">
          <span>单次咨询</span>
          <strong>
            <small>¥</small>
            {formatPrice(vipPrice)}
          </strong>
          {vipTier !== 'none' && (
            <em>
              VIP {Math.round(discount * 100) / 10} 折 · 原价 ¥{counselor.price}
            </em>
          )}
        </div>
        <button className="detail-chat-button" onClick={openChat}>
          <MessageCircle size={18} />
          聊一聊
        </button>
        <button className="detail-book-button" onClick={() => nav.navigate({ name: 'booking', counselorId: counselor.id })}>
          预约
        </button>
      </div>
    </div>
  )
}
