import { Product } from '@/types/api'
import { formatReviewDate } from '@/utils/formatters/formatReviewDate'

const id = '62dbfa7f31c12b460f19f2b1'

before(() => {
  cy.task('seedProducts')
  cy.task('seedUsers')
})

after(() => {
  cy.task('deleteProducts')
  cy.task('deleteUsers')
})

describe('Product Page', () => {
  it('renders product', () => {
    cy.visit(`/product/${id}`)

    cy.request(`/api/products/${id}`).then((response) => {
      const { status, body } = response
      const { name, price, description, reviews }: Product = body

      expect(status).to.equal(200)

      cy.getImage('product-image')

      cy.assertText('product-name', name)
      cy.assertText('product-description', description)
      cy.assertText('product-price', `$${price}`)

      cy.getByTestId('review-username').each((element, index) => {
        expect(element).to.have.text(reviews[index].username)
      })
      cy.getByTestId('review-date').each((date, index) => {
        expect(date).to.have.text(formatReviewDate(reviews[index].createdAt))
      })
      cy.getByTestId('review-comment').each((comment, index) => {
        expect(comment).to.have.text(reviews[index].comment)
      })
    })
  })

  describe('shows info message', () => {
    it('for no product reviews', () => {
      const id = '62dbfa7f31c12b460f19f2b3'
      cy.login({ email: 'john@gmail.com', password: '123456' })
      cy.visit(`/product/${id}`)
      cy.getMessage('info-message', 'No Reviews')
    })

    it('for not logged in user', () => {
      cy.visit(`/product/${id}`)
      cy.getMessage('info-message', 'Please sign in to write a review')
    })
  })

  describe('validates review form', () => {
    beforeEach(() => {
      cy.login({ email: 'john@gmail.com', password: '123456' })
      cy.visit(`/product/${id}`)
    })

    it('verifies select options', () => {
      cy.selectOption({
        testId: 'rating-select',
        text: '1 - Terrible',
        value: '1',
      })
      cy.selectOption({
        testId: 'rating-select',
        text: '2 - Bad',
        value: '2',
      })
      cy.selectOption({
        testId: 'rating-select',
        text: '3 - Good',
        value: '3',
      })
      cy.selectOption({
        testId: 'rating-select',
        text: '4 - Very Good',
        value: '4',
      })
      cy.selectOption({
        testId: 'rating-select',
        text: '5 - Excellent',
        value: '5',
      })
      cy.selectOption({
        testId: 'rating-select',
        text: 'Select',
        value: '',
      })
    })

    it('does not submit a review with no rating and shows an error message', () => {
      cy.waitBeforeSubmit()
      cy.submitForm('review-form')
      cy.getMessage('rating-error', 'Rating is required')
    })

    it('does not submit a review for an already reviewed product and shows an error message', () => {
      cy.selectOption({
        testId: 'rating-select',
        text: '4 - Very Good',
        value: '4',
      })
      cy.typeInto('comment-input', 'This product is very good!')
      cy.submitForm('review-form')
      cy.getMessage('error-message', 'Product already reviewed')
    })
  })

  it('submits a review with a rating and a comment', () => {
    const id = '62dbfa7f31c12b460f19f2b4'
    cy.intercept('POST', `/api/products/${id}/review`).as('createReview')
    cy.login({ email: 'john@gmail.com', password: '123456' })
    cy.visit(`/product/${id}`)

    cy.selectOption({
      testId: 'rating-select',
      text: '5 - Excellent',
      value: '5',
    })
    cy.typeInto('comment-input', 'This product is excellent!')
    cy.submitForm('review-form')
    cy.getByTestId('rating-error').should('not.exist')

    cy.assertDisabled('submit-button')
    cy.assertEmpty('rating-select')
    cy.assertEmpty('comment-input')

    cy.wait('@createReview').then(({ response }) => {
      expect(response.statusCode).to.equal(201)
      cy.assertText('review-username', 'John Doe')
      cy.assertText('review-date', new Date().toLocaleDateString('ru-RU'))
      cy.assertText('review-comment', 'This product is excellent!')
    })
  })

  it('verifies product quantity select options', () => {
    cy.visit(`/product/${id}`)
    cy.selectOption({ testId: 'product-quantity', text: '2', value: '2' })
    cy.selectOption({ testId: 'product-quantity', text: '3', value: '3' })
  })

  it('adds product to the cart', () => {
    const id = '62dbfa7f31c12b460f19f2b3'
    cy.intercept('POST', '/api/cart').as('addCartItem')
    cy.login({ email: 'jane@gmail.com', password: '123456' })
    cy.visit(`/product/${id}`)
    cy.getByTestId('product-button').click()

    cy.wait('@addCartItem').then(({ response }) => {
      expect(response.statusCode).to.equal(201)

      cy.verifyUrl('/cart')
      cy.assertLength('cart-item', 3)
    })
  })
})
