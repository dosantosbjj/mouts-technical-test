/// <reference types="cypress" />

describe("User Register test scenarios", () => {
  const errorMessages = {
    duplicateEmail: "Este email já está sendo usado",
    requiredName: "Nome é obrigatório",
    requiredEmail: "Email é obrigatório",
    requiredPassword: "Password é obrigatório",
    invalidEmail: "Email deve ser um email válido",
  }

  context("Positive Scenarios", () => {
    beforeEach(function () {
      cy.generateUserData().then((userData) => {
        this.newUserData = userData
      })
      cy.visit("/login")
      cy.title().should("eq", "Front - ServeRest")
      cy.url().should("eq", `${Cypress.config().baseUrl}/login`)
      cy.get('[data-testid="email"]').should("be.visible")
    })

    afterEach(function () {
      if (this.createdUserId) {
        cy.deleteUserById(this.createdUserId)
      }
      if (this.adminUserId) {
        cy.deleteUserById(this.adminUserId)
      }
    })

    it("User self registration", function () {
      cy.get('[data-testid="cadastrar"]').click()
      cy.intercept("POST", "**/usuarios").as("registerUser")
      cy.get('[data-testid="nome"]').type(this.newUserData.nome)
      cy.get('[data-testid="email"]').type(this.newUserData.email)
      cy.get('[data-testid="password"]').type(this.newUserData.password)
      cy.contains("button", "Cadastrar").click()
      cy.wait("@registerUser").then((interception) => {
        expect(interception.response.statusCode).to.equal(201)
        this.createdUserId = interception.response.body._id || interception.response.body.id
      })
      cy.contains("Cadastro realizado com sucesso").should("be.visible")
    })

    it("User self registration and successful login", function () {
      cy.get('[data-testid="cadastrar"]').click()
      cy.intercept("POST", "**/usuarios").as("registerUser")
      cy.get('[data-testid="nome"]').type(this.newUserData.nome)
      cy.get('[data-testid="email"]').type(this.newUserData.email)
      cy.get('[data-testid="password"]').type(this.newUserData.password)
      cy.contains("button", "Cadastrar").click()
      cy.wait("@registerUser").then((interception) => {
        expect(interception.response.statusCode).to.equal(201)
        this.createdUserId = interception.response.body._id || interception.response.body.id
      })
      cy.url().should("include", "/home")
      cy.get('[data-testid="logout"]').should("be.visible")
    })

    it("Internal register of a user as an Admin", function () {
      cy.generateUserData().then((adminData) => {
        adminData.administrador = "true"
        cy.createUser(adminData).then((response) => {
          this.adminUserId = response.body._id || response.body.id
          cy.visit("/login")
          cy.fillLoginForm(adminData.email, adminData.password)
          cy.get('[data-testid="entrar"]').click()
          cy.intercept("POST", "**/usuarios").as("registerUser")
          cy.get('[data-testid="cadastrar-usuarios"]').click()
          cy.get('[data-testid="nome"], input[name="nome"]').first().type(this.newUserData.nome)
          cy.get('[data-testid="email"]').type(this.newUserData.email)
          cy.get('[data-testid="password"]').first().type(this.newUserData.password, { log: false})
          cy.get('[data-testid="checkbox"]').check()
          cy.contains("button", "Cadastrar").click()

          cy.wait("@registerUser").its("response.statusCode").should("eq", 201)
          this.createdUserId = response.body._id || response.body.id
          cy.contains(this.newUserData.nome).should("be.visible")
        })
      })
    })
  })

  context("Negative Scenarios", () => {
    beforeEach(function () {
      cy.generateUserData().then((userData) => {
        this.newUserData = userData
      })
      cy.visit("/login")
      cy.title().should("eq", "Front - ServeRest")
      cy.url().should("eq", `${Cypress.config().baseUrl}/login`)
      cy.get('[data-testid="email"]').should("be.visible")
    })

    afterEach(function () {
      if (this.reservedUserId) {
        cy.deleteUserById(this.reservedUserId)
      }
    })

    it("Cannot register with empty mandatory fields", function () {
      cy.get('a[data-testid="cadastrar"]').click()
      cy.intercept("POST", "**/usuarios").as("registerUser")
      cy.get('button[data-testid="cadastrar"').should("be.visible").click()
      cy.wait("@registerUser").its("response.statusCode").should("eq", 400)
      cy.contains(errorMessages.requiredName).should("be.visible")
      cy.contains(errorMessages.requiredEmail).should("be.visible")
      cy.contains(errorMessages.requiredPassword).should("be.visible")
    })

    it("Cannot register with invalid values (invalid email)", function () {
      cy.get('a[data-testid="cadastrar"]').click()
      cy.intercept("POST", "**/usuarios").as("registerUser")
      cy.fillRegistrationForm(this.newUserData.nome, "invalid.email", this.newUserData.password)
      cy.get('button[data-testid="cadastrar"]').click()
      cy.get('input[data-testid="email"]').its("0.validity.typeMismatch").should("be.true")
    })

    it("Cannot register with an already registered email", function () {
      cy.createUser(this.newUserData).then((response) => {
        this.reservedUserId = response.body._id || response.body.id
        cy.get('[data-testid="cadastrar"]').click()
        cy.intercept("POST", "**/usuarios").as("registerUser")
        cy.fillRegistrationForm(this.newUserData.nome, this.newUserData.email, this.newUserData.password)
        cy.get('[data-testid="cadastrar"]').click()
        cy.wait("@registerUser").its("response.statusCode").should("eq", 400)
        cy.contains(errorMessages.duplicateEmail).should("be.visible")
      })
    })
  })
})
