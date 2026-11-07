import { useMemo, useState } from 'react'
import { ChevronRight, Crown, Flower2, Gamepad2, Gift, Lock, Plus, Sparkles, Users, Volume2 } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Avatar } from '../components/Avatar'
import { Artwork } from '../components/Artwork'
import { Button, FlowerPill, SectionHead, Sheet, Tag, TopBar } from '../components/UI'
import { GAME_META } from '../theme'
import { cn } from '../utils'

const roomTags = ['情绪倾听', '深夜陪伴', '你画我猜', '海龟汤']

export function RelaxScreen() {
  const { state, currentUser, createRoom, showToast } = useStore()
  const nav = useNav()
  const [createOpen, setCreateOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [tag, setTag] = useState(roomTags[0])
  const [error, setError] = useState('')

  const todayFlowers = useMemo(() => {
    const today = new Date().toDateString()
    return state.gameRecords
      .filter((r) => new Date(r.createdAt).toDateString() === today)
      .reduce((sum, r) => sum + r.flowers, 0)
  }, [state.gameRecords])

  const submit = () => {
    if (!title.trim()) {
      setError('给房间起一个名字吧')
      return
    }
    const id = createRoom({ title: title.trim(), topic: topic.trim() || '随便聊聊，今天过得怎么样', tag })
    setCreateOpen(false)
    setTitle('')
    setTopic('')
    setError('')
    showToast('房间已创建，+1 小红花已到账')
    nav.navigate({ name: 'room', id })
  }

  return (
    <div className="page relax-page">
      <TopBar
        title="解压空间"
        subtitle="不必有用，开心就好"
        back
        right={<FlowerPill count={currentUser?.flowers ?? 0} onClick={() => nav.navigate({ name: 'shop' })} />}
      />

      <section className="relax-hero">
        <div className="relax-hero-copy">
          <span className="eyebrow">
            <Sparkles size={13} />
            今天也辛苦了
          </span>
          <h1>
            把心事放下，
            <br />
            <em>玩一会儿。</em>
          </h1>
          <p>聊天、画画、猜谜、唱歌。这里没有 KPI，也没有必须表现得好。</p>
          <div className="relax-hero-actions">
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus size={15} />
              创建房间
            </Button>
            <button className="relax-hero-link" onClick={() => nav.navigate({ name: 'games' })}>
              去游戏大厅
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        <div className="relax-hero-visual">
          <div className="relax-hero-blob" />
          <span className="relax-float relax-float-1">🎨</span>
          <span className="relax-float relax-float-2">🐢</span>
          <span className="relax-float relax-float-3">🎧</span>
          <span className="relax-float relax-float-4">🌸</span>
          <div className="relax-hero-flower">
            <Flower2 size={38} />
            <span>+{todayFlowers || 3}</span>
            <small>今日可赚</small>
          </div>
        </div>
      </section>

      <div className="relax-stats-strip">
        <div>
          <strong>{state.rooms.length}</strong>
          <span>个房间正在聊</span>
        </div>
        <span className="relax-stat-line" />
        <div>
          <strong>{state.rooms.reduce((sum, r) => sum + r.members, 0)}</strong>
          <span>位伙伴在线</span>
        </div>
        <span className="relax-stat-line" />
        <div>
          <strong>{todayFlowers}</strong>
          <span>今日已赚小红花</span>
        </div>
      </div>

      <SectionHead
        title="正在发生"
        subtitle="选一个房间，或自己开一间"
        action={
          <button className="section-text-link" onClick={() => setCreateOpen(true)}>
            <Plus size={14} />
            建房
          </button>
        }
      />

      <div className="room-list">
        {state.rooms.map((room) => (
          <button className="room-card" key={room.id} onClick={() => nav.navigate({ name: 'room', id: room.id })}>
            <div className="room-art">
              <Artwork variant={room.art} />
              <span className="room-art-tag">{room.tag}</span>
              {room.isMine && <span className="room-mine">我的</span>}
            </div>
            <div className="room-card-body">
              <div className="room-card-top">
                <div>
                  <h3>{room.title}</h3>
                  <p>{room.topic}</p>
                </div>
                <span className="room-members">
                  <Users size={12} />
                  {room.members}/{room.capacity}
                </span>
              </div>
              <div className="room-card-footer">
                <span className="room-host">
                  <Avatar variant={room.hostAvatar} size={22} />
                  {room.hostName}
                </span>
                <div className="room-avatar-stack">
                  {['ali', 'nanzhi', 'luye'].map((a, i) => (
                    <span key={a} style={{ zIndex: 3 - i }}>
                      <Avatar variant={a} size={20} />
                    </span>
                  ))}
                  <span className="room-avatar-more">+{Math.max(0, room.members - 3)}</span>
                </div>
                <span className="room-join">
                  进入
                  <ChevronRight size={13} />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <SectionHead
        title="解压小游戏"
        subtitle="完成一局，就能收获小红花"
        action={
          <button className="section-text-link" onClick={() => nav.navigate({ name: 'games' })}>
            全部
            <ChevronRight size={14} />
          </button>
        }
      />

      <div className="game-grid">
        {GAME_META.map((game, index) => (
          <button
            key={game.type}
            className={cn('game-card', `game-tone-${game.tone}`, index === 0 && 'is-wide')}
            onClick={() => nav.navigate({ name: 'game', type: game.type })}
          >
            <div className="game-card-art">
              <Artwork variant={game.art} />
            </div>
            <div className="game-card-body">
              <div className="game-card-title">
                <span>{game.emoji}</span>
                <strong>{game.title}</strong>
              </div>
              <p>{game.tagline}</p>
              <div className="game-card-meta">
                <span className="game-reward">🌸 +{game.reward}</span>
                <span>{game.duration}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button className="shop-banner" onClick={() => nav.navigate({ name: 'shop' })}>
        <div className="shop-banner-icon">
          <Gift size={26} />
        </div>
        <div>
          <span className="shop-banner-eyebrow">小红花商店</span>
          <strong>把攒下的温柔，换成一件礼物</strong>
          <small>虚拟装扮 · 观心自制周边</small>
        </div>
        <div className="shop-banner-count">
          <Flower2 size={15} />
          {currentUser?.flowers ?? 0}
          <ChevronRight size={15} />
        </div>
      </button>

      <div className="relax-guideline">
        <Lock size={14} />
        <p>房间里的发言仅本房间可见。请勿索要他人隐私信息，遇到不适可随时退出。</p>
      </div>

      <Sheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="创建一间解压房"
        subtitle="给今晚的你，一个刚刚好的角落"
        footer={
          <Button full size="lg" onClick={submit}>
            创建并进入
          </Button>
        }
      >
        <div className="create-room-form">
          <label className="field">
            <span className="field-label">房间名字</span>
            <div className="field-control">
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setError('')
                }}
                placeholder="例如：今晚不内耗"
                maxLength={20}
              />
            </div>
          </label>
          <label className="field">
            <span className="field-label">想聊点什么（选填）</span>
            <div className="field-control">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="今天有什么想放下的？"
                maxLength={40}
              />
            </div>
          </label>
          <div>
            <span className="field-label">房间标签</span>
            <div className="create-room-tags">
              {roomTags.map((t) => (
                <button key={t} className={cn('filter-chip', tag === t && 'is-active')} onClick={() => setTag(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="create-room-tip">
            <Volume2 size={15} />
            <span>房间默认为文字聊天。你可以邀请朋友，也可以等待伙伴加入。</span>
          </div>
          {error && <p className="form-error">{error}</p>}
        </div>
      </Sheet>
    </div>
  )
}
