import { useState } from 'react'
import { ArrowUpRight, Headphones, HeartHandshake, MapPin, Sparkles } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Avatar } from '../components/Avatar'
import { MOODS } from '../theme'
import { getGreeting, regionLabel } from '../utils'
import { FlowerPill } from '../components/UI'

export function HomeScreen() {
  const { currentUser, state } = useStore()
  const nav = useNav()
  const [mood, setMood] = useState<string | null>(null)
  const today = new Date()
  const dateLabel = `${today.getMonth() + 1}月${today.getDate()}日 · ${['周日', '周一', '周二', '周三', '周四', '周五', '周六'][today.getDay()]}`
  const activeMood = MOODS.find((m) => m.key === mood)
  const onlineCounselors = state.counselors.filter((c) => c.online).length
  const livingNow = state.lives.filter((l) => l.status === 'live').length

  return (
    <div className="page home-page">
      <header className="home-header">
        <div>
          <p className="home-date">{dateLabel}</p>
          <h1 className="home-greeting">
            {getGreeting()}，<em>{currentUser?.nickname}</em>
          </h1>
          <button className="home-region" onClick={() => nav.navigate({ name: 'edit-profile' })}>
            <MapPin size={12} />
            {regionLabel(currentUser?.region)}
          </button>
        </div>
        <div className="home-header-right">
          <FlowerPill count={currentUser?.flowers ?? 0} onClick={() => nav.navigate({ name: 'shop' })} />
          <button className="home-avatar-button" onClick={() => nav.switchTab('me')} aria-label="进入个人主页">
            <Avatar variant={currentUser?.avatar} size={42} frame={currentUser?.equippedFrame} />
            <span className="home-avatar-status" />
          </button>
        </div>
      </header>

      <section className="home-quote-card">
        <div className="home-quote-sun" />
        <div className="home-quote-copy">
          <span className="home-quote-label">今日 · 心晴签</span>
          <p>
            {activeMood ? (
              <>“{activeMood.reply}”</>
            ) : (
              <>
                你不必急着变好，
                <br />
                先好好待在此刻。
              </>
            )}
          </p>
        </div>
        <div className="mood-checkin">
          <span className="mood-checkin-label">此刻心情</span>
          <div className="mood-row">
            {MOODS.map((m) => (
              <button
                key={m.key}
                className={mood === m.key ? 'is-active' : ''}
                onClick={() => setMood(mood === m.key ? null : m.key)}
                aria-label={m.label}
                title={m.label}
              >
                <span>{m.emoji}</span>
                <small>{m.label}</small>
              </button>
            ))}
          </div>
        </div>
        <span className="home-quote-flower">❀</span>
      </section>

      <main className="home-modules">
        <button className="home-module home-module-counsel" onClick={() => nav.navigate({ name: 'counseling' })}>
          <div className="module-ring module-ring-1" />
          <div className="module-ring module-ring-2" />
          <div className="module-ring module-ring-3" />
          <div className="module-glyph">心</div>
          <div className="module-topline">
            <span className="module-eyebrow">
              <span className="module-dot" />
              心理咨询
            </span>
            <span className="module-index">01</span>
          </div>
          <div className="home-module-body">
            <h2>
              有人听见，
              <br />
              就不那么孤单。
            </h2>
            <p>专业咨询师 · AI 智能匹配 · 附近机构</p>
          </div>
          <div className="module-counsel-visual">
            <div className="module-avatar-stack">
              {['lin', 'zhou', 'su'].map((v, i) => (
                <span key={v} style={{ zIndex: 3 - i }}>
                  <Avatar variant={v} size={38} />
                </span>
              ))}
              <span className="module-avatar-more">+{onlineCounselors}</span>
            </div>
            <div className="module-live-pill">
              <span className="live-dot" />
              {livingNow} 场直播进行中
            </div>
          </div>
          <div className="module-footer">
            <span>AI 帮我匹配咨询师</span>
            <span className="module-arrow">
              <ArrowUpRight size={18} />
            </span>
          </div>
          <span className="module-spark module-spark-1">✦</span>
          <span className="module-spark module-spark-2">✦</span>
        </button>

        <button className="home-module home-module-relax" onClick={() => nav.navigate({ name: 'relax' })}>
          <div className="relax-orbit" />
          <div className="relax-bubble relax-bubble-1">🎨</div>
          <div className="relax-bubble relax-bubble-2">🐢</div>
          <div className="relax-bubble relax-bubble-3">🎤</div>
          <div className="relax-flower">🌸</div>
          <div className="module-topline">
            <span className="module-eyebrow module-eyebrow-dark">
              <span className="module-dot module-dot-sage" />
              解压空间
            </span>
            <span className="module-index module-index-dark">02</span>
          </div>
          <div className="home-module-body">
            <h2>
              把心事放下，
              <br />
              玩一会儿。
            </h2>
            <p>主题房间 · 5 种小游戏 · 小红花礼物</p>
          </div>
          <div className="relax-stats">
            <span>
              <strong>{state.rooms.length}</strong> 个房间
            </span>
            <span>
              <strong>5</strong> 种游戏
            </span>
            <span>
              <strong>10</strong> 件礼物
            </span>
          </div>
          <div className="module-footer module-footer-dark">
            <span>进入解压空间</span>
            <span className="module-arrow module-arrow-dark">
              <ArrowUpRight size={18} />
            </span>
          </div>
        </button>
      </main>

      <section className="home-live-card" onClick={() => nav.navigate({ name: 'lives' })}>
        <span className="home-live-icon">
          <Headphones size={19} />
        </span>
        <div>
          <span className="home-live-eyebrow">今晚 · 免费直播</span>
          <strong>和焦虑做朋友：把紧绷的身体松一松</strong>
          <small>林知夏 · 1,286 人正在听</small>
        </div>
        <span className="home-live-join">去听</span>
      </section>

      <section className="home-bottom-note">
        <HeartHandshake size={16} />
        <p>
          本周已有 <strong>2,846</strong> 次心事被好好接住
        </p>
        <Sparkles size={15} />
      </section>
    </div>
  )
}
