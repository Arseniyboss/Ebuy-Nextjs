export type Review = {
  _id: string
  user: string
  name: string
  rating: number
  comment: string
}

export type CartItem = {
  _id: string
  name: string
  image: string
  price: number
  countInStock: number
  quantity: number
}

export interface Product extends CartItem {
  brand: string
  category: string
  description: string
  rating: number
  numReviews: number
  isPublished: boolean
  reviews: Review[]
}
