// Fija la zona horaria de TODA la suite de Jest en Argentina (GMT-3).
// Sin esto, los tests con fechas pueden pasar en una PC y fallar en otra
// (o en GitHub Actions, que corre en UTC). Ver informe TP6 · Tarea C.
module.exports = async () => {
  process.env.TZ = "America/Argentina/Buenos_Aires";
};
