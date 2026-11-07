import { useRef, useState } from 'react'
import { ArrowRight, Flower2, Gift, RotateCcw, Sparkles } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Button, FlowerPill, Modal, TopBar } from '../components/UI'
import { GAME_META } from '../theme'
import type { GameType } from '../types'
import { DrawGame } from './games/DrawGame'
import { TurtleGame } from './games/TurtleGame'
import { IdiomGame } from './games/IdiomGame'
import { SongGame } from './games/SongGame'
import { KaraokeGame } from './games/KaraokeGame'

export interface GameProps {
  onFinish: () => void
}

export function GameScreen({ type }: { type: GameType }) {
  const { currentUser, completeGame } = useStore()
  const nav = useNav()
  const meta = GAME_META.find((g) => g.type === type) ?? GAME_META[0]
  const [reward, setReward] = useState<number | null>(null)
  const [round, setRound] = useState(1)
  const completed = useRef(false)

  const finish = () => {
    if (completed.current) return
    completed.current = true
    completeGame(meta.type, meta.title, meta.reward)
    setReward(meta.reward)
  }

  const replay = () => {
    completed.current = false
    setReward(null)
    setRound((r) => r + 1)
  }

  const Game = {
    draw: DrawGame,
    turtle: TurtleGame,
    idiom: IdiomGame,
    song: SongGame,
    karaoke: KaraokeGame,
  }[type]

  return (
    <div className={`page game-page game-page-${meta.tone}`}>
      <TopBar
        title={meta.title}
        subtitle={meta.tagline}
        back
        right={<FlowerPill count={currentUser?.flowers ?? 0} onClick={() => nav.navigate({ name: 'shop' })} />}
      />
      <div className="game-reward-strip">
        <Sparkles size={13} />
        完成本局可获得 <strong>+{meta.reward} 小红花</strong>
        <span>·</span>
        <span>{meta.duration}</span>
      </div>

      <Game key={round} onFinish={finish} />

      <Modal open={reward !== null} onClose={replay} dismissible={false} className="reward-modal">
        <div className="reward-burst">
          <span>🌸</span>
          <span>✦</span>
          <span>🌿</span>
          <span>✧</span>
        </div>
        <div className="reward-flower">
          <Flower2 size={34} />
        </div>
        <p className="reward-eyebrow">这一局完成啦</p>
        <h2>收下你的小红花</h2>
        <div className="reward-amount">
          <span>+</span>
          {reward ?? meta.reward}
          <small>小红花</small>
        </div>
        <p className="reward-copy">
          {meta.title} · 又给自己留了一段轻松的时光。
          <br />
          你现在的余额是 {currentUser?.flowers ?? 0} 朵。
        </p>
        <div className="reward-actions">
          <Button full size="lg" onClick={replay}>
            <RotateCcw size={16} />
            再玩一局
          </Button>
          <div className="reward-secondary-actions">
            <button onClick={() => nav.navigate({ name: 'shop' })}>
              <Gift size={15} />
              去换礼物
            </button>
            <button onClick={() => nav.navigate({ name: 'relax' })}>
              回解压空间
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
