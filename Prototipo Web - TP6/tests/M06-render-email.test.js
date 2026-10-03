/**
 * Tests unitarios — M06 armado del correo a partir de la plantilla
 * Responsable: Del Bosco Marcos
 * Funciones: detectarVariablesFaltantes · renderizarEmailHtml · escaparHtml · esUrlImagenValida
 * Trazabilidad: M06-F05 · E-1 (HTML con CSS inline) · M06-NF03 (seguridad: sin inyección de HTML)
 */
const {
  detectarVariablesFaltantes, renderizarEmailHtml, escaparHtml, esUrlImagenValida,
} = require("../src/logica-negocio");

describe("detectarVariablesFaltantes", () => {
  test("caso normal: devuelve solo las variables que no tienen valor", () => {
    expect(detectarVariablesFaltantes("Hola {{nombre}}, código {{codigo}}", { nombre: "Juan" })).toEqual(["codigo"]);
  });

  test("borde: no repite variables y respeta el orden de aparición", () => {
    expect(detectarVariablesFaltantes("{{b}} {{a}} {{b}} {{ a }}", {})).toEqual(["b", "a"]);
  });

  test("borde: una variable con valor vacío o 0 NO falta (existe la clave)", () => {
    expect(detectarVariablesFaltantes("{{x}} {{y}}", { x: "", y: 0 })).toEqual([]);
  });

  test("inválido: cuerpo no string o sin variables devuelve lista vacía", () => {
    expect(detectarVariablesFaltantes(null, {})).toEqual([]);
    expect(detectarVariablesFaltantes("Texto sin variables", {})).toEqual([]);
  });
});

describe("renderizarEmailHtml", () => {
  test("caso normal: arma una tabla con CSS inline, el cuerpo y la firma (saltos de línea → <br>)", () => {
    // Act
    const html = renderizarEmailHtml({ cuerpo: "Hola Juan\nTu reserva fue confirmada", firma: "Equipo AgendaYA" });
    // Assert: es un fragmento compatible con clientes de correo, no un documento completo
    expect(html.startsWith("<table")).toBe(true);
    expect(html).toContain('style="');
    expect(html).toContain("Hola Juan<br>Tu reserva fue confirmada");
    expect(html).toContain("Equipo AgendaYA");
  });

  test("seguridad: el texto del cliente no puede inyectar HTML", () => {
    const html = renderizarEmailHtml({ cuerpo: '<script>alert("x")</script>' });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  });

  test("borde: incluye la imagen solo si la URL es http/https", () => {
    expect(renderizarEmailHtml({ imagenUrl: "https://agendaya.com/logo.png" })).toContain('<img src="https://agendaya.com/logo.png"');
    expect(renderizarEmailHtml({ imagenUrl: "javascript:alert(1)" })).not.toContain("<img");
    expect(renderizarEmailHtml({ imagenUrl: "" })).not.toContain("<img");
  });

  test("borde: sin parámetros no falla y devuelve la estructura base", () => {
    expect(renderizarEmailHtml()).toContain("AgendaYA");
  });
});

describe("escaparHtml y esUrlImagenValida", () => {
  test("escapaHtml: escapa los 5 caracteres especiales y convierte null/undefined en vacío", () => {
    expect(escaparHtml(`<a href="x" title='y'>&</a>`)).toBe("&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;");
    expect(escaparHtml(null)).toBe("");
    expect(escaparHtml(42)).toBe("42");
  });

  test("esUrlImagenValida: acepta http/https y rechaza otros protocolos o texto", () => {
    expect(esUrlImagenValida("http://agendaya.com/a.png")).toBe(true);
    expect(esUrlImagenValida("ftp://agendaya.com/a.png")).toBe(false);
    expect(esUrlImagenValida("no es una url")).toBe(false);
    expect(esUrlImagenValida(null)).toBe(false);
  });
});

test("HOTFIX INC-M6-Inyeccion-html: el cuerpo del email debe escapar etiquetas HTML en las variables del cliente para evitar inyección", () => {
  // Arrange: Simulamos una entrada maliciosa con etiquetas HTML
  const datosMaliciosos = { cuerpo: "Hola <h1>Usuario Malicioso</h1>" };

  // Act: Renderizamos el email aplicando la lógica actual
  const htmlRenderizado = renderizarEmailHtml(datosMaliciosos);

  // Assert: Verificamos que la etiqueta HTML cruda NO aparezca en el resultado
  expect(htmlRenderizado).not.toContain("<h1>Usuario Malicioso</h1>");

  // Assert: Verificamos que se haya escapado correctamente a entidades seguras
  expect(htmlRenderizado).toContain("&lt;h1&gt;Usuario Malicioso&lt;/h1&gt;");
});