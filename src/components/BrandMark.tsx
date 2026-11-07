export function BrandMark({ size = 44, tone = 'dark' }: { size?: number; tone?: 'dark' | 'light' }) {
  const bg = tone === 'dark' ? '#24483F' : '#F6F1E6'
  const eye = tone === 'dark' ? '#F6F1E6' : '#24483F'
  const pupil = tone === 'dark' ? '#24483F' : '#F6F1E6'
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label="观心">
      <rect width="64" height="64" rx="20" fill={bg} />
      <circle cx="32" cy="32" r="18.5" fill="none" stroke="#E7BE68" strokeWidth="1.6" />
      <path d="M17 34C23.5 23 41.5 21 47.5 32C41 43.5 23.5 45.5 17 34Z" fill={eye} />
      <circle cx="33.4" cy="32.5" r="5.3" fill={pupil} />
      <circle cx="35.2" cy="30.7" r="1.8" fill={eye} />
      <circle cx="32" cy="12.5" r="1.2" fill="#E7BE68" />
      <circle cx="50" cy="42" r="1" fill="#E7BE68" />
    </svg>
  )
}
