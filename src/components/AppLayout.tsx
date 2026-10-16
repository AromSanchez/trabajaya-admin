import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  const [colapsado, setColapsado] = useState(false)
  const [movilAbierto, setMovilAbierto] = useState(false)

  return (
    <div className="min-h-screen bg-base">
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
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
