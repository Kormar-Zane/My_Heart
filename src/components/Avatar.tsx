import { useId } from 'react'
import { AVATARS } from '../theme'
import { cn } from '../utils'

interface AvatarProps {
  name?: string
  variant?: string
  size?: number
  frame?: string
  className?: string
  online?: boolean
}

function hairBack(style: string, color: string) {
  switch (style) {
    case 'long':
      return (
        <>
          <path d="M28 52C28 24 42 14 60 14C78 14 92 25 92 52V99C92 108 84 112 78 106V69H42V106C36 112 28 108 28 99V52Z" fill={color} />
          <path d="M31 70C26 84 27 98 32 106C36 99 36 87 39 77L31 70Z" fill={color} />
          <path d="M89 70C94 84 93 98 88 106C84 99 84 87 81 77L89 70Z" fill={color} />
        </>
      )
    case 'wavy':
      return (
        <>
          <path d="M27 53C27 25 41 14 60 14C80 14 94 26 94 53V76C100 86 95 97 88 99C91 110 82 116 76 109V69H44V109C38 116 29 110 32 99C25 97 20 86 26 76V53Z" fill={color} />
          <path d="M31 90C22 96 23 107 31 109C36 104 35 97 39 92L31 90Z" fill={color} />
          <path d="M89 90C98 96 97 107 89 109C84 104 85 97 81 92L89 90Z" fill={color} />
        </>
      )
    case 'bob':
      return (
        <path d="M28 54C28 25 43 14 60 14C78 14 93 26 93 54V82C93 93 87 99 79 96V68H41V96C33 99 28 93 28 82V54Z" fill={color} />
      )
    case 'bun':
      return (
        <>
          <circle cx="60" cy="13" r="13" fill={color} />
          <path d="M29 56C29 28 42 18 60 18C78 18 92 29 92 56V72H86V64H34V72H29V56Z" fill={color} />
        </>
      )
    case 'curly':
      return (
        <>
          <circle cx="38" cy="32" r="15" fill={color} />
          <circle cx="58" cy="21" r="17" fill={color} />
          <circle cx="79" cy="30" r="15" fill={color} />
          <circle cx="31" cy="51" r="12" fill={color} />
          <circle cx="89" cy="51" r="12" fill={color} />
          <path d="M31 49C31 31 44 21 60 21C77 21 90 32 90 49V64H31V49Z" fill={color} />
        </>
      )
    default:
      return (
        <>
          <path d="M30 55C30 29 43 18 60 18C78 18 91 30 91 55V65H30V55Z" fill={color} />
          <path d="M30 53C34 41 43 36 49 39C53 28 70 27 76 39C83 35 89 43 91 55C82 47 71 45 62 47C50 49 38 54 30 61V53Z" fill={color} />
        </>
      )
  }
}

function fringe(style: string, color: string) {
  if (style === 'short') {
    return <path d="M35 50C36 31 46 23 60 23C73 23 84 31 85 50C77 44 72 46 67 40C60 48 48 50 35 50Z" fill={color} />
  }
  if (style === 'curly') {
    return <path d="M36 48C38 31 48 24 60 24C73 24 82 32 84 48C76 42 73 47 67 42C58 50 45 49 36 48Z" fill={color} />
  }
  if (style === 'bob') {
    return <path d="M34 48C35 28 47 21 60 21C75 21 84 31 86 49C78 47 74 37 69 39C62 47 47 51 34 48Z" fill={color} />
  }
  return <path d="M35 48C37 30 48 23 61 23C74 23 83 31 85 48C76 44 70 48 66 41C58 49 46 50 35 48Z" fill={color} />
}

