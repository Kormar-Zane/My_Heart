import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  CalendarHeart,
  Check,
  Crown,
  Gift,
  Infinity as InfinityIcon,
  Mic,
  Percent,
  ShieldCheck,
  Shirt,
  Sparkles,
  Star,
  Video,
  Zap,
} from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Button, Modal, Tag, TopBar } from '../components/UI'
import { VIP_PLANS } from '../theme'
import { activeVipTier, cn, formatDateCN, guanxinId, isVipActive, vipName } from '../utils'

const perks = [
  { icon: Mic, title: '直播连麦', desc: '直接和咨询师对话', tone: 'peach' },
  { icon: Percent, title: '咨询折扣', desc: '预约低至 85 折', tone: 'sage' },
  { icon: Shirt, title: '专属装扮', desc: '限定头像框与徽章', tone: 'gold' },
  { icon: BadgeCheck, title: '身份标识', desc: '名字旁的会员标记', tone: 'blue' },
  { icon: CalendarHeart, title: '面对面权益', desc: '年卡赠 1 次 60 分钟', tone: 'rose' },
  { icon: Zap, title: '优先预约', desc: '热门时段优先安排', tone: 'sand' },
]

export function VipScreen() {
  const { currentUser, purchaseVip, showToast } = useStore()
  const nav = useNav()
  const [selected, setSelected] = useState<'week' | 'month' | 'year'>('month')
  const [payOpen, setPayOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [paying, setPaying] = useState(false)
  const timer = useRef<number | null>(null)
  const currentTier = activeVipTier(currentUser)
  const VIP = isVipActive(currentUser)
  const plan = VIP_PLANS.find((p) => p.tier === selected)!
  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])
  const expires = currentUser?.vipExpiresAt ? new Date(currentUser.vipExpiresAt) : null
  const remainingDays = expires ? Math.max(0, Math.ceil((expires.getTime() - Date.now()) / 86400_000)) : 0

  const openPayment = () => {
    setPayOpen(true)
    setPaying(false)
  }

  const pay = () => {
    setPaying(true)
    timer.current = window.setTimeout(() => {
      const result = purchaseVip(selected)
      setPaying(false)
      setPayOpen(false)
      if (result.ok) setSuccessOpen(true)
      else showToast(result.message ?? '开通失败', 'error')
    }, 900)
  }

  return (
    <div className="page vip-page">
      <TopBar title="VIP 中心" subtitle="让陪伴更靠近一点" back />

      <section className="vip-hero">
        <div className="vip-hero-glow" />
        <div className="vip-hero-stars">✦ · ✧ · ✦</div>
        <span className="vip-hero-eyebrow">
          <Crown size={14} />
          GUANXIN VIP
        </span>
        {VIP ? (
          <>
            <h1>
              {vipName(currentTier)}
              <br />
              <em>正在陪伴你。</em>
            </h1>
            <p>有效期至 {expires ? formatDateCN(expires) : '—'} · 剩余 {remainingDays} 天</p>
            <div className="vip-hero-status">
              <span>
                <Check size={13} />
                直播连麦已解锁
              </span>
              <span>
                <Check size={13} />
                咨询折扣已生效
              </span>
            </div>
          </>
        ) : (
          <>
            <h1>
              有些陪伴，
              <br />
              <em>可以更靠近一点。</em>
            </h1>
            <p>无限连麦、咨询折扣、专属装扮，以及一次真实的面对面相遇。</p>
            <div className="vip-hero-status">
              <span>
                <Mic size={13} /> 连麦咨询师
              </span>
              <span>
                <Percent size={13} /> 咨询低至 85 折
              </span>
              <span>
                <Gift size={13} /> 专属装扮
              </span>
            </div>
          </>
        )}
        <div className="vip-hero-card">
          <span className="vip-hero-card-mark">
            <Crown size={25} />
          </span>
          <div>
            <small>观心 VIP</small>
            <strong>{VIP ? vipName(currentTier) : '待开启'}</strong>
          </div>
          <span className="vip-hero-card-id">{currentUser ? guanxinId(currentUser.id) : 'GUEST'}</span>
        </div>
        <span className="vip-hero-glyph">VIP</span>
      </section>

      <section className="vip-plans">
        <div className="vip-section-head">
          <div>
            <h2>选择你的陪伴方式</h2>
            <p>随时可续费，权益立即生效</p>
          </div>
          <Tag tone="gold">限时内测价</Tag>
        </div>
        <div className="vip-plan-list">
          {VIP_PLANS.map((item) => {
            const active = selected === item.tier
            const isCurrent = currentTier === item.tier
            return (
              <button
                key={item.tier}
                className={cn('vip-plan', active && 'is-active', item.tier === 'month' && 'is-featured')}
                onClick={() => setSelected(item.tier)}
              >
                {item.tier === 'month' && <span className="vip-plan-ribbon">最受欢迎</span>}
                {isCurrent && <span className="vip-plan-current">当前</span>}
                <div className="vip-plan-radio">
                  {active && <span />}
                </div>
                <div className="vip-plan-main">
                  <div className="vip-plan-title">
                    <strong>{item.name}</strong>
                    <Tag tone="outline">{item.tag}</Tag>
                  </div>
                  <div className="vip-plan-price">
                    <small>¥</small>
                    <strong>{item.price}</strong>
                    <span>/ {item.days} 天</span>
                  </div>
                  <p className="vip-plan-mic">
                    {item.tier === 'week' ? <Mic size={13} /> : item.tier === 'month' ? <InfinityIcon size={13} /> : <Gift size={13} />}
                    {item.mic}
                    {item.tier === 'year' && ' + 1 次面对面'}
                  </p>
                  <div className="vip-plan-perks">
                    {item.perks.slice(0, 3).map((perk) => (
                      <span key={perk}>
                        <Check size={11} /> {perk}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="vip-plan-price-tag">
                  {item.tier === 'week' ? '尝鲜' : item.tier === 'month' ? '热选' : '最划算'}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="vip-perks">
        <div className="vip-section-head">
          <div>
            <h2>会员专属权益</h2>
            <p>每一份，都为了让陪伴更容易</p>
          </div>
        </div>
        <div className="vip-perk-grid">
          {perks.map((perk) => {
            const Icon = perk.icon
            return (
              <div className="vip-perk" key={perk.title}>
                <span className={cn('vip-perk-icon', `tone-${perk.tone}`)}>
                  <Icon size={19} />
                </span>
                <strong>{perk.title}</strong>
                <p>{perk.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="vip-yeal-card">
        <div className="vip-yeal-copy">
          <span className="eyebrow eyebrow-light">
            <Star size={13} />
            年度特别权益
          </span>
          <h2>一次真实的面对面，<br />由你来决定。</h2>
          <p>开通年卡即赠 1 次 60 分钟面对面咨询。你可以自由选择咨询师、时间与地点，也可以用于已选咨询师的线下时段。</p>
          <div className="vip-yeal-tags">
            <span>60 分钟</span>
            <span>自选咨询师</span>
            <span>自选时间</span>
          </div>
        </div>
        <div className="vip-yeal-visual">
          <CalendarHeart size={39} />
          <span>+1</span>
          <small>面对面</small>
        </div>
      </section>

      <section className="vip-compare">
        <h2>三种方案，怎么选？</h2>
        <div className="vip-compare-table">
          <div className="vip-compare-row header">
            <span>权益</span>
            <span>周卡</span>
            <span>月卡</span>
            <span>年卡</span>
          </div>
          {[
            ['连麦机会', '2 次', '无限', '无限'],
            ['咨询折扣', '95 折', '9 折', '85 折'],
            ['专属装扮', '周卡款', '全部', '全部 + 年度'],
            ['面对面咨询', '—', '—', '赠 1 次'],
          ].map(([label, week, month, year]) => (
            <div className="vip-compare-row" key={label}>
              <span>{label}</span>
              <span>{week}</span>
              <span>{month}</span>
              <span>{year}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="vip-fineprint">
        <ShieldCheck size={14} />
        <p>演示环境为模拟支付，不会产生真实扣款。会员权益自开通时起算，虚拟商品不支持退款。年卡面对面权益自开通日起 365 天内有效。</p>
      </div>

      <div className="vip-sticky">
        <div className="vip-sticky-price">
          <span>{VIP ? '续费' : '开通'} {plan.name}</span>
          <strong>
            <small>¥</small>
            {plan.price}
          </strong>
          <em>{plan.discount > 0 ? `咨询 ${Math.round(plan.discount * 100) / 10} 折优惠` : ''}</em>
        </div>
        <Button size="lg" onClick={openPayment} className="vip-buy-button">
          立即{VIP ? '续费' : '开通'}
          <ArrowRight size={16} />
        </Button>
      </div>

      <Modal open={payOpen} onClose={() => !paying && setPayOpen(false)} dismissible={!paying} className="vip-pay-modal">
        <p className="success-eyebrow">确认订单</p>
        <h2>{plan.name} · 观心 VIP</h2>
        <div className="vip-pay-card">
          <div>
            <span>观心 VIP · {plan.name}</span>
            <small>{plan.days} 天会员权益</small>
          </div>
          <strong>¥{plan.price}</strong>
        </div>
        <div className="vip-pay-method">
          <span className="vip-pay-method-icon">微</span>
          <div>
            <strong>微信支付</strong>
            <small>演示环境 · 不会真实扣款</small>
          </div>
          <span className="vip-pay-method-check">
            <Check size={13} />
          </span>
        </div>
        <Button full size="lg" onClick={pay} disabled={paying}>
          {paying ? (
            <span className="btn-loading">
              <span />
              <span />
              <span />
            </span>
          ) : (
            `确认支付 ¥${plan.price}`
          )}
        </Button>
        <p className="vip-pay-agreement">支付即表示同意《观心会员服务协议》</p>
      </Modal>

      <Modal open={successOpen} onClose={() => setSuccessOpen(false)} dismissible={false} className="vip-success-modal">
        <div className="vip-success-crown">
          <Crown size={36} />
          <span>✦</span>
        </div>
        <p className="success-eyebrow">开通成功</p>
        <h2>{plan.name}会员已生效</h2>
        <p className="success-sub">
          {selected === 'year'
            ? '1 次免费面对面咨询已放入你的权益，随时可以预约。'
            : selected === 'week'
              ? '2 次连麦机会已到账，去直播间和咨询师聊聊吧。'
              : '无限次连麦已解锁，专属装扮也为你打开了。'}
        </p>
        <div className="vip-success-perks">
          <span><Check size={13} /> 连麦权益</span>
          <span><Check size={13} /> 咨询折扣</span>
          <span><Check size={13} /> 专属装扮</span>
        </div>
        {selected === 'year' && (
          <div className="vip-success-gift">
            <Gift size={17} />
            <span>年卡赠礼 · 60 分钟面对面咨询 × 1</span>
          </div>
        )}
        <Button full size="lg" onClick={() => setSuccessOpen(false)}>
          开始享受陪伴
        </Button>
        <button
          className="success-home"
          onClick={() => {
            setSuccessOpen(false)
            nav.navigate({ name: 'dressup' })
          }}
        >
          <Sparkles size={14} />
          查看专属装扮
        </button>
      </Modal>
    </div>
  )
}
