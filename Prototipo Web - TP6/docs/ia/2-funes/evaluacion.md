# Funes Joaquín — evaluación del output de la IA

**Funciones:** validarEmail · validarDNI · validarCamposObligatorios  
**Versión final:** `tests/M04-validaciones-formulario.test.js`

## Resultado de ejecutar el output original

8 tests generados, 1 fallaron.

validarDNI › rechaza DNI con puntos o letras — «Expected: false · Received: true» en validarDNI("30.123.456")

## Modificaciones realizadas

1. El DNI con puntos ("30.123.456") sí es válido: es el formato habitual y el formulario lo acepta a propósito. El prompt no lo aclaraba y la IA asumió lo contrario; se corrigió el test.
2. Al revisar por qué se aceptaban los puntos se encontró que la función borraba TODOS los puntos, así que "3.0.1.2.3.4.5.6" era válido. Se agregó un test que lo exige inválido y se corrigió la expresión regular.
3. Se agregaron casos de espacios internos en el email, email vacío, undefined, campos con solo espacios, datos undefined y el valor 0 como campo completo.

## Evaluación crítica

Los tests generados eran correctos en sintaxis y en los casos típicos, pero la IA completó con supuestos lo que el prompt no decía (formato con puntos). Ese fallo fue útil: obligó a mirar la implementación y apareció un bug de validación demasiado permisiva.
