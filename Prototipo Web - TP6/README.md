# AgendaYA — Frontend mínimo (Grupo 9 · Módulo 4 y Módulo 6)

Frontend mínimo funcional de AgendaYA, con dos vistas simuladas en una sola página:

- **Vista Cliente (Mobile)** — Módulo 4, Proceso de Reserva: selección de tipo de
  evento → fecha y hora → datos personales → reserva pendiente → verificación de
  correo → confirmación por link → cancelación.
- **Vista Administrador (Desktop)** — Dashboard (reservas de hoy y de la semana,
  próxima reserva, alertas, accesos rápidos y agenda del día) y Módulo 6,
  Notificaciones (sección **Mensajes**): listar, buscar, crear, editar, duplicar,
  previsualizar y eliminar plantillas, simulación de envío e historial de correos.
  Las secciones de otros módulos (Disponibilidad, Tipos de evento, Agenda,
  Configuración) son de consulta o indican qué equipo las desarrolla.

Se cambia de vista con los botones de la barra superior.

## Estructura

```
agendaya-tp6/
├── frontend/
│   ├── index.html        → estructura de ambas vistas (data-cy en todo elemento interactivo)
│   ├── style.css         → estilos
│   └── app.js            → interacción con el DOM; usa las funciones de src/logica-negocio.js
├── src/
│   └── logica-negocio.js → funciones puras de negocio (validaciones, slots, plantillas...)
├── cypress/e2e/          → tests E2E (*.cy.js)
├── tests/                → tests unitarios con Jest (*.test.js)
├── cypress.config.js
├── package.json
└── README.md
```

`index.html` carga la lógica desde `../src/logica-negocio.js`, por eso el
servidor tiene que servir **la raíz del proyecto**, no la carpeta `frontend/`.

## Instalación (una sola vez)

Requiere Node.js 18 o superior.

```bash
npm install
```

## Levantar el frontend

```bash
npm start
```

Queda disponible en <http://127.0.0.1:5500/frontend/index.html>.

Alternativa con VS Code: abrir la **carpeta raíz** `agendaya-tp6/` y usar
*Open with Live Server* sobre `frontend/index.html` (misma URL).

No hace falta backend: los datos (tipos de evento, reservas, plantillas,
notificaciones) se guardan en memoria mientras la página está abierta.

## Ejecutar los tests

Tests unitarios (Jest):

```bash
npm test
```

Tests E2E (Cypress) — con el frontend levantado en otra terminal (`npm start`):

```bash
npm run cy:open   # modo interactivo
npm run cy:run    # modo headless
```

En los tests usar rutas relativas: `cy.visit("/frontend/index.html")`.

## Notas de la simulación

- **Datos de ejemplo:** al cargar la página se generan reservas relativas a la
  fecha actual (hoy, ayer, la semana pasada y mañana) para que el dashboard
  tenga contenido. Los horarios que se pueden reservar empiezan desde mañana.
- **Código de verificación** (US-03 M04): se muestra en pantalla
  (`data-cy="codigo-demo-hint"`) porque no hay backend que envíe correos.
- **Eventos especiales para probar escenarios de error:**
  - `evento-ev5` (Clase de prueba) simula un evento que dejó de estar
    disponible → US-01-02 Escenario 2.
  - `evento-ev4` (Sesión de coaching) no tiene disponibilidad configurada →
    US-01-05 Escenario 2.
- **Correos:** todos los envíos quedan en *Mensajes → Notificaciones enviadas*,
  con el HTML del correo (CSS inline, variables `{{nombre_cliente}}`, etc.,
  según la épica E-1). Si no existe una plantilla personalizada de la
  categoría, se usa la plantilla genérica del sistema.

## Tips para escribir los tests

- **Fechas dinámicas:** los `data-cy` de los días incluyen la fecha
  (`dia-2026-09-29`). Para elegir el primer día hábil:
  `cy.get('[data-cy^="dia-"]:not(:disabled)').first().click()`.
- **Simular a otro cliente** (US-01-06 E2 y US-01-03 E3) desde un solo navegador:

  ```js
  cy.window().then((w) => w.AgendaYADemo.reservarComoOtroCliente("2026-09-29", "10:00"));
  ```

- **Plazos (12 hs de confirmación, recordatorio de 24 hs, cita vencida):**
  controlar el reloj con `cy.clock()` antes de `cy.visit()` y avanzar con
  `cy.tick(ms)`. El chequeo de recordatorios corre cada 1 minuto.
- **Pop-ups:** los mensajes de las historias que son pop-up aparecen en
  `data-cy="popup-mensaje"` y se cierran con `data-cy="popup-cerrar"`.
  Los mensajes de guardado de plantillas aparecen en `data-cy="toast-texto"`.
