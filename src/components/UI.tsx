import { createPortal } from 'react-dom'
import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { REGION_DATA } from '../theme'
import type { Region } from '../types'
import { cn, regionFullLabel } from '../utils'
import { useNav } from '../navigation'

export function TopBar({
  title,
  subtitle,
  right,
  back,
  transparent,
}: {
  title?: string
  subtitle?: string
  right?: ReactNode
  back?: boolean
  transparent?: boolean
}) {
  const nav = useNav()
  return (
    <header className={cn('topbar', transparent && 'topbar-transparent')}>
      <div className="topbar-side topbar-left">
        {back ? (
          <button className="icon-button topbar-back" onClick={nav.back} aria-label="返回">
            <ChevronLeft size={22} strokeWidth={1.8} />
          </button>
        ) : (
          <span className="topbar-spacer" />
        )}
      </div>
      <div className="topbar-title-wrap">
        {title && <h1 className="topbar-title">{title}</h1>}
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>
      <div className="topbar-side topbar-right">{right ?? <span className="topbar-spacer" />}</div>
    </header>
  )
}

export function IconButton({
  children,
  className,
  label,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button className={cn('icon-button', className)} aria-label={label} {...props}>
      {children}
    </button>
  )
}

export function Button({
  children,
  className,
  variant = 'primary',
  full,
  size = 'md',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold' | 'dark'
  full?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  return (
    <button
      className={cn('btn', `btn-${variant}`, `btn-${size}`, full && 'btn-full', className)}
      {...props}
    >
      {children}
    </button>
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T
  options: Array<{ value: T; label: string; count?: number }>
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div className={cn('segmented', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          className={cn('segmented-item', value === option.value && 'is-active')}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {typeof option.count === 'number' && <span className="segmented-count">{option.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Tag({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'sage' | 'peach' | 'gold' | 'dark' | 'outline' }) {
  return <span className={cn('tag', `tag-${tone}`)}>{children}</span>
}

export function FlowerPill({ count, onClick }: { count: number; onClick?: () => void }) {
  const Comp = onClick ? 'button' : 'span'
  return (
    <Comp className={cn('flower-pill', onClick && 'is-clickable')} onClick={onClick}>
      <span className="flower-pill-icon">🌸</span>
      <span>{count}</span>
    </Comp>
  )
}

export function Rating({ value, size = 12 }: { value: number; size?: number }) {
  return (
    <span className="rating">
      <span className="rating-star" style={{ fontSize: size }}>
        ★
      </span>
      {value.toFixed(1)}
    </span>
  )
}

export function SectionHead({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode
  subtitle?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('section-head', className)}>
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className,
}: {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="overlay-root">
      <div className="sheet-backdrop" onClick={onClose} />
      <section className={cn('sheet', className)} role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-grab" />
        {(title || subtitle) && (
          <div className="sheet-head">
            <div>
              {title && <h2 className="sheet-title">{title}</h2>}
              {subtitle && <p className="sheet-subtitle">{subtitle}</p>}
            </div>
            <IconButton label="关闭" onClick={onClose} className="sheet-close">
              <X size={20} />
            </IconButton>
          </div>
        )}
        <div className="sheet-content">{children}</div>
        {footer && <div className="sheet-footer">{footer}</div>}
      </section>
    </div>,
    document.body,
  )
}

export function Modal({
  open,
  onClose,
  children,
  className,
  dismissible = true,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  dismissible?: boolean
}) {
  if (!open) return null
  return createPortal(
    <div className="overlay-root">
      <div className="modal-backdrop" onClick={dismissible ? onClose : undefined} />
      <section className={cn('modal', className)} role="dialog" aria-modal="true">
        {dismissible && (
          <IconButton label="关闭" onClick={onClose} className="modal-close">
            <X size={19} />
          </IconButton>
        )}
        {children}
      </section>
    </div>,
    document.body,
  )
}

export function RegionSheet({
  open,
  onClose,
  value,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  value: Region
  onConfirm: (region: Region) => void
}) {
  const initialProvince = REGION_DATA.find((p) => p.province === value.province) ?? REGION_DATA[0]
  const initialCity = initialProvince.cities.find((c) => c.city === value.city) ?? initialProvince.cities[0]
  const [province, setProvince] = useState(initialProvince.province)
  const [city, setCity] = useState(initialCity.city)
  const [district, setDistrict] = useState(
    initialCity.districts.includes(value.district) ? value.district : initialCity.districts[0],
  )

  useEffect(() => {
    if (!open) return
    const p = REGION_DATA.find((x) => x.province === value.province) ?? REGION_DATA[0]
    const c = p.cities.find((x) => x.city === value.city) ?? p.cities[0]
    setProvince(p.province)
    setCity(c.city)
    setDistrict(c.districts.includes(value.district) ? value.district : c.districts[0])
  }, [open, value])

  const activeProvince = REGION_DATA.find((p) => p.province === province) ?? REGION_DATA[0]
  const activeCity = activeProvince.cities.find((c) => c.city === city) ?? activeProvince.cities[0]

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="选择所在地区"
      subtitle="我们会优先为你推荐附近的咨询师与机构"
      footer={
        <Button
          full
          size="lg"
          onClick={() => {
            onConfirm({ province, city, district })
            onClose()
          }}
        >
          确认选择 · {city} {district}
        </Button>
      }
    >
      <div className="region-columns">
        <div className="region-column">
          <p className="region-column-label">省份</p>
          <div className="region-options">
            {REGION_DATA.map((p) => (
              <button
                key={p.province}
                className={cn('region-option', province === p.province && 'is-active')}
                onClick={() => {
                  setProvince(p.province)
                  const c = p.cities[0]
                  setCity(c.city)
                  setDistrict(c.districts[0])
                }}
              >
                {p.province.replace(/省|市/g, '')}
              </button>
            ))}
          </div>
        </div>
        <div className="region-column">
          <p className="region-column-label">城市</p>
          <div className="region-options">
            {activeProvince.cities.map((c) => (
              <button
                key={c.city}
                className={cn('region-option', city === c.city && 'is-active')}
                onClick={() => {
                  setCity(c.city)
                  setDistrict(c.districts[0])
                }}
              >
                {c.city}
              </button>
            ))}
          </div>
        </div>
        <div className="region-column">
          <p className="region-column-label">区 / 县</p>
          <div className="region-options">
            {activeCity.districts.map((d) => (
              <button
                key={d}
                className={cn('region-option', district === d && 'is-active')}
                onClick={() => setDistrict(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="region-current">
        <span>当前选择</span>
        <strong>{regionFullLabel({ province, city, district })}</strong>
      </div>
    </Sheet>
  )
}

export function EmptyState({
  emoji = '🌿',
  title,
  description,
  action,
}: {
  emoji?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <div className="empty-emoji">{emoji}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}

export function ArrowRow({
  icon,
  title,
  subtitle,
  onClick,
  right,
  tone,
}: {
  icon?: ReactNode
  title: ReactNode
  subtitle?: string
  onClick?: () => void
  right?: ReactNode
  tone?: string
}) {
  return (
    <button className="arrow-row" onClick={onClick}>
      {icon && <span className={cn('arrow-row-icon', tone && `tone-${tone}`)}>{icon}</span>}
      <span className="arrow-row-body">
        <span className="arrow-row-title">{title}</span>
        {subtitle && <span className="arrow-row-subtitle">{subtitle}</span>}
      </span>
      {right ?? <ChevronRight size={17} className="arrow-row-chevron" />}
    </button>
  )
}
