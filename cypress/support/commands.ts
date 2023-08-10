/// <reference types="cypress" />

import { Product } from '../../src/types/api'
import { formatPrice } from '../../src/utils/formatPrice'
import { getTotalPrice } from '../../src/utils/getTotalPrice'

Cypress.Commands.add('getByTestId', (testId) => {
  cy.get(`[data-testid=${testId}]`)
})

Cypress.Commands.add('getMessage', (dataId, value) => {
  cy.getByTestId(dataId).should('have.text', value)
})

Cypress.Commands.add('getTemporaryMessage', (dataId, value) => {
  cy.getMessage(dataId, value)
  cy.wait(3000)
  cy.getByTestId(dataId).should('not.exist')
})

Cypress.Commands.add('getImage', (testId) => {
  cy.getByTestId(testId)
    .should('be.visible')
    .and((img) => {
      expect(img[0].naturalWidth).to.be.greaterThan(0)
    })
})

Cypress.Commands.add('assertText', (testId, text, index = 0) => {
  cy.getByTestId(testId).eq(index).should('have.text', text)
})

Cypress.Commands.add('assertValue', (testId, value, index = 0) => {
  cy.getByTestId(testId).eq(index).should('have.value', value)
})

Cypress.Commands.add('assertEmpty', (testId) => {
  cy.getByTestId(testId).should('have.value', '')
})

Cypress.Commands.add('assertLength', (testId, value) => {
  cy.getByTestId(testId).should('have.length', value)
})

Cypress.Commands.add('assertDisabled', (testId) => {
  cy.getByTestId(testId).should('be.disabled')
})

Cypress.Commands.add('assertDisabledLink', (testId) => {
  cy.getByTestId(testId).should('have.css', 'pointer-events', 'none')
})

Cypress.Commands.add('assertChecked', (testId) => {
  cy.getByTestId(testId).should('be.checked')
})

Cypress.Commands.add('assertTotalPrice', (items) => {
  const totalPrice = getTotalPrice(items)
  cy.assertText('total-price', `Total: $${totalPrice}`)
})

Cypress.Commands.add('assertDeliveryDate', (deliveryDate) => {
  cy.assertText('delivery-date', `Delivery Date: ${deliveryDate}`)
})

Cypress.Commands.add('assertAddress', (address) => {
  cy.assertText('street', `Street: ${address.street}`)
  cy.assertText('country', `Country: ${address.country}`)
  cy.assertText('city', `City: ${address.city}`)
  cy.assertText('postal-code', `Postal Code: ${address.postalCode}`)
})

Cypress.Commands.add('assertPaymentMethod', (paymentMethod) => {
  cy.assertText('payment-method', `Payment Method: ${paymentMethod}`)
})

Cypress.Commands.add('assertCartItems', (cartItems) => {
  cy.getImage('product-image')

  cartItems.forEach((cartItem, index) => {
    const { name, price, quantity } = cartItem

    cy.assertText('product-name', name, index)
    cy.assertText('product-price', `$${price}`, index)
    cy.assertValue('product-quantity', quantity.toString(), index)
  })
})

Cypress.Commands.add('assertOrderItems', (orderItems) => {
  cy.getImage('item-image')

  orderItems.forEach((orderItems, index) => {
    const { name, quantity, price } = orderItems

    const totalPrice = formatPrice(quantity * price)

    cy.assertText('item-name', name, index)
    cy.assertText(
      'item-total-price',
      `${quantity} x $${price} = $${totalPrice}`,
      index
    )
  })
})

Cypress.Commands.add('assertCountInStock', (productId, countInStock) => {
  cy.request(`/api/products/${productId}`).then((response) => {
    const product: Product = response.body
    expect(product.countInStock).to.equal(countInStock)

    if (countInStock === 0) {
      cy.assertText('product-status', 'Out Of Stock')
    } else {
      cy.getByTestId('product-quantity').should('contain', countInStock)
      cy.getByTestId('product-quantity').should('not.contain', countInStock + 1)
    }
  })
})

Cypress.Commands.add('typeInto', (dataId, text) => {
  cy.getByTestId(dataId).type(text).should('have.value', text)
})

Cypress.Commands.add('selectOption', ({ testId, text, value, index = 0 }) => {
  cy.getByTestId(testId).eq(index).select(text).should('have.value', value)
})

Cypress.Commands.add('clearInput', (dataId) => {
  cy.getByTestId(dataId).clear()
})

Cypress.Commands.add('submitForm', (dataId) => {
  cy.getByTestId(dataId).submit()
})

Cypress.Commands.add('waitDebounce', () => {
  cy.wait(500)
})

Cypress.Commands.add('waitSelect', () => {
  cy.wait(500)
})

Cypress.Commands.add('waitBeforeSubmit', () => {
  cy.wait(100)
})

Cypress.Commands.add('verifyUrl', (url) => {
  cy.location('pathname').should('eq', url)
})

Cypress.Commands.add('verifyLink', (testId, url) => {
  cy.getByTestId(testId).click()
  cy.verifyUrl(url)
  cy.go('back')
})

Cypress.Commands.add('verifyNavLink', (testId, url) => {
  cy.getByTestId(testId).click()
  cy.verifyUrl(url)
})

Cypress.Commands.add('verifyFirstDynamicLink', (testId, url) => {
  cy.getByTestId(testId).eq(0).click()
  cy.location('pathname').should('eq', url)
  cy.go('back')
})

Cypress.Commands.add('verifySort', (prices) => {
  cy.getByTestId('product-price').each((element, index) => {
    const price = Number(element.text().slice(1))
    expect(price).to.eq(prices[index])
  })
})

Cypress.Commands.add('verifyCookie', (name) => {
  cy.getCookie(name).then((cookie) => {
    expect(cookie.secure).to.be.true
    expect(cookie.httpOnly).to.be.true
    expect(cookie.sameSite).to.equal('lax')
  })
})

Cypress.Commands.add('verifyUserUpdate', (input, value) => {
  cy.wait('@updateUser').then(({ response }) => {
    expect(response.statusCode).to.equal(200)
    cy.verifyCookie('token')
    cy.reload()
    cy.assertValue(input, value)
  })
})

Cypress.Commands.add('login', (userCredentials) => {
  cy.request({
    method: 'POST',
    url: '/api/users/login',
    body: userCredentials,
  }).then(() => {
    cy.verifyCookie('token')
    cy.reload()
  })
})

Cypress.Commands.add('logout', () => {
  cy.request({
    method: 'POST',
    url: '/api/users/logout',
  }).then(() => {
    cy.getCookie('token').then((cookie) => {
      expect(cookie).to.be.null
    })
    cy.reload()
  })
})

Cypress.Commands.add('getUser', () => {
  cy.getCookie('token').then((cookie) => {
    const token = cookie.value
    cy.request({
      method: 'GET',
      url: '/api/users/user',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  })
})

Cypress.Commands.add('getOrder', (id) => {
  cy.getCookie('token').then((cookie) => {
    const token = cookie.value
    cy.request({
      method: 'GET',
      url: `/api/orders/${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  })
})
