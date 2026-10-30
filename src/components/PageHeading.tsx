export default function PageHeading({ titulo, descripcion }: { titulo: string; descripcion: string }) {
  return (
    <div className="mb-7 max-w-2xl">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">{titulo}</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-2">{descripcion}</p>
    </div>
  )
}
