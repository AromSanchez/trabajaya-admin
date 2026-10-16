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
    <section className="rounded-2xl border border-dark/10 bg-white p-10 shadow-sm">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <IconConstruction className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-dark">{titulo}</h2>
        <p className="mt-1 text-sm text-dark/60">{descripcion}</p>
        <span className="mt-5 rounded-full bg-dark/5 px-3 py-1 text-xs font-medium text-dark/60">
          En construcción
        </span>
      </div>
    </section>
  )
}
