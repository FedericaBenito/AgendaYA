/**
 * AgendaYA — Lógica de negocio
 * Módulo 4 (Proceso de Reserva / Booking) + Módulo 6 (Notificaciones)
 *
 * Estas funciones son puras (sin acceso al DOM) para que puedan ser
 * cubiertas con tests unitarios (Jest) de forma independiente del frontend.
 */

// ---------- M04 · Proceso de Reserva ----------

/**
 * Valida el formato de un correo electrónico.
 * @param {string} email
 * @returns {boolean}
 */
function validarEmail(email) {
  if (typeof email !== "string") return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

/**
 * Valida un DNI argentino: solo dígitos (se toleran puntos como separador
 * de miles) y entre 7 y 8 cifras.
 * @param {string} dni
 * @returns {boolean}
 */
function validarDNI(dni) {
  if (typeof dni !== "string" && typeof dni !== "number") return false;
  // Corrección TP6: los puntos solo se aceptan como separador de miles
  // en las dos posiciones correctas (antes se borraban todos y "3.0.1.2.3.4.5.6" era válido).
  return /^(\d{7,8}|\d{1,2}\.\d{3}\.\d{3})$/.test(String(dni).trim());
}

/**
 * Valida que un código de verificación tenga exactamente 6 dígitos.
 * @param {string} codigo
 * @returns {boolean}
 */
function validarFormatoCodigo(codigo) {
  return typeof codigo === "string" && /^\d{6}$/.test(codigo.trim());
}

/**
 * Revisa que existan valores para cada campo obligatorio de un objeto.
 * @param {Object} datos
 * @param {string[]} camposObligatorios
 * @returns {string[]} nombres de los campos faltantes
 */
function validarCamposObligatorios(datos, camposObligatorios) {
  return camposObligatorios.filter((campo) => {
    const valor = datos ? datos[campo] : undefined;
    return valor === undefined || valor === null || String(valor).trim() === "";
  });
}

/**
 * Indica si una fecha (ISO "YYYY-MM-DD" u objeto Date) es futura respecto
 * al momento actual. Una reserva no puede hacerse en el pasado.
 * @param {string|Date} fecha
 * @param {Date} [ahora]
 * @returns {boolean}
 */
function esFechaValida(fecha, ahora = new Date()) {
  // Corrección TP6: "YYYY-MM-DD" sin hora se interpreta a las 00:00 LOCAL.
  // new Date("2026-10-06") usa UTC y en Argentina equivale al día anterior a las 21 hs.
  const soloFecha = typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha);
  const f = fecha instanceof Date ? fecha : new Date(soloFecha ? `${fecha}T00:00:00` : fecha);
  if (isNaN(f.getTime())) return false;
  return f.getTime() > ahora.getTime();
}

/**
 * Genera los horarios disponibles ("slots") entre una hora de inicio y una
 * hora de fin, dada una duración en minutos.
 * @param {string} horaInicio formato "HH:MM"
 * @param {string} horaFin formato "HH:MM"
 * @param {number} duracionMin duración de cada turno en minutos
 * @returns {string[]} lista de horarios "HH:MM"
 */
function generarSlots(horaInicio, horaFin, duracionMin) {
  // Corrección TP6: la duración tiene que ser un entero positivo (con 22.5 se
  // generaba "09:22.5") y las horas tienen que ser "HH:MM" entre 00:00 y 23:59
  // (con "25:00" se generaban turnos "24:00" y "24:30").
  const HORA_VALIDA = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!HORA_VALIDA.test(horaInicio) || !HORA_VALIDA.test(horaFin)) return [];
  if (!Number.isInteger(duracionMin) || duracionMin <= 0) return [];

  const [hIni, mIni] = horaInicio.split(":").map(Number);
  const [hFin, mFin] = horaFin.split(":").map(Number);

  let minutosInicio = hIni * 60 + mIni;
  const minutosFin = hFin * 60 + mFin;
  if (minutosInicio >= minutosFin) return [];

  const slots = [];
  while (minutosInicio + duracionMin <= minutosFin) {
    const h = String(Math.floor(minutosInicio / 60)).padStart(2, "0");
    const m = String(minutosInicio % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
    minutosInicio += duracionMin;
  }
  return slots;
}

