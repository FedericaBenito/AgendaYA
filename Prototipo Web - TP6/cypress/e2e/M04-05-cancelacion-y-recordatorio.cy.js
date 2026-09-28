/**
 * Test E2E — Cancelación por el cliente y recordatorio de 24 hs
 * Responsable: Becerra Joaquín
 * Trazabilidad: US-02 M04 (E1 cancelación en término, E2 cita expirada)
 *               US-04 / US-07 M06 (correos de cancelación) · US-09 M06 (recordatorio 24 hs)
 *               Casos de prueba TP5: CP-001 (positivo) y CP-002 (negativo)
 */
const HORA_MS = 60 * 60 * 1000;

describe("AgendaYA - M04/M06 · Cancelación de la reserva y recordatorio", () => {
  beforeEach(() => {
    // Arrange común: reserva CONFIRMADA de Juan Pérez para el martes 06/10 a las 10:00
    cy.visitarAgendaYA();
    cy.crearReservaConfirmada({ evento: "ev1", dia: "2026-10-06", hora: "10:00" });
  });

  it("CP-001: cancela en término, libera el horario e invalida el link", () => {
    // Arrange: abre el link de cancelación y ve el detalle de la cita
    cy.dataCy("btn-cancelar-reserva").click();
    cy.dataCy("modal-cancelar").should("be.visible");
    cy.dataCy("cancelar-detalle-cliente").should("have.text", "Juan Pérez");
    cy.dataCy("cancelar-detalle-fecha").should("have.text", "Mar 6 de oct · 10:00 hs");
    cy.dataCy("cancelar-detalle-anfitrion").should("have.text", "Dra. Gómez");
    cy.dataCy("cancelar-detalle-ubicacion").should("have.text", "Consultorio · Av. Corrientes 1234, CABA");

    // Act: confirma la cancelación
    cy.dataCy("btn-confirmar-cancelacion").click();

    // Assert (1): mensaje de éxito y estado cancelada
    cy.dataCy("popup-mensaje").should("be.visible").and("have.text", "Se canceló correctamente la cita");
    cy.dataCy("popup-cerrar").click();
    cy.dataCy("estado-cancelada").should("be.visible");

    // Assert (2): el link de cancelación queda inutilizable
    cy.dataCy("btn-reabrir-link-cancelacion").click();
    cy.dataCy("popup-mensaje").should("be.visible").and("have.text", "Este link de cancelación ya fue utilizado.");
    cy.dataCy("popup-cerrar").click();

    // Assert (3): el horario vuelve a estar disponible para otros clientes
    cy.dataCy("btn-nueva-reserva-3").click();
    cy.dataCy("evento-ev1").click();
    cy.dataCy("dia-2026-10-06").click();
    cy.dataCy("horario-10:00").should("not.be.disabled");

    // Assert (4): se notificó la cancelación al cliente y al administrador
    cy.irAMensajesAdmin("enviadas");
    cy.dataCy("tabla-enviadas")
      .should("contain", "CANCELACIÓN DE RESERVA RES-0012")
      .and("contain", "CANCELACIÓN RESERVA NÚMERO RES-0012");
  });

  it("mantiene la reserva si el cliente se arrepiente en la confirmación", () => {
    // Arrange
    cy.dataCy("btn-cancelar-reserva").click();

    // Act: elige "Mantener reserva"
    cy.dataCy("btn-mantener-reserva").click();

    // Assert: el modal se cierra y la reserva sigue confirmada
    cy.dataCy("modal-cancelar").should("not.be.visible");
    cy.dataCy("estado-confirmada").should("be.visible");
  });

  it("CP-002: rechaza la cancelación de una cita cuya fecha y hora ya pasaron", () => {
    // Arrange: pasan 27 horas → martes 06/10 a las 11:00 (la cita era a las 10:00)
    cy.tick(27 * HORA_MS);

    // Act: el cliente usa el link de cancelación
    cy.dataCy("btn-cancelar-reserva").click();

    // Assert: pop-up de cita expirada y la reserva sigue confirmada en el panel del administrador
    cy.dataCy("popup-mensaje").should("be.visible").and("have.text", "Su cita número RES-0012 el día Mar 6 de oct y 10:00 ya expiró");
    cy.dataCy("modal-cancelar").should("not.be.visible");
    cy.dataCy("popup-cerrar").click();
    cy.dataCy("nav-admin").click();
    cy.dataCy("menu-agenda").click();
    cy.dataCy("agenda-fila-r12").should("contain", "Juan Pérez").and("contain", "Confirmada");
  });

  it("envía el recordatorio 24 hs antes del turno usando la plantilla personalizada", () => {
    // Arrange: el administrador mira el historial; todavía faltan 26 hs para el turno
    cy.irAMensajesAdmin("enviadas");
    cy.dataCy("tabla-enviadas").should("not.contain", "Recordatorio: tu turno es mañana");

    // Act: avanza el reloj 2 horas → lunes 10:00 (faltan exactamente 24 hs)
    cy.tick(2 * HORA_MS);

    // Assert: se envió un único recordatorio al cliente con la plantilla "Recordatorio 24hs"
    cy.get('[data-cy^="enviada-asunto-"]:contains("Recordatorio: tu turno es mañana")').should("have.length", 1);
    cy.dataCy("tabla-enviadas").should("contain", "Para: juanperez@correo.com (Cliente)").and("contain", "Plantilla: Recordatorio 24hs");
  });
});
