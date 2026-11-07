import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, BadgeCheck, Bot, Check, MapPin, RefreshCw, Send, ShieldCheck, Sparkles } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Avatar } from '../components/Avatar'
import { RegionSheet, Tag, TopBar } from '../components/UI'
import type { Counselor } from '../types'
import { clamp, cn, regionLabel } from '../utils'
import { serverApi } from '../api'

interface AiMessage {
  id: string
  role: 'ai' | 'me'
  text: string
}

interface Question {
  id: string
  prompt: string
  hint?: string
  options: string[]
}

const QUESTIONS: Question[] = [
  {
    id: 'concern',
    prompt: '先不急着给答案。最近，是哪种感受最常来找你？',
    hint: '选一个最接近的就好，没有标准答案',
    options: ['情绪低落', '焦虑与压力', '关系困扰', '睡眠问题', '职场迷茫', '想更了解自己'],
  },
  {
    id: 'duration',
    prompt: '这样的状态，大概持续多久了？',
    hint: '时间长短会影响我们建议的咨询节奏',
    options: ['最近几天', '几周', '几个月', '一年以上'],
  },
  {
    id: 'style',
    prompt: '你更希望被怎样陪伴？',
    hint: '没有对错，舒服最重要',
    options: ['温柔地听我说', '帮我理清思路', '给我一些行动建议', '用艺术 / 书写表达'],
  },
  {
    id: 'budget',
    prompt: '关于单次咨询的预算，你更倾向哪一档？',
    hint: '价格不是衡量帮助的唯一标准，按自己的节奏来',
    options: ['300–400 元', '400–600 元', '600 元以上', '还不确定'],
  },
  {
    id: 'mode',
    prompt: '最后，想优先在哪里咨询？',
    hint: '我们会结合你所在的地区给出建议',
    options: ['优先我附近的线下空间', '线上视频也可以', '都可以，看谁更合适'],
  },
]

const concernTags: Record<string, string[]> = {
  情绪低落: ['情绪压力', '焦虑抑郁', '创伤修复'],
  焦虑与压力: ['焦虑抑郁', '情绪压力', '正念减压', '职场压力'],
  关系困扰: ['亲密关系', '伴侣沟通', '家庭沟通', '亲子关系'],
  睡眠问题: ['睡眠困扰', '正念减压', '身心疲惫'],
  职场迷茫: ['职场压力', '职业迷茫', '自我价值'],
  想更了解自己: ['自我成长', '艺术疗愈', '自我价值'],
}

const styleTags: Record<string, string> = {
  温柔地听我说: '温柔倾听',
  帮我理清思路: '专业分析',
  给我一些行动建议: '行动建议',
  '用艺术 / 书写表达': '艺术表达',
}

const budgetMax: Record<string, number> = {
  '300–400 元': 400,
  '400–600 元': 600,
  '600 元以上': 9999,
  还不确定: 9999,
}

interface Recommendation {
  counselor: Counselor
  score: number
  reasons: string[]
}

function scoreCounselor(
  counselor: Counselor,
  answers: Record<string, string>,
  city: string,
): Recommendation {
  let score = 70
  const reasons: string[] = []
  const concern = answers.concern
  const tags = concern ? concernTags[concern] : []
  const tagHits = counselor.specialties.filter((s) => tags.includes(s))

  if (tagHits.length > 0) {
    score += tagHits.length > 1 ? 12 : 9
    reasons.push(`专注${tagHits[0]}议题`)
  } else {
    reasons.push(`擅长${counselor.specialties[0]}，也可能帮到你`)
  }

  const wantedStyle = styleTags[answers.style]
  if (wantedStyle && counselor.style === wantedStyle) {
    score += 7
    reasons.push(`沟通风格偏「${counselor.style}」`)
  }

  if (counselor.city === city) {
    score += 6
    if (answers.mode === '优先我附近的线下空间') {
      score += 2
      reasons.push(`就在你所在的城市，支持面对面`)
    }
  } else if (answers.mode === '线上视频也可以') {
    score += 2
    reasons.push('支持线上视频，距离不是问题')
  }

  const max = budgetMax[answers.budget] ?? 9999
  if (counselor.price <= max) {
    score += 3
  } else {
    score -= 8
  }

  if (counselor.years >= 8) {
    score += 2
  }

  return {
    counselor,
    score: Math.round(clamp(score, 72, 98)),
    reasons: reasons.slice(0, 2),
  }
}

