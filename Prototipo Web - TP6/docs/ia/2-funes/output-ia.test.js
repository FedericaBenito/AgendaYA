const { validarEmail, validarDNI, validarCamposObligatorios } = require("../../../src/logica-negocio");

describe("validarEmail", () => {
  test("acepta un email con formato válido", () => {
    expect(validarEmail("juanperez@correo.com")).toBe(true);
  });

  test("rechaza emails sin @ o sin dominio", () => {
    expect(validarEmail("juanperez.correo.com")).toBe(false);
    expect(validarEmail("juanperez@correo")).toBe(false);
  });

  test("rechaza valores que no son string", () => {
    expect(validarEmail(null)).toBe(false);
    expect(validarEmail(12345)).toBe(false);
  });
});

describe("validarDNI", () => {
  test("acepta DNI de 7 y 8 dígitos", () => {
    expect(validarDNI("1234567")).toBe(true);
    expect(validarDNI("30123456")).toBe(true);
  });

  test("rechaza DNI con puntos o letras", () => {
    expect(validarDNI("30.123.456")).toBe(false);
    expect(validarDNI("30ABC456")).toBe(false);
  });

  test("rechaza DNI con menos de 7 o más de 8 dígitos", () => {
    expect(validarDNI("123456")).toBe(false);
    expect(validarDNI("123456789")).toBe(false);
  });
});

describe("validarCamposObligatorios", () => {
  test("devuelve un array vacío si están todos los campos", () => {
    const datos = { nombre: "Juan", apellido: "Pérez", dni: "30123456", email: "juan@correo.com" };
    expect(validarCamposObligatorios(datos, ["nombre", "apellido", "dni", "email"])).toEqual([]);
  });

  test("devuelve los campos faltantes", () => {
    const datos = { nombre: "Juan", apellido: "", dni: null };
    expect(validarCamposObligatorios(datos, ["nombre", "apellido", "dni", "email"])).toEqual(["apellido", "dni", "email"]);
  });
});
