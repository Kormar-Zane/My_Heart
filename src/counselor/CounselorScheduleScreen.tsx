import { useState } from 'react'
import {
  CalendarDays,
  CalendarClock,
  Check,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  Sparkles,
  Video,
  X,
} from 'lucide-react'
import { useStore } from '../store'
import { useCounselorNav } from './navigation'
import { Avatar } from '../components/Avatar'
import { Button, EmptyState, Segmented, Tag } from '../components/UI'
import { CounselorTopBar } from './components'
import type { Booking } from '../types'
import { addMinutes, cn, formatDateCN, isoDate, weekdayCN } from '../utils'

type ScheduleTab = 'upcoming' | 'completed' | 'cancelled'
const formatLabel = { video: '视频咨询', voice: '语音咨询', inperson: '面对面' }

export function CounselorScheduleScreen() {
  const { state, currentCounselorAccount, showToast } = useStore()
  const nav = useCounselorNav()
  const [tab, setTab] = useState<ScheduleTab>('upcoming')
  if (!currentCounselorAccount) return null
  const counselorId = currentCounselorAccount.counselorId

  const all = state.bookings.filter((booking) => booking.counselorId === counselorId)
  const bookings = all
    .filter((booking) => booking.status === tab)
    .sort((a, b) =>
      tab === 'upcoming'
        ? `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
        : `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`),
    )
  const upcomingCount = all.filter((booking) => booking.status === 'upcoming').length
  const todayCount = all.filter(
    (booking) => booking.status === 'upcoming' && booking.date === isoDate(new Date()),
  ).length

  const findChat = (booking: Booking) => {
    if (!booking.clientName) return undefined
    return state.counselorChats.find(
      (chat) => chat.counselorId === counselorId && chat.clientName === booking.clientName,
    )
  }

  return (
    <div className="page ca-page ca-schedule-page">
      <CounselorTopBar title="咨询日程" subtitle="把时间留给真正重要的人" back />

      <section className="ca-schedule-summary">
        <div className="ca-schedule-summary-copy">
          <span className="ca-eyebrow">
            <CalendarClock size={13} />
            THIS WEEK
          </span>
          <h1>
            把每一次见面，
            <br />
            <em>都好好准备。</em>
          </h1>
          <p>今天是 {formatDateCN(new Date())}，你有 {todayCount} 个咨询安排。</p>
        </div>
        <div className="ca-schedule-summary-icon">
          <CalendarDays size={34} />
          <span>{upcomingCount}</span>
          <small>待咨询</small>
        </div>
      </section>

      <div className="ca-schedule-tabs">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'upcoming', label: '待咨询', count: all.filter((b) => b.status === 'upcoming').length },
            { value: 'completed', label: '已完成', count: all.filter((b) => b.status === 'completed').length },
            { value: 'cancelled', label: '已取消' },
          ]}
        />
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          emoji="🗓️"
          title={tab === 'upcoming' ? '暂时没有新的预约' : tab === 'completed' ? '还没有已完成的咨询' : '没有取消的预约'}
          description={tab === 'upcoming' ? '用户端预约后会出现在这里。也可以先开始一场直播。' : '咨询记录会在完成后归档。'}
          action={
            tab === 'upcoming' ? (
              <Button size="sm" onClick={() => nav.navigate({ name: 'live-setup' })}>
                开启一场直播
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="ca-schedule-list">
          {bookings.map((booking) => {
            const chat = findChat(booking)
            return (
              <article className="ca-schedule-card-detail" key={booking.id}>
                <div className="ca-schedule-card-head">
                  <Avatar
                    variant={booking.clientAvatar ?? 'me'}
                    name={booking.clientName ?? '来访者'}
                    size={46}
                    online
                  />
                  <div>
                    <strong>{booking.clientName ?? '来访者'}</strong>
                    <p>{formatLabel[booking.format]} · {booking.usedVoucher ? '60' : '50'} 分钟</p>
                  </div>
                  <span className={cn('ca-schedule-status', `is-${booking.status}`)}>
                    {booking.status === 'upcoming' ? '待咨询' : booking.status === 'completed' ? '已完成' : '已取消'}
                  </span>
                </div>

                <div className="ca-schedule-date">
                  <div>
                    <span>{booking.date.slice(5, 7)}月</span>
                    <strong>{Number(booking.date.slice(8, 10))}</strong>
                    <small>{weekdayCN(booking.date)}</small>
                  </div>
                  <div className="ca-schedule-date-copy">
                    <span>
                      <Clock3 size={13} />
                      {booking.time} - {addMinutes(booking.time, booking.usedVoucher ? 60 : 50)}
                    </span>
                    <span>
                      {booking.format === 'inperson' ? <MapPin size={13} /> : <Video size={13} />}
                      {booking.format === 'inperson' ? '线下咨询室' : '观心线上咨询室'}
                    </span>
                    <span>
                      <CalendarDays size={13} />
                      {formatDateCN(booking.date)}
                    </span>
                  </div>
                  {booking.status === 'upcoming' && <span className="ca-schedule-today">{booking.date === isoDate(new Date()) ? '今天' : '待赴约'}</span>}
                </div>

                <div className="ca-schedule-card-actions">
                  {chat ? (
                    <button onClick={() => nav.navigate({ name: 'chat', id: chat.id })}>
                      <MessageCircle size={14} />
                      联系来访者
                    </button>
                  ) : (
                    <button onClick={() => nav.switchTab('messages')}>
                      <MessageCircle size={14} />
                      查看消息
                    </button>
                  )}
                  {booking.status === 'upcoming' ? (
                    <Button
                      size="sm"
                      onClick={() => showToast('咨询室将在开始前 10 分钟开放（演示）', 'info')}
                    >
                      进入咨询室
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => showToast('咨询记录将在正式版开放', 'info')}
                    >
                      查看记录
                    </Button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <div className="ca-schedule-note">
        <Sparkles size={13} />
        咨询开始前 24 小时可免费改期。请提前 5 分钟进入咨询室，给自己和来访者一点缓冲。
      </div>

      <section className="ca-schedule-manage">
        <div className="ca-section-head">
          <div>
            <h2>接诊设置</h2>
            <p>当前为演示工作台</p>
          </div>
          <ChevronRight size={16} />
        </div>
        <div className="ca-schedule-manage-row">
          <span>
            <Check size={14} />
            接受新预约
          </span>
          <em>已开启</em>
        </div>
        <div className="ca-schedule-manage-row">
          <span>
            <X size={14} />
            暂停本周新预约
          </span>
          <em>演示选项</em>
        </div>
      </section>
    </div>
  )
}
