import { faker } from '@faker-js/faker'

Cypress.Commands.add('login', (email, password) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiHost')}/login`,
    body: {
      email,
      password,
    },
    failOnStatusCode: false,
  })
})

Cypress.Commands.add('generateUserData', () => {
  return {
    nome: faker.person.firstName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password(),
    administrador: "false"
  }
})

Cypress.Commands.add('createUser', (userData) => {
    return cy.request({
        method: 'POST',
        url: `${Cypress.env('apiHost')}/usuarios`,
        body: userData,
        failOnStatusCode: false,
    })
})

Cypress.Commands.add('deleteUserById', (id) => {
  return cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiHost')}/usuarios/${id}`,
    failOnStatusCode: false,
  })
})

Cypress.Commands.add('generateProductData', () => {
  return {
    nome: `${faker.commerce.productName()} ${Date.now()}`,
    preco: faker.number.int({ min: 1, max: 2000 }),
    descricao: faker.commerce.productDescription(),
    quantidade: faker.number.int({ min: 1, max: 100 }),
  }
})

Cypress.Commands.add('createProduct', (productData, token) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiHost')}/produtos`,
    headers: {
      Authorization: token,
    },
    body: productData,
    failOnStatusCode: false,
  })
})

Cypress.Commands.add('deleteProductById', (id, token) => {
  return cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiHost')}/produtos/${id}`,
    headers: {
      Authorization: token,
    },
    failOnStatusCode: false,
  })
})
