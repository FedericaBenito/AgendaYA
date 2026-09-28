# Benito Federica — evaluación del output de la IA

**Funciones:** construirCuerpoPlantilla · nombrePlantillaDuplicado  
**Versión final:** `tests/M06-plantillas.test.js`

## Resultado de ejecutar el output original

6 tests generados, 1 fallaron.

construirCuerpoPlantilla › reemplaza por vacío las variables sin valor — «Expected: "Hola " · Received: "Hola {{nombre_cliente}}"»

## Modificaciones realizadas

1. Una variable sin valor se deja tal cual a propósito: así detectarVariablesFaltantes() puede avisar antes de enviar el correo. Borrarla en silencio mandaría un mail incompleto. Se corrigió la expectativa.
2. Se agregaron espacios dentro de las llaves ({{ n }}), valores numéricos (0), nombre con espacios extremos, y edición cuando el nombre coincide con OTRA plantilla (sí es duplicado).
3. Este test responde la pregunta abierta del CP-005 del TP5: la unicidad del nombre NO distingue mayúsculas.

## Evaluación crítica

La IA eligió la opción «más común», pero no la que conviene al negocio. La decisión correcta salió de mirar cómo se usan juntas las funciones del módulo, algo que la herramienta no ve si el prompt describe una sola función.
