const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // Antes de correr Cypress hay que levantar el frontend con `npm start`
    // (sirve la RAÍZ del proyecto en el puerto 5500).
    baseUrl: "http://127.0.0.1:5500",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
    viewportWidth: 1280,
    viewportHeight: 900,
    defaultCommandTimeout: 6000,
    // Evidencia para el informe: video de cada spec y captura automática si un test falla.
    video: true,
    screenshotOnRunFailure: true,
    // Cada test arranca con la página recién cargada (los datos viven en memoria).
    testIsolation: true,
  },
});
