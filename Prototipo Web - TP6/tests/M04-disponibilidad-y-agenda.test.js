/**
 * Tests unitarios — M04 disponibilidad de horarios y agenda del dashboard
 * Responsable: Fernandez Carla
 * Funciones: horarioOcupado · filtrarReservasPorRango · inicioDeSemana · formatearNumeroReserva
 * Trazabilidad: US-01-06 (E2 horario ya reservado) · US-01-03 (E3) · Dashboard (reservas de hoy / semana)
 */
const {
  horarioOcupado, filtrarReservasPorRango, inicioDeSemana, formatearNumeroReserva,
} = require("../src/logica-negocio");

// Arrange común: agenda de ejemplo
const reservas = [
  { fecha: "2026-10-06", hora: "10:00", estado: "confirmada" },
  { fecha: "2026-10-06", hora: "11:00", estado: "cancelada" },
  { fecha: "2026-10-06", hora: "12:00", estado: "expirada" },
  { fecha: "2026-10-07", hora: "10:00", estado: "pendiente" },
  { fecha: "2026-10-12", hora: "09:00", estado: "confirmada" },
];

describe("horarioOcupado", () => {
  test("caso normal: un horario con reserva confirmada o pendiente está ocupado", () => {
    expect(horarioOcupado(reservas, "2026-10-06", "10:00")).toBe(true);
    expect(horarioOcupado(reservas, "2026-10-07", "10:00")).toBe(true);
  });

  test("borde: las reservas canceladas y expiradas liberan el horario", () => {
    expect(horarioOcupado(reservas, "2026-10-06", "11:00")).toBe(false);
    expect(horarioOcupado(reservas, "2026-10-06", "12:00")).toBe(false);
  });

  test("borde: misma hora en otro día no está ocupada", () => {
    expect(horarioOcupado(reservas, "2026-10-08", "10:00")).toBe(false);
  });

  test("inválido: si la lista no es un array devuelve false", () => {
    expect(horarioOcupado(null, "2026-10-06", "10:00")).toBe(false);
    expect(horarioOcupado(undefined, "2026-10-06", "10:00")).toBe(false);
  });
});

describe("filtrarReservasPorRango", () => {
  test("borde: incluye ambos extremos del rango y excluye canceladas/expiradas por defecto", () => {
    // Act
    const resultado = filtrarReservasPorRango(reservas, "2026-10-06", "2026-10-07");
    // Assert
    expect(resultado).toEqual([
      { fecha: "2026-10-06", hora: "10:00", estado: "confirmada" },
      { fecha: "2026-10-07", hora: "10:00", estado: "pendiente" },
    ]);
  });

  test("caso normal: con una lista de exclusión vacía incluye todos los estados", () => {
    expect(filtrarReservasPorRango(reservas, "2026-10-06", "2026-10-06", [])).toHaveLength(3);
  });

  test("inválido: rango invertido o lista no válida devuelven lista vacía", () => {
    expect(filtrarReservasPorRango(reservas, "2026-10-12", "2026-10-06")).toEqual([]);
    expect(filtrarReservasPorRango("no-es-array", "2026-10-01", "2026-10-31")).toEqual([]);
  });
});

describe("inicioDeSemana", () => {
  test("caso normal: el lunes de la semana de un miércoles", () => {
    expect(inicioDeSemana("2026-10-07")).toBe("2026-10-05");
  });

  test("borde: un lunes devuelve el mismo día y un domingo el lunes anterior (semana lun-dom)", () => {
    expect(inicioDeSemana("2026-10-05")).toBe("2026-10-05");
    expect(inicioDeSemana("2026-10-11")).toBe("2026-10-05");
  });

  test("borde: cruza de mes y de año correctamente", () => {
    expect(inicioDeSemana("2026-11-01")).toBe("2026-10-26");
    expect(inicioDeSemana("2027-01-01")).toBe("2026-12-28");
  });

  test("inválido: una fecha inválida devuelve string vacío", () => {
    expect(inicioDeSemana("fecha-rota")).toBe("");
  });
});

describe("formatearNumeroReserva", () => {
  test("caso normal y borde: completa con ceros a 4 dígitos", () => {
    expect(formatearNumeroReserva(1)).toBe("RES-0001");
    expect(formatearNumeroReserva(12345)).toBe("RES-12345");
  });

  test("inválido: cero, negativos y decimales devuelven string vacío", () => {
    expect(formatearNumeroReserva(0)).toBe("");
    expect(formatearNumeroReserva(-3)).toBe("");
    expect(formatearNumeroReserva(2.5)).toBe("");
  });
});
