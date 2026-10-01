/**
 * Comandos personalizados de Cypress para AgendaYA (Grupo 9).
 *
 * Buenas prácticas aplicadas:
 *  - Selectores SOLO por atributo data-cy (no dependen de clases ni textos).
 *  - Reloj del navegador controlado (cy.clock) para que los tests sean
 *    deterministas: siempre "hoy" es el lunes 05/10/2026 a las 08:00, así los
 *    días hábiles, fines de semana y plazos (12 hs, 24 hs) no dependen del día
 *    en que se ejecute la suite.
 *  - Los pasos repetidos del flujo de reserva se encapsulan acá (DRY) y cada
 *    test solo expresa lo que quiere verificar.
 */

// Fecha "actual" fija para toda la suite: lunes 05/10/2026 08:00 (hora local).
const FECHA_SISTEMA = new Date(2026, 9, 5, 8, 0, 0);

/** Atajo: cy.dataCy("btn-reservar") === cy.get('[data-cy="btn-reservar"]') */
Cypress.Commands.add("dataCy", (valor, opciones) => cy.get(`[data-cy="${valor}"]`, opciones));

/**
 * Congela el reloj en FECHA_SISTEMA (o la fecha indicada) y abre el prototipo.
 * cy.clock() tiene que ejecutarse ANTES de cy.visit() para que la página
 * nazca con el reloj simulado.
 */
Cypress.Commands.add("visitarAgendaYA", (fecha = FECHA_SISTEMA) => {
  cy.clock(fecha.getTime());
  cy.visit("/frontend/index.html");
  cy.dataCy("vista-cliente").should("be.visible");
});

/** Paso 1 + Paso 2: elige tipo de evento, día y horario, y avanza al formulario. */
Cypress.Commands.add("elegirEventoFechaYHora", ({ evento = "ev1", dia = "2026-10-06", hora = "10:00" } = {}) => {
  cy.dataCy(`evento-${evento}`).click();
  cy.dataCy("paso-2").should("be.visible");
  cy.dataCy(`dia-${dia}`).click();
  cy.dataCy(`horario-${hora}`).click();
  cy.dataCy("btn-confirmar-horario").should("not.be.disabled").click();
  cy.dataCy("paso-3").should("be.visible");
});

/** Paso 3: completa el formulario con los campos indicados (los vacíos no se tipean). */
Cypress.Commands.add("completarDatosCliente", (datos) => {
  const campos = ["nombre", "apellido", "dni", "email", "telefono"];
  campos.forEach((campo) => {
    if (datos[campo]) cy.dataCy(`input-${campo}`).clear().type(datos[campo]);
  });
});

/** Lee el código de verificación simulado que muestra la pantalla y lo ingresa. */
Cypress.Commands.add("verificarCorreoConCodigoMostrado", () => {
  cy.dataCy("codigo-demo-hint")
    .invoke("text")
    .then((texto) => {
      const codigo = texto.match(/\d{6}/)[0];
      cy.dataCy("input-codigo").type(codigo);
    });
  cy.dataCy("btn-verificar-codigo").click();
});

/** Flujo completo hasta dejar una reserva CONFIRMADA (reutilizado por varios specs). */
Cypress.Commands.add("crearReservaConfirmada", (opciones = {}) => {
  cy.fixture("datos-prueba").then(({ cliente }) => {
    cy.elegirEventoFechaYHora(opciones);
    cy.completarDatosCliente(cliente);
    cy.dataCy("btn-reservar").click();
    cy.dataCy("estado-pendiente").should("be.visible");
    cy.verificarCorreoConCodigoMostrado();
    cy.dataCy("estado-verificado").should("be.visible");
    cy.dataCy("btn-simular-link-confirmacion").click();
    cy.dataCy("estado-confirmada").should("be.visible");
    cy.dataCy("popup-cerrar").click();
  });
});

/** Vista Administrador → Mensajes → pestaña indicada ("plantillas" | "enviadas"). */
Cypress.Commands.add("irAMensajesAdmin", (pestania = "plantillas") => {
  cy.dataCy("nav-admin").click();
  cy.dataCy("menu-mensajes").click();
  cy.dataCy(`tab-${pestania}`).click();
});
