// Configuración del LINTER (buenas prácticas de JavaScript).
// Se ejecuta con: npm run lint
const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  { ignores: ["node_modules/**", "coverage/**", "docs/**"] },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        cy: "readonly",
        Cypress: "readonly",
      },
    },
  },
  // Este archivo de soporte de Cypress usa "import" (módulo ES).
  { files: ["cypress/support/e2e.js"], languageOptions: { sourceType: "module" } },
];
