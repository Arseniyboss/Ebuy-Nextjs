'use server'

import { cookies } from 'next/headers'
import { CartItem } from 'types/product'

export const addToCart = async (cartItem: CartItem) => {
  cookies().set('cartItem', JSON.stringify(cartItem))
}
