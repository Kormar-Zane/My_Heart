import { ChevronRight, Flower2, Gamepad2, Gift, Heart, Sparkles } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Artwork } from '../components/Artwork'
import { FlowerPill, TopBar } from '../components/UI'
import { GAME_META } from '../theme'
import { cn, formatTimeAgo } from '../utils'

export function GamesScreen() {
  const { state, currentUser } = useStore()
  const nav = useNav()
  const today = new Date().toDateString()
  const todayRecords = state.gameRecords.filter((r) => new Date(r.createdAt).toDateString() === today)
  const todayFlowers = todayRecords.reduce((sum, r) => sum + r.flowers, 0)

  return (
    <div className="page games-page">
      <TopBar
        title="解压游戏厅"
        subtitle="完成一局，收下小红花"
        back
        right={<FlowerPill count={currentUser?.flowers ?? 0} onClick={() => nav.navigate({ name: 'shop' })} />}
      />

      <section className="games-hero">
        <div className="games-hero-copy">
          <span className="eyebrow">
            <Gamepad2 size={13} />
            今日游戏厅
          </span>
          <h1>不用玩得很好，<br /><em>只要玩得开心。</em></h1>
          <p>每一局结束都会收获小红花。它们可以换成头像框，或一件观心自制的小礼物。</p>
          <div className="games-hero-stats">
            <div>
              <strong>{todayRecords.length}</strong>
              <span>今日局数</span>
            </div>
            <div>
              <strong>{todayFlowers}</strong>
              <span>今日小红花</span>
            </div>
            <div>
              <strong>{currentUser?.flowers ?? 0}</strong>
              <span>我的余额</span>
            </div>
          </div>
        </div>
        <div className="games-hero-art">
          <Artwork variant="draw" />
          <span className="games-hero-bubble">+3 🌸</span>
        </div>
      </section>

      <div className="games-list">
        {GAME_META.map((game, index) => {
          const played = todayRecords.filter((r) => r.type === game.type).length
          return (
            <button
              key={game.type}
              className={cn('game-list-card', `game-tone-${game.tone}`)}
              onClick={() => nav.navigate({ name: 'game', type: game.type })}
            >
              <div className="game-list-index">0{index + 1}</div>
              <div className="game-list-art">
                <Artwork variant={game.art} />
                <span className="game-list-emoji">{game.emoji}</span>
              </div>
              <div className="game-list-body">
                <div className="game-list-title">
                  <h2>{game.title}</h2>
                  {played > 0 && <span className="game-played">今日 {played} 局</span>}
                </div>
                <p>{game.tagline}</p>
                <div className="game-list-meta">
                  <span className="game-list-reward">
                    <Flower2 size={13} />
                    完成 +{game.reward}
                  </span>
                  <span>{game.duration}</span>
                </div>
              </div>
              <span className="game-list-arrow">
                <ChevronRight size={18} />
              </span>
            </button>
          )
        })}
      </div>

      <button className="games-shop-card" onClick={() => nav.navigate({ name: 'shop' })}>
        <span className="games-shop-icon">
          <Gift size={24} />
        </span>
        <div>
          <strong>小红花能换什么？</strong>
          <p>限定头像框、徽章，还有观心随行杯、种子卡等自制周边。</p>
        </div>
        <ChevronRight size={17} />
      </button>

      {state.gameRecords.length > 0 && (
        <section className="game-records">
          <div className="game-records-head">
            <h2>
              <Sparkles size={15} />
              最近的小小成就
            </h2>
          </div>
          <div className="game-record-list">
            {state.gameRecords.slice(0, 4).map((record) => (
              <div className="game-record" key={record.id}>
                <span className="game-record-icon">
                  <Heart size={13} />
                </span>
                <div>
                  <strong>{record.title}</strong>
                  <small>{formatTimeAgo(record.createdAt)}</small>
                </div>
                <span className="game-record-reward">+{record.flowers} 🌸</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="game-guideline">
        <Sparkles size={14} />
        <p>游戏为单机演示玩法，房间伙伴由本地示例数据模拟。小红花仅用于观心内兑换，不具备现金价值。</p>
      </div>
    </div>
  )
}
