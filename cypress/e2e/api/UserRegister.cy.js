import { faker } from "@faker-js/faker"

let existingUserEmail
let existingUserPassword
let existingUserId
let createdUserId

describe("API user registration tests", () => {
  before(() => {
    // create an existing user to test duplicate email handling
    cy.generateUserData().then((userData) => {
      userData.administrador = "false"
      cy.createUser(userData).then((response) => {
        expect(response.status).to.eq(201)
        existingUserEmail = userData.email
        existingUserPassword = userData.password
        existingUserId = response.body._id
      })
    })  
  })

  afterEach(() => {
    // delete the user created by the test (if any)
    if (createdUserId) {
      cy.deleteUserById(createdUserId).then((response) => {
        // allow 200 or 204 depending on API implementation
        expect([200, 204]).to.include(response.status)
        createdUserId = null
      })
    }
  })

  after(() => {
    // delete the existing user created in before()
    if (existingUserId) {
      cy.deleteUserById(existingUserId).then((response) => {
        expect([200, 204]).to.include(response.status)
        existingUserId = null
      })
    }
  })

  context("Successful registration", () => {
    it("Should create an admin user successfully", function () {
      cy.generateUserData().then((userData) => {
        userData.administrador = "true"
        cy.createUser(userData).then((response) => {
          expect(response.status).to.eq(201)
          expect(response.body.message).to.eq("Cadastro realizado com sucesso")
          createdUserId = response.body._id
        })
      })
    })

    it("Should create a regular user successfully", function () {
      cy.generateUserData().then((userData) => {
        userData.administrador = "false"
        cy.createUser(userData).then((response) => {
          expect(response.status).to.eq(201)
          expect(response.body.message).to.eq("Cadastro realizado com sucesso")
          createdUserId = response.body._id
        })
      })
    })
  })

  context("Registration failures", () => {
    const invalidData = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    }

    it("User register should fail when trying to create a user with duplicate email", function () {
      cy.generateUserData().then((userData) => {
        userData.administrador = "false"
        userData.email = existingUserEmail
        cy.createUser(userData).then((response) => {
          expect(response.status).to.eq(400)
          expect(response.body.message).to.eq("Este email já está sendo usado")
        })
      })
    })

    it("User register should fail when email is missing", function () {
      cy.generateUserData().then((userData) => {
        userData.email = ""
        cy.createUser(userData).then((response) => {
          expect(response.status).to.eq(400)
          expect(response.body.email).to.eq("email não pode ficar em branco")
        })
      })
    })

    it("User register should fail when password is missing", function () {
      cy.generateUserData().then((userData) => {
        userData.password = ""
        cy.createUser(userData).then((response) => {
          expect(response.status).to.eq(400)
          expect(response.body.password).to.eq("password não pode ficar em branco")
        })
      })
    })
  })
})