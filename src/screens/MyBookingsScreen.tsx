import { useState } from 'react'
import { CalendarDays, Clock3, MapPin, MessageCircle, Sparkles, Video, XCircle } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Avatar } from '../components/Avatar'
import { Button, EmptyState, Modal, Segmented, Tag, TopBar } from '../components/UI'
import type { Booking } from '../types'
import { addMinutes, cn, formatDateCN, formatPrice, isoDate, weekdayCN } from '../utils'

type BookingTab = 'upcoming' | 'completed' | 'cancelled'

const formatLabel = { video: '视频咨询', voice: '语音咨询', inperson: '面对面' }

export function MyBookingsScreen() {
  const { state, cancelBooking, ensureCounselorConversation, showToast } = useStore()
  const nav = useNav()
  const [tab, setTab] = useState<BookingTab>('upcoming')
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)

  const bookings = state.bookings
    .filter((b) => b.status === tab)
    .sort((a, b) => {
      const left = `${a.date}T${a.time}`
      const right = `${b.date}T${b.time}`
      return tab === 'upcoming' ? left.localeCompare(right) : right.localeCompare(left)
    })
  const upcomingCount = state.bookings.filter((b) => b.status === 'upcoming').length

  const openChat = (booking: Booking) => {
    const counselor = state.counselors.find((c) => c.id === booking.counselorId)
    if (!counselor) return
    const id = ensureCounselorConversation(counselor)
    nav.navigate({ name: 'conversation', id })
  }

  const durationOf = (booking: Booking) => (booking.usedVoucher ? 60 : 50)

  const countdownLabel = (booking: Booking) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(`${booking.date}T00:00:00`)
    const diff = Math.round((target.getTime() - today.getTime()) / 86400_000)
    if (booking.date === isoDate(new Date())) return '今天'
    if (diff === 1) return '明天'
    if (diff <= 0) return '待确认'
    return `还有 ${diff} 天`
  }

  return (
    <div className="page my-bookings-page">
      <TopBar title="我的预约" subtitle={upcomingCount > 0 ? `有 ${upcomingCount} 次咨询在等你` : '给自己留一段时间'} back />

      <div className="bookings-tabs">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'upcoming', label: '待咨询', count: state.bookings.filter((b) => b.status === 'upcoming').length },
            { value: 'completed', label: '已完成' },
            { value: 'cancelled', label: '已取消' },
          ]}
        />
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          emoji="🗓️"
          title={tab === 'upcoming' ? '还没有待赴的约' : tab === 'completed' ? '还没有完成的咨询' : '没有取消的预约'}
          description={tab === 'upcoming' ? '当你准备好时，找一位合适的咨询师聊聊吧。' : '每一次照顾自己的尝试，都值得被记住。'}
          action={
            <Button size="sm" onClick={() => nav.navigate({ name: 'counseling' })}>
              去预约咨询
            </Button>
          }
        />
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => {
            const institution = state.institutions.find(
              (i) => i.id === state.counselors.find((c) => c.id === booking.counselorId)?.institutionId,
            )
            return (
              <article className={cn('booking-card', `is-${booking.status}`)} key={booking.id}>
                <div className="booking-card-top">
                  <Avatar variant={booking.counselorAvatar} name={booking.counselorName} size={50} />
                  <div>
                    <strong>{booking.counselorName}</strong>
                    <p>{formatLabel[booking.format]} · {durationOf(booking)} 分钟{booking.usedVoucher ? ' · 年卡权益' : ''}</p>
                  </div>
                  <span className={cn('booking-status', `status-${booking.status}`)}>
                    {booking.status === 'upcoming' ? '待咨询' : booking.status === 'completed' ? '已完成' : '已取消'}
                  </span>
                </div>

                <div className="booking-date-box">
                  <div className="booking-date-main">
                    <span className="booking-date-month">{Number(booking.date.slice(5, 7))}月</span>
                    <strong>{Number(booking.date.slice(8, 10))}</strong>
                    <span>{weekdayCN(booking.date)}</span>
                  </div>
                  <div className="booking-date-info">
                    <p>
                      <Clock3 size={14} />
                      {booking.time} - {addMinutes(booking.time, durationOf(booking))}（{durationOf(booking)} 分钟）
                    </p>
                    <p>
                      {booking.format === 'inperson' ? <MapPin size={14} /> : <Video size={14} />}
                      {booking.format === 'inperson' ? institution?.name ?? '线下咨询室' : '观心线上咨询室'}
                    </p>
                    <p>
                      <CalendarDays size={14} />
                      {formatDateCN(booking.date)} {weekdayCN(booking.date)}
                    </p>
                  </div>
                  {booking.status === 'upcoming' && <span className="booking-countdown">{countdownLabel(booking)}</span>}
                </div>

                <div className="booking-card-meta">
                  <span>
                    {booking.usedVoucher ? '年卡面对面权益' : `¥${formatPrice(booking.price)}`}
                  </span>
                  {booking.usedVoucher && <Tag tone="gold">年卡权益</Tag>}
                  {booking.originalPrice > booking.price && !booking.usedVoucher && (
                    <span className="booking-original">原价 ¥{booking.originalPrice}</span>
                  )}
                </div>

                {booking.status === 'upcoming' ? (
                  <div className="booking-card-actions">
                    <button className="booking-action-secondary" onClick={() => openChat(booking)}>
                      <MessageCircle size={15} />
                      联系咨询师
                    </button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (booking.format === 'inperson') {
                          showToast('请按预约时间前往咨询室，提前 10 分钟签到', 'info')
                        } else {
                          showToast('咨询室将在开始前 10 分钟开放，届时会提醒你', 'info')
                        }
                      }}
                    >
                      进入咨询室
                    </Button>
                    <button className="booking-cancel" onClick={() => setCancelTarget(booking)}>
                      取消
                    </button>
                  </div>
                ) : (
                  <div className="booking-card-actions">
                    <button className="booking-action-secondary" onClick={() => openChat(booking)}>
                      <MessageCircle size={15} />
                      联系咨询师
                    </button>
                    <Button size="sm" variant="secondary" onClick={() => nav.navigate({ name: 'booking', counselorId: booking.counselorId })}>
                      再次预约
                    </Button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      <div className="bookings-note">
        <Sparkles size={14} />
        <p>咨询开始前 24 小时可免费取消。如需改期，请先取消后重新预约，或联系咨询师协商。</p>
      </div>

      <Modal open={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} className="cancel-modal">
        <div className="cancel-icon">
          <XCircle size={30} />
        </div>
        <p className="success-eyebrow">取消预约</p>
        <h2>确定要取消这次咨询吗？</h2>
        <p className="success-sub">
          {cancelTarget?.counselorName} · {cancelTarget ? `${formatDateCN(cancelTarget.date)} ${cancelTarget.time}` : ''}
          <br />
          取消后，这个时段会重新开放给其他人。
        </p>
        <div className="cancel-actions">
          <Button variant="secondary" onClick={() => setCancelTarget(null)}>
            先不取消
          </Button>
          <Button
            onClick={() => {
              if (cancelTarget) cancelBooking(cancelTarget.id)
              setCancelTarget(null)
            }}
          >
            确认取消
          </Button>
        </div>
      </Modal>
    </div>
  )
}
