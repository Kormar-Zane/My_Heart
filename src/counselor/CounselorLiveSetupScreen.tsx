import { useState } from 'react'
import { ArrowRight, Check, Eye, Radio, ShieldCheck, Sparkles, Video } from 'lucide-react'
import { useStore } from '../store'
import { useCounselorNav } from './navigation'
import { Artwork } from '../components/Artwork'
import { Button, Tag } from '../components/UI'
import { CounselorTopBar } from './components'
import { cn } from '../utils'

const covers = [
  { art: 'live_sage', label: '安静绿意' },
  { art: 'live_night', label: '夜航星光' },
  { art: 'live_peach', label: '晚风暖意' },
  { art: 'live_flowers', label: '花间慢谈' },
]

const topicOptions = ['情绪陪伴', '焦虑与压力', '亲密关系', '正念练习', '读书会', '职业成长', '睡眠与身体']

export function CounselorLiveSetupScreen() {
  const { state, currentCounselorAccount, startCounselorLive, showToast } = useStore()
  const nav = useCounselorNav()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>(['情绪陪伴'])
  const [art, setArt] = useState('live_sage')
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)
  if (!currentCounselorAccount) return null

  const activeLive = state.lives.find(
    (live) => live.hostId === currentCounselorAccount.counselorId && live.status === 'live',
  )

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length >= 3 ? prev : [...prev, tag]))
  }

  const start = () => {
    if (!title.trim()) {
      setError('给这场直播起一个标题吧')
      return
    }
    setStarting(true)
    const result = startCounselorLive({ title, description, tags, art })
    setStarting(false)
    if (!result.ok) {
      setError(result.message ?? '开播失败')
      return
    }
    if (result.liveId) {
      if (result.message) showToast(result.message, 'info')
      nav.replace({ name: 'live-room', id: result.liveId })
    }
  }

  return (
    <div className="page ca-page ca-live-setup-page">
      <CounselorTopBar title="开启直播" subtitle="一场自由、真诚的免费分享" back />

      {activeLive && (
        <button className="ca-live-already" onClick={() => nav.navigate({ name: 'live-room', id: activeLive.id })}>
          <Radio size={18} />
          <div>
            <strong>你已经有一场直播正在进行</strong>
            <p>{activeLive.title} · 进入控制台继续</p>
          </div>
          <ArrowRight size={16} />
        </button>
      )}

      <section className="ca-live-setup-hero">
        <div className="ca-live-setup-copy">
          <span className="ca-eyebrow">
            <Sparkles size={13} />
            免费公开直播
          </span>
          <h1>今天想和大家<br /><em>聊点什么？</em></h1>
          <p>直播会展示在用户端「免费直播」中。普通互动为打字，VIP 用户可以申请与你连麦。</p>
        </div>
        <div className="ca-live-setup-art">
          <Artwork variant={art} />
          <span>
            <Eye size={12} /> 公开可见
          </span>
        </div>
      </section>

      <section className="ca-live-form-section">
        <div className="ca-form-section-head">
          <h2>直播标题</h2>
          <span>{title.length} / 40</span>
        </div>
        <div className="ca-live-title-input">
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value.slice(0, 40))
              setError('')
            }}
            placeholder="例如：和焦虑做朋友，把紧绷的身体松一松"
          />
          <span>🎙️</span>
        </div>
      </section>

      <section className="ca-live-form-section">
        <div className="ca-form-section-head">
          <h2>直播主题</h2>
          <span>最多选 3 个</span>
        </div>
        <div className="ca-live-tag-grid">
          {topicOptions.map((tag) => (
            <button
              key={tag}
              className={cn(tags.includes(tag) && 'is-active')}
              onClick={() => toggleTag(tag)}
            >
              {tag}
              {tags.includes(tag) && <Check size={11} />}
            </button>
          ))}
        </div>
      </section>

      <section className="ca-live-form-section">
        <div className="ca-form-section-head">
          <h2>本场简介</h2>
          <span>{description.length} / 160</span>
        </div>
        <textarea
          className="ca-live-textarea"
          value={description}
          onChange={(event) => setDescription(event.target.value.slice(0, 160))}
          rows={4}
          placeholder="你会聊到什么？适合谁来听？给来访者一个温柔的预期。"
        />
      </section>

      <section className="ca-live-form-section">
        <div className="ca-form-section-head">
          <h2>直播封面</h2>
          <span>选择一张心情插画</span>
        </div>
        <div className="ca-live-cover-grid">
          {covers.map((cover) => (
            <button
              key={cover.art}
              className={cn('ca-live-cover', art === cover.art && 'is-active')}
              onClick={() => setArt(cover.art)}
            >
              <Artwork variant={cover.art} />
              <span>{cover.label}</span>
              {art === cover.art && <em>✓</em>}
            </button>
          ))}
        </div>
      </section>

      <div className="ca-live-free-note">
        <Video size={16} />
        <div>
          <strong>本次直播免费</strong>
          <p>你可以随时在控制台结束直播，结束后直播间会从用户端下线。</p>
        </div>
        <Tag tone="gold">免费</Tag>
      </div>

      <div className="ca-live-ethics">
        <ShieldCheck size={14} />
        <p>开播即表示你愿意遵守观心职业伦理：不公开来访者身份信息，不进行诊断替代，不进行私下交易。</p>
      </div>

      {error && <p className="ca-form-error">{error}</p>}

      <div className="ca-live-start-bar">
        <div>
          <span>免费公开直播</span>
          <strong>{activeLive ? '已有直播进行中' : '准备好就开始吧'}</strong>
        </div>
        <Button size="lg" onClick={start} disabled={starting || Boolean(activeLive)}>
          {starting ? (
            <span className="btn-loading">
              <span /><span /><span />
            </span>
          ) : (
            <>
              <Radio size={17} />
              开始直播
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
