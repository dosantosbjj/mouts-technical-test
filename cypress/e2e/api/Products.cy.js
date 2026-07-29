let adminEmail
let adminPassword
let adminToken
let createdProductId
let cleanupUserId

describe("API product tests", () => {
  before(() => {
    cy.generateUserData().then((userData) => {
      userData.administrador = "true"
      cy.createUser(userData).then((response) => {
        expect(response.status).eq(201)
        cleanupUserId = response.body._id
        adminEmail = userData.email
        adminPassword = userData.password
      })
    })
  })

  beforeEach(() => {
    cy.login(adminEmail, adminPassword).then((response) => {
      expect(response.status).eq(200)
      expect(response.body.message).eq("Login realizado com sucesso")
      adminToken = response.body.authorization
      expect(adminToken).to.match(/^Bearer\s+/)
    })
  })

  afterEach(() => {
    if (createdProductId) {
      cy.deleteProductById(createdProductId, adminToken).then((response) => {
        expect(response.status).eq(200)
        expect(response.body.message).eq("Registro excluído com sucesso")
        createdProductId = null
      })
    }
  })

  after(() => {
    if (cleanupUserId) {
      cy.deleteUserById(cleanupUserId).then((response) => {
        expect(response.status).eq(200)
        expect(response.body.message).eq("Registro excluído com sucesso")
        cleanupUserId = null
      })
    }
  })

  context("Successful product creation", () => {
    it("Should create a product with valid data when authorized", () => {
      cy.generateProductData().then((productData) => {
        cy.createProduct(productData, adminToken).then((response) => {
          expect(response.status).eq(201)
          expect(response.body.message).eq("Cadastro realizado com sucesso")
          expect(response.body._id).to.be.a("string")
          createdProductId = response.body._id
        })
      })
    })
  })

  context("Negative value validation", () => {
    it("Should not allow creation of a product with duplicate name", () => {
      cy.generateProductData().then((productData) => {
        cy.createProduct(productData, adminToken).then((firstResponse) => {
          expect(firstResponse.status).eq(201)
          expect(firstResponse.body.message).eq("Cadastro realizado com sucesso")
          createdProductId = firstResponse.body._id

          cy.createProduct(productData, adminToken).then((secondResponse) => {
            expect(secondResponse.status).eq(400)
            expect(secondResponse.body.message).eq("Já existe produto com esse nome")
          })
        })
      })
    })
    
    it("Should fail when preco is negative", () => {
      cy.generateProductData().then((productData) => {
        productData.preco = -10

        cy.createProduct(productData, adminToken).then((response) => {
          expect(response.status).eq(400)
          expect(response.body.preco).eq('preco deve ser um número positivo')
        })
      })
    })

    it("Should fail without the authorization token", () => {
      cy.generateProductData().then((productData) => {
        productData.preco = -10

        cy.createProduct(productData, "").then((response) => {
          expect(response.status).eq(401)
          expect(response.body.message).eq("Token de acesso ausente, inválido, expirado ou usuário do token não existe mais")
        })
      })
    })

    it.only("Should fail when quantidade is negative", () => {
      cy.generateProductData().then((productData) => {
        productData.quantidade = -5

        cy.createProduct(productData, adminToken).then((response) => {
          expect(response.status).eq(400)
          expect(response.body.quantidade).eq('quantidade deve ser maior ou igual a 0')
        })
      })
    })
  })
})
