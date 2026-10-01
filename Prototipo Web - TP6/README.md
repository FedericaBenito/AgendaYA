# AgendaYA — TP6 Testing Automatizado (Grupo 9 · M04 y M06)

Frontend mínimo de AgendaYA + tests E2E con **Cypress** + tests unitarios con **Jest**.

- **Vista Cliente (Mobile)** — Módulo 4, Proceso de Reserva: tipo de evento → fecha y hora → datos → reserva pendiente → verificación de correo → confirmación por link → cancelación.
- **Vista Administrador (Desktop)** — Dashboard y Módulo 6, Notificaciones (sección **Mensajes**): plantillas, simulación de envío e historial.

| Qué | Cantidad | Estado |
|---|---|---|
| Tests E2E (Cypress) | 7 specs · 24 tests | ✅ todos pasan |
| Tests unitarios (Jest) | 7 archivos · 67 tests | ✅ todos pasan · 98 % de cobertura |

---

## Estructura

```
Prototipo Web - TP6/
├── frontend/                 → index.html, style.css, app.js (todo elemento interactivo tiene data-cy)
├── src/logica-negocio.js     → funciones puras de negocio (se testean con Jest)
├── cypress/
│   ├── e2e/                  → 7 specs E2E, uno por integrante (*.cy.js)
│   ├── fixtures/             → datos de prueba (datos-prueba.json)
│   └── support/              → comandos personalizados (commands.js) y e2e.js
├── tests/                    → tests unitarios Jest (*.test.js) + jest.global-setup.js
├── docs/ia/                  → prompts, outputs originales de la IA y evaluación crítica
├── .github/workflows/        → CI (copiar a la raíz del repo, ver paso 9)
├── cypress.config.js
└── package.json
```

## Responsabilidades individuales

| Integrante | Test E2E (Cypress) | Tests unitarios (Jest) |
|---|---|---|
| Palermo Lourdes | `M04-01-reserva-exitosa.cy.js` | `M04-slots-y-fechas.test.js` |
| Funes Joaquín | `M04-02-validacion-formulario.cy.js` | `M04-validaciones-formulario.test.js` |
| Varano Lucía | `M04-03-confirmacion-reserva.cy.js` | `M04-plazos-y-codigo.test.js` |
| Fernandez Carla | `M04-04-disponibilidad.cy.js` | `M04-disponibilidad-y-agenda.test.js` |
| Becerra Joaquín | `M04-05-cancelacion-y-recordatorio.cy.js` | `M06-recordatorios-y-alertas.test.js` |
| Benito Federica | `M06-01-plantillas.cy.js` | `M06-plantillas.test.js` |
| Del Bosco Marcos | `M06-02-envio-notificaciones.cy.js` | `M06-render-email.test.js` |

---

# Guía paso a paso: cómo levantar el proyecto y correr Cypress

> Pensada para quien **nunca usó Cypress**. Seguila en orden la primera vez.

## Paso 0 — Qué es cada cosa (2 minutos de teoría)

- **Node.js / npm**: el entorno que ejecuta JavaScript fuera del navegador. `npm` instala las herramientas (Cypress, Jest, http-server) listadas en `package.json`.
- **Jest**: corre los **tests unitarios**. Llama directo a las funciones de `src/logica-negocio.js`, sin navegador.
- **Cypress**: corre los **tests E2E**. Abre un navegador real, entra a la página y hace clic y escribe como un usuario. Por eso **la página tiene que estar levantada** antes de correrlo.
- **`data-cy`**: atributo que ponemos en cada botón o campo para que Cypress lo encuentre sin depender del texto ni del CSS. Ejemplo: `cy.get('[data-cy="btn-reservar"]').click()`.

## Paso 1 — Instalar lo necesario (una sola vez por computadora)

1. Instalar **Node.js 20 LTS** desde <https://nodejs.org> (botón LTS, siguiente, siguiente).
2. Verificar en una terminal (PowerShell, CMD o la terminal de VS Code):
   ```bash
   node -v    # tiene que mostrar v18 o superior
   npm -v
   ```
