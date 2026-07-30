import { faker } from "@faker-js/faker";

Cypress.Commands.add("login", (email, password) => {
  return cy.request({
    method: "POST",
    url: `${Cypress.env("apiHost")}/login`,
    body: { email, password },
    failOnStatusCode: false,
  });
});

Cypress.Commands.add("generateUserData", () => {
  return {
    nome: faker.person.firstName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password(),
    administrador: "false",
  };
});

Cypress.Commands.add("createUser", (userData) => {
  return cy.request({
    method: "POST",
    url: `${Cypress.env("apiHost")}/usuarios`,
    body: userData,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add("getUsers", () => {
  return cy.request({
    method: "GET",
    url: `${Cypress.env("apiHost")}/usuarios`,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add("getUserById", (userId) => {
  return cy.request({
    method: "GET",
    url: `${Cypress.env("apiHost")}/usuarios/${userId}`,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add("deleteUserById", (id) => {
  return cy.request({
    method: "DELETE",
    url: `${Cypress.env("apiHost")}/usuarios/${id}`,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add("updateUser", (id, payload) => {
  return cy.request({
    method: "PUT",
    url: `${Cypress.env("apiHost")}/usuarios/${id}`,
    body: payload,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add("generateProductData", () => {
  return {
    nome: `${faker.commerce.productName()} ${Date.now()}`,
    preco: faker.number.int({ min: 1, max: 2000 }),
    descricao: faker.commerce.productDescription(),
    quantidade: faker.number.int({ min: 1, max: 100 }),
  };
});

Cypress.Commands.add("getProducts", () => {
  cy.request({
    method: "GET",
    url: `${Cypress.env("apiHost")}/produtos`,
    failOnStatusCode: false,
  });
});
Cypress.Commands.add("getProductById", (id) => {
  cy.request({
    method: "GET",
    url: `${Cypress.env("apiHost")}/produtos/${id}`,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add("createProduct", (productData, token) => {
  return cy.request({
    method: "POST",
    url: `${Cypress.env("apiHost")}/produtos`,
    headers: { Authorization: token },
    body: productData,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add("editProduct", (productId, productData, token) => {
  cy.request({
    method: "PUT",
    url: `${Cypress.env("apiHost")}/produtos/${productId}`,
    headers: { Authorization: token },
    body: productData,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add("deleteProductById", (id, token) => {
  return cy.request({
    method: "DELETE",
    url: `${Cypress.env("apiHost")}/produtos/${id}`,
    headers: { Authorization: token },
    failOnStatusCode: false,
  });
});

// UI test helpers
Cypress.Commands.add("fillLoginForm", (email, password) => {
  cy.get('[data-testid="email"]').type(email);
  cy.get('[data-testid="senha"]').type(password, { log: false });
});

Cypress.Commands.add("fillRegistrationForm", (nome, email, password) => {
  cy.get('[data-testid="nome"]').type(nome);
  cy.get('[data-testid="email"]').type(email);
  cy.get('[data-testid="password"]').type(password, { log: false });
});

//Utility
Cypress.Commands.add("validateSchema", (response, schema) => {
  const { error } = schema.validate(response);
  if (error) {
    console.error("Schema validation failure:", error.details[0].message);
    throw new Error(error.details[0].message);
  } else {
    cy.log("Schema validation successfull");
  }
});
