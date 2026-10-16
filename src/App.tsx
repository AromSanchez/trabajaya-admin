import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Tecnicos from './pages/Tecnicos/Tecnicos'
import TecnicoDetalle from './pages/TecnicoDetalle/TecnicoDetalle'
import Reportes from './pages/Reportes/Reportes'
import ReporteDetalle from './pages/ReporteDetalle/ReporteDetalle'
import CancelacionesTardias from './pages/CancelacionesTardias/CancelacionesTardias'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tecnicos" element={<Tecnicos />} />
          <Route path="/tecnicos/:id" element={<TecnicoDetalle />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/reportes/:id" element={<ReporteDetalle />} />
          <Route
            path="/cancelaciones-tardias"
            element={<CancelacionesTardias />}
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
