import api from './api'
import type { Cart } from '../types'

export const cartService = {
  get() {
    return api.get<Cart>('/cart/').then(r => r.data)
  },
  add(product_id: number, size_id?: number, quantity: number = 1) {
    return api.post<Cart>('/cart/add/', { product_id, size_id, quantity }).then(r => r.data)
  },
  update(item_id: number, quantity: number) {
    return api.post<Cart>(`/cart/update/${item_id}/`, { quantity }).then(r => r.data)
  },
  remove(item_id: number) {
    return api.delete<Cart>(`/cart/remove/${item_id}/`).then(r => r.data)
  },
}
