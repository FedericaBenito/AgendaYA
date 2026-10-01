/**
 * Test E2E — Simular envío de notificación e historial (Módulo 6: Notificaciones)
 * Responsable: Del Bosco Marcos
 * Trazabilidad: M06-F05 · US-05/US-07 (envío con plantilla) · US-01-04 (E4 plantilla en uso)
 *               Flujo obligatorio TP6 (M06): "Simular envío de notificación"
 *               Flujo opcional TP6 (M06): "Vista de historial de notificaciones"
 */
describe("AgendaYA - M06 Notificaciones · Simulación de envío e historial", () => {
  beforeEach(() => {
    // Arrange común: el administrador está en Mensajes → Notificaciones enviadas (historial vacío)
    cy.visitarAgendaYA();
    cy.irAMensajesAdmin("enviadas");
    cy.dataCy("msg-sin-enviadas").should("be.visible").and("have.text", "Todavía no se envió ninguna notificación.");
  });

  it("envía una notificación con plantilla y la registra en el historial", () => {
    // Arrange: elige la reserva de Juan Pérez (RES-0008) y la plantilla "Recordatorio 24hs"
    cy.dataCy("select-reserva").select("r8");
    cy.dataCy("select-plantilla-envio").select("p2");

    // Act
    cy.dataCy("btn-simular-envio").click();

    // Assert (1): confirmación visible y una fila nueva en el historial
    cy.dataCy("toast-texto").should("have.text", "Notificación enviada correctamente");
    cy.dataCy("toast-cerrar").click();
    cy.dataCy("msg-sin-enviadas").should("not.be.visible");
    cy.get('[data-cy^="enviada-asunto-"]').should("have.length", 1);
    cy.dataCy("enviada-asunto-n1").should("have.text", "Recordatorio: tu turno es mañana");
    cy.dataCy("enviada-destinatario-n1").should("contain", "Para: juan.perez@mail.com (Cliente)");

    // Assert (2): el cuerpo del correo tiene las variables reemplazadas
    cy.dataCy("enviada-detalle-n1").find("summary").click();
    cy.dataCy("enviada-detalle-n1")
      .should("contain", "Hola Juan Pérez")
      .and("contain", "RES-0008")
      .and("not.contain", "{{");

    // Assert (3): la plantilla quedó "en uso" y ya no se puede eliminar
    cy.dataCy("tab-plantillas").click();
    cy.dataCy("plantilla-en-uso-p2").should("be.visible");
    cy.dataCy("btn-eliminar-p2").click();
    cy.dataCy("error-plantillas").should(
      "have.text",
      "No es posible eliminar esta plantilla porque está siendo utilizada actualmente."
    );
    cy.dataCy("modal-eliminar-plantilla").should("not.be.visible");
  });

  it("no envía si falta seleccionar la reserva o la plantilla", () => {
    // Arrange: solo se elige la plantilla
    cy.dataCy("select-plantilla-envio").select("p1");

    // Act
    cy.dataCy("btn-simular-envio").click();

    // Assert: mensaje de error y el historial sigue vacío
    cy.dataCy("error-simular-envio").should("be.visible").and("have.text", "Seleccioná una reserva y una plantilla para continuar.");
    cy.dataCy("msg-sin-enviadas").should("be.visible");
  });

  it("no envía si la plantilla usa una variable que la reserva no puede completar", () => {
    // Arrange: se crea una plantilla con una variable inexistente
    cy.dataCy("tab-plantillas").click();
    cy.dataCy("btn-crear-plantilla").click();
    cy.dataCy("categoria-recordatorio").click();
    cy.dataCy("pl-nombre").type("Promo con descuento");
    cy.dataCy("pl-asunto").type("Tenés un descuento");
    cy.dataCy("pl-cuerpo").type("Hola {{nombre_cliente}}, usá el código {{codigo_descuento}}", { parseSpecialCharSequences: false });
    cy.dataCy("pl-firma").type("Equipo AgendaYA");
    cy.dataCy("btn-guardar-plantilla").click();
    cy.dataCy("toast-cerrar").click();
    cy.dataCy("tab-enviadas").click();
    cy.dataCy("select-reserva").select("r8");
    cy.dataCy("select-plantilla-envio").select("p4");

    // Act
    cy.dataCy("btn-simular-envio").click();

    // Assert: se informa la variable faltante y no se envía nada
    cy.dataCy("error-simular-envio").should(
      "have.text",
      "No se puede enviar: la plantilla usa variables sin datos (codigo_descuento)."
    );
    cy.dataCy("msg-sin-enviadas").should("be.visible");
  });
});
