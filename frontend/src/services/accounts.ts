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
}
