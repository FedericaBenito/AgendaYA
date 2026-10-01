const { horarioOcupado, filtrarReservasPorRango, inicioDeSemana } = require("../../../src/logica-negocio");

const reservas = [
  { fecha: "2026-10-06", hora: "10:00", estado: "confirmada" },
  { fecha: "2026-10-06", hora: "11:00", estado: "cancelada" },
  { fecha: "2026-10-07", hora: "10:00", estado: "pendiente" },
  { fecha: "2026-10-12", hora: "09:00", estado: "confirmada" },
];

describe("horarioOcupado", () => {
  test("detecta un horario ocupado", () => {
    expect(horarioOcupado(reservas, "2026-10-06", "10:00")).toBe(true);
  });

  test("un horario con reserva cancelada está libre", () => {
    expect(horarioOcupado(reservas, "2026-10-06", "11:00")).toBe(false);
  });

  test("devuelve false si la lista no es un array", () => {
    expect(horarioOcupado(null, "2026-10-06", "10:00")).toBe(false);
  });
});

describe("filtrarReservasPorRango", () => {
  test("incluye los extremos del rango y excluye canceladas", () => {
    const resultado = filtrarReservasPorRango(reservas, "2026-10-06", "2026-10-07");
    expect(resultado).toHaveLength(2);
  });
});

describe("inicioDeSemana", () => {
  test("devuelve el lunes para un miércoles", () => {
    expect(inicioDeSemana("2026-10-07")).toBe("2026-10-05");
  });

  test("devuelve el lunes anterior para un domingo", () => {
    expect(inicioDeSemana("2026-10-11")).toBe("2026-10-05");
  });
});
