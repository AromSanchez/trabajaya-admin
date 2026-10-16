interface IconProps {
  className?: string
}

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function IconDashboard({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  )
}

export function IconUsers({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

export function IconFlag({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  )
}

export function IconClock({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  )
}

export function IconChevronsLeft({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="m11 17-5-5 5-5" />
      <path d="m18 17-5-5 5-5" />
    </svg>
  )
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function IconLogout({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}

export function IconConstruction({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="2" y="6" width="20" height="8" rx="1.5" />
      <path d="M6 6v4" />
      <path d="M12 6v4" />
      <path d="M18 6v4" />
      <path d="M4 14v6" />
      <path d="M20 14v6" />
      <path d="M8 14v6" />
      <path d="M16 14v6" />
    </svg>
  )
}

export function IconCheckCircle({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  )
}

export function IconAlertTriangle({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

export function IconRefresh({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  )
}

export function IconArrowLeft({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  )
}

export function IconChevronRight({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function IconX({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export function IconFileText({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  )
}

export function IconEye({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function IconBan({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="m5.6 5.6 12.8 12.8" />
    </svg>
  )
}

export function IconPlay({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="m6 4 14 8-14 8z" />
    </svg>
  )
}
