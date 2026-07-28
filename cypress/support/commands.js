import { faker } from '@faker-js/faker';

Cypress.Commands.add('login', (email, password) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiHost')}/login`,
    body: {
      email,
      password,
    },
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('generateUserData', () => {
  return {
    nome: faker.person.firstName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password(),
    administrador: false
  };
});

Cypress.Commands.add('createUser', (userData) => {
    cy.request({
        method: 'POST',
        url: `${Cypress.env('apiHost')}/usuarios`,
        body: userData,
        failOnStatusCode: false,
    }).then((response) => {
        return response;
    })
});