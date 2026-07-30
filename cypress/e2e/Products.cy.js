/// <reference types="cypress" />

describe("Products test scenarios", () => {
  const errorMessages = {
    duplicateName: "Já existe produto com esse nome",
    requiredName: "Nome é obrigatório",
    requiredPrice: "Preco é obrigatório",
    requiredDescription: "Descricao é obrigatório",
    requiredQuantity: "Quantidade é obrigatório",
  }

  beforeEach(() => {
    cy.visit("/login")
    cy.title().should("eq", "Front - ServeRest")
    cy.url().should("eq", `${Cypress.config().baseUrl}/login`)
    // Ensure login form is rendered
    cy.get('[data-testid="email"]').should('be.visible')
  })

  context("Positive Scenarios", () => {
    beforeEach(function () {
      cy.generateUserData().then((userData) => {
        userData.administrador = "true"
        cy.createUser(userData).then((response) => {
          expect(response.status).to.be.oneOf([200, 201])
          this.adminUser = userData
          this.adminUserId = response.body._id || response.body.id
          cy.fillLoginForm(this.adminUser.email, this.adminUser.password)
          cy.get('[data-testid="entrar"]').click()
          cy.generateProductData().then((productData) => {
            this.productData = productData
          })
        })
      })
    })

    afterEach(function () {
      if (this.productId) {
        cy.deleteProductById(this.productId, this.token)
      }
      if (this.adminUserId) {
        cy.deleteUserById(this.adminUserId)
      }
    })

    it("Admin user should successfully list products", function () {
      cy.login(this.adminUser.email, this.adminUser.password).then((resp) => {
        this.token = resp.body.authorization
        cy.createProduct(this.productData, this.token).then((productResponse) => {
          this.productId = productResponse.body._id || productResponse.body.id
          cy.intercept("GET", "**/produtos").as("getProducts")
          cy.get('[data-testid="listar-produtos"]').click()
          cy.wait("@getProducts").its("response.statusCode").should("eq", 200)
          cy.contains(this.productData.nome).should("be.visible")
        })
      })
    })

    it("Admin user should successfully create a new product", function () {
      cy.intercept("POST", "**/produtos").as("postProduct")
      cy.get('[data-testid="cadastrar-produtos"]').click()
      cy.get('[data-testid="nome"]').type(this.productData.nome)
      cy.get('[data-testid="preco"]').type(this.productData.preco)
      cy.get('[data-testid="descricao"]').type(this.productData.descricao)
      cy.get('[data-testid="quantity"]').type(this.productData.quantidade)
      cy.get('[data-testid="cadastarProdutos"]').click()
      cy.wait("@postProduct").its("response.statusCode").should("eq", 201)
      cy.contains(this.productData.nome).should("be.visible")
      cy.login(this.adminUser.email, this.adminUser.password).then((resp) => {
        this.token = resp.body.authorization
        cy.request({
          method: "GET",
          url: `${Cypress.env("apiHost")}/produtos?nome=${this.productData.nome}`,
        }).then((res) => {
          if (res.body.produtos && res.body.produtos.length > 0) {
            this.productId = res.body.produtos[0]._id
          }
        })
      })
    })

    it("Admin user should be able to delete a product from the list", function () {
      cy.login(this.adminUser.email, this.adminUser.password).then((resp) => {
        this.token = resp.body.authorization
        cy.createProduct(this.productData, this.token).then((productResponse) => {
          this.productId = productResponse.body._id || productResponse.body.id
          cy.intercept("DELETE", "**/produtos/*").as("deleteProduct")
          cy.get('[data-testid="listar-produtos"]').click()
          cy.contains("tr", this.productData.nome).within(() => {
            cy.get("button").contains("Excluir").click()
          })
          cy.wait("@deleteProduct").its("response.statusCode").should("eq", 200)
          cy.contains(this.productData.nome).should("not.exist")
          this.productId = null
        })
      })
    })
  })

  context("Negative Scenarios", () => {
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
      if (this.productId){
        cy.deleteProductById(this.productId, this.token)
      }

      if (this.regularUserId){
        cy.deleteUserById(this.regularUserId)
      }
      if (this.adminUserId){
        cy.deleteUserById(this.adminUserId)
      }
    })

    it("Regular user cannot create products (just list them)", function () {
      cy.fillLoginForm(this.regularUser.email, this.regularUser.password)
      cy.get('[data-testid="entrar"]').click()
      cy.get('[data-testid="cadastrar-produtos"]').should("not.exist")
    })

    it("Admin user cannot create a product with an already registered name", function () {
      cy.generateUserData().then((adminData) => {
        adminData.administrador = "true"
        cy.createUser(adminData).then((response) => {
          this.adminUserId = response.body._id || response.body.id
          cy.fillLoginForm(adminData.email, adminData.password)
          cy.get('[data-testid="entrar"]').click()
          cy.generateProductData().then((productData) => {
            this.productData = productData
            cy.login(adminData.email, adminData.password).then((resp) => {
              this.token = resp.body.authorization
              cy.createProduct(this.productData, this.token).then((productResponse) => {
                  this.productId = productResponse.body._id || productResponse.body.id
                  cy.intercept("POST", "**/produtos").as("postProduct")
                  cy.get('[data-testid="cadastrar-produtos"]').click()
                  cy.get('[data-testid="nome"]').type(this.productData.nome)
                  cy.get('[data-testid="preco"]').type(this.productData.preco)
                  cy.get('[data-testid="descricao"]').type(this.productData.descricao)
                  cy.get('[data-testid="quantity"]').type(this.productData.quantidade)
                  cy.get('[data-testid="cadastarProdutos"]').click()
                  cy.wait("@postProduct").its("response.statusCode").should("eq", 400)
                  cy.contains(errorMessages.duplicateName).should("be.visible")
                },
              )
            })
          })
        })
      })
    })

    it("Admin user cannot create a product with empty mandatory fields", function () {
      cy.generateUserData().then((adminData) => {
        adminData.administrador = "true"
        cy.createUser(adminData).then((response) => {
          this.adminUserId = response.body._id || response.body.id
          cy.fillLoginForm(adminData.email, adminData.password)
          cy.get('[data-testid="entrar"]').click()
          cy.intercept("POST", "**/produtos").as("postProduct")
          cy.get('[data-testid="cadastrar-produtos"]').click()
          cy.get('[data-testid="cadastarProdutos"]').click()
          cy.wait("@postProduct").its("response.statusCode").should("eq", 400)
          cy.contains(errorMessages.requiredName).should("be.visible")
          cy.contains(errorMessages.requiredPrice).should("be.visible")
          cy.contains(errorMessages.requiredDescription).should("be.visible")
          cy.contains(errorMessages.requiredQuantity).should("be.visible")
        })
      })
    })
  })
})
