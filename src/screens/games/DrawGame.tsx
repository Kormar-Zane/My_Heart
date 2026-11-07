import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Eraser, Paintbrush, Send, Sparkles } from 'lucide-react'
import { Button } from '../../components/UI'
import { Avatar } from '../../components/Avatar'
import type { GameProps } from '../GameScreen'

const prompts = ['一只正在晒太阳的猫', '一棵会发光的小树', '雨里的一把伞', '一只戴帽子的兔子', '今晚的月亮']

const colors = ['#394B42', '#D07C61', '#E3B352', '#6C8C87', '#9C7B9E', '#4A6A80']

export function DrawGame({ onFinish }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const timers = useRef<number[]>([])
  const [color, setColor] = useState(colors[0])
  const [brush, setBrush] = useState(7)
  const [prompt] = useState(() => prompts[Math.floor(Math.random() * prompts.length)])
  const [hasDrawn, setHasDrawn] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [guesses, setGuesses] = useState<Array<{ name: string; text: string; avatar: string; correct?: boolean }>>([])
  const [error, setError] = useState('')

  useEffect(() => {
    return () => timers.current.forEach((timer) => window.clearTimeout(timer))
  }, [])

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  const begin = (event: PointerEvent<HTMLCanvasElement>) => {
    if (submitted) return
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture(event.pointerId)
    drawing.current = true
    const p = point(event)
    lastPoint.current = p
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(p.x, p.y, brush / 2, 0, Math.PI * 2)
    ctx.fill()
    setHasDrawn(true)
  }

  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || submitted) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const p = point(event)
    const previous = lastPoint.current ?? p
    ctx.strokeStyle = color
    ctx.lineWidth = brush
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(previous.x, previous.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    lastPoint.current = p
  }

  const end = () => {
    drawing.current = false
    lastPoint.current = null
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  const submit = () => {
    if (!hasDrawn) {
      setError('先画两笔吧，随便画什么都算作品。')
      return
    }
    setError('')
    setSubmitted(true)
    const replies = [
      { name: '阿梨', text: '是一个毛茸茸的东西？', avatar: 'ali' },
      { name: '鹿野', text: '好像在晒太阳，还有一条尾巴。', avatar: 'luye' },
      { name: '南栀', text: `我知道了！是「${prompt}」！`, avatar: 'nanzhi', correct: true },
    ]
    replies.forEach((reply, index) => {
      const timer = window.setTimeout(() => setGuesses((prev) => [...prev, reply]), 650 + index * 850)
      timers.current.push(timer)
    })
    const finishTimer = window.setTimeout(onFinish, 3900)
    timers.current.push(finishTimer)
  }

  return (
    <div className="draw-game">
      <div className="game-prompt-card">
        <div>
          <span className="game-step-eyebrow">本轮题目</span>
          <h1>{prompt}</h1>
        </div>
        <span className="game-prompt-emoji">🎨</span>
      </div>

      <div className="draw-canvas-wrap">
        <div className="draw-tape draw-tape-left" />
        <div className="draw-tape draw-tape-right" />
        <canvas
          ref={canvasRef}
          className="draw-canvas"
          width={640}
          height={420}
          onPointerDown={begin}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onPointerLeave={end}
          aria-label="绘画画布"
        />
        {!hasDrawn && !submitted && (
          <div className="draw-placeholder">
            <Paintbrush size={25} />
            <p>用手指或鼠标，画出你心里的样子</p>
            <small>画得不像也完全没关系</small>
          </div>
        )}
        {submitted && (
          <div className="draw-guessing-overlay">
            <span className="tiny-spinner" />
            伙伴们正在猜你的画…
          </div>
        )}
      </div>

      {!submitted && (
        <div className="draw-toolbar">
          <div className="draw-colors">
            {colors.map((c) => (
              <button
                key={c}
                className={color === c ? 'is-active' : ''}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={`选择颜色 ${c}`}
              />
            ))}
          </div>
          <div className="draw-brushes">
            {[4, 7, 12].map((size) => (
              <button key={size} className={brush === size ? 'is-active' : ''} onClick={() => setBrush(size)} aria-label={`笔刷 ${size}`}>
                <span style={{ width: size + 2, height: size + 2 }} />
              </button>
            ))}
          </div>
          <button className="draw-clear" onClick={clear}>
            <Eraser size={15} />
            擦掉
          </button>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      {!submitted && (
        <Button full size="lg" onClick={submit} className="game-primary-button">
          <Send size={16} />
          画好了，让大家猜猜
        </Button>
      )}

      {submitted && (
        <div className="draw-guesses">
          <div className="draw-guesses-head">
            <Sparkles size={14} />
            房间伙伴的猜测
          </div>
          {guesses.map((guess) => (
            <div className={`draw-guess ${guess.correct ? 'is-correct' : ''}`} key={guess.name}>
              <Avatar variant={guess.avatar} name={guess.name} size={34} />
              <div>
                <strong>{guess.name}</strong>
                <p>{guess.text}</p>
              </div>
              {guess.correct && <span className="draw-guess-check">猜中</span>}
            </div>
          ))}
          {guesses.length < 3 && <div className="draw-guess-typing">有人在输入中…</div>}
        </div>
      )}
    </div>
  )
}
