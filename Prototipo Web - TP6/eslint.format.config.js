// Configuración del FORMATO (estilo del código: sangría, comillas, punto y coma, etc.).
// Se verifica con: npm run format:check  ·  Se corrige con: npm run format
const stylistic = require("@stylistic/eslint-plugin");
module.exports = [
  { ignores: ["node_modules/**", "coverage/**", "docs/**"] },
  {
    files: ["**/*.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "commonjs" },
    plugins: { "@stylistic": stylistic },
    rules: {
      "@stylistic/indent": ["error", 2, { SwitchCase: 1, flatTernaryExpressions: true, ignoredNodes: ["TemplateLiteral *"] }],
      "@stylistic/quotes": ["error", "double", { avoidEscape: true, allowTemplateLiterals: true }],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
      "@stylistic/no-trailing-spaces": "error",
      "@stylistic/eol-last": ["error", "always"],
      "@stylistic/no-multiple-empty-lines": ["error", { max: 2 }],
    },
  },
  { files: ["cypress/support/e2e.js"], languageOptions: { sourceType: "module" } },
];
