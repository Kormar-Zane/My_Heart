import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Bot,
  Building2,
  CalendarDays,
  ChevronRight,
  MapPin,
  Play,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Avatar } from '../components/Avatar'
import { Artwork } from '../components/Artwork'
import { CounselorCard } from '../components/CounselorCard'
import { EmptyState, RegionSheet, SectionHead, Tag, TopBar } from '../components/UI'
import { cn, regionLabel } from '../utils'

const specialtyFilters = ['全部', '情绪压力', '亲密关系', '自我成长', '焦虑抑郁', '职场']

export function CounselingScreen() {
  const { currentUser, state, updateProfile } = useStore()
  const nav = useNav()
  const [regionOpen, setRegionOpen] = useState(false)
  const [scope, setScope] = useState<'nearby' | 'all'>('nearby')
  const [specialty, setSpecialty] = useState('全部')

  const nearby = useMemo(() => {
    if (!currentUser) return state.counselors
    return state.counselors.filter(
      (c) => c.city === currentUser.region.city || c.district === currentUser.region.district,
    )
  }, [currentUser, state.counselors])

  const base = scope === 'nearby' ? nearby : state.counselors
  const counselors = base.filter((c) => specialty === '全部' || c.specialties.some((s) => s.includes(specialty)))

  const institutions = state.institutions.filter(
    (i) => scope === 'all' || i.city === currentUser?.region.city || i.district === currentUser?.region.district,
  )
  const liveSessions = [...state.lives].sort((a, b) => (a.status === 'live' ? -1 : 1) - (b.status === 'live' ? -1 : 1)).slice(0, 3)

  return (
    <div className="page counseling-page">
      <TopBar
        title="心理咨询"
        back
        right={
          <button className="topbar-text-button" onClick={() => nav.navigate({ name: 'bookings' })}>
            <CalendarDays size={16} />
            我的预约
          </button>
        }
      />

      <section className="counseling-hero">
        <div className="counseling-hero-orbit" />
        <div className="counseling-hero-copy">
          <span className="eyebrow">
            <ShieldCheck size={13} />
            专业 · 保密 · 被看见
          </span>
          <h1>
            你可以，
            <br />
            不必一个人扛着。
          </h1>
          <p>让专业的人，陪你走过这一段。所有咨询师均经过资质审核。</p>
        </div>
        <div className="counseling-hero-faces">
          {['lin', 'shen', 'su'].map((v, i) => (
            <span key={v} style={{ zIndex: 3 - i }}>
              <Avatar variant={v} size={48} />
            </span>
          ))}
          <span className="counseling-face-note">8 位咨询师</span>
        </div>
        <span className="counseling-hero-mark">❋</span>
      </section>

      <button className="ai-entry-card" onClick={() => nav.navigate({ name: 'ai' })}>
        <div className="ai-entry-orb">
          <Bot size={25} strokeWidth={1.6} />
          <span />
        </div>
        <div className="ai-entry-copy">
          <div className="ai-entry-title">
            <strong>AI 心情匹配</strong>
            <Tag tone="gold">3 分钟</Tag>
          </div>
          <p>聊几句，让我们帮你找到更合适的咨询师</p>
        </div>
        <span className="ai-entry-arrow">
          <ArrowRight size={18} />
        </span>
      </button>

      <div className="feature-tiles">
        <button className="feature-tile feature-tile-live" onClick={() => nav.navigate({ name: 'lives' })}>
          <span className="feature-tile-icon">
            <Radio size={20} />
          </span>
          <strong>免费直播</strong>
          <small>{state.lives.filter((l) => l.status === 'live').length} 场正在进行</small>
          <span className="feature-tile-badge">
            <span className="live-dot" /> LIVE
          </span>
        </button>
        <button
          className="feature-tile feature-tile-inst"
          onClick={() => {
            setScope('nearby')
            document.getElementById('institution-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
        >
          <span className="feature-tile-icon">
            <Building2 size={20} />
          </span>
          <strong>附近机构</strong>
          <small>{institutions.length} 家在你身边</small>
          <span className="feature-tile-decoration" />
        </button>
      </div>

      <section className="region-filter-row">
        <button className="region-filter" onClick={() => setRegionOpen(true)}>
          <MapPin size={14} />
          <span>{regionLabel(currentUser?.region)}</span>
          <ChevronRight size={13} />
        </button>
        <div className="scope-toggle">
          <button className={cn(scope === 'nearby' && 'is-active')} onClick={() => setScope('nearby')}>
            附近
          </button>
          <button className={cn(scope === 'all' && 'is-active')} onClick={() => setScope('all')}>
            全部
          </button>
        </div>
      </section>

      <SectionHead
        title={scope === 'nearby' ? '身边的咨询师' : '全部咨询师'}
        subtitle={`${counselors.length} 位符合筛选 · 资料已审核`}
        action={
          <button className="section-text-link" onClick={() => setScope(scope === 'nearby' ? 'all' : 'nearby')}>
            {scope === 'nearby' ? '查看全部' : '只看附近'}
            <ChevronRight size={14} />
          </button>
        }
      />

      <div className="filter-chips">
        {specialtyFilters.map((chip) => (
          <button
            key={chip}
            className={cn('filter-chip', specialty === chip && 'is-active')}
            onClick={() => setSpecialty(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="counselor-list">
        {counselors.length === 0 ? (
          <EmptyState
            emoji="🍃"
            title="附近暂时没有匹配的咨询师"
            description="可以切换「全部」看看线上咨询，或换一个擅长方向。"
            action={
              <button className="text-button" onClick={() => setScope('all')}>
                查看全部咨询师
              </button>
            }
          />
        ) : (
          counselors.map((c) => <CounselorCard key={c.id} counselor={c} />)
        )}
      </div>

      <section className="live-preview-section">
        <SectionHead
          title="免费直播"
          subtitle="咨询师在这里分享心理学知识与生活"
          action={
            <button className="section-text-link" onClick={() => nav.navigate({ name: 'lives' })}>
              全部
              <ChevronRight size={14} />
            </button>
          }
        />
        <div className="live-horizontal">
          {liveSessions.map((live) => (
            <button key={live.id} className="live-mini-card" onClick={() => nav.navigate({ name: 'live', id: live.id })}>
              <div className="live-mini-art">
                <Artwork variant={live.art} />
                <span className={cn('live-status-pill', live.status)}>
                  {live.status === 'live' ? (
                    <>
                      <span className="live-dot" /> 直播中
                    </>
                  ) : (
                    '即将开始'
                  )}
                </span>
                <span className="live-mini-play">
                  <Play size={13} fill="currentColor" />
                </span>
              </div>
              <div className="live-mini-body">
                <strong>{live.title}</strong>
                <div className="live-mini-meta">
                  <Avatar variant={live.hostAvatar} size={20} />
                  <span>{live.hostName}</span>
                  <span className="live-mini-viewers">
                    <Users size={11} />
                    {live.status === 'live' ? live.viewers.toLocaleString() : '预约'}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="institution-section" id="institution-section">
        <SectionHead title="附近咨询机构" subtitle="线下空间 · 可预约参观" />
        <div className="institution-grid">
          {institutions.length === 0 ? (
            <EmptyState emoji="🏡" title="这个地区暂时没有收录机构" description="可以切换到全部地区，或查看线上咨询。" />
          ) : (
            institutions.map((inst) => (
              <button
                key={inst.id}
                className="institution-card"
                onClick={() => nav.navigate({ name: 'institution', id: inst.id })}
              >
                <div className="institution-art">
                  <Artwork variant={inst.art} />
                  <span className="institution-rating">★ {inst.rating.toFixed(1)}</span>
                </div>
                <div className="institution-card-body">
                  <strong>{inst.name}</strong>
                  <p>
                    <MapPin size={11} />
                    {inst.city} · {inst.district}
                  </p>
                  <div className="institution-tags">
                    {inst.tags.slice(0, 2).map((t) => (
                      <Tag key={t} tone="outline">
                        {t}
                      </Tag>
                    ))}
                  </div>
                  <span className="institution-counselors">
                    <Users size={12} />
                    {inst.counselorIds.length} 位咨询师
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      <p className="counseling-disclaimer">
        <Sparkles size={13} />
        观心推荐仅供参考，是否选择咨询师由你决定。若你正处于紧急危机中，请优先联系当地急救或心理援助热线。
      </p>

      <RegionSheet
        open={regionOpen}
        onClose={() => setRegionOpen(false)}
        value={currentUser?.region ?? { province: '浙江省', city: '杭州', district: '西湖区' }}
        onConfirm={(region) => {
          updateProfile({ region })
          setScope('nearby')
        }}
      />
    </div>
  )
}
