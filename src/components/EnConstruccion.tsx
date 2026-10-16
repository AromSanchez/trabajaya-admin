import { IconConstruction } from './icons'

interface EnConstruccionProps {
  titulo: string
  descripcion: string
}

export default function EnConstruccion({
  titulo,
  descripcion,
}: EnConstruccionProps) {
  return (
    <section className="border border-line bg-surface p-10">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="grid h-14 w-14 place-items-center bg-primary/10 text-primary">
          <IconConstruction className="h-7 w-7" />
        </div>
        <h2 className="mt-4 font-display text-lg font-semibold text-ink">
          {titulo}
        </h2>
        <p className="mt-1 text-sm text-ink-2">{descripcion}</p>
        <span className="mt-5 bg-surface-2 px-3 py-1 text-xs font-medium text-ink-3">
          En construcción
        </span>
      </div>
    </section>
  )
}
