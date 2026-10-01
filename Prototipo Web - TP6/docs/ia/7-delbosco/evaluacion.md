# Del Bosco Marcos — evaluación del output de la IA

**Funciones:** detectarVariablesFaltantes · renderizarEmailHtml · escaparHtml · esUrlImagenValida  
**Versión final:** `tests/M06-render-email.test.js`

## Resultado de ejecutar el output original

7 tests generados, 1 fallaron.

renderizarEmailHtml › genera un documento HTML completo — «Expected: true · Received: false» en html.startsWith("<!DOCTYPE html>")

## Modificaciones realizadas

1. La función devuelve un fragmento <table> con CSS inline, que es lo que requiere la épica E-1 para que el correo se vea bien en Gmail/Outlook. La IA supuso un documento HTML completo; se reemplazó por la verificación de la estructura real.
2. El test de inyección solo verificaba que no apareciera <script>; se agregó la verificación del texto escapado exacto.
3. Se agregaron: orden de aparición de las variables faltantes, clave con valor vacío o 0 (no falta), URL ftp:// y vacía, llamada sin parámetros y esUrlImagenValida.

## Evaluación crítica

La IA escribe tests plausibles para funciones genéricas, pero no conoce las restricciones propias del dominio (correo HTML compatible con clientes de mail). Hubo que aportar ese conocimiento desde la especificación.
