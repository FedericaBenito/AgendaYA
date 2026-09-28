/**
 * Tests unitarios — M04/M06: plazo de 12 hs para confirmar y código de verificación
 * Responsable: Varano Lucía
 * Funciones: calcularVencimiento · estaVencido · validarFormatoCodigo · generarCodigoVerificacion
 * Trazabilidad: US-01 M04 (E1/E2) · US-03 M04 (verificación de correo) · M06-NF01 · US-08
 */
const {
  calcularVencimiento, estaVencido, validarFormatoCodigo, generarCodigoVerificacion,
} = require("../src/logica-negocio");

describe("calcularVencimiento", () => {
  test("caso normal: suma 12 horas a la fecha de envío del link", () => {
    // Arrange
    const envio = new Date(2026, 9, 5, 8, 0);
    // Act
    const vencimiento = calcularVencimiento(envio, 12);
    // Assert
    expect(vencimiento).toEqual(new Date(2026, 9, 5, 20, 0));
  });

  test("borde: cruza de día y acepta la fecha como string ISO", () => {
    expect(calcularVencimiento("2026-10-05T20:30:00", 12)).toEqual(new Date(2026, 9, 6, 8, 30));
  });
});

describe("estaVencido", () => {
  const vencimiento = new Date(2026, 9, 5, 20, 0);

  test("caso normal: un minuto antes no está vencido y un minuto después sí", () => {
    expect(estaVencido(vencimiento, new Date(2026, 9, 5, 19, 59))).toBe(false);
    expect(estaVencido(vencimiento, new Date(2026, 9, 5, 20, 1))).toBe(true);
  });

  test("borde: justo a las 12 hs todavía NO está vencido (la US dice 'más de 12 horas')", () => {
    expect(estaVencido(vencimiento, new Date(2026, 9, 5, 20, 0))).toBe(false);
  });
});

describe("validarFormatoCodigo", () => {
  test("caso normal: acepta 6 dígitos, incluso si el cliente pegó espacios alrededor", () => {
    expect(validarFormatoCodigo("123456")).toBe(true);
    expect(validarFormatoCodigo(" 123456 ")).toBe(true);
  });

  test("inválido: rechaza otra longitud, letras, espacios internos o tipos no string", () => {
    expect(validarFormatoCodigo("12345")).toBe(false);
    expect(validarFormatoCodigo("1234567")).toBe(false);
    expect(validarFormatoCodigo("12a456")).toBe(false);
    expect(validarFormatoCodigo("123 456")).toBe(false);
    expect(validarFormatoCodigo(123456)).toBe(false);
  });
});

describe("generarCodigoVerificacion", () => {
  test("genera siempre códigos de 6 dígitos que pasan la propia validación", () => {
    // Act: se generan muchos códigos porque la función es aleatoria
    const codigos = Array.from({ length: 200 }, () => generarCodigoVerificacion());
    // Assert
    codigos.forEach((c) => {
      expect(c).toMatch(/^[1-9]\d{5}$/); // nunca empieza con 0
      expect(validarFormatoCodigo(c)).toBe(true);
    });
  });

  test("borde: con Math.random en sus extremos genera 100000 y 999999", () => {
    const spy = jest.spyOn(Math, "random");
    spy.mockReturnValueOnce(0).mockReturnValueOnce(0.9999999);
    expect(generarCodigoVerificacion()).toBe("100000");
    expect(generarCodigoVerificacion()).toBe("999999");
    spy.mockRestore();
  });
});
