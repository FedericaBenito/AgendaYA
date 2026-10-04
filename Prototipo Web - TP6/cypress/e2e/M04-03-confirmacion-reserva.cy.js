/**
 * Test E2E — Confirmación de la reserva por link (Módulo 4 + notificaciones M06)
 * Responsable: Varano Lucía
 * Trazabilidad: US-01 M04 (E1 confirmación, E2 link expirado) · US-03 M04 verificación de correo
 *               US-08 M06 (mail pendiente / link reabierto) · US-01 y US-02 M06 (mails al cliente y al admin)
 *               Casos de prueba TP5: CP-US01-001 (positivo) y CP-US01-002 (negativo)
 */
const DOCE_HORAS_MS = 12 * 60 * 60 * 1000;

describe("AgendaYA - M04 Proceso de Reserva · Confirmación de la reserva", () => {
  beforeEach(() => {
    // Arrange común: reserva pendiente de Juan Pérez para el martes 06/10 a las 10:00
    cy.visitarAgendaYA();
    cy.fixture("datos-prueba").then(({ cliente }) => {
      cy.elegirEventoFechaYHora({ evento: "ev1", dia: "2026-10-06", hora: "10:00" });
      cy.completarDatosCliente(cliente);
      cy.dataCy("btn-reservar").click();
      cy.dataCy("estado-pendiente").should("be.visible");
    });
  });

  it("CP-US01-001: confirma dentro de las 12 hs y notifica al cliente y al administrador", () => {
    // Arrange: un código mal escrito no verifica el correo
    cy.dataCy("input-codigo").type("12ab");
    cy.dataCy("btn-verificar-codigo").click();
    cy.dataCy("error-codigo").should("have.text", "Ingresá el código de 6 dígitos que enviamos a tu correo.");
    cy.dataCy("input-codigo").clear().type("000000"); // el sistema genera códigos entre 100000 y 999999
    cy.dataCy("btn-verificar-codigo").click();
    cy.dataCy("error-codigo").should("have.text", "El código ingresado no es correcto.");
    cy.dataCy("input-codigo").clear();

    // Act: verifica el correo con el código correcto y abre el link "Confirmar Reserva"
    cy.verificarCorreoConCodigoMostrado();
    cy.dataCy("estado-verificado").should("be.visible");
    cy.dataCy("btn-simular-link-confirmacion").click();

    // Assert (pantalla): pop-up con los datos de la reserva y opción de cancelar
    cy.dataCy("popup-mensaje").should("be.visible").and(
      "have.text",
      "Juan Pérez su reserva RES-0012, el día Mar 6 de oct, a las 10:00, en Consultorio · Av. Corrientes 1234, CABA, ha sido confirmada exitosamente.",
    );
    cy.dataCy("popup-cerrar").click();
    cy.dataCy("estado-confirmada").should("be.visible");
    cy.dataCy("mensaje-confirmada").should("have.text", "Su reserva se confirmó");
    cy.dataCy("btn-cancelar-reserva").should("be.visible");

    // Assert (correos): uno para el cliente y otro para el administrador
    cy.irAMensajesAdmin("enviadas");
    cy.dataCy("tabla-enviadas")
      .should("contain", "Reserva confirmada: RES-0012") // plantilla personalizada de confirmación
      .and("contain", "Para: juanperez@correo.com (Cliente)")
      .and("contain", "NUEVA RESERVA CONFIRMADA RES-0012")
      .and("contain", "Para: dra.gomez@agendaya.com (Administrador)");
  });

  it("no vuelve a confirmar ni reenvía correos si se abre el link otra vez", () => {
    // Arrange: reserva ya confirmada
    cy.verificarCorreoConCodigoMostrado();
    cy.dataCy("btn-simular-link-confirmacion").click();
    cy.dataCy("popup-cerrar").click();

    // Act: el cliente vuelve a abrir el link de confirmación
    cy.dataCy("btn-reabrir-link-confirmacion").click();

    // Assert: se informa que ya estaba confirmada y hay un único correo de confirmación por destinatario
    cy.dataCy("popup-mensaje").should("be.visible").and("have.text", "Esta reserva ya fue confirmada anteriormente. No se volvió a confirmar.");
    cy.dataCy("popup-cerrar").click();
    cy.irAMensajesAdmin("enviadas");
    cy.get('[data-cy^="enviada-asunto-"]:contains("NUEVA RESERVA CONFIRMADA RES-0012")').should("have.length", 1);
    cy.get('[data-cy^="enviada-asunto-"]:contains("Reserva confirmada: RES-0012")').should("have.length", 1);
  });

  it("cuenta las 12 hs desde el envío del link de confirmación, no desde la creación de la reserva", () => {
    // Arrange: el cliente verifica su correo 11 hs después de reservar
    // → recién ahí se le envía el mail con el link "Confirmar Reserva" (US-08)
    cy.tick(11 * 60 * 60 * 1000);
    cy.verificarCorreoConCodigoMostrado();
    cy.dataCy("estado-verificado").should("be.visible");

    // Act: abre el link 2 hs después de recibirlo (13 hs después de reservar)
    cy.tick(2 * 60 * 60 * 1000);
    cy.dataCy("btn-simular-link-confirmacion").click();

    // Assert: el link sigue vigente (pasaron 2 hs desde su envío) y la reserva se confirma
    cy.dataCy("estado-confirmada").should("be.visible");
    cy.dataCy("estado-expirado").should("not.be.visible");
  });

  it("CP-US01-002: rechaza la confirmación cuando pasaron más de 12 hs y avisa por correo", () => {
    // Arrange: correo verificado, pero el cliente no abre el link a tiempo
    cy.verificarCorreoConCodigoMostrado();
    cy.dataCy("estado-verificado").should("be.visible");
    cy.tick(DOCE_HORAS_MS + 60 * 1000); // 12 hs y 1 minuto después

    // Act: abre el link vencido
    cy.dataCy("btn-simular-link-confirmacion").click();

    // Assert: la reserva expira, no se confirma y se envía el correo de expiración
    cy.dataCy("estado-expirado").should("be.visible");
    cy.dataCy("mensaje-expirada").should("have.text", "Su reserva expiró");
    cy.dataCy("estado-confirmada").should("not.be.visible");
    cy.irAMensajesAdmin("enviadas");
    cy.dataCy("tabla-enviadas")
      .should("contain", "RESERVA EXPIRADA RES-0012")
      .and("not.contain", "NUEVA RESERVA CONFIRMADA RES-0012");
  });
});
