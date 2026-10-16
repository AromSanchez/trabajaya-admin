import axios from 'axios'

export function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const mensaje = (error.response?.data as { error?: string } | undefined)
      ?.error
    if (mensaje) return mensaje
    if (!error.response) return 'No se pudo conectar con el servidor.'
  }
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.'
}
