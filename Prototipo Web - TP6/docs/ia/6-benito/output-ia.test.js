const { construirCuerpoPlantilla, nombrePlantillaDuplicado } = require("../../../src/logica-negocio");

describe("construirCuerpoPlantilla", () => {
  test("reemplaza las variables por sus valores", () => {
    const cuerpo = "Hola {{nombre_cliente}}, tu reserva es el {{fecha_reserva}}.";
    expect(construirCuerpoPlantilla(cuerpo, { nombre_cliente: "Juan Pérez", fecha_reserva: "06/10/2026" }))
      .toBe("Hola Juan Pérez, tu reserva es el 06/10/2026.");
  });

  test("reemplaza todas las apariciones de una variable", () => {
    expect(construirCuerpoPlantilla("{{n}} y {{n}}", { n: "X" })).toBe("X y X");
  });

  test("reemplaza por vacío las variables sin valor", () => {
    expect(construirCuerpoPlantilla("Hola {{nombre_cliente}}", {})).toBe("Hola ");
  });

  test("devuelve string vacío si el cuerpo no es un string", () => {
    expect(construirCuerpoPlantilla(null, {})).toBe("");
  });
});

describe("nombrePlantillaDuplicado", () => {
  const plantillas = [
    { id: "p1", nombre: "Confirmación de reserva" },
    { id: "p2", nombre: "Recordatorio 24hs" },
  ];

  test("detecta un nombre duplicado sin importar mayúsculas", () => {
    expect(nombrePlantillaDuplicado("CONFIRMACIÓN DE RESERVA", plantillas)).toBe(true);
  });

  test("permite guardar la misma plantilla al editarla", () => {
    expect(nombrePlantillaDuplicado("Recordatorio 24hs", plantillas, "p2")).toBe(false);
  });
});
