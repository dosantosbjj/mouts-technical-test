

### Technical test - Cypress E2E Automation Suite - Mouts TI

---

## 📌 Quick Start

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v16.x or higher recommended)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 2. Clone the Repository
```bash
git clone https://github.com/dosantosbjj/mouts-technical-test.git
cd mouts-technical-test
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Running the Tests

* **Open Cypress Test Runner (Interactive Mode):**
  ```bash
  npm run cy:open
  # or
  npx cypress open
  ```

* **Run Tests Headlessly (CI / CLI Mode):**
  ```bash
  npm run cy:run
  # or
  npx cypress run
  ```

---  

### Configuration Reference

* **Cypress Config:** `cypress.config.js`
* **Custom Commands:** `cypress/support/commands.js`
* **Example E2E Spec:** `cypress/e2e/Login.cy.js`

---

## 🚀 How to Evolve This Project (Priorities)

* **Test Independence:** Create and clean resources per-test (use API-backed setup in `beforeEach` and cleanup in `afterEach`).
* **Deterministic, Fast Tests:** Prefer API setup combined with UI verification; use `cy.intercept()` to assert network behavior.
* **Single Source of Truth:** Centralize selectors, UI messages, and contract schemas in dedicated `support/contract` files.
* **Reuse & Readability:** Encapsulate repeated flows inside `Cypress.Commands` (e.g., `login`, `createUser`, `createProduct`).
* **CI / Parallelization Readiness:** Isolate environments, generate unique test data, and split specs for parallel execution.
* **Observability & Maintenance:** Keep Mochawesome reports, failure screenshots, and consistent test naming conventions.

---

## ⚓ Recommended Hooks & Patterns

* **`before`** — Create long-lived fixtures (e.g., global admin user).
* **`beforeEach`** — Create per-test resources (product, user) via API.
* **`afterEach`** — Delete per-test resources to avoid state bleed across tests.
* **`after`** — Remove long-lived fixtures created in `before`.

> **Note:** Use Mocha `function () {}` (instead of arrow functions `() => {}`) when you need to access context via `this`, or use `cy.wrap(...).as('alias')`.

### Paste-Ready Example Pattern

```javascript
describe('Product Management', function () {
  let authToken;

  before(function () {
    // Create admin user or fetch persistent tokens
    cy.loginApi('admin@test.com', 'admin123').then((res) => {
      authToken = res.body.authorization;
    });
  });

  beforeEach(function () {
    // API setup for isolated test data
    const newProduct = {
      nome: `Product ${Date.now()}`,
      preco: 100,
      descricao: 'Testing',
      quantidade: 10,
    };

    cy.createProductApi(newProduct, authToken).then((res) => {
      cy.wrap(res.body._id).as('productId');
    });
  });

  it('should display the created product in the UI', function () {
    cy.visit('/products');
    cy.get(`[data-id="${this.productId}"]`).should('be.visible');
  });

  afterEach(function () {
    // Cleanup per-test entity
    if (this.productId) {
      cy.deleteProductApi(this.productId, authToken);
    }
  });
});

```

---

## 💡 Best Practices Implemented

| Practice | Purpose | How Applied Here | Short Example |
| --- | --- | --- | --- |
| **Create / Cleanup Per-Test** | Prevent state bleed | `beforeEach` creates entity, `afterEach` deletes it | `beforeEach(() => cy.createProduct(...).then(r => this.id = r.body._id))` |
| **Custom Commands** | DRY repeated API/UI flows | Encapsulate in `commands.js` | `cy.createProduct(product, token)` |
| **Network Assertions** | Deterministic expectations | `cy.intercept()` + `cy.wait('@alias')` | `cy.intercept('POST', '**/login').as('login')` |
| **Schema Validation** | Catch contract regressions | Validate API responses with JSON schemas | `cy.validateSchema(resp.body, productListSchema)` |
| **Unique Test Data** | Avoid duplicate collisions | Append timestamp or UUID to names | `const name = ${faker.commerce.productName()}_${Date.now()};` |
| **Small Focused Tests** | Easier debug & fewer flakes | One scenario per test, minimal unrelated asserts | `it('should fail when password invalid', ...)` |

---

## 🧠 Architectural Principles

### 1. KISS (Keep It Simple, Stupid)

Do the minimal assertions needed to prove behavior.

* **Example:** Assert the login network request status and the visibility of the logout button, rather than asserting dozens of unrelated UI elements on the dashboard.

### 2. DRY (Don't Repeat Yourself)

Centralize repeated HTTP flows inside custom Cypress commands.

* **Example:** Replace inline `cy.request()` calls with `cy.createUser(user)` across all test suites.

### 3. YAGNI (You Aren't Gonna Need It)

Avoid building complex abstractions (such as elaborate Page Object Models) until you have at least 3 distinct places requiring the exact same abstraction.

### 4. Clean Code

Use descriptive test names, centralized error messages, and eliminate magic strings.

* **Example:**
```javascript
const ERROR_MESSAGES = {
  invalidCredentials: 'Email e/ou senha inválidos',
};

```

## ⚙️ CI/CD Pipeline & Test Artifacts
**Disclaimer:** Every push to the main branch automatically triggers the entire Cypress E2E test suite in the CI pipeline.

Upon completion of the pipeline run, a Mochawesome execution report (along with any failure screenshots and videos) is generated and uploaded as a downloadable build artifact. You can inspect these reports directly from the pipeline run summary page to verify execution results or debug failures.

---