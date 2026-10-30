interface BrandProps {
  compacto?: boolean
}

export default function Brand({ compacto = false }: BrandProps) {
  return (
    <div className="flex items-center gap-2.5" aria-label="TrabajaYa">
      <svg viewBox="0 0 40 44" className="h-10 w-9 shrink-0 text-primary-strong" fill="currentColor" aria-hidden="true">
        <path d="M2 17 20 2l18 15-5 6L20 12 7 23z" />
        <path d="M9 23h18v6h-6v14h-6V29H9zm17 8h6l2 4 2-4h6l-5 8v4h-6v-4z" transform="translate(-2 -2)" />
      </svg>
      {!compacto && <span className="font-display text-[23px] font-semibold tracking-[-0.06em] text-ink">trabajaya<span className="text-primary-strong">.</span></span>}
    </div>
  )
}
