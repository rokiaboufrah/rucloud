import api from './api'
import type { Order } from '../types'

export const ordersService = {
  create(data: {
    full_name: string
    email: string
    phone: string
    address: string
    city: string
    country: string
    notes?: string
  }) {
    return api.post<Order>('/orders/create/', data).then(r => r.data)
  },
  list() {
    return api.get<Order[]>('/orders/').then(r => r.data)
  },
  get(id: number) {
    return api.get<Order>(`/orders/${id}/`).then(r => r.data)
  },
}
