import { NextRequest } from 'next/server'
import { CartItem as Body } from 'types/api'
import { connectToDB } from '@config/mongodb'
import { decodeToken } from '@auth/decodeToken/requestHeaders'
import { throwError } from '@utils/throwError'
import { setCookie } from '@utils/setCookie'
import { generatePayload } from '@auth/generatePayload'
import { generateTokenCookie } from '@auth/generateTokenCookie'
import User from '@models/user'

export const POST = async (request: NextRequest) => {
  await connectToDB()

  const cartItem: Body = await request.json()

  const decoded = await decodeToken(request)
  const user = await User.findById(decoded?.id)

  if (!user) {
    return throwError({ error: 'User not found', status: 404 })
  }

  const itemInTheCart = user.cartItems.find(({ id }) => cartItem._id === id)

  if (itemInTheCart) {
    return throwError({ error: 'Item is already in the cart', status: 400 })
  }

  user.cartItems.push(cartItem)

  await user.save()

  const payload = generatePayload(user)
  const tokenCookie = await generateTokenCookie(payload)

  return setCookie(tokenCookie, 201)
}
