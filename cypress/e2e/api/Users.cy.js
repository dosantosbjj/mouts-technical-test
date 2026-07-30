import { faker } from "@faker-js/faker"
import { userListSchema } from "../api/contracts/user.contract"
let adminEmail
let adminPassword
let adminToken
let createdUserId
let cleanupAdminId
let updatedUser

describe("API user tests", () => {
  before(() => {
    cy.generateUserData().then((userData) => {
      userData.administrador = "true"
      cy.createUser(userData).then((resp) => {
        expect(resp.status).eq(201)
        adminEmail = userData.email
        adminPassword = userData.password
        cleanupAdminId = resp.body._id
      })
    })
  })

  beforeEach(() => {
    cy.login(adminEmail, adminPassword).then((resp) => {
      expect(resp.status).eq(200)
      adminToken = resp.body.authorization
      expect(adminToken).to.match(/^Bearer\s+/)
    })
  })

  afterEach(() => {
    if (createdUserId) {
      cy.deleteUserById(createdUserId, adminToken).then((resp) => {
        expect(resp.status).eq(200)
        createdUserId = null
      })
    }
  })

  after(() => {
    if (cleanupAdminId) {
      cy.deleteUserById(cleanupAdminId, adminToken).then((resp) => {
        expect(resp.status).eq(200)
        cleanupAdminId = null
      })
    }
  })

  context("User creation operations", () => {
    it("Should create a user with valid data", () => {
      cy.generateUserData().then((userData) => {
        cy.createUser(userData).then((resp) => {
          expect(resp.status).eq(201)
          expect(resp.body.message).to.contain(
            "Cadastro realizado com sucesso",
          )
          createdUserId = resp.body._id
        })
      })
    })

    it("Should not create a user with empty payload", () => {
      cy.createUser("").then((resp) => {
        expect(resp.status).eq(400)
        expect(resp.body.email).eq("email é obrigatório")
        expect(resp.body.nome).eq("nome é obrigatório")
        expect(resp.body.password).eq("password é obrigatório")
        expect(resp.body.administrador).eq("administrador é obrigatório")
      })
    })
  })

  context("User read operations", () => {
    it("Should list the registered users", () => {
      cy.getUsers().then((response) => {
        expect(response.status).eq(200)
        cy.validateSchema(response.body.usuarios[0], userListSchema)
      })
    })

    it("Should list a user by its id", () => {
      cy.getUserById(cleanupAdminId).then((response) => {
        expect(response.status).eq(200)
        cy.validateSchema(response.body, userListSchema)
      })
    })
    it("Should fail when the id is not valid", () => {
      cy.getUserById(faker.number.int()).then((response) => {
        expect(response.status).eq(400)
        expect(response.body.message).contain("Usuário não encontrado")
      })
    })
  })

  

  context("User edit operations", () => {
    beforeEach(() => {
      cy.generateUserData().then((userData) => {
        cy.createUser(userData).then((createResp) => {
          expect(createResp.status).eq(201)
          createdUserId = createResp.body._id
          updatedUser = {
            nome: `${userData.nome} Updated`,
            email: faker.internet.email(),
            password: `${userData.password} Updated`,
            administrador: userData.administrador,
          }
        })
      })
    })
    it("Should successfully edit an user", () => {
      cy.updateUser(createdUserId, updatedUser).then((updateResp) => {
        expect(updateResp.status).eq(200)
        expect(updateResp.body.message).to.contain("Registro alterado com sucesso")
      })
    })
    it("Should fail editing an user that does not exists", () => {
      cy.updateUser("", updatedUser).then((response) => {
        expect(response.status).eq(405)
        expect(response.body.message).eq('Não é possível realizar PUT em /usuarios/. Acesse https://serverest.dev para ver as rotas disponíveis e como utilizá-las.')
      })
    })
  })

  context("User deletion operations", () => {
    it("Should delete a user", () => {
      cy.generateUserData().then((userData) => {
        cy.createUser(userData).then((createResp) => {
          expect(createResp.status).eq(201)
          createdUserId = createResp.body._id
          cy.deleteUserById(createdUserId).then((delResp) => {
            expect(delResp.status).eq(200)
            expect(delResp.body.message).to.contain(
              "Registro excluído com sucesso",
            )
            createdUserId = null
          })
        })
      })
    })

    it("Should fail deleting a user that does not exists", () => {
      cy.deleteUserById("").then((delResp) => {
        expect(delResp.status).eq(405)
        expect(delResp.body.message).eq(
          "Não é possível realizar DELETE em /usuarios/. Acesse https://serverest.dev para ver as rotas disponíveis e como utilizá-las.",
        )
      })
    })
  })
})
