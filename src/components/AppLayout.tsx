import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  const [colapsado, setColapsado] = useState(false)
  const [movilAbierto, setMovilAbierto] = useState(false)

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar
        colapsado={colapsado}
        movilAbierto={movilAbierto}
        onCerrarMovil={() => setMovilAbierto(false)}
        onToggleColapso={() => setColapsado((valor) => !valor)}
      />

      <div
        className={`flex min-h-screen flex-col transition-[padding] duration-[var(--duration)] ease-[var(--ease)] ${
          colapsado ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Header onAbrirMenuMovil={() => setMovilAbierto(true)} />
        <main id="contenido" className="mx-auto w-full min-w-0 max-w-[1440px] flex-1 px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
