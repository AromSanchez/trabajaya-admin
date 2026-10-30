import { Check, ShieldCheck, Users, Wrench } from 'lucide-react'
import Brand from '../../components/Brand'

export type FocoLogin = 'email' | 'password' | 'ninguno'
export type EstadoLogin = 'idle' | 'enviando' | 'exito'

export default function EscenaLogin({ estado }: { foco: FocoLogin; estado: EstadoLogin }) {
  return (
    <aside className="relative m-5 hidden w-[48%] flex-col justify-between overflow-hidden rounded-3xl bg-primary-soft/55 p-10 lg:flex xl:p-14">
      <Brand />
      <div className="relative z-10 py-10">
        <p className="mb-5 text-sm font-semibold text-link">Personas que hacen la diferencia</p>
        <h2 className="max-w-lg font-display text-4xl font-semibold leading-tight tracking-tight text-ink xl:text-5xl">Grandes trabajos.<br />Una comunidad<br />en buenas manos.</h2>
        <p className="mt-6 max-w-sm text-base leading-relaxed text-ink-2">Conecta el talento con la confianza. Este es tu espacio para cuidar lo que construimos juntos.</p>
        <div className="relative mx-auto mt-14 h-48 w-72" aria-hidden="true">
          <div className="absolute left-3 top-12 text-link/55"><Wrench className="size-8" /></div>
          <div className="absolute right-3 top-12 text-link/55"><Users className="size-8" /></div>
          <div className="absolute left-1/2 top-4 -translate-x-1/2 text-link">{estado === 'exito' ? <Check className="size-24" /> : <ShieldCheck className="size-24" strokeWidth={1.25} />}</div>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-ink-2">La confianza nos mueve</p>
        </div>
      </div>
      <p className="text-xs text-ink-3">TrabajaYa · Administración</p>
    </aside>
  )
}
