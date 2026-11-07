import { useMemo, useState } from 'react'
import { ArrowRight, CalendarCheck2, Check, Clock3, Crown, Gift, MapPin, ShieldCheck, Sparkles, Video } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Avatar } from '../components/Avatar'
import { Button, Modal, Tag, TopBar } from '../components/UI'
import type { SessionFormat } from '../types'
import {
  activeVipTier,
  cn,
  formatDateCN,
  formatPrice,
  isoDate,
  nextDays,
  vipDiscount,
  vipName,
  weekdayCN,
} from '../utils'

const formatMeta: Record<SessionFormat, { label: string; icon: string; hint: string }> = {
  video: { label: '视频咨询', icon: '📹', hint: '线上 · 50 分钟' },
  voice: { label: '语音咨询', icon: '🎧', hint: '线上 · 50 分钟' },
  inperson: { label: '面对面', icon: '🏡', hint: '线下 · 50 分钟' },
}

const timeSlots = ['09:30', '10:30', '14:00', '15:00', '16:30', '19:00', '20:00']

function endTime(start: string, minutes: number) {
  const [hour, minute] = start.split(':').map(Number)
  const total = hour * 60 + minute + minutes
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function BookingScreen({ counselorId }: { counselorId: string }) {
  const { state, currentUser, createBooking, ensureCounselorConversation, sendMessage, showToast } = useStore()
  const nav = useNav()
  const counselor = state.counselors.find((c) => c.id === counselorId)
  if (!counselor) return null

  const days = useMemo(() => nextDays(7), [])
  const [format, setFormat] = useState<SessionFormat>(counselor.formats[0] ?? 'video')
  const [date, setDate] = useState(isoDate(days[0]))
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')
  const [useVoucher, setUseVoucher] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')

  const tier = activeVipTier(currentUser)
  const discount = vipDiscount(tier)
  const hasVoucher = (currentUser?.faceToFaceVoucher ?? 0) > 0
  const inPersonAvailable = counselor.formats.includes('inperson')

  const discounted = Math.round(counselor.price * discount)
  const finalPrice = useVoucher && format === 'inperson' && hasVoucher ? 0 : discounted
  const saving = counselor.price - finalPrice

  const confirm = () => {
    if (!time) {
      setError('请选择一个你方便的时间')
      return
    }
    if (useVoucher && format !== 'inperson') {
      setError('年卡面对面权益仅适用于面对面咨询')
      return
    }
    const result = createBooking({
      counselorId: counselor.id,
      counselorName: counselor.name,
      counselorAvatar: counselor.avatar,
      date,
      time,
      format,
      price: finalPrice,
      originalPrice: counselor.price,
      usedVoucher: useVoucher,
    })
    if (!result.ok) {
      showToast(result.message ?? '预约失败', 'error')
      return
    }
    const convId = ensureCounselorConversation(counselor)
    const voucherText = useVoucher ? '（使用年卡免费面对面权益）' : ''
    sendMessage(
      convId,
      `你好，我预约了 ${formatDateCN(date)} ${time} 的${formatMeta[format].label}${voucherText}。${note ? `想提前说：${note}` : ''}`,
    )
    setConfirmed(true)
  }

  return (
    <div className="page booking-page">
      <TopBar title="预约咨询" subtitle="给自己留一段被照顾的时间" back />

      <section className="booking-counselor">
        <Avatar variant={counselor.avatar} name={counselor.name} size={54} online={counselor.online} />
        <div>
          <div className="booking-counselor-name">
            <strong>{counselor.name}</strong>
            <Tag tone="sage">{counselor.style}</Tag>
          </div>
          <p>{counselor.title}</p>
          <span>
            <MapPin size={11} />
            {counselor.city} · {counselor.district} · ★ {counselor.rating.toFixed(1)}
          </span>
        </div>
      </section>

      {tier !== 'none' && (
        <div className="booking-vip-note">
          <Crown size={15} />
          <span>
            你是{vipName(tier)}，本次预约享 <strong>{Math.round(discount * 100) / 10} 折</strong>
          </span>
          <Sparkles size={14} />
        </div>
      )}

      <section className="booking-section">
        <div className="booking-section-head">
          <h2>
            <span>01</span> 咨询方式
          </h2>
          <small>选择让你安心的方式</small>
        </div>
        <div className="format-options">
          {counselor.formats.map((f) => (
            <button
              key={f}
              className={cn('format-option', format === f && 'is-active')}
              onClick={() => {
                setFormat(f)
                if (f !== 'inperson') setUseVoucher(false)
                setError('')
              }}
            >
              <span>{formatMeta[f].icon}</span>
              <strong>{formatMeta[f].label}</strong>
              <small>{f === 'inperson' ? `${counselor.city} · 线下` : formatMeta[f].hint}</small>
              {format === f && (
                <span className="option-check">
                  <Check size={11} strokeWidth={3} />
                </span>
              )}
            </button>
          ))}
        </div>
        {!inPersonAvailable && <p className="booking-hint">这位咨询师目前只提供线上咨询。</p>}
      </section>

      <section className="booking-section">
        <div className="booking-section-head">
          <h2>
            <span>02</span> 选择日期
          </h2>
          <small>未来 7 天</small>
        </div>
        <div className="date-strip">
          {days.map((day, i) => {
            const value = isoDate(day)
            return (
              <button
                key={value}
                className={cn('date-chip', date === value && 'is-active')}
                onClick={() => {
                  setDate(value)
                  setTime('')
                  setError('')
                }}
              >
                <small>{i === 0 ? '今天' : weekdayCN(day)}</small>
                <strong>{day.getDate()}</strong>
                <span>{day.getMonth() + 1}月</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="booking-section">
        <div className="booking-section-head">
          <h2>
            <span>03</span> 选择时间
          </h2>
          <small>北京时间 GMT+8</small>
        </div>
        <div className="time-grid">
          {timeSlots.map((slot, index) => {
            const unavailable = index === 2 && date === isoDate(days[0])
            return (
              <button
                key={slot}
                className={cn('time-chip', time === slot && 'is-active', unavailable && 'is-disabled')}
                disabled={unavailable}
                onClick={() => {
                  setTime(slot)
                  setError('')
                }}
              >
                {slot}
                {unavailable && <small>已约满</small>}
              </button>
            )
          })}
        </div>
      </section>

      {hasVoucher && inPersonAvailable && (
        <button
          className={cn('voucher-card', useVoucher && 'is-active', format !== 'inperson' && 'is-disabled')}
          onClick={() => {
            if (format !== 'inperson') {
              showToast('请先选择面对面咨询，再使用年卡权益', 'info')
              return
            }
            setUseVoucher((v) => !v)
          }}
        >
          <span className="voucher-icon">
            <Gift size={20} />
          </span>
          <span className="voucher-copy">
            <strong>年卡免费面对面权益</strong>
            <small>剩余 {currentUser?.faceToFaceVoucher} 次 · 可抵扣本次 60 分钟面对面咨询</small>
          </span>
          <span className={cn('toggle', useVoucher && 'is-on')}>
            <span />
          </span>
        </button>
      )}

      <section className="booking-section">
        <div className="booking-section-head">
          <h2>
            <span>04</span> 想先说的话
          </h2>
          <small>选填</small>
        </div>
        <textarea
          className="booking-note"
          value={note}
          maxLength={200}
          onChange={(e) => setNote(e.target.value)}
          placeholder="可以简单说说最近的状态，或希望咨询师提前了解的事…"
        />
        <div className="booking-note-count">{note.length} / 200</div>
      </section>

      <section className="booking-summary">
        <h2>费用明细</h2>
        <div className="summary-row">
          <span>{formatMeta[format].label} · 50 分钟</span>
          <span>¥{counselor.price}</span>
        </div>
        {tier !== 'none' && (
          <div className="summary-row summary-discount">
            <span>
              <Crown size={13} /> {vipName(tier)}折扣
            </span>
            <span>-¥{counselor.price - discounted}</span>
          </div>
        )}
        {useVoucher && (
          <div className="summary-row summary-discount">
            <span>
              <Gift size={13} /> 年卡面对面权益
            </span>
            <span>-¥{discounted}</span>
          </div>
        )}
        <div className="summary-total">
          <span>合计</span>
          <strong>
            <small>¥</small>
            {formatPrice(finalPrice)}
          </strong>
        </div>
        {saving > 0 && <p className="summary-saving">本次已为你省下 ¥{formatPrice(saving)}</p>}
      </section>

      {tier === 'none' && (
        <button className="booking-vip-upsell" onClick={() => nav.navigate({ name: 'vip' })}>
          <Crown size={17} />
          <div>
            <strong>开通 VIP，咨询低至 85 折</strong>
            <small>还有免费直播连麦、专属装扮等福利</small>
          </div>
          <ArrowRight size={16} />
        </button>
      )}

      <div className="booking-policy">
        <ShieldCheck size={14} />
        <p>预约开始前 24 小时可免费取消。咨询内容严格保密，观心不会向任何第三方披露。</p>
      </div>

      <div className="detail-sticky-bar booking-sticky">
        <div className="detail-price">
          <span>合计</span>
          <strong>
            <small>¥</small>
            {formatPrice(finalPrice)}
          </strong>
          {saving > 0 && <em>已优惠 ¥{formatPrice(saving)}</em>}
        </div>
        <Button size="md" onClick={confirm} className="booking-confirm-button">
          确认预约
        </Button>
      </div>
      {error && <div className="booking-error-toast">{error}</div>}

      <Modal open={confirmed} onClose={() => setConfirmed(false)} dismissible={false} className="booking-success-modal">
        <div className="success-orbit">
          <CalendarCheck2 size={32} />
        </div>
        <p className="success-eyebrow">预约成功</p>
        <h2>把这段时间，留给自己</h2>
        <p className="success-sub">
          {counselor.name} · {formatMeta[format].label}
        </p>
        <div className="success-card">
          <div>
            <CalendarCheck2 size={17} />
            <span>
              {formatDateCN(date)} {weekdayCN(date)}
            </span>
          </div>
          <div>
            <Clock3 size={17} />
            <span>
              {time} - {endTime(time, useVoucher ? 60 : 50)}（约 {useVoucher ? 60 : 50} 分钟）
            </span>
          </div>
          <div>
            {format === 'inperson' ? <MapPin size={17} /> : <Video size={17} />}
            <span>
              {format === 'inperson'
                ? `${counselor.city} · ${state.institutions.find((i) => i.id === counselor.institutionId)?.name}`
                : '观心线上咨询室'}
            </span>
          </div>
        </div>
        <p className="success-note">咨询开始前 10 分钟，我们会发消息提醒你。现在，可以先深呼吸一下。</p>
        <Button full size="lg" onClick={() => nav.replace({ name: 'bookings' })}>
          查看我的预约
        </Button>
        <button className="success-home" onClick={() => nav.switchTab('home')}>
          先回首页
        </button>
      </Modal>
    </div>
  )
}