export function Avatar({ name, variant = 'me', size = 48, frame, className, online }: AvatarProps) {
  const style = AVATARS[variant] ?? AVATARS.me
  const gid = useId().replace(/[:]/g, '')
  return (
    <span
      className={cn('avatar-frame', frame && `frame-${frame.replace('frame_', '')}`, className)}
      style={{ width: size, height: size }}
      aria-label={name ? `${name}的头像` : '头像'}
    >
      <span className="avatar-inner">
        <svg viewBox="0 0 120 120" width="100%" height="100%" role="img" aria-hidden="true">
          <defs>
            <clipPath id={`clip-${gid}`}>
              <circle cx="60" cy="60" r="60" />
            </clipPath>
            <linearGradient id={`bg-${gid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={style.bg} />
              <stop offset="100%" stopColor={style.bg} stopOpacity="0.72" />
            </linearGradient>
          </defs>
          <g clipPath={`url(#clip-${gid})`}>
            <circle cx="60" cy="60" r="60" fill={`url(#bg-${gid})`} />
            <circle cx="18" cy="24" r="34" fill={style.accent} opacity="0.18" />
            <circle cx="106" cy="101" r="41" fill={style.top} opacity="0.16" />
            <path d="M-8 108C14 83 28 92 40 104C51 115 59 118 77 102C93 88 106 85 128 106V126H-8V108Z" fill={style.accent} opacity="0.22" />
            {hairBack(style.style, style.hair)}
            <path d="M16 122C19 97 35 87 60 87C85 87 101 97 104 122H16Z" fill={style.top} />
            <path d="M49 79H71V91C71 97 65 101 60 101C55 101 49 97 49 91V79Z" fill={style.skin} />
            <ellipse cx="60" cy="61" rx="27" ry="30" fill={style.skin} />
            <ellipse cx="33" cy="64" rx="5" ry="8" fill={style.skin} />
            <ellipse cx="87" cy="64" rx="5" ry="8" fill={style.skin} />
            <ellipse cx="45" cy="74" rx="7" ry="4" fill="#E49A8C" opacity="0.28" />
            <ellipse cx="75" cy="74" rx="7" ry="4" fill="#E49A8C" opacity="0.28" />
            <path d="M51 60C53 58 56 58 58 60" stroke="#4A3A33" strokeWidth="1.7" strokeLinecap="round" fill="none" />
            <path d="M62 60C64 58 67 58 69 60" stroke="#4A3A33" strokeWidth="1.7" strokeLinecap="round" fill="none" />
            <circle cx="54.5" cy="64.5" r="1.6" fill="#3E302B" />
            <circle cx="65.5" cy="64.5" r="1.6" fill="#3E302B" />
            <path d="M59 67.5C59 70.5 58.5 71.5 57 72" stroke="#C58C77" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M54 77C57 80 63 80 66 77" stroke="#9E5E54" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            {style.accessory === 'glasses' && (
              <g stroke="#5D514A" strokeWidth="1.5" fill="none" opacity="0.85">
                <rect x="44" y="57" width="13" height="11" rx="4" />
                <rect x="63" y="57" width="13" height="11" rx="4" />
                <path d="M57 62H63M44 62L38 60M76 62L82 60" />
              </g>
            )}
            {style.accessory === 'earring' && (
              <>
                <circle cx="33" cy="76" r="2" fill={style.accent} />
                <circle cx="87" cy="76" r="2" fill={style.accent} />
              </>
            )}
            {style.accessory === 'flower' && (
              <g transform="translate(84 38)">
                <circle cx="0" cy="-5" r="4" fill="#F4D7C1" />
                <circle cx="5" cy="0" r="4" fill="#F4D7C1" />
                <circle cx="0" cy="5" r="4" fill="#F4D7C1" />
                <circle cx="-5" cy="0" r="4" fill="#F4D7C1" />
                <circle cx="0" cy="0" r="2.6" fill="#EAC26D" />
              </g>
            )}
            {fringe(style.style, style.hair)}
            <path d="M47 92C52 96 68 96 73 92" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="2" fill="none" />
          </g>
        </svg>
      </span>
      {online && <span className="avatar-online-dot" />}
    </span>
  )
}
