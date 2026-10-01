const {
  calcularVencimiento, estaVencido, validarFormatoCodigo, generarCodigoVerificacion,
} = require("../../../src/logica-negocio");

describe("calcularVencimiento", () => {
  test("suma 12 horas a la fecha de envío", () => {
    const envio = new Date("2026-10-05T08:00:00");
    expect(calcularVencimiento(envio, 12)).toEqual(new Date("2026-10-05T20:00:00"));
  });
});

describe("estaVencido", () => {
  const vencimiento = new Date("2026-10-05T20:00:00");

  test("no está vencido antes del vencimiento", () => {
    expect(estaVencido(vencimiento, new Date("2026-10-05T19:59:00"))).toBe(false);
  });

  test("está vencido después del vencimiento", () => {
    expect(estaVencido(vencimiento, new Date("2026-10-05T20:01:00"))).toBe(true);
  });

  test("está vencido justo en el momento del vencimiento", () => {
    expect(estaVencido(vencimiento, new Date("2026-10-05T20:00:00"))).toBe(true);
  });
});

describe("validarFormatoCodigo", () => {
  test("acepta un código de 6 dígitos", () => {
    expect(validarFormatoCodigo("123456")).toBe(true);
  });

  test("rechaza códigos con otra longitud, letras o espacios", () => {
    expect(validarFormatoCodigo("12345")).toBe(false);
    expect(validarFormatoCodigo("1234567")).toBe(false);
    expect(validarFormatoCodigo("12a456")).toBe(false);
    expect(validarFormatoCodigo(" 123456 ")).toBe(false);
  });
});

describe("generarCodigoVerificacion", () => {
  test("genera un código de 6 dígitos", () => {
    expect(generarCodigoVerificacion()).toMatch(/^\d{6}$/);
  });
});
