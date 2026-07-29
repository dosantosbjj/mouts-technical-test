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
    baseUrl: "https://front.serverest.dev/login/",
    env: {
      apiHost: "https://serverest.dev",
    },
    setupNodeEvents(on, config) {},
  },
});
