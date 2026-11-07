import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Mic2, Music, Play, RotateCcw, Sparkles, Star, Volume2 } from 'lucide-react'
import { Button } from '../../components/UI'
import { playMelody, type Playback } from '../../audio'
import type { GameProps } from '../GameScreen'

interface KaraokeSong {
  title: string
  subtitle: string
  emoji: string
  tone: string
  lyrics: string[]
  notes: Array<{ note: string; beats?: number }>
}

const songs: KaraokeSong[] = [
  {
    title: '送别',
    subtitle: '李叔同 词 · 学堂乐歌',
    emoji: '🍃',
    tone: 'sage',
    lyrics: ['长亭外，古道边，芳草碧连天', '晚风拂柳笛声残，夕阳山外山', '天之涯，地之角，知交半零落', '一壶浊酒尽余欢，今宵别梦寒'],
    notes: [
      { note: 'G4', beats: 1.5 }, { note: 'E4' }, { note: 'G4', beats: 1.5 }, { note: 'A4' }, { note: 'G4', beats: 1.5 }, { note: 'E4' },
      { note: 'D4', beats: 2 }, { note: 'E4', beats: 1.5 }, { note: 'G4' }, { note: 'A4', beats: 1.5 }, { note: 'G4' },
      { note: 'E4', beats: 2.5 },
    ],
  },
  {
    title: '茉莉花',
    subtitle: '江苏民歌 · 传统曲目',
    emoji: '🌼',
    tone: 'peach',
    lyrics: ['好一朵美丽的茉莉花', '好一朵美丽的茉莉花', '芬芳美丽满枝桠', '又香又白人人夸'],
    notes: [
      { note: 'E4', beats: 1.5 }, { note: 'E4' }, { note: 'G4', beats: 1.5 }, { note: 'A4' }, { note: 'C5', beats: 1.5 }, { note: 'C5' },
      { note: 'A4', beats: 1.5 }, { note: 'G4' }, { note: 'A4', beats: 1.5 }, { note: 'G4' }, { note: 'E4', beats: 1.5 }, { note: 'D4' },
      { note: 'E4', beats: 1.5 }, { note: 'G4' }, { note: 'A4', beats: 1.5 }, { note: 'G4' }, { note: 'E4', beats: 1.5 }, { note: 'D4' },
      { note: 'C4', beats: 2.5 },
    ],
  },
  {
    title: '小星星',
    subtitle: '经典童谣 · 一起轻轻唱',
    emoji: '⭐',
    tone: 'night',
    lyrics: ['一闪一闪亮晶晶', '满天都是小星星', '挂在天上放光明', '好像许多小眼睛'],
    notes: [
      { note: 'C4' }, { note: 'C4' }, { note: 'G4' }, { note: 'G4' }, { note: 'A4' }, { note: 'A4' }, { note: 'G4', beats: 2 },
      { note: 'F4' }, { note: 'F4' }, { note: 'E4' }, { note: 'E4' }, { note: 'D4' }, { note: 'D4' }, { note: 'C4', beats: 2 },
    ],
  },
]

type Stage = 'select' | 'ready' | 'singing' | 'result'

