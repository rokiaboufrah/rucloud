import api from './api'
import type { User } from '../types'

export const accountsService = {
  register(data: { username: string; email: string; password: string; password2: string }) {
    return api.post<User>('/accounts/register/', data).then(r => r.data)
  },
  login(username: string, password: string) {
    return api.post<User>('/accounts/login/', { username, password }).then(r => r.data)
  },
  logout() {
    return api.post('/accounts/logout/').then(r => r.data)
  },
  me() {
    return api.get<User>('/accounts/me/').then(r => r.data)
  },
  requestPasswordReset(email: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/accounts/password/reset/', { email }).then(r => r.data)
  },
  confirmPasswordReset(uid: string, token: string, newPassword: string): Promise<{ message: string }> {
    return api
      .post<{ message: string }>('/accounts/password/reset/confirm/', {
        uid,
        token,
        new_password: newPassword,
      })
      .then(r => r.data)
  },
}
