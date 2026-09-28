/**
 * Tests unitarios — M04 Proceso de Reserva: validaciones del formulario de datos
 * Responsable: Funes Joaquín
 * Funciones: validarEmail · validarDNI · validarCamposObligatorios
 * Trazabilidad: US-01-04 (E2 campos obligatorios, E3 formato de correo) · M04-NF06
 */
const { validarEmail, validarDNI, validarCamposObligatorios } = require("../src/logica-negocio");

describe("validarEmail", () => {
  test("caso normal: acepta un correo con formato válido (y tolera espacios alrededor)", () => {
    expect(validarEmail("juanperez@correo.com")).toBe(true);
    expect(validarEmail("  juan.perez+turnos@correo.com.ar ")).toBe(true);
  });

  test("inválido: rechaza correos sin @, sin dominio o con espacios internos", () => {
    expect(validarEmail("juanperez.correo.com")).toBe(false);
    expect(validarEmail("juanperez@correo")).toBe(false);
    expect(validarEmail("juan perez@correo.com")).toBe(false);
    expect(validarEmail("")).toBe(false);
  });

  test("inválido: rechaza valores que no son string", () => {
    expect(validarEmail(null)).toBe(false);
    expect(validarEmail(undefined)).toBe(false);
    expect(validarEmail(12345)).toBe(false);
  });
});

describe("validarDNI", () => {
  test("caso normal: acepta 7 u 8 dígitos como string o number", () => {
    expect(validarDNI("1234567")).toBe(true);
    expect(validarDNI("30123456")).toBe(true);
    expect(validarDNI(30123456)).toBe(true);
  });

  test("borde: acepta puntos como separador de miles (formato habitual del DNI)", () => {
    expect(validarDNI("30.123.456")).toBe(true);
    expect(validarDNI("1.234.567")).toBe(true);
  });

  test("inválido: rechaza puntos mal ubicados", () => {
    // BUG encontrado: se borraban TODOS los puntos, así que "3.0.1.2.3.4.5.6" era válido
    expect(validarDNI("3.0.1.2.3.4.5.6")).toBe(false);
    expect(validarDNI("30123.456")).toBe(false);
  });

  test("inválido: rechaza letras, longitudes incorrectas y tipos no soportados", () => {
    expect(validarDNI("30ABC456")).toBe(false);
    expect(validarDNI("123456")).toBe(false);
    expect(validarDNI("123456789")).toBe(false);
    expect(validarDNI(null)).toBe(false);
  });
});

describe("validarCamposObligatorios", () => {
  const OBLIGATORIOS = ["nombre", "apellido", "dni", "email"];

  test("caso normal: devuelve una lista vacía si están todos los campos", () => {
    // Arrange
    const datos = { nombre: "Juan", apellido: "Pérez", dni: "30123456", email: "juan@correo.com" };
    // Act + Assert
    expect(validarCamposObligatorios(datos, OBLIGATORIOS)).toEqual([]);
  });

  test("inválido: informa los faltantes en orden (vacío, null, undefined y solo espacios)", () => {
    const datos = { nombre: "Juan", apellido: "   ", dni: null };
    expect(validarCamposObligatorios(datos, OBLIGATORIOS)).toEqual(["apellido", "dni", "email"]);
  });

  test("borde: sin objeto de datos, todos los campos faltan; el valor 0 cuenta como completo", () => {
    expect(validarCamposObligatorios(undefined, ["nombre"])).toEqual(["nombre"]);
    expect(validarCamposObligatorios({ cantidad: 0 }, ["cantidad"])).toEqual([]);
  });
});
