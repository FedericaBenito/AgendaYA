package agendaya.service;

import agendaya.model.EstadoReserva;
import agendaya.model.Reserva;

import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;


public class ReservaService {

    private static final Duration PLAZO_CONFIRMACION = Duration.ofHours(12);
    private static final DateTimeFormatter FECHA_FORMATO = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter HORA_FORMATO = DateTimeFormatter.ofPattern("HH:mm");

    private final MailService mailService;
    private final Clock clock;
    private final List<Reserva> reservas = new ArrayList<>();
    private final Random random = new Random(42);

    public ReservaService(MailService mailService) {
        this(mailService, Clock.systemDefaultZone());
    }

    public ReservaService(MailService mailService, Clock clock) {
        this.mailService = mailService;
        this.clock = clock;
    }

    public void registrarReserva(Reserva reserva) {
        reservas.add(reserva);
    }

    public Reserva buscarPorLinkConfirmacion(String link) {
        return reservas.stream()
                .filter(r -> link.equals(r.getLinkConfirmacion()))
                .findFirst()
                .orElse(null);
    }

    public Reserva buscarPorLinkCancelacion(String link) {
        return reservas.stream()
                .filter(r -> link.equals(r.getLinkCancelacion()))
                .findFirst()
                .orElse(null);
    }

    public ResultadoVerificacionCorreo verificarCorreo(Reserva reserva, String correo) {
        if (reserva.getEstado() != EstadoReserva.PENDIENTE_CONFIRMACION) {
            throw new IllegalStateException("La reserva debe estar pendiente de confirmación.");
        }
        if (!esCorreoValido(correo)) {
            return new ResultadoVerificacionCorreo(
                    false,
                    "Ingrese un correo electrónico válido.",
                    null
            );
        }

        String codigo = generarCodigoVerificacion();
        reserva.getCliente().setCorreo(correo);
        mailService.enviar(
                correo,
                "Código de verificación - AgendaYA",
                "Su código de verificación es: " + codigo
        );

        return new ResultadoVerificacionCorreo(true, "Código de verificación enviado.", codigo);
    }

    public ResultadoConfirmacionReserva confirmarReserva(String linkConfirmacion) {
        Reserva reserva = buscarPorLinkConfirmacion(linkConfirmacion);
        if (reserva == null) {
            throw new IllegalArgumentException("No existe una reserva asociada a este link.");
        }

        LocalDateTime ahora = LocalDateTime.now(clock);
        Duration transcurrido = Duration.between(reserva.getFechaEnvioLinkConfirmacion(), ahora);

        if (transcurrido.compareTo(PLAZO_CONFIRMACION) > 0) {
            reserva.setEstado(EstadoReserva.EXPIRADA);
            enviarMailExpiracion(reserva);
            return new ResultadoConfirmacionReserva(false, "Su reserva expiró", false);
        }

        reserva.setEstado(EstadoReserva.CONFIRMADA);
        reserva.setLinkCancelacion("cancelar/" + reserva.getCodigo());

        enviarMailConfirmacionCliente(reserva);
        enviarMailConfirmacionAdministrador(reserva);

        return new ResultadoConfirmacionReserva(true, "Su reserva se confirmó", true);
    }

    public ResultadoCancelacionReserva cancelarReserva(String linkCancelacion) {
        Reserva reserva = buscarPorLinkCancelacion(linkCancelacion);
        if (reserva == null) {
            throw new IllegalArgumentException("No existe una reserva asociada a este link.");
        }

        if (reserva.isLinkCancelacionUsado()) {
            throw new IllegalStateException("El link de cancelación ya fue utilizado.");
        }

        LocalDateTime ahora = LocalDateTime.now(clock);
        if (!reserva.getFechaHora().isAfter(ahora)) {
            String mensaje = String.format(
                    "Su cita numero %s el día %s y %s ya expiró",
                    reserva.getCodigo(),
                    reserva.getFechaHora().format(FECHA_FORMATO),
                    reserva.getFechaHora().format(HORA_FORMATO)
            );
            return new ResultadoCancelacionReserva(false, mensaje, reserva);
        }

        reserva.setEstado(EstadoReserva.CANCELADA);
        reserva.setHorarioOcupado(false);
        reserva.setLinkCancelacionUsado(true);

        return new ResultadoCancelacionReserva(
                true,
                "Se canceló correctamente la cita",
                reserva
        );
    }

        public List<LocalDate> visualizarFechasDisponibles(
            Map<LocalDate, List<LocalTime>> disponibilidad,
            Set<LocalDateTime> horariosOcupados
    ) {
        if (disponibilidad == null || disponibilidad.isEmpty()) {
            return Collections.emptyList();
        }

        Set<LocalDateTime> ocupados = horariosOcupados == null
                ? Collections.emptySet()
                : horariosOcupados;

        return disponibilidad.entrySet()
                .stream()
                .filter(entry -> tieneAlMenosUnHorarioLibre(entry.getKey(), entry.getValue(), ocupados))
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    public boolean verificarDisponibilidad(
            LocalDateTime fechaHora,
            Set<LocalDateTime> horariosDisponibles,
            Set<LocalDateTime> horariosOcupados
    ) {
        if (fechaHora == null) {
            return false;
        }

        if (fechaHora.isBefore(LocalDateTime.now(clock))) {
            return false;
        }

        Set<LocalDateTime> disponibles = horariosDisponibles == null
                ? Collections.emptySet()
                : horariosDisponibles;

        Set<LocalDateTime> ocupados = horariosOcupados == null
                ? Collections.emptySet()
                : horariosOcupados;

        return disponibles.contains(fechaHora) && !ocupados.contains(fechaHora);
    }

    private boolean tieneAlMenosUnHorarioLibre(
            LocalDate fecha,
            List<LocalTime> horarios,
            Set<LocalDateTime> horariosOcupados
    ) {
        if (horarios == null || horarios.isEmpty()) {
            return false;
        }

        return horarios.stream()
                .map(hora -> LocalDateTime.of(fecha, hora))
                .anyMatch(fechaHora -> !horariosOcupados.contains(fechaHora));
    }

    private void enviarMailConfirmacionCliente(Reserva reserva) {
        mailService.enviar(
                reserva.getCliente().getCorreo(),
                "Reserva confirmada - AgendaYA",
                construirDetalleReserva(reserva)
        );
    }

    private void enviarMailConfirmacionAdministrador(Reserva reserva) {
        mailService.enviar(
                reserva.getAnfitrion().getCorreo(),
                "Nueva reserva confirmada - AgendaYA",
                construirDetalleReserva(reserva)
        );
    }

    private void enviarMailExpiracion(Reserva reserva) {
        mailService.enviar(
                reserva.getCliente().getCorreo(),
                "Reserva expirada - AgendaYA",
                construirDetalleReserva(reserva)
        );
    }

    private String construirDetalleReserva(Reserva reserva) {
        return String.format(
                "Cliente: %s %s%nFecha y hora: %s %s%nCódigo: %s",
                reserva.getCliente().getNombre(),
                reserva.getCliente().getApellido(),
                reserva.getFechaHora().format(FECHA_FORMATO),
                reserva.getFechaHora().format(HORA_FORMATO),
                reserva.getCodigo()
        );
    }

    private boolean esCorreoValido(String correo) {
        return correo != null && correo.matches("^[\\w.+-]+@[\\w.-]+\\.[A-Za-z]{2,}$");
    }

    private String generarCodigoVerificacion() {
        return String.format("%06d", random.nextInt(1_000_000));
    }
}
