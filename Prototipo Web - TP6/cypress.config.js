const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // Levantar antes el frontend con `npm start` (sirve la raíz del proyecto en el puerto 5500)
    baseUrl: "http://127.0.0.1:5500",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: false,
    viewportWidth: 1280,
    viewportHeight: 900,
  },
});
