const { detectarVariablesFaltantes, renderizarEmailHtml, escaparHtml } = require("../../../src/logica-negocio");

describe("detectarVariablesFaltantes", () => {
  test("detecta las variables sin valor", () => {
    expect(detectarVariablesFaltantes("Hola {{nombre}}, código {{codigo}}", { nombre: "Juan" })).toEqual(["codigo"]);
  });

  test("no repite variables", () => {
    expect(detectarVariablesFaltantes("{{a}} {{a}} {{b}}", {})).toEqual(["a", "b"]);
  });

  test("devuelve array vacío si no faltan variables", () => {
    expect(detectarVariablesFaltantes("Hola {{nombre}}", { nombre: "Juan" })).toEqual([]);
  });
});

describe("renderizarEmailHtml", () => {
  test("genera un documento HTML completo", () => {
    const html = renderizarEmailHtml({ cuerpo: "Hola", firma: "Equipo" });
    expect(html.startsWith("<!DOCTYPE html>")).toBe(true);
  });

  test("escapa el HTML del cuerpo", () => {
    const html = renderizarEmailHtml({ cuerpo: "<script>alert(1)</script>" });
    expect(html).not.toContain("<script>");
  });

  test("no incluye la imagen si la URL no es http/https", () => {
    const html = renderizarEmailHtml({ cuerpo: "Hola", imagenUrl: "javascript:alert(1)" });
    expect(html).not.toContain("<img");
  });
});

describe("escaparHtml", () => {
  test("escapa caracteres especiales", () => {
    expect(escaparHtml('<a href="x">')).toBe("&lt;a href=&quot;x&quot;&gt;");
  });
});
