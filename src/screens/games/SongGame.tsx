import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, Headphones, Music2, Pause, Play, RotateCcw, Sparkles, Volume2, X } from 'lucide-react'
import { Button } from '../../components/UI'
import { playMelody, type Playback } from '../../audio'
import type { GameProps } from '../GameScreen'

interface Tune {
  title: string
  kind: string
  emoji: string
  notes: Array<{ note: string; beats?: number }>
}

const tunes: Tune[] = [
  {
    title: '小星星',
    kind: '童谣',
    emoji: '⭐',
    notes: [
      { note: 'C4' }, { note: 'C4' }, { note: 'G4' }, { note: 'G4' }, { note: 'A4' }, { note: 'A4' }, { note: 'G4', beats: 2 },
      { note: 'F4' }, { note: 'F4' }, { note: 'E4' }, { note: 'E4' }, { note: 'D4' }, { note: 'D4' }, { note: 'C4', beats: 2 },
    ],
  },
  {
    title: '茉莉花',
    kind: '中国民歌',
    emoji: '🌼',
    notes: [
      { note: 'E4', beats: 1.5 }, { note: 'E4' }, { note: 'G4', beats: 1.5 }, { note: 'A4' }, { note: 'C5', beats: 1.5 }, { note: 'C5' },
      { note: 'A4', beats: 1.5 }, { note: 'G4' }, { note: 'A4', beats: 1.5 }, { note: 'G4' }, { note: 'E4', beats: 1.5 }, { note: 'D4' },
      { note: 'E4', beats: 1.5 }, { note: 'G4' }, { note: 'A4', beats: 1.5 }, { note: 'G4' }, { note: 'E4', beats: 1.5 }, { note: 'D4' },
      { note: 'C4', beats: 2.5 },
    ],
  },
  {
    title: '送别',
    kind: '学堂乐歌',
    emoji: '🍃',
    notes: [
      { note: 'G4', beats: 1.5 }, { note: 'E4' }, { note: 'G4', beats: 1.5 }, { note: 'A4' }, { note: 'G4', beats: 1.5 }, { note: 'E4' },
      { note: 'D4', beats: 2 }, { note: 'E4', beats: 1.5 }, { note: 'G4' }, { note: 'A4', beats: 1.5 }, { note: 'G4' },
      { note: 'E4', beats: 2.5 },
    ],
  },
  {
    title: '两只老虎',
    kind: '童谣',
    emoji: '🐯',
    notes: [
      { note: 'C4' }, { note: 'D4' }, { note: 'E4' }, { note: 'C4' }, { note: 'C4' }, { note: 'D4' }, { note: 'E4' }, { note: 'C4' },
      { note: 'E4' }, { note: 'F4' }, { note: 'G4', beats: 2 }, { note: 'E4' }, { note: 'F4' }, { note: 'G4', beats: 2 },
    ],
  },
]

const optionsPool = tunes.map((t) => t.title)