3. Tener **Git** (<https://git-scm.com>) y **VS Code** (recomendado).

## Paso 2 — Descargar el proyecto

```bash
git clone https://github.com/FedericaBenito/AgendaYA.git
cd "AgendaYA/Prototipo Web - TP6"
```

> Las comillas son necesarias porque el nombre de la carpeta tiene espacios.
> Abrí **esta carpeta** en VS Code con `code .`

## Paso 3 — Instalar las dependencias

```bash
npm install
```

Tarda unos minutos la primera vez porque descarga el binario de Cypress (~500 MB).
Si termina sin errores en rojo, está listo. Para comprobar Cypress:

```bash
npx cypress verify
```

## Paso 4 — Correr los tests unitarios (Jest)

```bash
npm test               # corre los 67 tests
npm run test:coverage  # además genera el reporte en coverage/lcov-report/index.html
```

Resultado esperado: `Tests: 67 passed, 67 total`.

## Paso 5 — Levantar el frontend

Cypress necesita la página funcionando. En una **terminal 1**:

```bash
npm start
```

Queda en <http://127.0.0.1:5500/frontend/index.html>. Abrila en el navegador para chequear.
**No cierres esta terminal** mientras corren los tests.

> Alternativa: extensión *Live Server* de VS Code sobre `frontend/index.html`, con la carpeta raíz del proyecto abierta. Usa el mismo puerto 5500.

## Paso 6 — Abrir Cypress en modo interactivo (el ideal para aprender)

En una **terminal 2** (la 1 sigue corriendo):

```bash
npm run cy:open
```

1. Se abre la ventana de Cypress. Elegí **E2E Testing**. Como el proyecto ya está configurado, aparece "Configured".
2. Elegí un navegador (**Chrome** o **Electron**) y hacé clic en **Start E2E Testing**.
3. Aparece la lista de specs. Hacé clic, por ejemplo, en `M04-01-reserva-exitosa.cy.js`.
4. A la izquierda se ve cada comando (`get`, `click`, `type`, `assert`) y a la derecha la app. Si hacés clic en un comando, Cypress muestra cómo estaba la pantalla en ese momento (*time travel*). Así se explica un test en la presentación.
5. Si editás y guardás un `.cy.js`, el test se vuelve a correr solo.

## Paso 7 — Correr todo en modo headless (para evidencia)

Con el frontend levantado (terminal 1):

```bash
npm run cy:run
```

O todo en un solo comando, que levanta el servidor, corre Cypress y lo apaga:

```bash
npm run e2e
```

Resultado esperado al final: una tabla con los 7 specs y `All specs passed!` con 24 tests.

**Evidencia para el informe:**
- Videos: `cypress/videos/*.mp4`, uno por spec.
- Capturas automáticas de tests fallidos: `cypress/screenshots/`.
- Captura manual: la tabla final de la terminal y la ventana interactiva con los tests en verde.

Para correr un solo spec:

```bash
npx cypress run --spec cypress/e2e/M04-01-reserva-exitosa.cy.js
```

## Paso 8 — Usar Cypress Cloud (opcional: ya tienen cuentas)

Cypress Cloud guarda online los resultados, videos y capturas, y es cómodo para compartir evidencia.

1. Entrá a <https://cloud.cypress.io>, creá una **organización** para el grupo e invitá a los 7 integrantes.
2. Creá un **proyecto** "AgendaYA TP6". Cypress te da un `projectId` y una **Record Key**.
3. Agregá el `projectId` en `cypress.config.js`, al mismo nivel que `e2e`:
   ```js
   module.exports = defineConfig({
     projectId: "abc123",
     e2e: { /* ...lo que ya está... */ },
   });
   ```
4. Grabá una ejecución (con el frontend levantado):
   ```bash
   npx cypress run --record --key TU-RECORD-KEY
   ```
5. En Cypress Cloud aparece el run con cada test, su video y su duración. Esa página sirve como evidencia.

> ⚠️ **No subas la Record Key al repositorio.** Pasala por la terminal o guardala como *secret* de GitHub.

## Paso 9 — Integración continua con GitHub Actions (opcional, recomendado)

1. Copiá `.github/workflows/tp6-tests.yml` a la **raíz del repo**: `AgendaYA/.github/workflows/tp6-tests.yml`. GitHub solo lee esa carpeta.
2. Hacé commit y push. En la pestaña **Actions** de GitHub se corren Jest y Cypress en cada push.
3. Los videos quedan descargables como artefacto `evidencia-cypress`.

## Paso 10 — Cómo se escribe un test nuevo (plantilla)

```js
describe("AgendaYA - M04 Proceso de Reserva · <qué se prueba>", () => {
  beforeEach(() => {
    cy.visitarAgendaYA(); // congela el reloj en lun 05/10/2026 08:00 y abre la app
  });

  it("<resultado esperado, en lenguaje del usuario>", () => {
    // Arrange: preparar el estado inicial
    cy.elegirEventoFechaYHora({ evento: "ev1", dia: "2026-10-06", hora: "10:00" });

    // Act: ejecutar la acción principal
    cy.dataCy("btn-reservar").click();

    // Assert: verificar el resultado esperado
    cy.dataCy("error-form-datos").should("be.visible");
  });
});
```

**Comandos personalizados disponibles** (`cypress/support/commands.js`):

| Comando | Qué hace |
|---|---|
| `cy.dataCy("x")` | Atajo de `cy.get('[data-cy="x"]')` |
| `cy.visitarAgendaYA()` | Congela el reloj con `cy.clock` y abre la página |
| `cy.elegirEventoFechaYHora({evento, dia, hora})` | Pasos 1 y 2 del flujo de reserva |
| `cy.completarDatosCliente({nombre, apellido, dni, email})` | Completa el formulario del paso 3 |
| `cy.verificarCorreoConCodigoMostrado()` | Lee el código simulado y lo verifica |
| `cy.crearReservaConfirmada(opciones)` | Flujo completo hasta una reserva confirmada |
| `cy.irAMensajesAdmin("plantillas" o "enviadas")` | Navega a Mensajes en la vista admin |

**Aserciones más usadas:** `should("be.visible")`, `should("not.be.visible")`, `should("have.text", "...")`, `should("contain", "...")`, `should("be.disabled")`, `should("have.length", n)`, `should("not.exist")`.

## Paso 11 — Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| `cy.visit() failed trying to load` | El frontend no está levantado. Corré `npm start` en otra terminal. |
| La página carga sin datos o aparece `LogicaNegocio is undefined` | Se sirvió la carpeta `frontend/` en lugar de la raíz. Usá `npm start` desde la raíz del proyecto. |
| `Cypress binary is missing` | Corré `npx cypress install`. |
| Error de *special character sequence* al escribir `{{variable}}` | `cy.type` interpreta las llaves. Usá `.type(texto, { parseSpecialCharSequences: false })`. |
| `cy.click() can only be called on a single element` | El selector encuentra varios elementos. Revisá que el `data-cy` sea único. |
| *is being covered by another element* | Hay un pop-up o un toast abierto. Cerralo antes con `cy.dataCy("popup-cerrar").click()` o `cy.dataCy("toast-cerrar").click()`. |
| Tests con fechas que fallan según el día o la hora | No uses el reloj real: `cy.visitarAgendaYA()` ya fija la fecha. En Jest, pasá `ahora` como parámetro. |
| `http-server` no se reconoce | Corré primero `npm install` en la carpeta del proyecto. |

## Paso 12 — Reproducir el "test que falla" documentado en el informe

El spec `M04-03` incluye un test que detectó un bug real: el plazo de 12 hs se contaba desde la creación de la reserva y no desde el envío del link. Para reproducir el fallo y sacar la captura:

1. En `frontend/app.js`, comentá la línea `reserva.fechaEnvioConfirmacion = new Date();` (buscá "Corrección TP6").
2. Corré `npx cypress run --spec cypress/e2e/M04-03-confirmacion-reserva.cy.js`. El test *"cuenta las 12 hs desde el envío del link..."* falla y queda la captura en `cypress/screenshots/`.
3. Descomentá la línea y volvé a correrlo: pasa.

---

## Notas de la simulación

- **Sin backend:** los datos viven en memoria. Cada test de Cypress recarga la página, así que siempre arranca con los mismos datos de ejemplo (11 reservas, 3 plantillas).
- **Código de verificación:** se muestra en pantalla (`data-cy="codigo-demo-hint"`) porque no hay envío real de correos.
- **Eventos especiales:** `evento-ev5` (Clase de prueba) simula un evento que dejó de estar disponible; `evento-ev4` (Sesión de coaching) no tiene disponibilidad configurada.
- **Otro cliente:** `cy.window().then((w) => w.AgendaYADemo.reservarComoOtroCliente("2026-10-06", "10:00"))`.
- **Plazos:** `cy.tick(ms)` avanza el reloj simulado. El chequeo de recordatorios corre cada 1 minuto.
- **Correos:** quedan en *Mensajes → Notificaciones enviadas*. Si existe una plantilla personalizada de la categoría (confirmación, cancelación o recordatorio) se usa esa; si no, la genérica del sistema.
