import api from './api'

export const contactService = {
  send(data: { name: string; email: string; subject?: string; message: string }) {
    return api.post('/contact/', data).then(r => r.data)
  },
}
