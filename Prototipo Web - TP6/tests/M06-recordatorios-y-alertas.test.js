/**
 * Tests unitarios — M06 recordatorio de 24 hs y datos del dashboard
 * Responsable: Becerra Joaquín
 * Funciones: debeEnviarRecordatorio · proximaReserva · tiempoRelativo
 * Trazabilidad: US-09 M06 (recordatorio 24 hs) · Dashboard (próxima reserva, alertas)
 */
const {
  debeEnviarRecordatorio, proximaReserva, tiempoRelativo, fechaLocalISO,
} = require("../src/logica-negocio");

const HORA = 60 * 60 * 1000;
const ahora = new Date(2026, 9, 5, 10, 0); // lunes 05/10/2026 10:00 (hora local)

/**
 * Arma una reserva que empieza `horas` después de `ahora`.
 * Corrección sobre el output de la IA: se usa fecha/hora LOCAL (fechaLocalISO),
 * no toISOString(), que devuelve UTC y rompía el test en Argentina (GMT-3).
 */
function reservaDentroDe(horas, extra = {}) {
  const inicio = new Date(ahora.getTime() + horas * HORA);
  const hora = `${String(inicio.getHours()).padStart(2, "0")}:${String(inicio.getMinutes()).padStart(2, "0")}`;
  return { fecha: fechaLocalISO(inicio), hora, estado: "confirmada", recordatorioEnviado: false, ...extra };
}

describe("debeEnviarRecordatorio", () => {
  test("caso normal: envía cuando faltan exactamente 24 hs", () => {
    expect(debeEnviarRecordatorio(reservaDentroDe(24), ahora)).toBe(true);
  });

  test("borde: respeta la ventana [24 hs, 23 hs) con la tolerancia por defecto de 60 min", () => {
    expect(debeEnviarRecordatorio(reservaDentroDe(24.5), ahora)).toBe(false); // demasiado temprano
    expect(debeEnviarRecordatorio(reservaDentroDe(23.5), ahora)).toBe(true); // dentro de la ventana
    expect(debeEnviarRecordatorio(reservaDentroDe(23), ahora)).toBe(false); // fuera de plazo
  });

  test("inválido: no envía si la reserva no está confirmada", () => {
    expect(debeEnviarRecordatorio(reservaDentroDe(24, { estado: "pendiente" }), ahora)).toBe(false);
    expect(debeEnviarRecordatorio(reservaDentroDe(24, { estado: "cancelada" }), ahora)).toBe(false);
  });

  test("inválido: no envía dos veces ni con datos faltantes", () => {
    expect(debeEnviarRecordatorio(reservaDentroDe(24, { recordatorioEnviado: true }), ahora)).toBe(false);
    expect(debeEnviarRecordatorio(null, ahora)).toBe(false);
    expect(debeEnviarRecordatorio(reservaDentroDe(24, { hora: "xx:yy" }), ahora)).toBe(false);
  });
});

describe("proximaReserva", () => {
  test("caso normal: devuelve la reserva activa más cercana en el futuro", () => {
    // Arrange: lista desordenada con pasadas, canceladas y futuras
    const reservas = [
      { id: "a", fecha: "2026-10-07", hora: "09:00", estado: "confirmada" },
      { id: "b", fecha: "2026-10-05", hora: "09:00", estado: "confirmada" }, // ya pasó
      { id: "c", fecha: "2026-10-05", hora: "11:00", estado: "cancelada" },
      { id: "d", fecha: "2026-10-05", hora: "15:00", estado: "pendiente" },
    ];
    // Act + Assert
    expect(proximaReserva(reservas, ahora).id).toBe("d");
  });

  test("borde: sin reservas futuras activas o con lista inválida devuelve null", () => {
    expect(proximaReserva([], ahora)).toBeNull();
    expect(proximaReserva([{ fecha: "2026-10-05", hora: "10:00", estado: "confirmada" }], ahora)).toBeNull();
    expect(proximaReserva(null, ahora)).toBeNull();
  });
});

describe("tiempoRelativo", () => {
  test("caso normal: minutos, horas y días", () => {
    expect(tiempoRelativo(new Date(ahora.getTime() - 10 * 60 * 1000), ahora)).toBe("Hace 10 min");
    expect(tiempoRelativo(new Date(ahora.getTime() - 2 * HORA), ahora)).toBe("Hace 2 h");
    expect(tiempoRelativo(new Date(ahora.getTime() - 72 * HORA), ahora)).toBe("Hace 3 d");
  });

  test("borde: menos de 1 minuto, justo 60 min y fecha inválida", () => {
    expect(tiempoRelativo(new Date(ahora.getTime() - 30 * 1000), ahora)).toBe("Hace instantes");
    expect(tiempoRelativo(new Date(ahora.getTime() - HORA), ahora)).toBe("Hace 1 h");
    expect(tiempoRelativo("no-es-fecha", ahora)).toBe("");
  });
});
