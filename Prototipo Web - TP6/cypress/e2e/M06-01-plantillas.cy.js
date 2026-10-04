/**
 * Test E2E — Configurar plantilla de email (Módulo 6: Notificaciones)
 * Responsable: Benito Federica
 * Trazabilidad: M06-F03 · US-01-05 (E1/E2/E3 crear plantilla) · US-01-01 (previsualizar)
 *               Casos de prueba TP5: CP-005 (positivo) y CP-006 (negativo)
 * Flujo obligatorio TP6 (M06): "Configurar plantilla de email".
 */

// Las llaves de {{variable}} son secuencias especiales para cy.type():
// hay que desactivarlas para escribirlas literalmente.
const LITERAL = { parseSpecialCharSequences: false };

describe("AgendaYA - M06 Notificaciones · Plantillas de mensajes", () => {
  beforeEach(() => {
    // Arrange común: el administrador está en Mensajes → Plantillas
    cy.visitarAgendaYA();
    cy.irAMensajesAdmin("plantillas");
    cy.get('[data-cy^="plantilla-row-"]').should("have.length", 3);
  });

  it("CP-005: crea una plantilla con todos los datos completos", () => {
    cy.fixture("datos-prueba").then(({ plantilla }) => {
      // Arrange: antes del formulario, el sistema pide una categoría base
      cy.dataCy("btn-crear-plantilla").click();
      cy.dataCy("selector-categoria-wrap").should("be.visible");
      cy.dataCy("form-plantilla").should("not.be.visible");
      cy.dataCy("categoria-confirmacion").click();
      cy.dataCy("form-plantilla").should("be.visible");

      // Act (1): completa los campos obligatorios y previsualiza
      cy.dataCy("pl-nombre").type(plantilla.nombre);
      cy.dataCy("pl-asunto").type(plantilla.asunto);
      cy.dataCy("pl-cuerpo").type(plantilla.cuerpo, LITERAL);
      cy.dataCy("pl-firma").type(plantilla.firma);
      cy.dataCy("btn-previsualizar").click();

      // Assert (1): la vista previa reemplaza las variables por datos de ejemplo
      cy.dataCy("preview-plantilla").should("be.visible");
      cy.dataCy("preview-asunto").should("have.text", "Asunto: Reunión confirmada");
      cy.dataCy("preview-cuerpo").should("contain", "Estimado Carlos Mendoza").and("not.contain", "{{");

      // Act (2): guarda
      cy.dataCy("btn-guardar-plantilla").click();

      // Assert (2): mensaje de éxito y la plantilla aparece en el listado
      cy.dataCy("toast-texto").should("have.text", "La plantilla ha sido creada exitosamente");
      cy.dataCy("modal-plantilla").should("not.be.visible");
      cy.get('[data-cy^="plantilla-row-"]').should("have.length", 4);
      cy.dataCy("plantilla-nombre-p4").should("contain", plantilla.nombre);
    });
  });

  it("CP-006: no guarda una plantilla con campos obligatorios vacíos", () => {
    // Arrange: formulario de creación con solo el Asunto completo
    cy.dataCy("btn-crear-plantilla").click();
    cy.dataCy("categoria-confirmacion").click();
    cy.dataCy("pl-asunto").type("Reunión confirmada");

    // Act
    cy.dataCy("btn-guardar-plantilla").click();

    // Assert: mensaje de error, el formulario sigue abierto y no se registró nada
    cy.dataCy("error-form-plantilla")
      .should("be.visible")
      .and("have.text", "Los campos Nombre de plantilla, Asunto, Cuerpo y Firma son obligatorios");
    cy.dataCy("form-plantilla").should("be.visible");
    cy.dataCy("btn-cerrar-plantilla").click();
    cy.get('[data-cy^="plantilla-row-"]').should("have.length", 3);
  });

  it("rechaza un nombre repetido aunque cambien mayúsculas y minúsculas", () => {
    // Arrange: ya existe "Confirmación de reserva"
    cy.dataCy("btn-crear-plantilla").click();
    cy.dataCy("categoria-confirmacion").click();
    cy.dataCy("pl-nombre").type("CONFIRMACIÓN DE RESERVA");
    cy.dataCy("pl-asunto").type("Otro asunto");
    cy.dataCy("variable-nombre_cliente").click(); // inserta {{nombre_cliente}} con el chip
    cy.dataCy("pl-cuerpo").should("have.value", "{{nombre_cliente}}");
    cy.dataCy("pl-firma").type("Equipo AgendaYA");

    // Act
    cy.dataCy("btn-guardar-plantilla").click();

    // Assert (responde la pregunta abierta del CP-005: la unicidad NO distingue mayúsculas)
    cy.dataCy("error-form-plantilla").should(
      "have.text",
      "Ya existe una plantilla con ese nombre. Por favor ingrese un nombre distinto.",
    );
    cy.get('[data-cy^="plantilla-row-"]').should("have.length", 3);
  });
});
