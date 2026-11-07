import type { Counselor, Region, User, VipTier } from './types'

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3600_000).toISOString()
}

export function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

export function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return '刚刚'
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}分钟前`
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}小时前`
  if (diff < 2 * 86400_000) return '昨天'
  if (diff < 7 * 86400_000) return `${Math.floor(diff / 86400_000)}天前`
  const d = new Date(iso)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function formatClock(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function formatDateCN(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function weekdayCN(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
}

export function isoDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getGreeting() {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 11) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

export function regionLabel(region?: Region) {
  if (!region) return '未选择地区'
  return `${region.city} · ${region.district}`
}

export function regionFullLabel(region?: Region) {
  if (!region) return '未选择地区'
  const provinceShort = region.province.replace(/省|市|自治区|特别行政区/g, '')
  const cityShort = region.city.replace(/市/g, '')
  if (provinceShort === cityShort) return `${region.province} · ${region.district}`
  return `${region.province} · ${region.city} · ${region.district}`
}

export function addMinutes(time: string, minutes: number) {
  const [hour, minute] = time.split(':').map(Number)
  const total = hour * 60 + minute + minutes
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function isVipActive(user?: User | null) {
  if (!user || user.vipTier === 'none' || !user.vipExpiresAt) return false
  return new Date(user.vipExpiresAt).getTime() > Date.now()
}

export function activeVipTier(user?: User | null): VipTier {
  return isVipActive(user) ? (user?.vipTier ?? 'none') : 'none'
}

export function vipName(tier: VipTier) {
  return ({ none: '普通用户', week: '周卡会员', month: '月卡会员', year: '年卡会员' } as const)[tier]
}

export function vipDiscount(tier: VipTier) {
  return ({ none: 1, week: 0.95, month: 0.9, year: 0.85 } as const)[tier]
}

export function micIsUnlimited(tier: VipTier) {
  return tier === 'month' || tier === 'year'
}

export function getInitials(name: string) {
  return name.slice(0, 1)
}

export function guanxinId(id: string) {
  if (id === 'u_demo') return 'GX-000128'
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 900000
  }
  return `GX-${String(hash + 100000)}`
}

export function counselorsInRegion(counselors: Counselor[], region?: Region) {
  if (!region) return counselors
  return counselors.filter((c) => c.city === region.city || c.district === region.district)
}

export function formatPrice(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function nextDays(count: number) {
  const days: Date[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push(d)
  }
  return days
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function compressImage(file: File, maxSide = 1100, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('图片读取失败'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('图片解析失败'))
      img.onload = () => {
        const ratio = Math.min(1, maxSide / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('图片处理失败'))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}