export function AIAssistantScreen() {
  const { currentUser, state, updateProfile, showToast } = useStore()
  const nav = useNav()
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'ai-welcome',
      role: 'ai',
      text: '嗨，我是观心的小观。接下来我会问你 5 个简单的问题，帮你找到可能更合适的咨询师。这里没有评判，慢慢来。',
    },
    { id: 'ai-q0', role: 'ai', text: QUESTIONS[0].prompt },
  ])
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [typing, setTyping] = useState(false)
  const [phase, setPhase] = useState<'chat' | 'matching' | 'results'>('chat')
  const [regionOpen, setRegionOpen] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState<Recommendation[] | null>(null)
  const [aiSummary, setAiSummary] = useState('')
  const [aiSource, setAiSource] = useState<'ai' | 'local'>('local')
  const timers = useRef<number[]>([])
  const matchRequest = useRef(0)
  const chatEnd = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const schedule = (fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay)
    timers.current.push(id)
    return id
  }

  useEffect(() => {
    return () => timers.current.forEach((t) => window.clearTimeout(t))
  }, [])

  useEffect(() => {
    if (phase === 'results') return
    chatEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, typing, phase])

  useEffect(() => {
    if (phase !== 'results') return
    const timer = window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
    return () => window.clearTimeout(timer)
  }, [phase])

  const localRecommendations = useMemo(() => {
    return state.counselors
      .map((c) => scoreCounselor(c, answers, currentUser?.region.city ?? ''))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }, [answers, currentUser?.region.city, state.counselors])

  const recommendations = aiRecommendations ?? localRecommendations

  const runAiMatch = async (finalAnswers: Record<string, string>) => {
    const requestId = ++matchRequest.current
    const city = currentUser?.region.city ?? ''
    const fallback = state.counselors
      .map((c) => scoreCounselor(c, finalAnswers, city))
      .sort((a, b) => b.score - a.score)
    try {
      const data = await serverApi.aiMatch(finalAnswers, city)
      if (requestId !== matchRequest.current) return
      const mapped: Recommendation[] = []
      for (const item of data.recommendations) {
        const counselor = state.counselors.find((c) => c.id === item.counselorId)
        if (!counselor) continue
        const reasons = item.reasons.filter(Boolean).slice(0, 3)
        mapped.push({
          counselor,
          score: item.score,
          reasons: reasons.length > 0 ? reasons : [`专注${counselor.specialties[0]}，与你此刻的困扰贴近`],
        })
        if (mapped.length >= 3) break
      }
      for (const item of fallback) {
        if (mapped.length >= 3) break
        if (!mapped.some((m) => m.counselor.id === item.counselor.id)) mapped.push(item)
      }
      setAiRecommendations(mapped)
      setAiSummary(data.summary)
      setAiSource('ai')
    } catch {
      if (requestId !== matchRequest.current) return
      setAiRecommendations(null)
      setAiSummary('')
      setAiSource('local')
    } finally {
      if (requestId === matchRequest.current) setPhase('results')
    }
  }

  const choose = (option: string) => {
    if (typing || phase !== 'chat') return
    const question = QUESTIONS[step]
    const finalAnswers = { ...answers, [question.id]: option }
    setAnswers(finalAnswers)
    setMessages((prev) => [...prev, { id: `me-${Date.now()}`, role: 'me', text: option }])
    setTyping(true)

    if (step === QUESTIONS.length - 1) {
      schedule(() => {
        setTyping(false)
        setPhase('matching')
        setAiSummary('')
        setAiRecommendations(null)
        void runAiMatch(finalAnswers)
      }, 800)
    } else {
      schedule(() => {
        setTyping(false)
        setStep((s) => s + 1)
        setMessages((prev) => [
          ...prev,
          { id: `ai-q-${step + 1}`, role: 'ai', text: `好，我记下了。${QUESTIONS[step + 1].prompt}` },
        ])
      }, 680)
    }
  }

  const restart = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    matchRequest.current += 1
    setMessages([
      {
        id: 'ai-welcome-again',
        role: 'ai',
        text: '好，我们重新来一次。这次也可以说一点不一样的心事。',
      },
      { id: 'ai-q0-again', role: 'ai', text: QUESTIONS[0].prompt },
    ])
    setAnswers({})
    setStep(0)
    setTyping(false)
    setPhase('chat')
    setAiRecommendations(null)
    setAiSummary('')
    setAiSource('local')
  }

  const currentQuestion = QUESTIONS[step]

  return (
    <div className="page ai-page">
      <TopBar
        title="AI 心情匹配"
        subtitle="由观心 AI 助手提供初步建议"
        back
        right={
          <button className="topbar-icon-text" onClick={restart}>
            <RefreshCw size={15} />
            重来
          </button>
        }
      />

      <div className="ai-intro-bar">
        <div className="ai-status">
          <span className="ai-status-orb">
            <Bot size={16} />
          </span>
          <div>
            <strong>小观 · AI 助手</strong>
            <span>
              <span className="online-dot" /> 在这里陪你
            </span>
          </div>
        </div>
        <button className="ai-region-chip" onClick={() => setRegionOpen(true)}>
          <MapPin size={12} />
          {regionLabel(currentUser?.region)}
        </button>
      </div>

      <div className="ai-chat">
        {messages.map((message) => (
          <div key={message.id} className={cn('ai-message-row', message.role)}>
            {message.role === 'ai' && (
              <span className="ai-message-avatar">
                <Bot size={16} />
              </span>
            )}
            <div className={cn('ai-bubble', message.role)}>{message.text}</div>
          </div>
        ))}
        {typing && (
          <div className="ai-message-row ai">
            <span className="ai-message-avatar">
              <Bot size={16} />
            </span>
            <div className="ai-bubble ai typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        {phase === 'matching' && (
          <div className="ai-matching-card">
            <div className="matching-orbit">
              <Sparkles size={22} />
            </div>
            <strong>正在认真理解你说的话…</strong>
            <p>在 {state.counselors.length} 位咨询师中，寻找和你此刻更贴近的人</p>
            <div className="matching-lines">
              <span className="is-done">
                <Check size={12} /> 已整理你的感受
              </span>
              <span className="is-active">
                <span className="tiny-spinner" /> 正在匹配擅长方向
              </span>
              <span>结合地区、预算与真实咨询师资料</span>
            </div>
          </div>
        )}

        {phase === 'results' && (
          <div className="ai-results" ref={resultsRef}>
            <div className="ai-result-heading">
              <span className="eyebrow">
                <Sparkles size={13} />
                为此刻的你
              </span>
              <span className={cn('ai-source-badge', aiSource === 'ai' ? 'is-ai' : 'is-local')}>
                {aiSource === 'ai' ? 'AI 实时分析' : '本地规则匹配'}
              </span>
              <h2>这 3 位，可能更懂你</h2>
              {aiSummary && <p className="ai-summary">{aiSummary}</p>}
              <p>
                基于你提到的「{answers.concern}」，以及偏好「{answers.style}」。最终选择谁，完全由你决定。
              </p>
              {aiSource === 'local' && (
                <p className="ai-source-note">
                  实时 AI 服务暂不可用，本次使用本地规则匹配；你仍可以正常查看与预约咨询师。
                </p>
              )}
            </div>

            {recommendations.map(({ counselor, score, reasons }, index) => (
              <article className="ai-rec-card" key={counselor.id}>
                <div className="ai-rec-top">
                  <span className="ai-rec-index">0{index + 1}</span>
                  <span className="ai-match">
                    <strong>{score}%</strong> 契合
                  </span>
                </div>
                <div className="ai-rec-person">
                  <Avatar variant={counselor.avatar} name={counselor.name} size={60} online={counselor.online} />
                  <div className="ai-rec-info">
                    <div className="ai-rec-name">
                      <strong>{counselor.name}</strong>
                      <BadgeCheck size={15} />
                      <span>{counselor.title}</span>
                    </div>
                    <p>
                      {counselor.years} 年经验 · {counselor.city} · ★ {counselor.rating.toFixed(1)}
                    </p>
                    <div className="ai-rec-tags">
                      {counselor.specialties.slice(0, 3).map((s) => (
                        <Tag key={s} tone="sage">
                          {s}
                        </Tag>
                      ))}
                    </div>
                  </div>
                  <div className="ai-rec-price">
                    <small>单次</small>
                    <strong>¥{counselor.price}</strong>
                  </div>
                </div>
                <div className="ai-rec-reasons">
                  {reasons.map((reason) => (
                    <span key={reason}>
                      <Check size={12} />
                      {reason}
                    </span>
                  ))}
                  <span>
                    <Check size={12} />
                    {counselor.online ? '近期可预约 · 在线' : '近期可预约'}
                  </span>
                </div>
                <div className="ai-rec-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => nav.navigate({ name: 'counselor', id: counselor.id })}>
                    看看 TA
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => nav.navigate({ name: 'booking', counselorId: counselor.id })}>
                    预约咨询
                    <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            ))}

            <div className="ai-result-footer">
              <button className="ai-link" onClick={restart}>
                <RefreshCw size={14} />
                重新匹配
              </button>
              <span>·</span>
              <button className="ai-link" onClick={() => nav.navigate({ name: 'counseling' })}>
                浏览全部咨询师
              </button>
            </div>
            <p className="ai-disclaimer">
              <ShieldCheck size={13} />
              AI 建议仅作为参考，不构成诊断或治疗意见。你可以自由选择是否预约。
              {aiSource === 'ai' && ' 本次推荐由服务端调用大模型生成；发送内容仅包含你的选项、城市与咨询师公开资料，不包含手机号或密码。'}
            </p>
          </div>
        )}
        <div ref={chatEnd} />
      </div>

      {phase === 'chat' && !typing && (
        <div className="ai-answer-panel">
          <div className="ai-answer-meta">
            <span>问题 {step + 1} / {QUESTIONS.length}</span>
            <span>{currentQuestion.hint}</span>
          </div>
          <div className="ai-options">
            {currentQuestion.options.map((option) => (
              <button key={option} className="ai-option" onClick={() => choose(option)}>
                {option}
                <span>
                  <ArrowRight size={14} />
                </span>
              </button>
            ))}
          </div>
          <div className="ai-input-fake">
            <span>选一个最接近的答案</span>
            <Send size={15} />
          </div>
        </div>
      )}

      {phase === 'matching' && (
        <div className="ai-answer-panel ai-answer-wait">
          <span className="tiny-spinner" />
          正在为你寻找合适的咨询师…
        </div>
      )}

      <RegionSheet
        open={regionOpen}
        onClose={() => setRegionOpen(false)}
        value={currentUser?.region ?? { province: '浙江省', city: '杭州', district: '西湖区' }}
        onConfirm={(region) => {
          updateProfile({ region })
          showToast('地区已更新，推荐会同步调整', 'info')
        }}
      />
    </div>
  )
}
