import type { ComponentType } from 'react'

type Acento = 'primary' | 'success' | 'warning' | 'danger' | 'dark'

const ACENTOS: Record<Acento, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  dark: 'bg-dark/10 text-dark',
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
    <article className="rounded-2xl border border-dark/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`grid h-11 w-11 place-items-center rounded-xl ${ACENTOS[acento]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-dark">
        {valor}
      </p>
      <p className="mt-1 text-sm font-medium text-dark/70">{titulo}</p>
      {descripcion && (
        <p className="mt-0.5 text-xs text-dark/45">{descripcion}</p>
      )}
    </article>
  )
}
