import { api } from './api'
import type { AdminUser } from '../context/auth-context'

interface LoginResponse {
  data: {
    token: string
    usuario: AdminUser
  }
}

export interface CredencialesAdmin {
  token: string
  usuario: AdminUser
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<CredencialesAdmin> {
  const { data } = await api.post<LoginResponse>('/auth/admin/login', {
    email,
    password,
  })
  return data.data
}
