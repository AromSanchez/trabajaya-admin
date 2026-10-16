import { useAuth } from '../../hooks/useAuth'

export default function Dashboard() {
  const { usuario } = useAuth()

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      <p className="mt-2 text-dark/60">
        Hola{usuario ? `, ${usuario.nombre}` : ''}. Panel en construcción.
      </p>
    </div>
  )
}
