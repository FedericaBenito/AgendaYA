const { generarSlots, esFechaValida } = require("../../../src/logica-negocio");

describe("generarSlots", () => {
  test("genera slots de 30 minutos entre 09:00 y 11:00", () => {
    expect(generarSlots("09:00", "11:00", 30)).toEqual(["09:00", "09:30", "10:00", "10:30"]);
  });

  test("devuelve un array vacío si la duración es mayor al rango disponible", () => {
    expect(generarSlots("09:00", "09:30", 60)).toEqual([]);
  });

  test("devuelve un array vacío si la hora de inicio y de fin son iguales", () => {
    expect(generarSlots("10:00", "10:00", 30)).toEqual([]);
  });

  test("devuelve un array vacío si la duración es cero o negativa", () => {
    expect(generarSlots("09:00", "11:00", 0)).toEqual([]);
    expect(generarSlots("09:00", "11:00", -15)).toEqual([]);
  });

  test("lanza un error si el formato de hora es inválido", () => {
    expect(() => generarSlots("9am", "11:00", 30)).toThrow();
  });
});

describe("esFechaValida", () => {
  test("retorna true si la fecha es futura", () => {
    expect(esFechaValida("2099-01-01")).toBe(true);
  });

  test("retorna false si la fecha es pasada", () => {
    expect(esFechaValida("2020-01-01")).toBe(false);
  });

  test("retorna false si la fecha es hoy", () => {
    const hoy = new Date().toISOString().split("T")[0];
    expect(esFechaValida(hoy)).toBe(false);
  });

  test("retorna false si la fecha no es válida", () => {
    expect(esFechaValida("no-es-una-fecha")).toBe(false);
  });
});
