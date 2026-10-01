/**
 * Test E2E — Flujo de error por datos inválidos (Módulo 4)
 * Responsable: Funes Joaquín
 * Trazabilidad: US-01-04 (E2 campos obligatorios, E3 formato de correo) · M04-NF06 mensajes de validación
 * Criterio TP6 5.4: "Los formularios validan al menos el caso de campo vacío y muestran un mensaje de error visible".
 */
describe("AgendaYA - M04 Proceso de Reserva · Validación del formulario de datos", () => {
  beforeEach(() => {
    // Arrange común: llegar al paso 3 (formulario de datos personales)
    cy.visitarAgendaYA();
    cy.elegirEventoFechaYHora({ evento: "ev1", dia: "2026-10-06", hora: "11:00" });
  });

  it("no permite reservar con todos los campos obligatorios vacíos", () => {
    // Arrange: formulario sin completar
    cy.dataCy("error-form-datos").should("not.be.visible");

    // Act: intenta reservar
    cy.dataCy("btn-reservar").click();

    // Assert: mensaje visible con los campos faltantes y la reserva NO se crea
    cy.dataCy("error-form-datos")
      .should("be.visible")
      .and("have.text", "Falta completar: Nombre, Apellido, DNI, Correo electrónico.");
    cy.dataCy("paso-3").should("be.visible");
    cy.dataCy("paso-4").should("not.be.visible");
  });

  it("informa solo el campo que falta cuando el resto está completo", () => {
    // Arrange: todos los datos menos el DNI
    cy.completarDatosCliente({ nombre: "Juan", apellido: "Pérez", email: "juanperez@correo.com" });

    // Act
    cy.dataCy("btn-reservar").click();

    // Assert
    cy.dataCy("error-form-datos").should("have.text", "Falta completar: DNI.");
    cy.dataCy("paso-4").should("not.be.visible");
  });

  it("rechaza un correo electrónico con formato inválido", () => {
    // Arrange: correo sin dominio
    cy.completarDatosCliente({ nombre: "Juan", apellido: "Pérez", dni: "30123456", email: "juanperez@correo" });

    // Act
    cy.dataCy("btn-reservar").click();

    // Assert
    cy.dataCy("error-form-datos").should("be.visible").and("have.text", "Ingrese un correo electrónico válido");
    cy.dataCy("paso-4").should("not.be.visible");
  });

  it("rechaza un DNI con letras y permite reservar al corregirlo", () => {
    // Arrange: DNI inválido
    cy.completarDatosCliente({ nombre: "Juan", apellido: "Pérez", dni: "30ABC456", email: "juanperez@correo.com" });

    // Act (1): intenta reservar con el DNI inválido
    cy.dataCy("btn-reservar").click();

    // Assert (1): se informa el error
    cy.dataCy("error-form-datos").should("have.text", "Ingrese un DNI válido (7 u 8 dígitos, sin letras).");

    // Act (2): corrige el DNI (con puntos, formato habitual) y vuelve a enviar
    cy.dataCy("input-dni").clear().type("30.123.456");
    cy.dataCy("btn-reservar").click();

    // Assert (2): el error desaparece y la reserva queda pendiente
    cy.dataCy("estado-pendiente").should("be.visible");
    cy.dataCy("error-form-datos").should("not.be.visible");
  });
});
