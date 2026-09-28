/**
 * Tests unitarios — M04 Proceso de Reserva: generación de turnos y fechas válidas
 * Responsable: Palermo Lourdes
 * Funciones: generarSlots · esFechaValida
 * Trazabilidad: US-01-05 (fechas disponibles) · US-01-06 (horarios) · M04: no se reserva en el pasado
 */
const { generarSlots, esFechaValida } = require("../src/logica-negocio");

describe("generarSlots", () => {
  test("caso normal: genera los turnos de 30 min que entran completos entre 09:00 y 11:00", () => {
    // Arrange
    const inicio = "09:00", fin = "11:00", duracion = 30;
    // Act
    const slots = generarSlots(inicio, fin, duracion);
    // Assert
    expect(slots).toEqual(["09:00", "09:30", "10:00", "10:30"]);
  });

  test("borde: el último turno termina justo a la hora de fin y no se agrega uno incompleto", () => {
    // Act: 09:00-10:00 con turnos de 45 min → solo entra uno completo
    const slots = generarSlots("09:00", "10:00", 45);
    // Assert
    expect(slots).toEqual(["09:00"]);
  });

  test("borde: duración mayor al rango o inicio igual al fin devuelven lista vacía", () => {
    expect(generarSlots("09:00", "09:30", 60)).toEqual([]);
    expect(generarSlots("10:00", "10:00", 30)).toEqual([]);
  });

  test("inválido: duración cero, negativa o no entera devuelve lista vacía", () => {
    expect(generarSlots("09:00", "11:00", 0)).toEqual([]);
    expect(generarSlots("09:00", "11:00", -15)).toEqual([]);
    // BUG encontrado: con 22.5 devolvía ["09:00", "09:22.5"]
    expect(generarSlots("09:00", "10:00", 22.5)).toEqual([]);
  });

  test("inválido: formato de hora incorrecto o fuera de rango devuelve lista vacía (no lanza error)", () => {
    expect(generarSlots("9am", "11:00", 30)).toEqual([]);
    expect(generarSlots("09:00", undefined, 30)).toEqual([]);
    // BUG encontrado: devolvía ["23:00", "23:30", "24:00", "24:30"]
    expect(generarSlots("23:00", "25:00", 30)).toEqual([]);
  });
});

describe("esFechaValida", () => {
  // Arrange común: "ahora" fijo → el test no depende del día en que se ejecute
  const ahora = new Date(2026, 9, 5, 10, 0); // lunes 05/10/2026 10:00 (hora local)

  test("caso normal: una fecha y hora futura es válida", () => {
    expect(esFechaValida("2026-10-06T10:00:00", ahora)).toBe(true);
  });

  test("inválido: una fecha pasada no es válida", () => {
    expect(esFechaValida("2026-10-01T10:00:00", ahora)).toBe(false);
  });

  test("borde: el mismo instante que 'ahora' no es válido (tiene que ser estrictamente futuro)", () => {
    expect(esFechaValida(new Date(ahora.getTime()), ahora)).toBe(false);
  });

  test("borde: una fecha sin hora se interpreta en horario local (mañana es válida aun a las 22 hs)", () => {
    // BUG encontrado: "2026-10-06" se tomaba como 00:00 UTC = 05/10 21:00 en Argentina,
    // así que después de las 21 hs "mañana" se consideraba una fecha pasada.
    const lunesALas22 = new Date(2026, 9, 5, 22, 0);
    expect(esFechaValida("2026-10-06", lunesALas22)).toBe(true);
    expect(esFechaValida("2026-10-05", lunesALas22)).toBe(false); // hoy
  });

  test("inválido: un texto que no es fecha no es válido", () => {
    expect(esFechaValida("no-es-una-fecha", ahora)).toBe(false);
  });
});
