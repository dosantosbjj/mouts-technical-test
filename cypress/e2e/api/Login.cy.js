import { faker } from "@faker-js/faker"

let adminUserEmail;
let adminUserPassword;
let regularUserEmail;
let regularUserPassword;

describe("API login tests", () => {
  before(() => {
    cy.generateUserData().then((adminData) => {
      adminData.administrador = "true"
      cy.createUser(adminData).then((response) => {
        expect(response.status).eq(201)
        adminUserEmail = adminData.email
        adminUserPassword = adminData.password
      })
    })

    cy.generateUserData().then((userData) => {
      userData.administrador = "false"
      cy.createUser(userData).then((response) => {
        expect(response.status).eq(201)
        regularUserEmail = userData.email
        regularUserPassword = userData.password
      })
    })
  })

  context("Successful login", () => {
    it("Registered user should login successfully", function () {
      cy.login(adminUserEmail, adminUserPassword).then((response) => {
        expect(response.status).eq(200)
        expect(response.body.message).eq("Login realizado com sucesso")
      })
    })

    it("Registered regular user should login successfully with valid credentials", function () {
      cy.login(regularUserEmail, regularUserPassword).then((response) => {
        expect(response.status).eq(200)
        expect(response.body.message).eq("Login realizado com sucesso")
      })
    })
  })

  context("Failed login", () => {
    const invalidCredentials = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    }

    it("User login should fail with invalid credentials", function () {
      cy.login(invalidCredentials.email, invalidCredentials.password).then((response) => {
        expect(response.status).eq(401)
        expect(response.body.message).eq("Email e/ou senha inválidos")
      })
    })

    it("Login should fail when email is missing", function () {
      cy.login("", invalidCredentials.password).then((response) => {
        expect(response.status).eq(400)
        expect(response.body.email).eq("email não pode ficar em branco")
      })
    })

    it("Login should fail when both credentials are missing", function () {
      cy.login().then((response) => {
        expect(response.status).eq(400)
        expect(response.body.email).eq("email é obrigatório")
        expect(response.body.password).eq("password é obrigatório")
      })
    })
  })
})
