export interface Collection {
  id: number
  name: string
  slug: string
  description: string
  image: string | null
  order: number
}

export interface Category {
  id: number
  name: string
  slug: string
  image: string | null
  collection: number | null
}

export interface ProductImage {
  id: number
  image: string
  alt_text: string
  order: number
  is_primary: boolean
}

export interface ProductSize {
  id: number
  name: string
  stock: number
}

export interface Product {
  id: number
  name: string
  slug: string
  price: string
  compare_at_price: string | null
  primary_image: string | null
  secondary_image: string | null
  has_multiple_sizes: boolean
  is_featured: boolean
  category: number | null
}

export interface ProductColor {
  id: number
  name: string
  hex_code: string
  stock: number
}

export interface ProductDetail extends Product {
  description: string
  material: string
  care_instructions: string
  category_name: string
  images: ProductImage[]
  sizes: ProductSize[]
  colors: ProductColor[]
  created_at: string
}

export interface CartItem {
  id: number
  product: number
  product_detail: Product
  size: number | null
  quantity: number
  subtotal: string
}

export interface Cart {
  id: number
  items: CartItem[]
  total: string
  item_count: number
}

export interface Order {
  id: number
  full_name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  status: string
  total: string
  notes: string
  items: OrderItem[]
  created_at: string
}

export interface OrderItem {
  id: number
  product: number | null
  product_name: string
  size: string
  price: string
  quantity: number
  subtotal: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  profile: {
    phone: string
    address: string
    city: string
    country: string
  }
}
