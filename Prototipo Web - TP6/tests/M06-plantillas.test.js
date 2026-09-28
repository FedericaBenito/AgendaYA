/**
 * Tests unitarios — M06 plantillas de mensajes
 * Responsable: Benito Federica
 * Funciones: construirCuerpoPlantilla · nombrePlantillaDuplicado
 * Trazabilidad: M06-F03 · US-01-05 / US-01-06 (crear y editar plantilla) · E-1 variables {{variable}}
 */
const { construirCuerpoPlantilla, nombrePlantillaDuplicado } = require("../src/logica-negocio");

describe("construirCuerpoPlantilla", () => {
  test("caso normal: reemplaza cada variable por su valor", () => {
    // Arrange
    const cuerpo = "Hola {{nombre_cliente}}, tu reserva {{numero_reserva}} es el {{fecha_reserva}}.";
    const variables = { nombre_cliente: "Juan Pérez", numero_reserva: "RES-0012", fecha_reserva: "Mar 6 de oct" };
    // Act
    const resultado = construirCuerpoPlantilla(cuerpo, variables);
    // Assert
    expect(resultado).toBe("Hola Juan Pérez, tu reserva RES-0012 es el Mar 6 de oct.");
  });

  test("borde: reemplaza todas las apariciones y tolera espacios dentro de las llaves", () => {
    expect(construirCuerpoPlantilla("{{n}} y {{ n }}", { n: "X" })).toBe("X y X");
  });

  test("borde: una variable sin valor se deja tal cual para poder detectarla después", () => {
    // Decisión de diseño: no se borra, así detectarVariablesFaltantes() puede avisar
    expect(construirCuerpoPlantilla("Hola {{nombre_cliente}}", {})).toBe("Hola {{nombre_cliente}}");
  });

  test("borde: los valores no string (números, 0) se convierten a texto", () => {
    expect(construirCuerpoPlantilla("Quedan {{cupos}} cupos", { cupos: 0 })).toBe("Quedan 0 cupos");
  });

  test("inválido: si el cuerpo no es string devuelve vacío", () => {
    expect(construirCuerpoPlantilla(null, { a: 1 })).toBe("");
    expect(construirCuerpoPlantilla(undefined)).toBe("");
  });
});

describe("nombrePlantillaDuplicado", () => {
  const plantillas = [
    { id: "p1", nombre: "Confirmación de reserva" },
    { id: "p2", nombre: "Recordatorio 24hs" },
  ];

  test("caso normal: detecta un nombre existente sin distinguir mayúsculas ni espacios extremos", () => {
    expect(nombrePlantillaDuplicado("CONFIRMACIÓN DE RESERVA", plantillas)).toBe(true);
    expect(nombrePlantillaDuplicado("  recordatorio 24hs ", plantillas)).toBe(true);
  });

  test("borde: al editar, la propia plantilla no cuenta como duplicado, pero otra sí", () => {
    expect(nombrePlantillaDuplicado("Recordatorio 24hs", plantillas, "p2")).toBe(false);
    expect(nombrePlantillaDuplicado("Recordatorio 24hs", plantillas, "p1")).toBe(true);
  });

  test("inválido: nombre vacío o lista inválida no se consideran duplicados", () => {
    expect(nombrePlantillaDuplicado("", plantillas)).toBe(false);
    expect(nombrePlantillaDuplicado("Nueva", null)).toBe(false);
    expect(nombrePlantillaDuplicado("Nueva plantilla", plantillas)).toBe(false);
  });
});