export function SongGame({ onFinish }: GameProps) {
  const [rounds] = useState(() => [...tunes].sort(() => Math.random() - 0.5).slice(0, 3))
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [playing, setPlaying] = useState(false)
  const playback = useRef<Playback | null>(null)
  const playingTimer = useRef<number | null>(null)
  const tune = rounds[index]
  const isCorrect = selected === tune.title

  const stop = () => {
    playback.current?.stop()
    playback.current = null
    if (playingTimer.current) window.clearTimeout(playingTimer.current)
    playingTimer.current = null
    setPlaying(false)
  }

  useEffect(() => {
    return () => {
      playback.current?.stop()
      if (playingTimer.current) window.clearTimeout(playingTimer.current)
    }
  }, [])

  const togglePlay = () => {
    if (playing) {
      stop()
      return
    }
    playback.current?.stop()
    const result = playMelody(tune.notes, { beat: 0.46, volume: 0.1, type: 'triangle' })
    playback.current = result
    setPlaying(true)
    playingTimer.current = window.setTimeout(() => setPlaying(false), result.duration)
  }

  const choose = (title: string) => {
    if (selected) return
    stop()
    setSelected(title)
    if (title === tune.title) setScore((s) => s + 1)
  }

  const next = () => {
    stop()
    if (index === rounds.length - 1) {
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
  }

  const restart = () => {
    setIndex(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    const message =
      score === rounds.length
        ? '三首全中，你的耳朵记得每一段旋律。'
        : score >= 2
          ? '很不错的乐感，再听几首就全对了。'
          : '没关系，有些旋律值得再听一遍。'
    return (
      <div className="song-result game-finish-card">
        <div className="finish-emoji">🎧</div>
        <span className="eyebrow">
          <Sparkles size={13} />
          听歌识曲完成
        </span>
        <h1>
          你听出了<br />
          <em>{score} / {rounds.length} 首</em>
        </h1>
        <p>{message}</p>
        <div className="song-result-list">
          {rounds.map((t, i) => (
            <span key={t.title}>
              <span>{t.emoji}</span>
              {t.title}
              {i < score && <Check size={13} />}
            </span>
          ))}
        </div>
        <div className="game-finish-actions">
          <Button size="lg" onClick={onFinish}>
            收下小红花
            <ArrowRight size={16} />
          </Button>
          <button className="text-button" onClick={restart}>
            <RotateCcw size={14} />
            再听一轮
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="song-game">
      <div className="song-progress">
        <span>第 {index + 1} / {rounds.length} 首</span>
        <div className="idiom-progress-dots">
          {rounds.map((t, i) => (
            <span key={t.title} className={i < index ? 'is-done' : i === index ? 'is-current' : ''} />
          ))}
        </div>
        <span>已猜对 {score}</span>
      </div>

      <div className="song-player">
        <div className={`song-vinyl ${playing ? 'is-playing' : ''}`}>
          <div className="song-vinyl-center">
            <Music2 size={27} />
          </div>
          <span className="song-vinyl-ring" />
        </div>
        <div className="song-player-copy">
          <span className="song-kind">{tune.kind}</span>
          <h1>听一听，这是哪首歌？</h1>
          <p>点击播放一段旋律，仔细听。听不出来也没关系，可以再听一次。</p>
          <button className="song-play-button" onClick={togglePlay}>
            {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            {playing ? '正在播放…' : '播放旋律'}
          </button>
          <div className={`song-equalizer ${playing ? 'is-playing' : ''}`}>
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} style={{ animationDelay: `${i * 0.07}s` }} />
            ))}
          </div>
        </div>
        <span className="song-player-note">♪</span>
      </div>

      <div className="song-options">
        {optionsPool.map((title, i) => {
          const right = selected !== null && title === tune.title
          const wrong = selected === title && title !== tune.title
          return (
            <button
              key={title}
              className={`song-option ${right ? 'is-correct' : ''} ${wrong ? 'is-wrong' : ''}`}
              onClick={() => choose(title)}
              disabled={selected !== null}
            >
              <span className="song-option-index">{String.fromCharCode(65 + i)}</span>
              <span>{title}</span>
              {right && <Check size={18} />}
              {wrong && <X size={18} />}
              {!selected && <Headphones size={16} />}
            </button>
          )
        })}
      </div>

      {selected && (
        <div className={`song-feedback ${isCorrect ? 'is-correct' : ''}`}>
          <strong>{isCorrect ? '耳朵很灵！' : `这首歌是「${tune.title}」`}</strong>
          <p>
            {isCorrect
              ? '旋律已经被你记住了。下一首，也听听看。'
              : '没关系，旋律会慢慢留在记忆里。下一首再来。'}
          </p>
          <Button onClick={next} className="idiom-next">
            {index === rounds.length - 1 ? '看看成绩' : '下一首'}
            <ArrowRight size={16} />
          </Button>
        </div>
      )}

      <div className="song-volume-note">
        <Volume2 size={14} />
        建议打开声音，旋律由观心轻音乐合成器演奏
      </div>
    </div>
  )
}
