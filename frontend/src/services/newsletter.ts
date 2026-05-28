import api from './api'

export const newsletterService = {
  subscribe(email: string) {
    return api.post('/newsletter/subscribe/', { email }).then(r => r.data)
  },
}
