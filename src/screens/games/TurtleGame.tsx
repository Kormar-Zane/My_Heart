import { useState } from 'react'
import { Eye, MessageCircleQuestion, Sparkles, UtensilsCrossed } from 'lucide-react'
import { Artwork } from '../../components/Artwork'
import { Button } from '../../components/UI'
import type { GameProps } from '../GameScreen'

const questions = [
  { q: '他以前喝过海龟汤吗？', a: '是。准确地说，他一直以为自己喝过。' },
  { q: '是味道有什么不对吗？', a: '不是。味道太熟悉了，熟悉到让他愣住。' },
  { q: '和某个人有关吗？', a: '是。和一个很久没有联系的人有关。' },
  { q: '他现在是一个人生活吗？', a: '不是。他只是很多年没有回家了。' },
]

export function TurtleGame({ onFinish }: GameProps) {
  const [asked, setAsked] = useState<number[]>([])
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="turtle-game">
      <section className="turtle-story">
        <div className="turtle-story-art">
          <Artwork variant="turtle" />
          <span className="turtle-story-emoji">🐢</span>
        </div>
        <div className="turtle-story-copy">
          <span className="game-step-eyebrow">第 1 碗 · 雨夜鱼汤</span>
          <h1>
            雨夜，男人走进一家餐厅，
            <br />
            点了一碗海龟汤。
          </h1>
          <p>
            喝了一口后，他忽然愣住了。沉默了很久，他掏出手机，给多年没有联系的母亲打了一个电话。
            <br />
            <strong>为什么？</strong>
          </p>
        </div>
      </section>

      {!revealed ? (
        <>
          <div className="turtle-rules">
            <MessageCircleQuestion size={15} />
            <p>你可以向主持人提问，但问题只能用「是 / 否 / 无关」来回答。问得越多，越接近汤底。</p>
          </div>

          <div className="turtle-progress">
            <span>已提问 {asked.length} / {questions.length}</span>
            <div>
              {questions.map((_, i) => (
                <span key={i} className={asked.includes(i) ? 'is-done' : ''} />
              ))}
            </div>
          </div>

          <div className="turtle-questions">
            {questions.map((item, index) => {
              const isAsked = asked.includes(index)
              const number = asked.indexOf(index) + 1
              return (
                <div className={`turtle-question ${isAsked ? 'is-asked' : ''}`} key={item.q}>
                  <button
                    className="turtle-question-button"
                    disabled={isAsked}
                    onClick={() => setAsked((prev) => [...prev, index])}
                  >
                    <span className="turtle-question-num">{isAsked ? number : '?'}</span>
                    <span>{item.q}</span>
                    {!isAsked && <em>问主持人</em>}
                  </button>
                  {isAsked && (
                    <div className="turtle-answer">
                      <strong>主持人</strong>
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="turtle-reveal-card">
            <span className="turtle-reveal-icon">
              <UtensilsCrossed size={20} />
            </span>
            <div>
              <strong>{asked.length >= 2 ? '我好像知道汤底了' : '再问两个问题吧'}</strong>
              <p>{asked.length >= 2 ? '准备好时，可以揭开这碗汤的故事。' : '慢慢来，好故事值得多问几句。'}</p>
            </div>
            <Button
              size="sm"
              disabled={asked.length < 2}
              onClick={() => setRevealed(true)}
            >
              <Eye size={15} />
              揭晓汤底
            </Button>
          </div>
        </>
      ) : (
        <section className="turtle-reveal">
          <div className="turtle-reveal-heading">
            <span className="eyebrow">
              <Sparkles size={13} />
              汤底揭晓
            </span>
            <h2>原来他找的，<br /><em>从来不是海龟汤。</em></h2>
          </div>
          <div className="turtle-solution">
            <p>
              小时候家里并不富裕。有一次，他哭着想吃海龟汤，母亲就用最便宜的鲫鱼煮了一锅奶白的汤，
              撒上一点葱花，笑着对他说：<strong>「这就是海龟汤呀。」</strong>
            </p>
            <p>
              他长大后走遍很多城市，点过很多次真正的海龟汤，却总觉得少了点什么。
              直到这个雨夜，他喝到那口熟悉的鱼汤，才忽然明白：
            </p>
            <blockquote>他怀念的从来不是海龟汤，而是母亲在厨房里，为他撒下的那一点葱花。</blockquote>
            <p className="turtle-solution-end">他拨通电话，只说了一句：「妈，我周末回家吃饭。」</p>
          </div>
          <div className="turtle-warmth">
            <span>🌿</span>
            <p>有些味道，是回家的路。谢谢你陪这碗汤走到这里。</p>
          </div>
          <Button full size="lg" onClick={onFinish} className="game-primary-button">
            收下这碗汤 · +2 小红花
          </Button>
        </section>
      )}
    </div>
  )
}
