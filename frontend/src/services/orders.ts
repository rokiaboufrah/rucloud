import api from './api'
import type { Order, BaridiMobConfig, CCPConfig } from '../types'

export const ordersService = {
  create(data: {
    full_name: string
    email: string
    phone: string
    address: string
    city: string
    wilaya_code?: number
    delivery_type?: string
    shipping_cost?: number
    country: string
    payment_method: string
    ccp_ref?: string
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
  getPaymentConfig() {
    return api.get<{ baridimob: BaridiMobConfig; ccp: CCPConfig }>('/orders/payment-config/').then(r => r.data)
  },
}
