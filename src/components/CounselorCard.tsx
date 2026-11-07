import { BadgeCheck, MapPin } from 'lucide-react'
import type { Counselor } from '../types'
import { useNav } from '../navigation'
import { Avatar } from './Avatar'
import { Rating, Tag } from './UI'
import { cn } from '../utils'

export function CounselorCard({ counselor, rank }: { counselor: Counselor; rank?: number }) {
  const nav = useNav()
  return (
    <button className="counselor-card" onClick={() => nav.navigate({ name: 'counselor', id: counselor.id })}>
      <div className="counselor-avatar-wrap">
        <Avatar variant={counselor.avatar} name={counselor.name} size={62} online={counselor.online} />
        {rank !== undefined && <span className="counselor-rank">推荐 {rank}</span>}
      </div>
      <div className="counselor-card-body">
        <div className="counselor-name-line">
          <strong>{counselor.name}</strong>
          <BadgeCheck size={15} className="counselor-verified" />
          <span className="counselor-title">{counselor.gender === '女' ? '她' : '他'} · {counselor.years} 年</span>
        </div>
        <p className="counselor-card-title">{counselor.title}</p>
        <div className="counselor-tags">
          {counselor.specialties.slice(0, 3).map((s) => (
            <Tag key={s} tone="sage">
              {s}
            </Tag>
          ))}
        </div>
        <div className="counselor-meta-line">
          <Rating value={counselor.rating} />
          <span>{counselor.sessions} 次陪伴</span>
          <span className="counselor-city">
            <MapPin size={11} />
            {counselor.city} · {counselor.district}
          </span>
        </div>
      </div>
      <div className="counselor-price-col">
        <strong>
          <small>¥</small>
          {counselor.price}
        </strong>
        <span>/ 50 分钟</span>
        <em className={cn('counselor-status', counselor.online && 'is-online')}>{counselor.online ? '在线' : '可预约'}</em>
      </div>
    </button>
  )
}
