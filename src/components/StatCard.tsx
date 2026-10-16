import type { ComponentType } from 'react'

type Acento = 'primary' | 'success' | 'warning' | 'danger' | 'dark'

const ACENTOS: Record<Acento, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  dark: 'bg-ink-3/10 text-ink-3',
}

interface StatCardProps {
  titulo: string
  valor: string | number
  descripcion?: string
  icon: ComponentType<{ className?: string }>
  acento?: Acento
}

export default function StatCard({
  titulo,
  valor,
  descripcion,
  icon: Icon,
  acento = 'primary',
}: StatCardProps) {
  return (
    <article className="bg-surface p-5">
      <div className="flex items-center gap-2.5">
        <span
          className={`grid h-7 w-7 place-items-center ${ACENTOS[acento]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">
          {titulo}
        </p>
      </div>
      <p className="mt-4 font-display text-4xl font-semibold tabular-nums leading-none text-ink">
        {valor}
      </p>
      {descripcion && (
        <p className="mt-2 text-xs text-ink-2">{descripcion}</p>
      )}
    </article>
  )
}
