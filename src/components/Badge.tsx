import type { EstadoInfo } from './estados'

interface BadgeProps {
  info: EstadoInfo
}

export default function Badge({ info }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${info.badge}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${info.dot}`}
        aria-hidden="true"
      />
      {info.label}
    </span>
  )
}