export function KaraokeGame({ onFinish }: GameProps) {
  const [stage, setStage] = useState<Stage>('select')
  const [song, setSong] = useState<KaraokeSong | null>(null)
  const [lineIndex, setLineIndex] = useState(0)
  const [taps, setTaps] = useState(0)
  const [score, setScore] = useState(0)
  const [floating, setFloating] = useState<number[]>([])
  const playback = useRef<Playback | null>(null)
  const timers = useRef<number[]>([])
  const tapsRef = useRef(0)
  const ended = useRef(false)

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
  }

  const stopAudio = () => {
    playback.current?.stop()
    playback.current = null
  }

  useEffect(() => {
    return () => {
      clearTimers()
      stopAudio()
    }
  }, [])

  const start = () => {
    if (!song) return
    setStage('singing')
    setLineIndex(0)
    setTaps(0)
    tapsRef.current = 0
    ended.current = false
    playback.current = playMelody(song.notes, { beat: 0.6, volume: 0.06, type: 'sine' })
    song.lyrics.forEach((_, i) => {
      if (i === 0) return
      const timer = window.setTimeout(() => setLineIndex(i), i * 2850)
      timers.current.push(timer)
    })
    const endTimer = window.setTimeout(() => finishSong(), song.lyrics.length * 2850 + 700)
    timers.current.push(endTimer)
  }

  const finishSong = () => {
    if (ended.current) return
    ended.current = true
    clearTimers()
    stopAudio()
    const bonus = Math.min(10, Math.floor(tapsRef.current / 2))
    const finalScore = Math.min(99, 82 + bonus + Math.floor(Math.random() * 5))
    setScore(finalScore)
    setStage('result')
  }

  const tapMic = () => {
    if (stage !== 'singing') return
    tapsRef.current += 1
    setTaps(tapsRef.current)
    const id = Date.now() + Math.random()
    setFloating((prev) => [...prev.slice(-6), id])
  }

  const reset = () => {
    clearTimers()
    stopAudio()
    setStage('select')
    setSong(null)
    setLineIndex(0)
    setTaps(0)
    setScore(0)
    setFloating([])
    ended.current = false
  }

  if (stage === 'select') {
    return (
      <div className="karaoke-select">
        <div className="karaoke-select-hero">
          <div className="karaoke-mic-orb">
            <Mic2 size={34} />
          </div>
          <span className="eyebrow">
            <Sparkles size={13} />
            一个人的 K 歌房
          </span>
          <h1>
            跑调也<br />
            <em>没关系。</em>
          </h1>
          <p>挑一首喜欢的歌，跟着歌词轻轻唱。不用录音，不用被评分，这里只有你和旋律。</p>
        </div>
        <div className="karaoke-song-list">
          {songs.map((item) => (
            <button
              key={item.title}
              className={`karaoke-song-card karaoke-tone-${item.tone}`}
              onClick={() => {
                setSong(item)
                setStage('ready')
              }}
            >
              <span className="karaoke-song-emoji">{item.emoji}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.subtitle}</p>
                <small>{item.lyrics.length} 句歌词 · 约 1 分钟</small>
              </div>
              <span className="karaoke-song-play">
                <Play size={15} fill="currentColor" />
              </span>
            </button>
          ))}
        </div>
        <div className="karaoke-note">
          <Volume2 size={14} />
          演示模式：无需麦克风，跟着屏幕上的歌词唱就好。
        </div>
      </div>
    )
  }

  if (stage === 'ready' && song) {
    return (
      <div className={`karaoke-ready karaoke-tone-${song.tone}`}>
        <div className="karaoke-ready-emoji">{song.emoji}</div>
        <span className="game-step-eyebrow">准备好了吗</span>
        <h1>{song.title}</h1>
        <p>{song.subtitle}</p>
        <div className="karaoke-ready-lyrics">
          {song.lyrics.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <div className="karaoke-ready-tips">
          <span>🎤 跟着歌词唱</span>
          <span>⭐ 点亮星星</span>
          <span>🌿 不评判自己</span>
        </div>
        <Button full size="lg" onClick={start}>
          <Mic2 size={17} />
          开始演唱
        </Button>
        <button className="text-button" onClick={reset}>
          换一首歌
        </button>
      </div>
    )
  }

  if (stage === 'singing' && song) {
    return (
      <div className={`karaoke-stage karaoke-tone-${song.tone}`}>
        <div className="karaoke-spotlight karaoke-spotlight-1" />
        <div className="karaoke-spotlight karaoke-spotlight-2" />
        <div className="karaoke-stage-top">
          <span className="karaoke-live-pill">
            <Music size={12} />
            K 歌中
          </span>
          <span className="karaoke-stage-progress">
            {lineIndex + 1} / {song.lyrics.length}
          </span>
        </div>
        <div className="karaoke-stage-title">
          <span>{song.emoji}</span>
          <div>
            <small>正在演唱</small>
            <strong>{song.title}</strong>
          </div>
        </div>
        <div className="karaoke-lyrics">
          {song.lyrics.map((line, i) => (
            <p
              key={line}
              className={i === lineIndex ? 'is-current' : i < lineIndex ? 'is-past' : 'is-next'}
            >
              {line}
            </p>
          ))}
        </div>
        <div className="karaoke-progress-bar">
          <span style={{ width: `${((lineIndex + 1) / song.lyrics.length) * 100}%` }} />
        </div>
        <div className="karaoke-energy">
          <div>
            <Star size={15} fill="currentColor" />
            今日歌声能量
            <strong>{taps}</strong>
          </div>
          <div className="karaoke-energy-bar">
            <span style={{ width: `${Math.min(100, taps * 6 + 18)}%` }} />
          </div>
        </div>
        <button className="karaoke-mic-button" onClick={tapMic}>
          <span className="karaoke-mic-ring" />
          <Mic2 size={28} />
          <small>点我 · 我在唱</small>
        </button>
        <div className="karaoke-floating-notes" aria-hidden="true">
          {floating.map((id, i) => (
            <span key={id} style={{ left: `${25 + (i % 5) * 12}%` }}>
              {i % 2 === 0 ? '♪' : '✦'}
            </span>
          ))}
        </div>
        <div className="karaoke-stage-footer">
          <button onClick={finishSong}>结束演唱并评分</button>
          <span>不用唱完，随时可以停</span>
        </div>
      </div>
    )
  }

  if (stage === 'result' && song) {
    const message = score >= 92 ? '今天的你，闪闪发光。' : score >= 86 ? '很好听，真的。' : '能开口唱，就已经很棒了。'
    return (
      <div className="karaoke-result game-finish-card">
        <div className="karaoke-score-ring">
          <span>{score}</span>
          <small>今日歌声</small>
        </div>
        <span className="eyebrow">
          <Sparkles size={13} />
          演唱完成
        </span>
        <h1>
          你唱完了<br />
          <em>「{song.title}」</em>
        </h1>
        <p>{message}</p>
        <div className="karaoke-result-stats">
          <div>
            <strong>{song.lyrics.length}</strong>
            <span>句歌词</span>
          </div>
          <div>
            <strong>{taps}</strong>
            <span>次跟唱</span>
          </div>
          <div>
            <strong>+3</strong>
            <span>小红花</span>
          </div>
        </div>
        <div className="game-finish-actions">
          <Button size="lg" onClick={onFinish}>
            收下小红花
            <ArrowRight size={16} />
          </Button>
          <button className="text-button" onClick={reset}>
            <RotateCcw size={14} />
            再唱一首
          </button>
        </div>
      </div>
    )
  }

  return null
}
