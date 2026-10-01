/**
 * Test E2E — Flujo de error por estado del sistema (Módulo 4)
 * Responsable: Fernandez Carla
 * Trazabilidad: US-01-02 (E2 evento no disponible) · US-01-05 (E2 sin fechas)
 *               US-01-06 (E2 horario tomado al seleccionar) · US-01-03 (E3 horario tomado al confirmar)
 *               Caso de prueba TP5: CP-M04-002 · Flujo opcional TP6 (M04): "Manejo de horario no disponible"
 */
describe("AgendaYA - M04 Proceso de Reserva · Evento u horario no disponible", () => {
  beforeEach(() => {
    cy.visitarAgendaYA();
  });

  it("CP-M04-002: impide avanzar con un tipo de evento que dejó de estar disponible", () => {
    // Arrange: el evento "Clase de prueba" figura en la lista al cargar la página
    cy.dataCy("evento-ev5").should("be.visible").and("contain", "Clase de prueba");

    // Act: intenta seleccionarlo (en la simulación ya no está disponible)
    cy.dataCy("evento-ev5").click();

    // Assert (1): mensaje claro y no se avanza al calendario
    cy.dataCy("error-evento-no-disponible").should("be.visible").and("have.text", "Este tipo de evento ya no está disponible");
    cy.dataCy("paso-2").should("not.be.visible");

    // Act (2): vuelve a la lista de eventos
    cy.dataCy("btn-volver-lista-eventos").click();

    // Assert (2): la lista se muestra sin el evento no disponible
    cy.dataCy("lista-eventos").should("be.visible");
    cy.dataCy("evento-ev5").should("not.exist");
    cy.dataCy("evento-ev1").should("be.visible");
  });

  it("informa que no hay fechas cuando el evento no tiene disponibilidad configurada", () => {
    // Arrange + Act: elige "Sesión de coaching" (sin disponibilidad)
    cy.dataCy("evento-ev4").click();

    // Assert
    cy.dataCy("error-sin-fechas").should("be.visible").and("have.text", "No hay fechas disponibles para este evento");
    cy.dataCy("dias-lista").should("not.be.visible");
    cy.dataCy("btn-confirmar-horario").should("be.disabled");
  });

  it("bloquea un horario que otro cliente reservó mientras se mostraba libre", () => {
    // Arrange: el invitado ve el martes 06/10 con el horario 14:00 libre
    cy.dataCy("evento-ev1").click();
    cy.dataCy("dia-2026-10-06").click();
    cy.dataCy("horario-14:00").should("not.be.disabled");
    // otro cliente reserva ese mismo horario en paralelo
    cy.window().then((win) => win.AgendaYADemo.reservarComoOtroCliente("2026-10-06", "14:00"));

    // Act: intenta seleccionar el horario que ya no está libre
    cy.dataCy("horario-14:00").click();

    // Assert: se avisa, el horario queda bloqueado y no se puede continuar
    cy.dataCy("error-horario-ocupado").should("be.visible").and("have.text", "Este horario ya fue reservado. Por favor elegí otro");
    cy.dataCy("horario-14:00").should("be.disabled");
    cy.dataCy("btn-confirmar-horario").should("be.disabled");
  });

  it("no crea la reserva si el horario se ocupa antes de enviar el formulario", () => {
    // Arrange: el invitado llega al formulario con el martes 06/10 a las 15:00
    cy.elegirEventoFechaYHora({ evento: "ev1", dia: "2026-10-06", hora: "15:00" });
    cy.fixture("datos-prueba").then(({ cliente }) => cy.completarDatosCliente(cliente));
    cy.window().then((win) => win.AgendaYADemo.reservarComoOtroCliente("2026-10-06", "15:00"));

    // Act: envía el formulario
    cy.dataCy("btn-reservar").click();

    // Assert: vuelve a la selección de horario con el mensaje y sin reserva pendiente
    cy.dataCy("paso-2").should("be.visible");
    cy.dataCy("error-horario-ocupado").should("have.text", "Este horario ya fue reservado. Por favor elija otro");
    cy.dataCy("horario-15:00").should("be.disabled");
    cy.dataCy("paso-4").should("not.be.visible");
  });
});