/**
 * Convierte una fecha a "YYYY-MM-DD" usando la zona horaria LOCAL.
 * (toISOString() usa UTC: en Argentina, después de las 21hs devuelve
 * el día siguiente.)
 * @param {Date} date
 * @returns {string}
 */
function fechaLocalISO(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Estados de reserva que liberan el horario para otros clientes.
const ESTADOS_QUE_LIBERAN_HORARIO = ["cancelada", "expirada"];

/**
 * Determina si un horario dentro de una lista de reservas ya existentes
 * está ocupado para una fecha determinada (evita reservas duplicadas).
 * @param {{fecha:string, hora:string, estado:string}[]} reservas
 * @param {string} fecha
 * @param {string} hora
 * @returns {boolean}
 */
function horarioOcupado(reservas, fecha, hora) {
  if (!Array.isArray(reservas)) return false;
  return reservas.some(
    (r) =>
      r.fecha === fecha &&
      r.hora === hora &&
      !ESTADOS_QUE_LIBERAN_HORARIO.includes(r.estado)
  );
}

/**
 * Calcula la fecha/hora de vencimiento de un plazo (por ej. confirmación
 * de reserva a las 12hs, o cancelación).
 * @param {Date} fechaEnvio
 * @param {number} horasDePlazo
 * @returns {Date}
 */
function calcularVencimiento(fechaEnvio, horasDePlazo) {
  const base = fechaEnvio instanceof Date ? fechaEnvio : new Date(fechaEnvio);
  return new Date(base.getTime() + horasDePlazo * 60 * 60 * 1000);
}

/**
 * Indica si ya se venció un plazo dado.
 * @param {Date} fechaVencimiento
 * @param {Date} [ahora]
 * @returns {boolean}
 */
function estaVencido(fechaVencimiento, ahora = new Date()) {
  const v = fechaVencimiento instanceof Date ? fechaVencimiento : new Date(fechaVencimiento);
  return ahora.getTime() > v.getTime();
}

/**
 * Genera un código numérico de verificación de 6 dígitos.
 * @returns {string}
 */
function generarCodigoVerificacion() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ---------- M06 · Notificaciones ----------

/**
 * Reemplaza las variables {{Nombre}} de una plantilla por los valores
 * provistos.
 * @param {string} cuerpo texto con placeholders {{Variable}}
 * @param {Object} variables mapa variable -> valor
 * @returns {string}
 */
function construirCuerpoPlantilla(cuerpo, variables = {}) {
  if (typeof cuerpo !== "string") return "";
  return cuerpo.replace(/{{\s*([\w.]+)\s*}}/g, (match, nombreVar) => {
    return Object.prototype.hasOwnProperty.call(variables, nombreVar)
      ? String(variables[nombreVar])
      : match;
  });
}

/**
 * Detecta qué variables usadas en una plantilla ({{Variable}}) no tienen
 * un valor provisto.
 * @param {string} cuerpo
 * @param {Object} variablesDisponibles
 * @returns {string[]} nombres de variables faltantes (sin duplicados)
 */
function detectarVariablesFaltantes(cuerpo, variablesDisponibles = {}) {
  if (typeof cuerpo !== "string") return [];
  const encontradas = new Set();
  const regex = /{{\s*([\w.]+)\s*}}/g;
  let match;
  while ((match = regex.exec(cuerpo)) !== null) {
    const nombreVar = match[1];
    if (!Object.prototype.hasOwnProperty.call(variablesDisponibles, nombreVar)) {
      encontradas.add(nombreVar);
    }
  }
  return Array.from(encontradas);
}

/**
 * Verifica si ya existe una plantilla con el mismo nombre (case-insensitive),
 * excluyendo opcionalmente una plantilla por id (útil al editar).
 * @param {string} nombre
 * @param {{id:string, nombre:string}[]} plantillas
 * @param {string} [idExcluir]
 * @returns {boolean}
 */
function nombrePlantillaDuplicado(nombre, plantillas, idExcluir = null) {
  if (!nombre || !Array.isArray(plantillas)) return false;
  const normalizado = nombre.trim().toLowerCase();
  return plantillas.some(
    (p) => p.id !== idExcluir && p.nombre.trim().toLowerCase() === normalizado
  );
}

/**
 * Escapa caracteres especiales de HTML para poder insertar texto ingresado
 * por el usuario con innerHTML sin riesgo de inyección (M04-NF05 / M06-NF03).
 * @param {*} texto
 * @returns {string}
 */
function escaparHtml(texto) {

  return texto;
}

// ---------- Reservas: numeración, rangos y próxima reserva ----------

/**
 * Formatea el número visible de una reserva: 1 -> "RES-0001".
 * @param {number} n
 * @returns {string}
 */
function formatearNumeroReserva(n) {
  const num = Number(n);
  if (!Number.isInteger(num) || num <= 0) return "";
  return `RES-${String(num).padStart(4, "0")}`;
}

/**
 * Devuelve la fecha ISO ("YYYY-MM-DD") del lunes de la semana de una fecha.
 * @param {string} fechaISO
 * @returns {string}
 */
function inicioDeSemana(fechaISO) {
  const d = new Date(`${fechaISO}T12:00:00`);
  if (isNaN(d.getTime())) return "";
  const desplazamiento = (d.getDay() + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - desplazamiento);
  return fechaLocalISO(d);
}

/**
 * Filtra reservas cuya fecha está entre desde y hasta (inclusive),
 * excluyendo los estados indicados (por defecto canceladas y expiradas).
 * @param {{fecha:string, estado:string}[]} reservas
 * @param {string} desdeISO
 * @param {string} hastaISO
 * @param {string[]} [estadosExcluidos]
 * @returns {Object[]}
 */
function filtrarReservasPorRango(reservas, desdeISO, hastaISO, estadosExcluidos = ["cancelada", "expirada"]) {
  if (!Array.isArray(reservas)) return [];
  return reservas.filter(
    (r) => r.fecha >= desdeISO && r.fecha <= hastaISO && !estadosExcluidos.includes(r.estado)
  );
}

/**
 * Devuelve la próxima reserva activa (pendiente o confirmada) posterior a "ahora".
 * @param {{fecha:string, hora:string, estado:string}[]} reservas
 * @param {Date} [ahora]
 * @returns {Object|null}
 */
function proximaReserva(reservas, ahora = new Date()) {
  if (!Array.isArray(reservas)) return null;
  const futuras = reservas
    .filter((r) => ["pendiente", "confirmada"].includes(r.estado))
    .map((r) => ({ r, inicio: new Date(`${r.fecha}T${r.hora}:00`) }))
    .filter(({ inicio }) => !isNaN(inicio.getTime()) && inicio.getTime() > ahora.getTime())
    .sort((a, b) => a.inicio - b.inicio);
  return futuras.length ? futuras[0].r : null;
}

/**
 * Texto relativo para alertas: "Hace instantes", "Hace 10 min", "Hace 2 h", "Hace 3 d".
 * @param {Date} fecha
 * @param {Date} [ahora]
 * @returns {string}
 */
function tiempoRelativo(fecha, ahora = new Date()) {
  const f = fecha instanceof Date ? fecha : new Date(fecha);
  if (isNaN(f.getTime())) return "";
  const minutos = Math.floor((ahora.getTime() - f.getTime()) / 60000);
  if (minutos < 1) return "Hace instantes";
  if (minutos < 60) return `Hace ${minutos} min`;
  if (minutos < 60 * 24) return `Hace ${Math.floor(minutos / 60)} h`;
  return `Hace ${Math.floor(minutos / (60 * 24))} d`;
}

/**
 * US-09 (M06): indica si corresponde enviar el recordatorio de 24 hs.
 * Solo reservas "confirmada", sin recordatorio previo, y dentro de la
 * ventana [24 hs, 24 hs - tolerancia) antes del inicio del turno.
 * No se envía antes (faltan más de 24 hs) ni fuera de plazo.
 * @param {{fecha:string, hora:string, estado:string, recordatorioEnviado?:boolean}} reserva
 * @param {Date} [ahora]
 * @param {number} [toleranciaMin]
 * @returns {boolean}
 */
function debeEnviarRecordatorio(reserva, ahora = new Date(), toleranciaMin = 60) {
  if (!reserva || reserva.estado !== "confirmada" || reserva.recordatorioEnviado) return false;
  const inicio = new Date(`${reserva.fecha}T${reserva.hora}:00`);
  if (isNaN(inicio.getTime())) return false;
  const restanteMin = (inicio.getTime() - ahora.getTime()) / 60000;
  const VENTANA = 24 * 60;
  return restanteMin <= VENTANA && restanteMin > VENTANA - toleranciaMin;
}

// ---------- M06 · Renderizado de correos (E-1) ----------

/**
 * Indica si una URL es válida para usar como imagen de encabezado (http/https).
 * @param {string} url
 * @returns {boolean}
 */
function esUrlImagenValida(url) {
  if (typeof url !== "string" || url.trim() === "") return false;
  try {
    const u = new URL(url.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (e) {
    return false;
  }
}

/**
 * E-1: arma el HTML del correo con CSS inline (compatible con Gmail/Outlook).
 * Todo el texto se escapa, así los datos del cliente no pueden inyectar HTML.
 * @param {{cuerpo?:string, firma?:string, imagenUrl?:string}} datos
 * @returns {string}
 */
function renderizarEmailHtml({ cuerpo = "", firma = "", imagenUrl = "" } = {}) {
  const aHtml = (t) => escaparHtml(t).replace(/\n/g, "<br>");
  const imagen = esUrlImagenValida(imagenUrl)
    ? `<tr><td style="padding:0;"><img src="${escaparHtml(imagenUrl.trim())}" alt="" style="display:block;width:100%;max-width:560px;border:0;"></td></tr>`
    : "";
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" ` +
    `style="max-width:560px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;background:#ffffff;border:1px solid #e3e6ef;">` +
    imagen +
    `<tr><td style="padding:14px 20px;background:#2f5fdc;color:#ffffff;font-size:16px;font-weight:bold;">AgendaYA</td></tr>` +
    `<tr><td style="padding:20px;color:#1c2130;font-size:14px;line-height:1.6;">${aHtml(cuerpo)}</td></tr>` +
    `<tr><td style="padding:0 20px 20px;color:#6b7280;font-size:13px;line-height:1.5;">${aHtml(firma)}</td></tr>` +
    `</table>`
  );
}

// Exponer las funciones tanto para el navegador (window) como para Node/Jest.
const LogicaNegocio = {
  validarEmail,
  validarDNI,
  validarFormatoCodigo,
  validarCamposObligatorios,
  esFechaValida,
  generarSlots,
  fechaLocalISO,
  horarioOcupado,
  calcularVencimiento,
  estaVencido,
  generarCodigoVerificacion,
  construirCuerpoPlantilla,
  detectarVariablesFaltantes,
  nombrePlantillaDuplicado,
  escaparHtml,
  formatearNumeroReserva,
  inicioDeSemana,
  filtrarReservasPorRango,
  proximaReserva,
  tiempoRelativo,
  debeEnviarRecordatorio,
  esUrlImagenValida,
  renderizarEmailHtml,
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = LogicaNegocio;
}
if (typeof window !== "undefined") {
  window.LogicaNegocio = LogicaNegocio;
}