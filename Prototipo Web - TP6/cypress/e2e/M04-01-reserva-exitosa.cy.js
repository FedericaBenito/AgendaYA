/**
 * Test E2E — Flujo principal (happy path) del Módulo 4: Proceso de Reserva
 * Responsable: Palermo Lourdes
 * Trazabilidad: M04-F01 · US-01-02 (E1/E3) · US-01-05 (E1) · US-01-04 (E1) · US-01-03 (E1)
 *               Caso de prueba TP5: CP-M04-001
 * Flujo obligatorio TP6 (M04): "Seleccionar fecha y hora / Completar formulario y confirmar reserva".
 */
describe("AgendaYA - M04 Proceso de Reserva · Reserva exitosa", () => {
  beforeEach(() => {
    // Reloj fijo: lunes 05/10/2026 08:00 → "mañana" es el martes 06/10/2026
    cy.visitarAgendaYA();
  });

  it("selecciona evento, fecha y hora y deja la reserva pendiente de confirmación", () => {
    cy.fixture("datos-prueba").then(({ cliente, diaReserva, horaReserva }) => {
      // Arrange: el invitado ve los tipos de evento disponibles
      cy.dataCy("paso-1").should("be.visible");
      cy.dataCy("evento-ev1").should("be.visible").and("contain", "Consulta inicial");

      // Act (1): selecciona el tipo de evento → pasa al calendario sin crear la reserva
      cy.dataCy("evento-ev1").click();
      cy.dataCy("paso-2").should("be.visible");
      cy.dataCy("evento-seleccionado-titulo").should("contain", "Consulta inicial");

      // Act (2): elige día y horario
      cy.dataCy(`dia-${diaReserva}`).click();
      cy.dataCy("horarios-wrap").should("be.visible");
      cy.dataCy(`horario-${horaReserva}`).click();
      cy.dataCy("btn-confirmar-horario").should("not.be.disabled").click();

      // Act (3): completa sus datos y envía el formulario
      cy.dataCy("paso-3").should("be.visible");
      cy.dataCy("resumen-mini").should("contain", "Consulta inicial").and("contain", horaReserva);
      cy.completarDatosCliente(cliente);
      cy.dataCy("btn-reservar").click();

      // Assert: la reserva queda creada y pendiente de confirmación
      cy.dataCy("paso-4").should("be.visible");
      cy.dataCy("estado-pendiente").should("be.visible");
      cy.dataCy("mensaje-pendiente").should("have.text", "Su reserva está pendiente de confirmación");
      cy.dataCy("resumen-final")
        .should("contain", "Consulta inicial")
        .and("contain", "RES-0012") // 11 reservas de ejemplo → la nueva es la N.º 12
        .and("contain", "Mar 6 de oct")
        .and("contain", `${horaReserva} hs`);
      cy.dataCy("codigo-demo-hint").invoke("text").should("match", /\d{6}/);
      cy.dataCy("step-dot-4").should("have.class", "step-actual");
    });
  });

  it("muestra solo días hábiles y los horarios que corresponden a la duración del evento", () => {
    // Arrange: el invitado elige "Consulta inicial" (30 min, disponibilidad 09:00-17:00)
    cy.dataCy("evento-ev1").click();

    // Act: abre el martes 06/10/2026
    cy.dataCy("dia-2026-10-06").click();

    // Assert: el fin de semana aparece bloqueado y hay 16 turnos de 30 minutos
    cy.dataCy("dia-2026-10-10").should("be.disabled"); // sábado
    cy.dataCy("dia-2026-10-11").should("be.disabled"); // domingo
    cy.get('[data-cy^="horario-"]').should("have.length", 16);
    cy.dataCy("horario-09:00").should("be.visible");
    cy.dataCy("horario-16:30").should("be.visible");
    cy.dataCy("horario-17:00").should("not.exist");
    cy.dataCy("btn-confirmar-horario").should("be.disabled"); // todavía no eligió horario
  });
});
