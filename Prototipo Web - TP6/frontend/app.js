/**
 * AgendaYA — Interacción con el DOM (frontend mínimo TP6, Grupo 9)
 * Vista Cliente: Módulo 4 (Proceso de Reserva)
 * Vista Administrador: Dashboard + Módulo 6 (Notificaciones)
 *
 * La lógica pura (validaciones, slots, plantillas, métricas) vive en
 * src/logica-negocio.js y se testea con Jest. Acá solo se conecta con la UI.
 * Los textos de MSG salen de las historias de usuario del TP2 para que los
 * tests E2E sean trazables.
 */
(function () {
  "use strict";

  const L = window.LogicaNegocio;
  const {
    validarEmail, validarDNI, validarFormatoCodigo, validarCamposObligatorios, esFechaValida,
    generarSlots, fechaLocalISO, horarioOcupado, calcularVencimiento, estaVencido,
    generarCodigoVerificacion, construirCuerpoPlantilla, detectarVariablesFaltantes,
    nombrePlantillaDuplicado, escaparHtml, formatearNumeroReserva, inicioDeSemana,
    filtrarReservasPorRango, proximaReserva, tiempoRelativo, debeEnviarRecordatorio,
    esUrlImagenValida, renderizarEmailHtml,
  } = L;

  // ============================================================
  // CONFIGURACIÓN Y MENSAJES
  // ============================================================

  const CONFIG = {
    horaInicio: "09:00",
    horaFin: "17:00",
    diasCalendario: 14,          // días que se muestran a partir de mañana
    horasParaConfirmar: 12,      // M06-NF01 / US-08
    duracionToastMs: 4000,
    intervaloRelojMs: 60 * 1000, // refresco de alertas + chequeo de recordatorios
  };

  const ADMIN = { nombre: "Dra. Gómez", email: "dra.gomez@agendaya.com" };
  const REMITENTE_SISTEMA = "no-reply@agendaya.com";

  const MSG = {
    // ---- M04 ----
    eventoNoDisponible: "Este tipo de evento ya no está disponible",                  // US-01-02 E2
    sinFechas: "No hay fechas disponibles para este evento",                          // US-01-05 E2
    sinHorarios: "No hay horarios disponibles para este día.",
    horarioOcupadoAlSeleccionar: "Este horario ya fue reservado. Por favor elegí otro", // US-01-06 E2
    horarioOcupadoAlConfirmar: "Este horario ya fue reservado. Por favor elija otro",  // US-01-03 E3
    horarioPasado: "Ese horario ya no está disponible. Por favor elegí otro.",
    camposFaltantes: (campos) => `Falta completar: ${campos.join(", ")}.`,             // US-01-04 E2
    emailInvalido: "Ingrese un correo electrónico válido",                            // US-01-04 E3
    dniInvalido: "Ingrese un DNI válido (7 u 8 dígitos, sin letras).",
    codigoFormato: "Ingresá el código de 6 dígitos que enviamos a tu correo.",
    codigoIncorrecto: "El código ingresado no es correcto.",
    confirmacionExitosa: (r) =>                                                       // US-01/US-02 M06
      `${nombreCompleto(r)} su reserva ${r.numero}, el día ${formatearFechaLarga(r.fecha)}, a las ${r.hora}, en ${r.lugar}, ha sido confirmada exitosamente.`,
    reservaYaConfirmada: "Esta reserva ya fue confirmada anteriormente. No se volvió a confirmar.", // US-08 E2
    cancelacionExitosa: "Se canceló correctamente la cita",                           // US-02 M04 E1
    citaVencida: (r) => `Su cita número ${r.numero} el día ${formatearFechaLarga(r.fecha)} y ${r.hora} ya expiró`, // US-02 M04 E2
    linkCancelacionUsado: "Este link de cancelación ya fue utilizado.",
    // ---- M06 plantillas ----
    sinPlantillas: "No hay plantillas disponibles en este momento.",                  // US-01-07 E2
    sinResultadosFiltro: "No se encontraron plantillas con los criterios ingresados.",// US-01-02 E4
    obligatoriosCrear: "Los campos Nombre de plantilla, Asunto, Cuerpo y Firma son obligatorios", // US-01-05 E3
    obligatoriosEditar: "Los campos Asunto y Nombre de plantilla son obligatorios",   // US-01-06 E3
    nombreDuplicado: "Ya existe una plantilla con ese nombre. Por favor ingrese un nombre distinto.",
    plantillaCreada: "La plantilla ha sido creada exitosamente",                      // US-01-05 E2
    plantillaActualizada: "La plantilla ha sido actualizada exitosamente",            // US-01-06 E2
    plantillaDuplicada: "La plantilla ha sido duplicada exitosamente.",               // US-01-03 E2
    plantillaEliminada: "La plantilla ha sido eliminada exitosamente.",               // US-01-04 E2
    plantillaEnUso: "No es posible eliminar esta plantilla porque está siendo utilizada actualmente.", // US-01-04 E4
    previewIncompleta: "Debe completar al menos el Asunto y el Cuerpo para previsualizar la plantilla.", // US-01-01 E2
    remitenteInvalido: "Ingrese un correo de remitente válido.",
    imagenInvalida: "La imagen de encabezado debe ser una URL que empiece con http:// o https://.",
    envioIncompleto: "Seleccioná una reserva y una plantilla para continuar.",
    envioVariables: (v) => `No se puede enviar: la plantilla usa variables sin datos (${v.join(", ")}).`,
    moduloExterno: (m) => `Esta funcionalidad corresponde al módulo ${m} (otro equipo).`,
  };

  // Variables disponibles en las plantillas (E-1: formato {{variable}})
  const VARIABLES_PLANTILLA = [
    "nombre_cliente", "fecha_reserva", "hora_reserva", "numero_reserva",
    "nombre_profesional", "modalidad", "lugar",
  ];

  // ============================================================
  // HELPERS
  // ============================================================

  const $ = (id) => document.getElementById(id);
  const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

  function mostrarError(el, texto) { el.textContent = texto; el.hidden = false; }
  function ocultarError(el) { el.textContent = ""; el.hidden = true; }

  function sumarDias(n) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + n);
    return fechaLocalISO(d);
  }
  const hoyISO = () => sumarDias(0);

  function formatearFechaLarga(fechaISO) {
    const d = new Date(fechaISO + "T00:00:00");
    return `${DIAS_SEMANA[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
  }

  function cuandoTexto(fechaISO) {
    if (fechaISO === hoyISO()) return "hoy";
    if (fechaISO === sumarDias(1)) return "mañana";
    if (fechaISO === sumarDias(-1)) return "ayer";
    return `el ${formatearFechaLarga(fechaISO)}`;
  }

  const nombreCompleto = (r) => `${r.nombre} ${r.apellido}`.trim();
  const inicioReserva = (r) => new Date(`${r.fecha}T${r.hora}:00`);

  // ---- Pop-up y toast ----
  const popup = $("popup");
  function mostrarPopup(texto, tipo = "ok") {
    $("popup-mensaje").textContent = texto;
    const icono = $("popup-icono");
    icono.className = `popup-icono ${tipo}`;
    icono.textContent = tipo === "ok" ? "✓" : "!";
    popup.hidden = false;
    $("popup-cerrar").focus();
  }
  $("popup-cerrar").addEventListener("click", () => (popup.hidden = true));

  let toastTimer = null;
  function mostrarToast(texto) {
    $("toast-texto").textContent = texto;
    $("toast").hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ($("toast").hidden = true), CONFIG.duracionToastMs);
  }
  $("toast-cerrar").addEventListener("click", () => ($("toast").hidden = true));

  // ============================================================
  // DATOS EN MEMORIA (simulan la base de datos)
  // ============================================================

  // disponible:false  → simula un evento que dejó de estar disponible (US-01-02 E2)
  // sinFechas:true    → el administrador no configuró disponibilidad (US-01-05 E2)
  const eventTypes = [
    { id: "ev1", nombre: "Consulta inicial", duracion: 30, modalidad: "Presencial", lugar: "Consultorio · Av. Corrientes 1234, CABA", disponible: true },
    { id: "ev2", nombre: "Reunión de consultoría", duracion: 60, modalidad: "Virtual", lugar: "Google Meet", disponible: true },
    { id: "ev3", nombre: "Consulta express", duracion: 15, modalidad: "Virtual", lugar: "Google Meet", disponible: true },
    { id: "ev4", nombre: "Sesión de coaching", duracion: 45, modalidad: "Virtual", lugar: "Zoom", disponible: true, sinFechas: true },
    { id: "ev5", nombre: "Clase de prueba", duracion: 60, modalidad: "Presencial", lugar: "Consultorio · Av. Corrientes 1234, CABA", disponible: false },
  ];
  const eventosOcultos = new Set(); // eventos que el cliente ya descubrió que no están disponibles

  const categoriasBase = [
    { id: "confirmacion", nombre: "Confirmación", desc: "Aviso de reserva confirmada" },
    { id: "cancelacion", nombre: "Cancelación", desc: "Aviso de reserva cancelada" },
    { id: "recordatorio", nombre: "Recordatorio", desc: "Aviso 24 hs antes del turno" },
    { id: "reagendado", nombre: "Reagendado", desc: "Aviso de cambio de horario" },
  ];

  // Plantillas personalizadas del administrador (editables)
  let plantillas = [
    {
      id: "p1", nombre: "Confirmación de reserva", categoria: "confirmacion",
      asunto: "Reserva confirmada: {{numero_reserva}}",
      cuerpo: "Hola {{nombre_cliente}},\n\nTu reserva {{numero_reserva}} para el {{fecha_reserva}} a las {{hora_reserva}} fue confirmada.\nLugar: {{lugar}}\n\nNos vemos pronto.",
      firma: "Equipo AgendaYA", remitente: "", imagen: "", activa: false,
    },
    {
      id: "p2", nombre: "Recordatorio 24hs", categoria: "recordatorio",
      asunto: "Recordatorio: tu turno es mañana",
      cuerpo: "Hola {{nombre_cliente}},\n\nTe recordamos que tu reserva {{numero_reserva}} con {{nombre_profesional}} es el {{fecha_reserva}} a las {{hora_reserva}}.\nTu reserva se encuentra confirmada.",
      firma: "Equipo AgendaYA", remitente: "", imagen: "", activa: false,
    },
    {
      id: "p3", nombre: "Cancelación de reserva", categoria: "cancelacion",
      asunto: "CANCELACIÓN DE RESERVA {{numero_reserva}}",
      cuerpo: "Hola {{nombre_cliente}},\n\nTu reserva {{numero_reserva}} del {{fecha_reserva}} a las {{hora_reserva}} fue cancelada.",
      firma: "Equipo AgendaYA", remitente: "", imagen: "", activa: false,
    },
  ];
  let plantillaIdSeq = 4;

  // Plantillas genéricas del sistema: se usan cuando no hay una personalizada
  // (US-05 / US-07 Escenario 1) o para mails que no son configurables.
  const GENERICAS = {
    verificacion: {
      asunto: "Tu código de verificación",
      cuerpo: "Hola {{nombre_cliente}},\n\nIngresá este código para verificar tu correo: {{codigo}}\nCódigo válido por 12 hs.",
    },
    pendiente: { // US-08
      asunto: "RESERVA PENDIENTE DE CONFIRMACIÓN {{numero_reserva}}",
      cuerpo: "Tu reserva número {{numero_reserva}} día {{fecha_reserva}} y hora {{hora_reserva}} está pendiente de confirmación. Para confirmar haga click en el botón de \"Confirmar Reserva\".\n\nTenés 12 horas para confirmarla.",
    },
    confirmacion_cliente: { // US-02 M06 / US-01 M04
      asunto: "CONFIRMACIÓN DE RESERVA {{numero_reserva}}",
      cuerpo: "Hola {{nombre_cliente}},\n\nTu reserva {{numero_reserva}} para el {{fecha_reserva}} a las {{hora_reserva}} fue confirmada.\nLugar: {{lugar}}",
    },
    confirmacion_admin: { // US-01 M06
      asunto: "NUEVA RESERVA CONFIRMADA {{numero_reserva}}",
      cuerpo: "El cliente {{nombre_cliente}} confirmó la reserva {{numero_reserva}} para el {{fecha_reserva}} a las {{hora_reserva}}.",
    },
    cancelacion_cliente: { // US-07 Escenario 1
      asunto: "CANCELACIÓN DE RESERVA {{numero_reserva}}",
      cuerpo: "Reserva Cancelada\n\nEstimado/a {{nombre_cliente}}, ¡tu reserva fue cancelada!\nGracias por elegir AgendaYA.\nConfirmamos que la cita programada para el día {{fecha_reserva}} a las {{hora_reserva}} (GMT-3, Buenos Aires) fue cancelada.\nEn caso de requerir una reprogramación, podés generar una nueva reserva desde el enlace del profesional. Quedamos a disposición ante cualquier consulta.\n\nReferencia {{numero_reserva}}",
    },
    cancelacion_admin: { // US-04
      asunto: "CANCELACIÓN RESERVA NÚMERO {{numero_reserva}}",
      cuerpo: "Le informamos que la reserva {{numero_reserva}} ha sido cancelada por el cliente {{nombre_cliente}} con fecha {{fecha_reserva}} y hora: {{hora_reserva}}.",
    },
    expiracion: { // US-01 M04 Escenario 2
      asunto: "RESERVA EXPIRADA {{numero_reserva}}",
      cuerpo: "Hola {{nombre_cliente}},\n\nTu reserva {{numero_reserva}} del {{fecha_reserva}} a las {{hora_reserva}} expiró porque no fue confirmada dentro de las 12 horas.",
    },
    recordatorio_cliente: { // US-09
      asunto: "RECORDATORIO DE RESERVA {{numero_reserva}}",
      cuerpo: "Hola {{nombre_cliente}},\n\nTe recordamos tu reserva {{numero_reserva}} con {{nombre_profesional}} el {{fecha_reserva}} a las {{hora_reserva}}.\nTu reserva se encuentra confirmada.",
    },
  };
  // Qué categoría de plantilla personalizada reemplaza a cada genérica
  const CATEGORIA_DE_GENERICA = {
    confirmacion_cliente: "confirmacion",
    cancelacion_cliente: "cancelacion",
    recordatorio_cliente: "recordatorio",
  };

  let reservas = [];
  let reservaSeq = 1;
  let alertas = [];
  let notificacionesEnviadas = [];
  let envioIdSeq = 1;
  const enviosUnicos = new Set(); // "Se envía un único correo para evitar duplicidades"

  function crearReserva(datos) {
    const n = reservaSeq++;
    const ev = eventTypes.find((e) => e.id === datos.eventoId);
    const reserva = {
      id: `r${n}`,
      numero: formatearNumeroReserva(n),
      eventoId: ev.id,
      eventoNombre: ev.nombre,
      modalidad: ev.modalidad,
      lugar: ev.lugar,
      telefono: "",
      codigo: null,
      emailVerificado: false,
      recordatorioEnviado: false,
      fechaEnvioConfirmacion: new Date(),
      ...datos,
    };
    reservas.push(reserva);
    return reserva;
  }

  function registrarAlerta(tipo, reserva, fecha = new Date()) {
    alertas.unshift({ id: `a${alertas.length + 1}`, tipo, reservaId: reserva.id, fecha, leida: false });
  }

  // Datos de ejemplo relativos a "hoy" para que el dashboard tenga contenido
  function cargarDatosDeEjemplo() {
    const ahora = Date.now();
    const seed = [
      [-9, "14:00", "ev3", "Camila", "Herrera", "cancelada"],
      [-8, "11:00", "ev1", "Diego", "Sosa", "completada"],
      [-7, "10:00", "ev2", "Valentina", "Romero", "completada"],
      [-2, "09:30", "ev1", "Lucas", "Fernández", "completada"],
      [-1, "10:00", "ev1", "Pedro", "Ruiz", "completada"],
      [-1, "12:00", "ev3", "Sofía", "Díaz", "completada"],
      [0, "09:00", "ev2", "Laura", "Martínez", "confirmada"],
      [0, "11:00", "ev2", "Juan", "Pérez", "confirmada"],
      [0, "13:00", "ev4", "Carlos", "Gómez", "cancelada"],
      [0, "15:00", "ev5", "María", "López", "pendiente"],
      [1, "16:00", "ev5", "Ana", "Torres", "pendiente"],
    ];
    const creadas = seed.map(([dias, hora, eventoId, nombre, apellido, estado]) =>
      crearReserva({
        eventoId, fecha: sumarDias(dias), hora, nombre, apellido, estado,
        dni: String(30000000 + Math.floor(Math.random() * 9000000)),
        email: `${nombre}.${apellido}@mail.com`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        emailVerificado: estado !== "pendiente",
        fechaEnvioConfirmacion: new Date(ahora - 2 * 60 * 60 * 1000),
      })
    );
    const buscar = (nombre) => creadas.find((r) => r.nombre === nombre);
    registrarAlerta("nueva", buscar("Ana"), new Date(ahora - 60 * 60 * 1000));
    registrarAlerta("cancelacion", buscar("Carlos"), new Date(ahora - 45 * 60 * 1000));
    registrarAlerta("nueva", buscar("María"), new Date(ahora - 10 * 60 * 1000));
  }

  // ============================================================
  // MOTOR DE NOTIFICACIONES (M06)
  // ============================================================

  function variablesDeReserva(reserva, extras = {}) {
    return {
      nombre_cliente: nombreCompleto(reserva),
      fecha_reserva: formatearFechaLarga(reserva.fecha),
      hora_reserva: reserva.hora,
      numero_reserva: reserva.numero,
      nombre_profesional: ADMIN.nombre,
      modalidad: reserva.modalidad,
      lugar: reserva.lugar,
      ...extras,
    };
  }

  /** Construye y registra un correo a partir de una plantilla (personalizada o genérica). */
  function registrarCorreo({ base, plantilla, reserva, destinatario, tipoDestinatario, extras }) {
    const variables = variablesDeReserva(reserva, extras);
    if (plantilla) plantilla.activa = true; // pasa a estar "en uso" (US-01-04 E4)
    const correo = {
      id: `n${envioIdSeq++}`,
      reservaId: reserva.id,
      destinatario,
      tipoDestinatario,
      remitente: base.remitente || REMITENTE_SISTEMA,
      origen: plantilla ? `Plantilla: ${plantilla.nombre}` : "Plantilla genérica del sistema",
      asunto: construirCuerpoPlantilla(base.asunto, variables),
      html: renderizarEmailHtml({
        cuerpo: construirCuerpoPlantilla(base.cuerpo, variables),
        firma: base.firma || "Equipo AgendaYA",
        imagenUrl: base.imagen || "",
      }),
      fecha: new Date(),
    };
    notificacionesEnviadas.unshift(correo);
    return correo;
  }

  /**
   * Envío automático (actor Sistema/Notificador). Cada combinación
   * reserva + tipo + destinatario se envía una sola vez.
   */
  function enviarAutomatico(claveGenerica, reserva, destinatario, tipoDestinatario, extras) {
    const claveUnica = `${reserva.id}|${claveGenerica}|${destinatario}`;
    if (enviosUnicos.has(claveUnica)) return null;
    enviosUnicos.add(claveUnica);

    const categoria = CATEGORIA_DE_GENERICA[claveGenerica];
    const plantilla = categoria ? plantillas.find((p) => p.categoria === categoria) : null; // US-05/07 E2
    const base = plantilla || GENERICAS[claveGenerica];
    return registrarCorreo({ base, plantilla, reserva, destinatario, tipoDestinatario, extras });
  }

  function notificar(evento, reserva) {
    const cliente = (clave, extras) => enviarAutomatico(clave, reserva, reserva.email, "Cliente", extras);
    const admin = (clave) => enviarAutomatico(clave, reserva, ADMIN.email, "Administrador");
    switch (evento) {
      case "verificacion": cliente("verificacion", { codigo: reserva.codigo }); break;
      case "pendiente": cliente("pendiente"); break;
      case "confirmacion": cliente("confirmacion_cliente"); admin("confirmacion_admin"); break;
      case "cancelacion": cliente("cancelacion_cliente"); admin("cancelacion_admin"); break;
      case "expiracion": cliente("expiracion"); break;
      case "recordatorio": cliente("recordatorio_cliente"); break;
    }
    refrescarAdmin();
  }

  // ============================================================
  // NAVEGACIÓN ENTRE VISTAS (Cliente / Admin)
  // ============================================================

  const navCliente = $("nav-cliente");
  const navAdmin = $("nav-admin");

  function cambiarVista(vista) {
    const esAdmin = vista === "admin";
    navAdmin.classList.toggle("active", esAdmin);
    navCliente.classList.toggle("active", !esAdmin);
    $("vista-admin").hidden = !esAdmin;
    $("vista-cliente").hidden = esAdmin;
    if (esAdmin) refrescarAdmin();
  }
  navCliente.addEventListener("click", () => cambiarVista("cliente"));
  navAdmin.addEventListener("click", () => cambiarVista("admin"));

  // ============================================================
  // MÓDULO 4 — PROCESO DE RESERVA (vista cliente)
  // ============================================================

  let eventoSeleccionado = null;
  let fechaSeleccionada = null;
  let horaSeleccionada = null;
  let reservaActualId = null;
  const reservaActual = () => reservas.find((r) => r.id === reservaActualId) || null;

  const pasos = [1, 2, 3, 4].map((n) => $(`paso-${n}`));
  const stepDots = [1, 2, 3, 4].map((n) => document.querySelector(`[data-cy="step-dot-${n}"]`));

  function mostrarPaso(n) {
    pasos.forEach((el, i) => (el.hidden = i !== n - 1));
    stepDots.forEach((dot, i) => {
      dot.classList.remove("step-actual", "step-hecho");
      if (i + 1 < n) dot.classList.add("step-hecho");
      if (i + 1 === n) dot.classList.add("step-actual");
    });
  }

  function resumenTexto(r) {
    return `<strong>${escaparHtml(r.eventoNombre)}</strong>${r.numero ? ` · ${escaparHtml(r.numero)}` : ""}<br>` +
      `${formatearFechaLarga(r.fecha)} · ${escaparHtml(r.hora)} hs<br>${escaparHtml(r.modalidad)} · ${escaparHtml(r.lugar)}`;
  }
  const resumenSeleccion = () => resumenTexto({
    eventoNombre: eventoSeleccionado.nombre, modalidad: eventoSeleccionado.modalidad,
    lugar: eventoSeleccionado.lugar, fecha: fechaSeleccionada, hora: horaSeleccionada,
  });

  // ---- Paso 1: tipos de evento (US-01-01 / US-01-02) ----
  const listaEventos = $("lista-eventos");

  function renderEventos() {
    listaEventos.innerHTML = "";
    const visibles = eventTypes.filter((e) => !eventosOcultos.has(e.id));
    $("error-sin-eventos").hidden = visibles.length !== 0;
    $("evento-no-disponible-wrap").hidden = true;

    visibles.forEach((ev) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "evento-card";
      card.setAttribute("data-cy", `evento-${ev.id}`);
      card.innerHTML = `<div class="evento-nombre">${escaparHtml(ev.nombre)}</div>
        <div class="evento-meta">${ev.duracion} min · ${escaparHtml(ev.modalidad)}</div>`;
      card.addEventListener("click", () => seleccionarEvento(ev.id));
      listaEventos.appendChild(card);
    });
  }

  function seleccionarEvento(id) {
    const ev = eventTypes.find((e) => e.id === id);
    if (!ev) return;

    // US-01-02 E2: el evento dejó de estar disponible
    if (!ev.disponible) {
      eventosOcultos.add(id);
      listaEventos.hidden = true;
      $("error-evento-no-disponible").textContent = MSG.eventoNoDisponible;
      $("evento-no-disponible-wrap").hidden = false;
      return;
    }

    eventoSeleccionado = ev;
    listaEventos.querySelectorAll(".evento-card")
      .forEach((c) => c.classList.toggle("seleccionado", c.dataset.cy === `evento-${id}`));

    // US-01-02 E3: se mantiene el evento elegido en el paso siguiente
    $("evento-seleccionado-titulo").textContent = `${ev.nombre} — elegí fecha y hora`;
    fechaSeleccionada = null;
    limpiarSeleccionHorario();
    horariosWrap.hidden = true;
    ocultarError(errorSinHorarios);
    renderDias();
    mostrarPaso(2);
  }

  $("btn-volver-lista-eventos").addEventListener("click", () => {
    listaEventos.hidden = false;
    renderEventos();
  });
  $("btn-volver-paso1").addEventListener("click", () => mostrarPaso(1));

  // ---- Paso 2: fechas y horarios (US-01-05 / US-01-06) ----
  const diasLista = $("dias-lista");
  const horariosWrap = $("horarios-wrap");
  const horariosLista = $("horarios-lista");
  const errorSinHorarios = $("error-sin-horarios");
  const errorHorarioOcupado = $("error-horario-ocupado");
  const btnConfirmarHorario = $("btn-confirmar-horario");

  function limpiarSeleccionHorario() {
    horaSeleccionada = null;
    btnConfirmarHorario.disabled = true;
    ocultarError(errorHorarioOcupado);
  }

  function renderDias() {
    diasLista.innerHTML = "";
    const errorSinFechas = $("error-sin-fechas");

    // US-01-05 E2: sin disponibilidad configurada para el evento
    if (eventoSeleccionado.sinFechas) {
      mostrarError(errorSinFechas, MSG.sinFechas);
      diasLista.hidden = true;
      return;
    }
    ocultarError(errorSinFechas);
    diasLista.hidden = false;

    // US-01-05 E1: los días no disponibles (fin de semana) se ven bloqueados
    for (let i = 1; i <= CONFIG.diasCalendario; i++) {
      const fecha = sumarDias(i);
      const d = new Date(`${fecha}T12:00:00`);
      const habil = d.getDay() !== 0 && d.getDay() !== 6;
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "dia-chip";
      chip.setAttribute("data-cy", `dia-${fecha}`);
      chip.innerHTML = `${DIAS_SEMANA[d.getDay()]}<span class="dia-num">${d.getDate()}</span>`;
      chip.disabled = !habil;
      if (!habil) chip.title = "Día no disponible";
      chip.addEventListener("click", () => seleccionarDia(fecha));
      diasLista.appendChild(chip);
    }
  }

  function seleccionarDia(fecha) {
    fechaSeleccionada = fecha;
    limpiarSeleccionHorario();
    diasLista.querySelectorAll(".dia-chip")
      .forEach((c) => c.classList.toggle("seleccionado", c.dataset.cy === `dia-${fecha}`));
    renderHorarios();
  }

  function renderHorarios() {
    const slots = generarSlots(CONFIG.horaInicio, CONFIG.horaFin, eventoSeleccionado.duracion);
    horariosLista.innerHTML = "";
    if (slots.length === 0) {
      horariosWrap.hidden = true;
      mostrarError(errorSinHorarios, MSG.sinHorarios);
      return;
    }
    ocultarError(errorSinHorarios);
    horariosWrap.hidden = false;

    slots.forEach((hora) => {
      const ocupado = horarioOcupado(reservas, fechaSeleccionada, hora);
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "horario-chip" + (ocupado ? " ocupado" : "");
      chip.setAttribute("data-cy", `horario-${hora}`);
      chip.textContent = hora;
      chip.disabled = ocupado;
      chip.addEventListener("click", () => seleccionarHorario(hora));
      horariosLista.appendChild(chip);
    });
  }

  function seleccionarHorario(hora) {
    // US-01-06 E2: otro cliente lo reservó mientras se mostraba como libre
    if (horarioOcupado(reservas, fechaSeleccionada, hora)) {
      volverAPaso2ConError(MSG.horarioOcupadoAlSeleccionar);
      return;
    }
    ocultarError(errorHorarioOcupado);
    horaSeleccionada = hora;
    horariosLista.querySelectorAll(".horario-chip")
      .forEach((c) => c.classList.toggle("seleccionado", c.dataset.cy === `horario-${hora}`));
    btnConfirmarHorario.disabled = false;
  }

  function volverAPaso2ConError(mensaje) {
    limpiarSeleccionHorario();
    renderHorarios();
    mostrarError(errorHorarioOcupado, mensaje);
    mostrarPaso(2);
  }

  btnConfirmarHorario.addEventListener("click", () => {
    if (!fechaSeleccionada || !horaSeleccionada) return;
    $("resumen-mini").innerHTML = resumenSeleccion();
    ocultarError(errorFormDatos);
    mostrarPaso(3);
  });
  $("btn-volver-paso2").addEventListener("click", () => mostrarPaso(2));

  // ---- Paso 3: datos personales (US-01-04) y reserva pendiente (US-01-03) ----
  const formDatos = $("form-datos");
  const errorFormDatos = $("error-form-datos");
  const ETIQUETAS_CAMPOS = { nombre: "Nombre", apellido: "Apellido", dni: "DNI", email: "Correo electrónico" };

  function leerDatosCliente() {
    return {
      nombre: $("input-nombre").value.trim(),
      apellido: $("input-apellido").value.trim(),
      dni: $("input-dni").value.trim(),
      email: $("input-email").value.trim(),
      telefono: $("input-telefono").value.trim(),
    };
  }

  function validarFormularioCliente(datos) {
    const faltantes = validarCamposObligatorios(datos, ["nombre", "apellido", "dni", "email"]);
    if (faltantes.length > 0) return MSG.camposFaltantes(faltantes.map((c) => ETIQUETAS_CAMPOS[c]));
    if (!validarDNI(datos.dni)) return MSG.dniInvalido;
    if (!validarEmail(datos.email)) return MSG.emailInvalido; // US-03 M04 E2
    return null;
  }

  formDatos.addEventListener("submit", (e) => {
    e.preventDefault();
    // US-01-03 E2: sin evento, fecha u hora no se crea la reserva
    if (!eventoSeleccionado || !fechaSeleccionada || !horaSeleccionada) {
      mostrarError(errorFormDatos, MSG.camposFaltantes(["Tipo de evento, fecha u hora"]));
      return;
    }
    const datos = leerDatosCliente();
    const error = validarFormularioCliente(datos);
    if (error) {
      mostrarError(errorFormDatos, error);
      return;
    }
    if (!esFechaValida(`${fechaSeleccionada}T${horaSeleccionada}:00`)) {
      volverAPaso2ConError(MSG.horarioPasado);
      return;
    }
    // US-01-03 E3: alguien reservó el horario antes de enviar el formulario
    if (horarioOcupado(reservas, fechaSeleccionada, horaSeleccionada)) {
      volverAPaso2ConError(MSG.horarioOcupadoAlConfirmar);
      return;
    }
    ocultarError(errorFormDatos);

    const reserva = crearReserva({
      eventoId: eventoSeleccionado.id,
      fecha: fechaSeleccionada,
      hora: horaSeleccionada,
      ...datos,
      estado: "pendiente",
      codigo: generarCodigoVerificacion(),
      fechaEnvioConfirmacion: new Date(),
    });
    reservaActualId = reserva.id;
    registrarAlerta("nueva", reserva);
    notificar("verificacion", reserva); // US-03 M04 E1

    $("resumen-final").innerHTML = resumenTexto(reserva);
    $("input-codigo").value = "";
    ocultarError(errorCodigo);
    $("codigo-demo-hint").textContent = `(Simulación) código enviado a tu correo: ${reserva.codigo}`;
    mostrarEstado("estado-pendiente");
    mostrarPaso(4);
    formDatos.reset();
  });

  // ---- Paso 4 ----
  const ESTADOS_VISTA = ["estado-pendiente", "estado-verificado", "estado-confirmada", "estado-expirado", "estado-cancelada"];
  const errorCodigo = $("error-codigo");
  const mostrarEstado = (id) => ESTADOS_VISTA.forEach((e) => ($(e).hidden = e !== id));

  /** M06-NF01 / US-01 M04 E2: vencidas las 12 hs, la reserva expira y se avisa por mail. */
  function expirarSiCorresponde(reserva) {
    if (reserva.estado !== "pendiente") return false;
    const vencimiento = calcularVencimiento(reserva.fechaEnvioConfirmacion, CONFIG.horasParaConfirmar);
    if (!estaVencido(vencimiento)) return false;
    reserva.estado = "expirada";
    notificar("expiracion", reserva);
    mostrarEstado("estado-expirado");
    return true;
  }

  $("btn-verificar-codigo").addEventListener("click", () => {
    const reserva = reservaActual();
    if (!reserva || expirarSiCorresponde(reserva)) return;
    const ingresado = $("input-codigo").value.trim();
    if (!validarFormatoCodigo(ingresado)) return mostrarError(errorCodigo, MSG.codigoFormato);
    if (ingresado !== reserva.codigo) return mostrarError(errorCodigo, MSG.codigoIncorrecto);
    ocultarError(errorCodigo);
    reserva.emailVerificado = true;
    notificar("pendiente", reserva); // US-08 E1: mail con botón "Confirmar Reserva"
    mostrarEstado("estado-verificado");
  });

  $("btn-simular-link-confirmacion").addEventListener("click", () => {
    const reserva = reservaActual();
    if (!reserva || expirarSiCorresponde(reserva)) return;
    if (reserva.estado === "confirmada") return mostrarPopup(MSG.reservaYaConfirmada, "error");

    reserva.estado = "confirmada";
    $("resumen-confirmada").innerHTML = resumenTexto(reserva);
    mostrarEstado("estado-confirmada");
    notificar("confirmacion", reserva);          // US-01 / US-02 M06
    mostrarPopup(MSG.confirmacionExitosa(reserva), "ok");
  });

  // US-08 E2 / US-01-02 M06: reabrir el link no reconfirma ni reenvía mails
  $("btn-reabrir-link-confirmacion").addEventListener("click", () => {
    mostrarPopup(MSG.reservaYaConfirmada, "error");
  });

  // ---- Cancelación (US-02 M04) ----
  const modalCancelar = $("modal-cancelar");

  $("btn-cancelar-reserva").addEventListener("click", () => {
    const reserva = reservaActual();
    if (!reserva) return;
    // E2: la fecha y hora de la cita ya pasaron
    if (inicioReserva(reserva).getTime() <= Date.now()) {
      mostrarPopup(MSG.citaVencida(reserva), "error");
      return;
    }
    document.querySelector('[data-cy="cancelar-detalle-cliente"]').textContent = nombreCompleto(reserva);
    document.querySelector('[data-cy="cancelar-detalle-fecha"]').textContent = `${formatearFechaLarga(reserva.fecha)} · ${reserva.hora} hs`;
    document.querySelector('[data-cy="cancelar-detalle-anfitrion"]').textContent = ADMIN.nombre;
    document.querySelector('[data-cy="cancelar-detalle-ubicacion"]').textContent = reserva.lugar;
    modalCancelar.hidden = false;
  });

  $("btn-mantener-reserva").addEventListener("click", () => (modalCancelar.hidden = true));

  $("btn-confirmar-cancelacion").addEventListener("click", () => {
    const reserva = reservaActual();
    if (!reserva) return;
    reserva.estado = "cancelada"; // el horario vuelve a estar disponible
    modalCancelar.hidden = true;
    mostrarEstado("estado-cancelada");
    registrarAlerta("cancelacion", reserva);
    notificar("cancelacion", reserva); // US-04 y US-07
    mostrarPopup(MSG.cancelacionExitosa, "ok");
  });

  // El link de cancelación queda inutilizable después del primer uso
  $("btn-reabrir-link-cancelacion").addEventListener("click", () => {
    mostrarPopup(MSG.linkCancelacionUsado, "error");
  });

  ["btn-nueva-reserva-1", "btn-nueva-reserva-2", "btn-nueva-reserva-3"].forEach((id) =>
    $(id).addEventListener("click", () => {
      eventoSeleccionado = null;
      fechaSeleccionada = null;
      reservaActualId = null;
      limpiarSeleccionHorario();
      $("codigo-demo-hint").textContent = "";
      listaEventos.hidden = false;
      renderEventos();
      mostrarPaso(1);
    })
  );

  // ============================================================
  // VISTA ADMINISTRADOR — navegación
  // ============================================================

  const SECCIONES = ["dashboard", "disponibilidad", "tipos-evento", "agenda", "mensajes", "configuracion"];
  let seccionActual = "dashboard";

  function irASeccion(seccion) {
    seccionActual = seccion;
    SECCIONES.forEach((s) => ($(`seccion-${s}`).hidden = s !== seccion));
    document.querySelectorAll(".admin-nav-btn")
      .forEach((b) => b.classList.toggle("active", b.dataset.seccion === seccion));
    refrescarAdmin();
  }

  document.querySelectorAll(".admin-nav-btn").forEach((b) =>
    b.addEventListener("click", () => irASeccion(b.dataset.seccion))
  );
  document.querySelectorAll("[data-ir]").forEach((b) =>
    b.addEventListener("click", () => {
      irASeccion(b.dataset.ir);
      if (b.dataset.ir === "mensajes") cambiarTabMensajes("plantillas");
    })
  );
  $("btn-ver-agenda-completa").addEventListener("click", () => irASeccion("agenda"));

  function refrescarAdmin() {
    renderBadge();
    if (seccionActual === "dashboard") renderDashboard();
    if (seccionActual === "agenda") renderAgendaCompleta();
    if (seccionActual === "tipos-evento") renderTiposEvento();
    if (seccionActual === "mensajes") {
      if (tabMensajes === "plantillas") renderTablaPlantillas();
      else { poblarSelectsEnvio(); renderTablaEnviadas(); }
    }
  }

  // ---- Topbar: alertas, menú de usuario, ayuda ----
  function renderBadge() {
    const noLeidas = alertas.filter((a) => !a.leida).length;
    const badge = $("badge-alertas");
    badge.textContent = noLeidas > 9 ? "9+" : String(noLeidas);
    badge.hidden = noLeidas === 0;
  }

  $("btn-notificaciones").addEventListener("click", () => {
    alertas.forEach((a) => (a.leida = true));
    mostrarTodasLasAlertas = true;
    irASeccion("dashboard");
    document.querySelector('[data-cy="card-alertas"]').scrollIntoView({ behavior: "smooth", block: "center" });
  });

  const dropdownUsuario = $("dropdown-usuario");
  $("btn-menu-usuario").addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownUsuario.hidden = !dropdownUsuario.hidden;
    $("btn-menu-usuario").setAttribute("aria-expanded", String(!dropdownUsuario.hidden));
  });
  dropdownUsuario.querySelectorAll("button").forEach((b) =>
    b.addEventListener("click", () => {
      dropdownUsuario.hidden = true;
      mostrarToast(MSG.moduloExterno(b.dataset.modulo));
    })
  );
  $("btn-centro-ayuda").addEventListener("click", () => mostrarToast("El centro de ayuda no forma parte de este prototipo."));

  // ---- Buscador global ----
  const buscador = $("buscador-global");
  const resultados = $("buscador-resultados");

  function renderResultadosBusqueda() {
    const q = buscador.value.trim().toLowerCase();
    if (q.length < 2) { resultados.hidden = true; return; }

    const encontradasReservas = reservas.filter((r) =>
      [nombreCompleto(r), r.eventoNombre, r.numero].some((t) => t.toLowerCase().includes(q))
    ).slice(0, 6);
    const encontradasPlantillas = plantillas.filter((p) => p.nombre.toLowerCase().includes(q)).slice(0, 4);

    resultados.innerHTML = "";
    if (!encontradasReservas.length && !encontradasPlantillas.length) {
      resultados.innerHTML = `<p class="sin-resultados" data-cy="buscador-sin-resultados">Sin resultados para “${escaparHtml(buscador.value.trim())}”.</p>`;
    }
    encontradasReservas.forEach((r) => {
      const b = document.createElement("button");
      b.setAttribute("data-cy", `resultado-reserva-${r.id}`);
      b.innerHTML = `<span class="resultado-tipo">Reserva ${escaparHtml(r.numero)}</span>${escaparHtml(nombreCompleto(r))} · ${escaparHtml(r.eventoNombre)} · ${formatearFechaLarga(r.fecha)} ${escaparHtml(r.hora)}`;
      b.addEventListener("click", () => {
        cerrarBusqueda();
        irASeccion("agenda");
        const fila = document.querySelector(`[data-cy="agenda-fila-${r.id}"]`);
        if (fila) { fila.classList.add("destacada"); fila.scrollIntoView({ block: "center" }); }
      });
      resultados.appendChild(b);
    });
    encontradasPlantillas.forEach((p) => {
      const b = document.createElement("button");
      b.setAttribute("data-cy", `resultado-plantilla-${p.id}`);
      b.innerHTML = `<span class="resultado-tipo">Plantilla</span>${escaparHtml(p.nombre)}`;
      b.addEventListener("click", () => {
        cerrarBusqueda();
        irASeccion("mensajes");
        cambiarTabMensajes("plantillas");
        abrirModalPlantilla("editar", p.id);
      });
      resultados.appendChild(b);
    });
    resultados.hidden = false;
  }
  function cerrarBusqueda() { resultados.hidden = true; buscador.value = ""; }
  buscador.addEventListener("input", renderResultadosBusqueda);
  buscador.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarBusqueda(); });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".buscador")) resultados.hidden = true;
    if (!e.target.closest(".menu-usuario")) dropdownUsuario.hidden = true;
  });

  // ============================================================
  // DASHBOARD
  // ============================================================

  const ESTADO_LABEL = {
    pendiente: "Pendiente", confirmada: "Confirmada", cancelada: "Cancelada",
    expirada: "Expirada", completada: "Completada",
  };
  const badgeEstado = (estado) =>
    `<span class="estado-badge estado-${estado}" data-cy="estado-${estado}">${ESTADO_LABEL[estado] || estado}</span>`;

  function textoDelta(diferencia, referencia) {
    if (diferencia > 0) return { texto: `↑ +${diferencia} vs. ${referencia}`, clase: "" };
    if (diferencia < 0) return { texto: `↓ ${diferencia} vs. ${referencia}`, clase: "negativo" };
    return { texto: `= igual que ${referencia}`, clase: "neutro" };
  }
  function pintarDelta(el, { texto, clase }) {
    el.textContent = texto;
    el.className = `kpi-delta ${clase}`.trim();
  }

  let mostrarTodasLasAlertas = false;

  function renderDashboard() {
    const hoy = hoyISO();
    const ayer = sumarDias(-1);

    // KPI: reservas de hoy (activas: sin canceladas ni expiradas)
    const cantHoy = filtrarReservasPorRango(reservas, hoy, hoy).length;
    const cantAyer = filtrarReservasPorRango(reservas, ayer, ayer).length;
    $("kpi-hoy").textContent = cantHoy;
    pintarDelta($("kpi-hoy-delta"), textoDelta(cantHoy - cantAyer, "ayer"));

    // KPI: reservas de la semana (lunes a domingo)
    const lunes = inicioDeSemana(hoy);
    const domingo = fechaDesplazada(lunes, 6);
    const lunesAnterior = fechaDesplazada(lunes, -7);
    const domingoAnterior = fechaDesplazada(lunes, -1);
    const cantSemana = filtrarReservasPorRango(reservas, lunes, domingo).length;
    const cantSemanaAnterior = filtrarReservasPorRango(reservas, lunesAnterior, domingoAnterior).length;
    $("kpi-semana").textContent = cantSemana;
    pintarDelta($("kpi-semana-delta"), textoDelta(cantSemana - cantSemanaAnterior, "semana anterior"));

    // KPI: próxima reserva
    const proxima = proximaReserva(reservas, new Date());
    $("kpi-proxima-hora").textContent = proxima ? proxima.hora : "—";
    $("kpi-proxima-cliente").textContent = proxima ? nombreCompleto(proxima) : "Sin reservas próximas";
    $("kpi-proxima-evento").textContent = !proxima ? ""
      : proxima.fecha === hoy ? proxima.eventoNombre
      : `${proxima.eventoNombre} · ${formatearFechaLarga(proxima.fecha)}`;

    renderAlertas();
    renderAgendaHoy();
  }

  function fechaDesplazada(fechaISO, dias) {
    const d = new Date(`${fechaISO}T12:00:00`);
    d.setDate(d.getDate() + dias);
    return fechaLocalISO(d);
  }

  function renderAlertas() {
    const lista = $("lista-alertas");
    const visibles = mostrarTodasLasAlertas ? alertas : alertas.slice(0, 3);
    lista.innerHTML = "";
    $("msg-sin-alertas").hidden = alertas.length !== 0;
    $("btn-ver-todas-alertas").textContent = mostrarTodasLasAlertas ? "Ver menos" : "Ver todas";
    $("btn-ver-todas-alertas").hidden = alertas.length <= 3;

    visibles.forEach((a) => {
      const r = reservas.find((x) => x.id === a.reservaId);
      if (!r) return;
      const esNueva = a.tipo === "nueva";
      const li = document.createElement("li");
      li.className = "alerta";
      li.setAttribute("data-cy", `alerta-${a.id}`);
      li.innerHTML = `
        <span class="alerta-icono ${a.tipo}" aria-hidden="true">${esNueva ? "✓" : "✕"}</span>
        <div class="alerta-cuerpo">
          <div class="alerta-titulo">
            <span data-cy="alerta-titulo-${a.id}">${esNueva ? "Nueva reserva recibida" : "Reserva cancelada"}</span>
            <span class="alerta-tiempo">${tiempoRelativo(a.fecha)}</span>
          </div>
          <p class="alerta-texto">${escaparHtml(nombreCompleto(r))} ${esNueva ? "reservó" : "canceló"} “${escaparHtml(r.eventoNombre)}” ${esNueva ? "para" : "programada para"} ${cuandoTexto(r.fecha)} a las ${escaparHtml(r.hora)}.</p>
        </div>`;
      lista.appendChild(li);
    });
  }
  $("btn-ver-todas-alertas").addEventListener("click", () => {
    mostrarTodasLasAlertas = !mostrarTodasLasAlertas;
    renderAlertas();
  });

  function filaReserva(r, conFecha) {
    const tr = document.createElement("tr");
    tr.setAttribute("data-cy", `${conFecha ? "agenda-fila" : "agenda-hoy-fila"}-${r.id}`);
    tr.innerHTML = (conFecha ? `<td>${escaparHtml(r.numero)}</td><td>${formatearFechaLarga(r.fecha)}</td>` : "") +
      `<td>${escaparHtml(r.hora)}</td><td>${escaparHtml(r.eventoNombre)}</td>` +
      `<td>${escaparHtml(nombreCompleto(r))}</td><td>${badgeEstado(r.estado)}</td>`;
    return tr;
  }

  const ordenarPorFechaHora = (a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora);

  function renderAgendaHoy() {
    const hoy = hoyISO();
    const deHoy = reservas.filter((r) => r.fecha === hoy && r.estado !== "expirada").sort(ordenarPorFechaHora);
    const tbody = $("tbody-agenda-hoy");
    tbody.innerHTML = "";
    deHoy.forEach((r) => tbody.appendChild(filaReserva(r, false)));
    $("msg-sin-agenda-hoy").hidden = deHoy.length !== 0;
  }

  function renderAgendaCompleta() {
    const tbody = $("tbody-agenda-completa");
    tbody.innerHTML = "";
    [...reservas].sort(ordenarPorFechaHora).reverse().forEach((r) => tbody.appendChild(filaReserva(r, true)));
  }

  function renderTiposEvento() {
    const tbody = $("tbody-tipos-evento");
    tbody.innerHTML = "";
    eventTypes.forEach((ev) => {
      const tr = document.createElement("tr");
      tr.setAttribute("data-cy", `tipo-evento-${ev.id}`);
      const estado = !ev.disponible ? "No disponible" : ev.sinFechas ? "Sin disponibilidad configurada" : "Activo";
      tr.innerHTML = `<td>${escaparHtml(ev.nombre)}</td><td>${ev.duracion} min</td><td>${escaparHtml(ev.modalidad)}</td><td>${escaparHtml(ev.lugar)}</td><td>${estado}</td>`;
      tbody.appendChild(tr);
    });
  }

  // ============================================================
  // MENSAJES — MÓDULO 6
  // ============================================================

  let tabMensajes = "plantillas";
  const tabPlantillas = $("tab-plantillas");
  const tabEnviadas = $("tab-enviadas");

  function cambiarTabMensajes(tab) {
    tabMensajes = tab;
    const esPlantillas = tab === "plantillas";
    tabPlantillas.classList.toggle("active", esPlantillas);
    tabEnviadas.classList.toggle("active", !esPlantillas);
    $("panel-plantillas").hidden = !esPlantillas;
    $("panel-enviadas").hidden = esPlantillas;
    refrescarAdmin();
  }
  tabPlantillas.addEventListener("click", () => cambiarTabMensajes("plantillas"));
  tabEnviadas.addEventListener("click", () => cambiarTabMensajes("enviadas"));

  // ---- Listado / filtros (US-01-07 / US-01-02) ----
  const tablaPlantillas = $("tabla-plantillas");
  const msgSinPlantillas = $("msg-sin-plantillas");
  const filtroNombre = $("filtro-nombre");
  const filtroCategoria = $("filtro-categoria");
  const errorPlantillas = $("error-plantillas");

  const nombreCategoria = (id) => (categoriasBase.find((c) => c.id === id) || { nombre: id }).nombre;

  function renderTablaPlantillas() {
    const texto = filtroNombre.value.trim().toLowerCase();
    const categoria = filtroCategoria.value;
    const filtradas = plantillas.filter(
      (p) => (!texto || p.nombre.toLowerCase().includes(texto)) && (!categoria || p.categoria === categoria)
    );

    tablaPlantillas.innerHTML = "";
    if (filtradas.length === 0) {
      msgSinPlantillas.textContent = plantillas.length === 0 ? MSG.sinPlantillas : MSG.sinResultadosFiltro;
      msgSinPlantillas.hidden = false;
    } else {
      msgSinPlantillas.hidden = true;
    }

    filtradas.forEach((p) => {
      const row = document.createElement("div");
      row.className = "plantilla-row";
      row.setAttribute("data-cy", `plantilla-row-${p.id}`);
      row.dataset.id = p.id;
      row.innerHTML = `
        <div class="plantilla-info">
          <div class="plantilla-nombre" data-cy="plantilla-nombre-${p.id}">${escaparHtml(p.nombre)}${
            p.activa ? ` · <small data-cy="plantilla-en-uso-${p.id}">en uso</small>` : ""}</div>
          <span class="plantilla-categoria">${escaparHtml(nombreCategoria(p.categoria))}</span>
        </div>
        <div class="plantilla-acciones">
          <button type="button" data-cy="btn-editar-${p.id}" data-accion="editar">Editar</button>
          <button type="button" data-cy="btn-duplicar-${p.id}" data-accion="duplicar">Duplicar</button>
          <button type="button" data-cy="btn-previsualizar-${p.id}" data-accion="previsualizar">Previsualizar</button>
          <button type="button" data-cy="btn-eliminar-${p.id}" data-accion="eliminar" class="accion-eliminar">Eliminar</button>
        </div>`;
      tablaPlantillas.appendChild(row);
    });
  }

  tablaPlantillas.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-accion]");
    if (!btn) return;
    const id = btn.closest(".plantilla-row").dataset.id;
    ocultarError(errorPlantillas);
    const acciones = {
      editar: () => abrirModalPlantilla("editar", id),
      duplicar: () => abrirModalPlantilla("duplicar", id),
      previsualizar: () => { abrirModalPlantilla("editar", id); previsualizarPlantilla(); },
      eliminar: () => intentarEliminarPlantilla(id),
    };
    acciones[btn.dataset.accion]();
  });
  filtroNombre.addEventListener("input", renderTablaPlantillas);          // US-01-02 E1: tiempo real
  filtroCategoria.addEventListener("change", renderTablaPlantillas);

  // ---- Modal crear / editar / duplicar ----
  const modalPlantilla = $("modal-plantilla");
  const selectorCategoriaWrap = $("selector-categoria-wrap");
  const formPlantilla = $("form-plantilla");
  const errorFormPlantilla = $("error-form-plantilla");
  const previewPlantilla = $("preview-plantilla");
  const campos = {
    nombre: $("pl-nombre"), asunto: $("pl-asunto"), cuerpo: $("pl-cuerpo"),
    firma: $("pl-firma"), remitente: $("pl-remitente"), imagen: $("pl-imagen"),
  };
  let modoPlantilla = "crear";
  let plantillaEditandoId = null;
  let categoriaSeleccionada = null;

  const leerFormPlantilla = () =>
    Object.fromEntries(Object.entries(campos).map(([k, el]) => [k, el.value.trim()]));

  function cargarFormPlantilla(valores) {
    Object.entries(campos).forEach(([k, el]) => (el.value = valores[k] || ""));
    ocultarError(errorFormPlantilla);
    previewPlantilla.hidden = true;
  }

  // Chips de variables: insertan {{variable}} en el cuerpo donde está el cursor
  VARIABLES_PLANTILLA.forEach((v) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip-variable";
    chip.textContent = `{{${v}}}`;
    chip.setAttribute("data-cy", `variable-${v}`);
    chip.addEventListener("click", () => {
      const ta = campos.cuerpo;
      const ini = ta.selectionStart ?? ta.value.length;
      const fin = ta.selectionEnd ?? ta.value.length;
      ta.value = ta.value.slice(0, ini) + `{{${v}}}` + ta.value.slice(fin);
      ta.focus();
      ta.selectionStart = ta.selectionEnd = ini + v.length + 4;
    });
    $("variables-chips").appendChild(chip);
  });

  categoriasBase.forEach((c) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "categoria-card";
    btn.setAttribute("data-cy", `categoria-${c.id}`);
    btn.innerHTML = `<strong>${escaparHtml(c.nombre)}</strong><span>${escaparHtml(c.desc)}</span>`;
    btn.addEventListener("click", () => {
      categoriaSeleccionada = c.id;
      selectorCategoriaWrap.hidden = true;
      formPlantilla.hidden = false;
      cargarFormPlantilla({});
      campos.nombre.focus();
    });
    $("categorias-grid").appendChild(btn);
  });

  function abrirModalPlantilla(modo, id) {
    modoPlantilla = modo;
    const titulos = { crear: "Nueva plantilla", editar: "Editar plantilla", duplicar: "Duplicar plantilla" };
    $("modal-plantilla-titulo").textContent = titulos[modo];
    // En edición solo Nombre y Asunto son obligatorios (US-01-06)
    $("pl-cuerpo-req").hidden = modo === "editar";
    $("pl-firma-req").hidden = modo === "editar";

    if (modo === "crear") { // US-01-05 E1: primero la categoría
      plantillaEditandoId = null;
      categoriaSeleccionada = null;
      selectorCategoriaWrap.hidden = false;
      formPlantilla.hidden = true;
      cargarFormPlantilla({});
    } else {
      const p = plantillas.find((pl) => pl.id === id);
      if (!p) return;
      plantillaEditandoId = modo === "editar" ? id : null;
      categoriaSeleccionada = p.categoria;
      selectorCategoriaWrap.hidden = true;
      formPlantilla.hidden = false;
      // US-01-03 E1: duplicar precarga todo con "Copia de [nombre original]"
      cargarFormPlantilla(modo === "duplicar" ? { ...p, nombre: `Copia de ${p.nombre}` } : p);
    }
    modalPlantilla.hidden = false;
  }

  $("btn-crear-plantilla").addEventListener("click", () => { ocultarError(errorPlantillas); abrirModalPlantilla("crear"); });
  $("btn-cerrar-plantilla").addEventListener("click", () => (modalPlantilla.hidden = true));
  $("btn-cancelar-categoria").addEventListener("click", () => (modalPlantilla.hidden = true));

  // ---- Previsualización (US-01-01) ----
  const DATOS_EJEMPLO = {
    nombre_cliente: "Carlos Mendoza", fecha_reserva: "Jue 24 de oct", hora_reserva: "14:30",
    numero_reserva: "RES-0042", nombre_profesional: ADMIN.nombre, modalidad: "Virtual", lugar: "Google Meet",
  };

  function previsualizarPlantilla() {
    const d = leerFormPlantilla();
    if (!d.asunto || !d.cuerpo) {
      mostrarError(errorFormPlantilla, MSG.previewIncompleta);
      previewPlantilla.hidden = true;
      return;
    }
    ocultarError(errorFormPlantilla);
    const faltantes = detectarVariablesFaltantes(`${d.asunto}\n${d.cuerpo}`, DATOS_EJEMPLO);
    previewPlantilla.querySelector('[data-cy="preview-asunto"]').textContent =
      `Asunto: ${construirCuerpoPlantilla(d.asunto, DATOS_EJEMPLO)}`;
    previewPlantilla.querySelector('[data-cy="preview-cuerpo"]').innerHTML = renderizarEmailHtml({
      cuerpo: construirCuerpoPlantilla(d.cuerpo, DATOS_EJEMPLO), firma: d.firma, imagenUrl: d.imagen,
    });
    const avisoFaltantes = previewPlantilla.querySelector('[data-cy="preview-variables-faltantes"]');
    avisoFaltantes.textContent = faltantes.length ? `Variables sin datos de ejemplo: ${faltantes.join(", ")}` : "";
    avisoFaltantes.hidden = faltantes.length === 0;
    previewPlantilla.hidden = false;
  }
  $("btn-previsualizar").addEventListener("click", previsualizarPlantilla);
  // US-01-01 E3: cerrar vuelve al formulario sin tocar los datos
  $("btn-cerrar-previsualizacion").addEventListener("click", () => (previewPlantilla.hidden = true));

  // ---- Guardar ----
  formPlantilla.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = leerFormPlantilla();
    const editando = modoPlantilla === "editar";

    const obligatorios = editando ? ["nombre", "asunto"] : ["nombre", "asunto", "cuerpo", "firma"];
    if (validarCamposObligatorios(d, obligatorios).length > 0) {
      return mostrarError(errorFormPlantilla, editando ? MSG.obligatoriosEditar : MSG.obligatoriosCrear);
    }
    if (nombrePlantillaDuplicado(d.nombre, plantillas, plantillaEditandoId)) {
      return mostrarError(errorFormPlantilla, MSG.nombreDuplicado);
    }
    if (d.remitente && !validarEmail(d.remitente)) return mostrarError(errorFormPlantilla, MSG.remitenteInvalido);
    if (d.imagen && !esUrlImagenValida(d.imagen)) return mostrarError(errorFormPlantilla, MSG.imagenInvalida);
    ocultarError(errorFormPlantilla);

    if (editando) {
      Object.assign(plantillas.find((pl) => pl.id === plantillaEditandoId), d);
      mostrarToast(MSG.plantillaActualizada);
    } else {
      plantillas.push({ id: `p${plantillaIdSeq++}`, categoria: categoriaSeleccionada || "confirmacion", activa: false, ...d });
      mostrarToast(modoPlantilla === "duplicar" ? MSG.plantillaDuplicada : MSG.plantillaCreada);
    }
    modalPlantilla.hidden = true;
    renderTablaPlantillas();
  });

  // ---- Eliminar (US-01-04) ----
  const modalEliminar = $("modal-eliminar-plantilla");
  let plantillaAEliminarId = null;

  function intentarEliminarPlantilla(id) {
    const p = plantillas.find((pl) => pl.id === id);
    if (!p) return;
    // E4: si está en uso, se informa al presionar "Eliminar" (sin pedir confirmación)
    if (p.activa) return mostrarError(errorPlantillas, MSG.plantillaEnUso);
    plantillaAEliminarId = id;
    modalEliminar.hidden = false; // E1
  }
  $("btn-cancelar-eliminar").addEventListener("click", () => (modalEliminar.hidden = true)); // E3
  $("btn-si-eliminar").addEventListener("click", () => { // E2
    plantillas = plantillas.filter((pl) => pl.id !== plantillaAEliminarId);
    modalEliminar.hidden = true;
    renderTablaPlantillas();
    mostrarToast(MSG.plantillaEliminada);
  });

  // ---- Simular envío + historial ----
  const selectReserva = $("select-reserva");
  const selectPlantillaEnvio = $("select-plantilla-envio");
  const errorSimularEnvio = $("error-simular-envio");

  function poblarSelect(select, placeholder, items, toOption) {
    const previo = select.value;
    select.innerHTML = "";
    select.appendChild(new Option(placeholder, ""));
    items.forEach((it) => { const { value, text } = toOption(it); select.appendChild(new Option(text, value)); });
    if ([...select.options].some((o) => o.value === previo)) select.value = previo;
  }

  function poblarSelectsEnvio() {
    poblarSelect(selectReserva, "Seleccioná una reserva...", [...reservas].sort(ordenarPorFechaHora), (r) => ({
      value: r.id, text: `${r.numero} · ${nombreCompleto(r)} — ${formatearFechaLarga(r.fecha)} ${r.hora}hs (${ESTADO_LABEL[r.estado]})`,
    }));
    poblarSelect(selectPlantillaEnvio, "Seleccioná una plantilla...", plantillas, (p) => ({
      value: p.id, text: `${p.nombre} (${nombreCategoria(p.categoria)})`,
    }));
  }

  $("btn-simular-envio").addEventListener("click", () => {
    const reserva = reservas.find((r) => r.id === selectReserva.value);
    const plantilla = plantillas.find((p) => p.id === selectPlantillaEnvio.value);
    if (!reserva || !plantilla) return mostrarError(errorSimularEnvio, MSG.envioIncompleto);

    const faltantes = detectarVariablesFaltantes(`${plantilla.asunto}\n${plantilla.cuerpo}`, variablesDeReserva(reserva));
    if (faltantes.length > 0) return mostrarError(errorSimularEnvio, MSG.envioVariables(faltantes));
    ocultarError(errorSimularEnvio);

    registrarCorreo({ base: plantilla, plantilla, reserva, destinatario: reserva.email, tipoDestinatario: "Cliente" });
    renderTablaEnviadas();
    mostrarToast("Notificación enviada correctamente");
  });

  function renderTablaEnviadas() {
    const tabla = $("tabla-enviadas");
    tabla.innerHTML = "";
    $("msg-sin-enviadas").hidden = notificacionesEnviadas.length !== 0;
    notificacionesEnviadas.forEach((n) => {
      const row = document.createElement("div");
      row.className = "enviada-row";
      row.setAttribute("data-cy", `enviada-${n.id}`);
      row.innerHTML = `
        <div class="enviada-asunto" data-cy="enviada-asunto-${n.id}">${escaparHtml(n.asunto)}</div>
        <div class="enviada-meta" data-cy="enviada-destinatario-${n.id}">Para: ${escaparHtml(n.destinatario)} (${n.tipoDestinatario}) · De: ${escaparHtml(n.remitente)} · ${n.fecha.toLocaleString("es-AR")}</div>
        <div class="enviada-meta">${escaparHtml(n.origen)}</div>
        <details data-cy="enviada-detalle-${n.id}"><summary>Ver correo</summary><div>${n.html}</div></details>`;
      tabla.appendChild(row);
    });
  }

  // ============================================================
  // RELOJ DEL SISTEMA: recordatorios 24 hs (US-09) + refresco de alertas
  // ============================================================

  function tickSistema() {
    const ahora = new Date();
    reservas.forEach((r) => {
      if (debeEnviarRecordatorio(r, ahora)) {
        r.recordatorioEnviado = true;
        notificar("recordatorio", r);
      }
    });
    if (!$("vista-admin").hidden) refrescarAdmin();
  }

  // ============================================================
  // Cerrar modales / menús con Escape
  // ============================================================

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    [modalCancelar, modalPlantilla, modalEliminar, popup].forEach((m) => (m.hidden = true));
    dropdownUsuario.hidden = true;
  });

  // ============================================================
  // GANCHO DE TESTING (solo simulación)
  // Permite a Cypress simular a "otro cliente" reservando un horario
  // para probar US-01-06 E2 y US-01-03 E3 desde un único navegador:
  //   cy.window().then((w) => w.AgendaYADemo.reservarComoOtroCliente(fecha, hora))
  // ============================================================

  window.AgendaYADemo = {
    reservarComoOtroCliente(fecha, hora, eventoId = "ev1") {
      return crearReserva({
        eventoId, fecha, hora, nombre: "Otro", apellido: "Cliente",
        dni: "30111222", email: "otro.cliente@mail.com", estado: "confirmada", emailVerificado: true,
      }).id;
    },
  };

  // ============================================================
  // INICIALIZACIÓN
  // ============================================================

  cargarDatosDeEjemplo();
  renderEventos();
  mostrarPaso(1);
  cambiarTabMensajes("plantillas");
  irASeccion("dashboard");
  tickSistema();
  setInterval(tickSistema, CONFIG.intervaloRelojMs);
})();
