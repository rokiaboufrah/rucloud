import api from './api'
import type { Collection, Category, Product, ProductDetail } from '../types'

export const productsService = {
  getCollections() {
    return api.get<Collection[]>('/products/collections/').then(r => r.data)
  },
  getCollection(slug: string) {
    return api.get<Collection>(`/products/collections/${slug}/`).then(r => r.data)
  },
  getCategories() {
    return api.get<Category[]>('/products/categories/').then(r => r.data)
  },
  list(params?: { category?: string; collection?: string; featured?: string }) {
    return api.get<Product[]>('/products/', { params }).then(r => r.data)
  },
  get(slug: string) {
    return api.get<ProductDetail>(`/products/${slug}/`).then(r => r.data)
  },
}
