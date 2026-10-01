const { debeEnviarRecordatorio, proximaReserva, tiempoRelativo } = require("../../../src/logica-negocio");

// Arma una reserva que empieza dentro de `horas` horas desde `ahora`
function reservaDentroDe(horas, ahora, extra = {}) {
  const inicio = new Date(ahora.getTime() + horas * 60 * 60 * 1000);
  const iso = inicio.toISOString();
  return { fecha: iso.slice(0, 10), hora: iso.slice(11, 16), estado: "confirmada", recordatorioEnviado: false, ...extra };
}

describe("debeEnviarRecordatorio", () => {
  const ahora = new Date("2026-10-05T10:00:00");

  test("envía el recordatorio cuando faltan exactamente 24 hs", () => {
    expect(debeEnviarRecordatorio(reservaDentroDe(24, ahora), ahora)).toBe(true);
  });

  test("no envía si faltan más de 24 hs", () => {
    expect(debeEnviarRecordatorio(reservaDentroDe(30, ahora), ahora)).toBe(false);
  });

  test("no envía si la reserva no está confirmada", () => {
    expect(debeEnviarRecordatorio(reservaDentroDe(24, ahora, { estado: "pendiente" }), ahora)).toBe(false);
  });

  test("no envía dos veces el mismo recordatorio", () => {
    expect(debeEnviarRecordatorio(reservaDentroDe(24, ahora, { recordatorioEnviado: true }), ahora)).toBe(false);
  });
});

describe("proximaReserva", () => {
  test("devuelve null si no hay reservas", () => {
    expect(proximaReserva([])).toBeNull();
  });
});

describe("tiempoRelativo", () => {
  test("muestra minutos", () => {
    const hace10 = new Date(Date.now() - 10 * 60 * 1000);
    expect(tiempoRelativo(hace10)).toBe("Hace 10 min");
  });
});
