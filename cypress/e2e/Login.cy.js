/// <reference types="cypress" />

describe("Login test scenarios", () => {
  beforeEach(() => {
    cy.visit("/login")
    cy.title().should("eq", "Front - ServeRest")
    cy.url().should("eq", `${Cypress.config().baseUrl}/login`)
    cy.get('[data-testid="email"]').should('be.visible')
  })

  const adminMenus = [
    "cadastrar-usuarios",
    "listar-usuarios",
    "cadastrar-produtos",
    "listar-produtos",
  ]

  const errorMessages = {
    invalidCredentials: "Email e/ou senha inválidos",
    requiredEmail: "Email é obrigatório",
    requiredPassword: "Password é obrigatório",
  }

  context("Successful login", () => {
    beforeEach(function () {
      cy.generateUserData().then((userData) => {
        userData.administrador = "false"
        cy.createUser(userData).then((response) => {
          expect(response.status).eq(201)
          this.regularUser = userData
          this.regularUserId = response.body._id || response.body.id
        })
      })
    })

    afterEach(function () {
      if (this.regularUserId) {
        cy.deleteUserById(this.regularUserId)
      }
      if (this.adminUserId) {
        cy.deleteUserById(this.adminUserId)
      }
    })

    it("Regular user should login successfully with valid credentials", function () {
      cy.intercept("POST", "**/login").as("loginRequest")
      cy.fillLoginForm(this.regularUser.email, this.regularUser.password)
      cy.get('[data-testid="entrar"]').click()
      cy.wait("@loginRequest").its("response.statusCode").should("eq", 200)
      cy.get('[data-testid="logout"]').should("be.visible")
      cy.get('[data-testid="entrar"]').should("not.exist")
      cy.url().should("eq", `${Cypress.config().baseUrl}/home`)

      adminMenus.forEach((menu) => {
        cy.get(`[data-testid="${menu}"]`).should("not.exist")
      })
    })

    it("Admin user should login successfully with valid credentials", function () {
      cy.generateUserData().then((adminData) => {
        adminData.administrador = "true"
        cy.createUser(adminData).then((response) => {
          expect(response.status).eq(201)
          const adminId = response.body._id || response.body.id
          this.adminUserId = adminId
          // Small pause to ensure backend propagation
          cy.wait(500)
          cy.intercept("POST", "**/login").as("loginRequest")
          cy.fillLoginForm(adminData.email, adminData.password)
          cy.get('[data-testid="entrar"]').click()
          cy.wait("@loginRequest").its("response.statusCode").should("eq", 200)

          adminMenus.forEach((menu) => {
            cy.get(`[data-testid="${menu}"]`).should("be.visible")
          })

          cy.get('[data-testid="logout"]').should("be.visible")
          cy.get('[data-testid="entrar"]').should("not.exist")
        })
      })
    })

    it("User should login and logout successfully", function () {
      cy.intercept("POST", "**/login").as("loginRequest")
      cy.fillLoginForm(this.regularUser.email, this.regularUser.password)
      cy.get('[data-testid="entrar"]').click()
      cy.wait("@loginRequest").its("response.statusCode").should("eq", 200)
      cy.get('[data-testid="logout"]').should("be.visible").click()
      cy.url().should("eq", `${Cypress.config().baseUrl}/login`)
      cy.get('[data-testid="entrar"]').should("be.visible")
    })
  })

  context("Login Failures", () => {
    beforeEach(function () {
      cy.generateUserData().then((userData) => {
        userData.administrador = "false"
        cy.createUser(userData).then((response) => {
          expect(response.status).eq(201)
          this.failureUser = userData
          this.failureUserId = response.body._id || response.body.id
        })
      })
    })

    afterEach(function () {
      if (this.failureUserId) {
        cy.deleteUserById(this.failureUserId)
      }
    })

    it("User should not login with invalid password", function () {
      cy.intercept("POST", "**/login").as("loginRequest")
      cy.fillLoginForm(this.failureUser.email, "invalidPassword123")
      cy.get('[data-testid="entrar"]').click()
      cy.wait("@loginRequest").its("response.statusCode").should("eq", 401)
      cy.contains(errorMessages.invalidCredentials).should("be.visible")
      cy.get('[data-testid="entrar"]').should("be.visible")
    })

    it("User should not login with invalid email", function () {
      cy.intercept("POST", "**/login").as("loginRequest")
      cy.get('[data-testid="email"]').type("invalid.email@qa.com")
      cy.get('[data-testid="senha"]').type(this.failureUser.password)
      cy.get('[data-testid="entrar"]').click()
      cy.wait("@loginRequest").its("response.statusCode").should("eq", 401)
      cy.contains(errorMessages.invalidCredentials).should("be.visible")
      cy.get('[data-testid="entrar"]').should("be.visible")
    })

    it("User should not login with empty credentials", () => {
      cy.intercept("POST", "**/login").as("loginRequest")

      cy.get('[data-testid="entrar"]').click()
      cy.wait("@loginRequest").its("response.statusCode").should("eq", 400)

      cy.contains(errorMessages.requiredEmail).should("be.visible")
      cy.contains(errorMessages.requiredPassword).should("be.visible")
      cy.get('[data-testid="entrar"]').should("be.visible")
    })
  })
})