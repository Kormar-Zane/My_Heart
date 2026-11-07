import { ArrowLeft, Clock, MapPin, Phone, Share2, ShieldCheck, Star } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Artwork } from '../components/Artwork'
import { CounselorCard } from '../components/CounselorCard'
import { Tag } from '../components/UI'
import { cn } from '../utils'

export function InstitutionDetailScreen({ id }: { id: string }) {
  const { state, showToast } = useStore()
  const nav = useNav()
  const institution = state.institutions.find((i) => i.id === id)
  if (!institution) return null
  const counselors = state.counselors.filter((c) => institution.counselorIds.includes(c.id))
  const gallery = [institution.art, 'window', 'desk']

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(institution.address)
      showToast('机构地址已复制')
    } catch {
      showToast('地址复制失败', 'info')
    }
  }

  return (
    <div className="page institution-detail-page">
      <section className="institution-hero">
        <div className="institution-hero-art">
          <Artwork variant={institution.art} />
        </div>
        <div className="institution-hero-shade" />
        <header className="profile-hero-bar">
          <button onClick={nav.back} aria-label="返回" className="hero-icon-button light">
            <ArrowLeft size={21} />
          </button>
          <button onClick={copyAddress} aria-label="分享地址" className="hero-icon-button light">
            <Share2 size={19} />
          </button>
        </header>
        <div className="institution-hero-copy">
          <span className="eyebrow eyebrow-light">观心合作机构</span>
          <h1>{institution.name}</h1>
          <div className="institution-hero-meta">
            <span>
              <Star size={13} fill="currentColor" /> {institution.rating.toFixed(1)}
            </span>
            <span>
              <MapPin size={13} />
              {institution.city} · {institution.district}
            </span>
          </div>
        </div>
      </section>

      <div className="detail-sheet institution-sheet">
        <div className="institution-info-card">
          <div className="institution-address-row">
            <span className="institution-info-icon">
              <MapPin size={18} />
            </span>
            <div>
              <small>地址</small>
              <strong>{institution.address}</strong>
            </div>
            <button onClick={copyAddress}>复制</button>
          </div>
          <div className="institution-info-divider" />
          <div className="institution-info-grid">
            <div>
              <Clock size={15} />
              <span>
                <small>营业时间</small>
                {institution.hours}
              </span>
            </div>
            <div>
              <Phone size={15} />
              <span>
                <small>联系电话</small>
                {institution.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-tags institution-tags">
          {institution.tags.map((t) => (
            <Tag key={t} tone="sage">
              {t}
            </Tag>
          ))}
        </div>

        <section className="detail-section">
          <h2>关于这里</h2>
          <p className="detail-paragraph">{institution.intro}</p>
        </section>

        <section className="detail-section">
          <h2>空间一角</h2>
          <div className="institution-gallery">
            {gallery.map((art, i) => (
              <div key={`${art}-${i}`} className={cn('institution-gallery-item', i === 0 && 'is-large')}>
                <Artwork variant={art} />
              </div>
            ))}
          </div>
          <div className="institution-gallery-note">图片为空间氛围示意，具体以现场为准</div>
        </section>

        <section className="detail-section">
          <h2>在这里的咨询师</h2>
          <div className="counselor-list">
            {counselors.map((c) => (
              <CounselorCard key={c.id} counselor={c} />
            ))}
          </div>
        </section>

        <div className="institution-actions">
          <button
            className="btn btn-secondary"
            onClick={() => showToast('演示版本未接入地图，地址已可复制', 'info')}
          >
            <MapPin size={16} />
            查看路线
          </button>
          <button className="btn btn-primary" onClick={() => showToast('请选择下方咨询师进行预约', 'info')}>
            预约到店
          </button>
        </div>

        <div className="profile-safety-note">
          <ShieldCheck size={15} />
          机构信息由观心团队实地核验，如遇收费异常请及时联系客服
        </div>
      </div>
    </div>
  )
}
