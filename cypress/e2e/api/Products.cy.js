import { faker } from "@faker-js/faker";
import { productListSchema } from "./contracts/product.contract";

let adminEmail;
let adminPassword;
let adminToken;
let createdProductId;
let cleanupUserId;
let productData;

describe("API product tests", () => {
  before(() => {
    cy.generateUserData().then((userData) => {
      userData.administrador = "true";
      cy.createUser(userData).then((response) => {
        expect(response.status).eq(201);
        cleanupUserId = response.body._id;
        adminEmail = userData.email;
        adminPassword = userData.password;
      });
    });
  });

  beforeEach(() => {
    cy.login(adminEmail, adminPassword).then((response) => {
      expect(response.status).eq(200);
      adminToken = response.body.authorization;
      expect(adminToken).to.match(/^Bearer\s+/);
    });
  });

  afterEach(() => {
    if (createdProductId) {
      cy.deleteProductById(createdProductId, adminToken).then((response) => {
        expect(response.status).eq(200);
        createdProductId = null;
      });
    }
  });

  after(() => {
    if (cleanupUserId) {
      cy.deleteUserById(cleanupUserId).then((response) => {
        expect(response.status).eq(200);
        cleanupUserId = null;
      });
    }
  });

  context("Product creation operations", () => {
    beforeEach(() => {
      cy.generateProductData().then((product) => {
        productData = product;
      });
    });
    it("Should create a product with valid data when authorized", () => {
      cy.createProduct(productData, adminToken).then((response) => {
        expect(response.status).eq(201);
        expect(response.body.message).eq("Cadastro realizado com sucesso");
        createdProductId = response.body._id;
      });
    });

    it("Should fail to create a product when preco is negative", () => {
      productData.preco = -10;
      cy.createProduct(productData, adminToken).then((response) => {
        expect(response.status).eq(400);
        expect(response.body.preco).eq("preco deve ser um número positivo");
      });
    });

    it("Should fail to create a product when quantidade is negative", () => {
      productData.quantidade = -5;
      cy.createProduct(productData, adminToken).then((response) => {
        expect(response.status).eq(400);
        expect(response.body.quantidade).eq(
          "quantidade deve ser maior ou igual a 0",
        );
      });
    });

    it("Should fail to create a product without the authorization token", () => {
      cy.createProduct(productData, "").then((response) => {
        expect(response.status).eq(401);
        expect(response.body.message).eq(
          "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais",
        );
      });
    });

    it("Should not allow creation of a product with duplicate name", () => {
      cy.createProduct(productData, adminToken).then((firstResponse) => {
        expect(firstResponse.status).eq(201);
        createdProductId = firstResponse.body._id;
        cy.createProduct(productData, adminToken).then((secondResponse) => {
          expect(secondResponse.status).eq(400);
          expect(secondResponse.body.message).eq(
            "Já existe produto com esse nome",
          );
        });
      });
    });
  });

  context("Product read operations", () => {
    it("Shoud list all products", () => {
      cy.getProducts().then((response) => {
        expect(response.status).eq(200);
        cy.validateSchema(response.body.produtos[0], productListSchema);
      });
    });
    it("Should retrieve a product by ID after creation", () => {
      cy.generateProductData().then((productData) => {
        cy.createProduct(productData, adminToken).then((createResp) => {
          expect(createResp.status).eq(201);
          const id = createResp.body._id;
          cy.getProductById(id).then((readResp) => {
            expect(readResp.status).eq(200);
            cy.validateSchema(readResp.body, productListSchema);
          });
          createdProductId = id;
        });
      });
    });

    it("Should return 400 for a non‑existent product ID", () => {
      const fakeId = "507f1f77bcf86cd799439011";
      cy.getProductById(fakeId).then((resp) => {
        expect(resp.status).eq(400);
      });
    });
  });

  context("Product update operations", () => {
    beforeEach(() => {
      cy.generateProductData().then((product) => {
        productData = product;
      });
    });
    it("Should update a product fields when authorized", () => {
      cy.createProduct(productData, adminToken).then((createResp) => {
        expect(createResp.status).eq(201);
        const id = createResp.body._id;
        const updatePayload = {
          nome: `${productData.nome} Updated`,
          preco: faker.number.int({ min: 0, max: 50000 }),
          descricao: `${productData.descricao} Updated`,
          quantidade: faker.number.int({ min: 0, max: 5000 }),
        };
        cy.editProduct(id, updatePayload, adminToken).then((updateResp) => {
          expect(updateResp.status).eq(200);
          expect(updateResp.body.message).eq("Registro alterado com sucesso");
        });
        createdProductId = id;
      });
    });
    it("Should fail to update when token is missing", () => {
      cy.createProduct(productData, adminToken).then((createResp) => {
        const id = createResp.body._id;
        const updatePayload = { nome: "FailUpdate" };
        cy.request({
          method: "PUT",
          url: `${Cypress.env("apiHost")}/produtos/${id}`,
          body: updatePayload,
          failOnStatusCode: false,
        }).then((resp) => {
          expect(resp.status).eq(401);
        });
        createdProductId = id;
      });
    });
  });

  context("Product deletion operations", () => {
    beforeEach(() => {
      cy.generateProductData().then((product) => {
        productData = product;
      });
    });
    it("Should delete a product when authorized", () => {
      cy.createProduct(productData, adminToken).then((createResp) => {
        expect(createResp.status).eq(201);
        const id = createResp.body._id;
        cy.deleteProductById(id, adminToken).then((delResp) => {
          expect(delResp.status).eq(200);
          expect(delResp.body.message).eq("Registro excluído com sucesso");
        });
      });
    });
    it("Should fail to delete when token is missing", () => {
      cy.createProduct(productData, adminToken).then((createResp) => {
        const id = createResp.body._id;
        cy.deleteProductById(id, '').then((resp) => {
          expect(resp.status).eq(401);
          expect(resp.body.message).eq('Token de acesso ausente, inválido, expirado ou usuário do token não existe mais')
        });
      });
    });
  });
});
