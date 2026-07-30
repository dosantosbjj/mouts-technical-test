const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: true,
  reporter: "mochawesome",
  reporterOptions: {
    reportDir: "cypress/reports",
    reportFilename: "results",
    overwrite: false,
    html: true,
    json: true,
  },
  e2e: {
    baseUrl: "https://front.serverest.dev",
    defaultCommandTimeout: 10000,
    requestTimeout: 6000,
    retries: { runMode: 3 , openMode: 0},
    env: {
      apiHost: "https://serverest.dev",
    },
    setupNodeEvents(on, config) {},
  },
});
