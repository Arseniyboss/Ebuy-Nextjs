import { Types, Model } from 'mongoose'
import { OmitId, CartItem } from './api'
import { Review, Product } from './product'
import { CartItem as CartSchemaType, User } from './user'

type OmitUserId<T> = Omit<T, 'userId'>
type OmitCartItems<T> = Omit<T, 'cartItems'>

type WithUserId<T> = T & {
  userId: Types.ObjectId
}

export interface UserSchema extends OmitCartItems<User> {
  cartItems: CartItem[]
  matchPassword: (password: string) => Promise<boolean>
}

export type ReviewSchema = WithUserId<OmitUserId<Review>>
export type CartSchema = OmitId<CartSchemaType>

export type ProductModel = Model<Product>
export type UserModel = Model<UserSchema>
