# Documentación del uso de IA (TP6 · Tarea C)

Herramienta utilizada: Claude (Anthropic). Cada carpeta contiene:

- `prompt.md`: el prompt exacto que se le dio a la herramienta.
- `output-ia.test.js`: el código tal como lo generó la IA, **sin modificar**.
- `evaluacion.md`: resultado de ejecutarlo, modificaciones realizadas y evaluación crítica.

La versión final de cada bloque está en `tests/`.

Para volver a ejecutar los outputs originales de la IA (y ver sus fallos):

```bash
npx jest --rootDir . --testMatch "**/docs/ia/**/*.test.js"
```

Resultado registrado: **7 fallidos, 42 pasados, 49 en total** (con la zona horaria de Argentina).

| Integrante | Tests IA | Fallaron | Tests finales | Archivo final |
|---|---|---|---|---|
| Palermo Lourdes | 9 | 1 | 10 | `tests/M04-slots-y-fechas.test.js` |
| Funes Joaquín | 8 | 1 | 10 | `tests/M04-validaciones-formulario.test.js` |
| Varano Lucía | 7 | 2 | 8 | `tests/M04-plazos-y-codigo.test.js` |
| Fernandez Carla | 6 | 0 | 13 | `tests/M04-disponibilidad-y-agenda.test.js` |
| Becerra Joaquín | 6 | 1 | 8 | `tests/M06-recordatorios-y-alertas.test.js` |
| Benito Federica | 6 | 1 | 8 | `tests/M06-plantillas.test.js` |
| Del Bosco Marcos | 7 | 1 | 10 | `tests/M06-render-email.test.js` |
| **Total** | **49** | **7** | **67** | |
