import { useState } from 'react'
import { ArrowRight, Check, ChevronRight, Lightbulb, RotateCcw, Sparkles, X } from 'lucide-react'
import { Button } from '../../components/UI'
import type { GameProps } from '../GameScreen'

const puzzles = [
  {
    clue: '🐎  👀  🌸',
    hint: '粗略地看一遍，不深入',
    options: ['走马观花', '心花怒放', '马到成功', '雾里看花'],
    answer: '走马观花',
    meaning: '骑在马上看花。比喻粗略地观察事物，只看到表面。',
  },
  {
    clue: '🪣 × 15  💧',
    hint: '形容心里慌乱不安',
    options: ['七上八下', '提心吊胆', '坐立不安', '手忙脚乱'],
    answer: '七上八下',
    meaning: '形容心里慌乱不安，无所适从。',
  },
  {
    clue: '🌕  🪞  🌸  💧',
    hint: '看起来美好，却并不真实',
    options: ['水落石出', '镜花水月', '花好月圆', '水中捞月'],
    answer: '镜花水月',
    meaning: '镜中的花，水里的月。比喻虚幻的景象，也比喻诗中不能从字面求解的意境。',
  },
  {
    clue: '🐦  🤐  🪶',
    hint: '安静得一点声音也没有',
    options: ['鸦雀无声', '万籁俱寂', '屏息凝神', '风平浪静'],
    answer: '鸦雀无声',
    meaning: '连乌鸦和麻雀的声音也没有。形容非常安静。',
  },
  {
    clue: '🌊  🍂  🪨  💔',
    hint: '比喻意志坚定，永远不变',
    options: ['海枯石烂', '天长地久', '至死不渝', '山盟海誓'],
    answer: '海枯石烂',
    meaning: '海水干涸、石头腐烂。比喻历时久远，也比喻意志坚定，永远不变。',
  },
]

export function IdiomGame({ onFinish }: GameProps) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const puzzle = puzzles[index]
  const isCorrect = selected === puzzle.answer

  const choose = (option: string) => {
    if (selected) return
    setSelected(option)
    if (option === puzzle.answer) setScore((s) => s + 1)
  }

  const next = () => {
    if (index === puzzles.length - 1) {
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
      score === puzzles.length
        ? '全部答对！你心里住着一本小词典。'
        : score >= 3
          ? '已经很像一位成语达人了。'
          : '猜错也没关系，今天又多认识几个词。'
    return (
      <div className="idiom-result game-finish-card">
        <div className="finish-emoji">🧩</div>
        <span className="eyebrow">
          <Sparkles size={13} />
          五题完成
        </span>
        <h1>
          你猜中了<br />
          <em>{score} / {puzzles.length} 题</em>
        </h1>
        <p>{message}</p>
        <div className="idiom-dots">
          {puzzles.map((p, i) => (
            <span key={p.answer} className={i < score ? 'is-correct' : ''} />
          ))}
        </div>
        <div className="game-finish-actions">
          <Button size="lg" onClick={onFinish}>
            收下小红花
            <ArrowRight size={16} />
          </Button>
          <button className="text-button" onClick={restart}>
            <RotateCcw size={14} />
            再猜一次
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="idiom-game">
      <div className="idiom-progress">
        <span>第 {index + 1} / {puzzles.length} 题</span>
        <div className="idiom-progress-dots">
          {puzzles.map((p, i) => (
            <span key={p.answer} className={i < index ? 'is-done' : i === index ? 'is-current' : ''} />
          ))}
        </div>
        <span>已答对 {score}</span>
      </div>

      <div className="idiom-clue-card">
        <span className="idiom-clue-label">看图猜成语</span>
        <div className="idiom-emoji">{puzzle.clue}</div>
        <div className="idiom-hint">
          <Lightbulb size={14} />
          {puzzle.hint}
        </div>
        <span className="idiom-decoration">❋</span>
      </div>

      <div className="idiom-question">哪个成语最接近？</div>
      <div className="idiom-options">
        {puzzle.options.map((option, i) => {
          const wrong = selected === option && option !== puzzle.answer
          const right = selected !== null && option === puzzle.answer
          return (
            <button
              key={option}
              className={`idiom-option ${right ? 'is-correct' : ''} ${wrong ? 'is-wrong' : ''}`}
              onClick={() => choose(option)}
              disabled={selected !== null}
            >
              <span className="idiom-option-mark">{String.fromCharCode(65 + i)}</span>
              <span>{option}</span>
              {right && <Check size={17} />}
              {wrong && <X size={17} />}
            </button>
          )
        })}
      </div>

      {selected && (
        <div className={`idiom-feedback ${isCorrect ? 'is-correct' : ''}`}>
          <div className="idiom-feedback-head">
            <span>{isCorrect ? '答对啦' : `正确答案是「${puzzle.answer}」`}</span>
            {isCorrect && <span className="idiom-score-add">+1</span>}
          </div>
          <p>{puzzle.meaning}</p>
          <Button size="md" onClick={next} className="idiom-next">
            {index === puzzles.length - 1 ? '看看成绩' : '下一题'}
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  )
}
