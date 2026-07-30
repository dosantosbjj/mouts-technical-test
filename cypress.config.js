const { defineConfig } = require("cypress");

module.exports = defineConfig({
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,
  screenshotORunFailure: true,
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
    defaultCommandTimeout: 6000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    retries: { runMode: 2 , openMode: 0},
    env: {
      apiHost: "https://serverest.dev",
    },
    setupNodeEvents(on, config) {},
  },
});
