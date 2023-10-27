import { BASE_URL } from '@/baseUrl'
import { getToken } from '@/auth/token/getters/getToken'

export const deleteCartItem = async (id: string) => {
  const token = await getToken()

  const response = await fetch(`${BASE_URL}/api/cart/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response
}
