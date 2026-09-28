package agendaya.service;

import agendaya.model.EstadoReserva;
import agendaya.model.Reserva;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;

import static org.junit.jupiter.api.Assertions.*;

class US0404_CancelarReservaTest {

    private static final ZoneId ZONA = ZoneId.of("America/Argentina/Buenos_Aires");

    private MailService mailService;
    private ReservaService service;
    private Reserva reserva;

    @BeforeEach
    void setUp() {
        mailService = new MailService();
        LocalDateTime fechaCita = LocalDateTime.of(2026, 6, 25, 10, 0);
        Clock clock = Clock.fixed(fechaCita.minusDays(1).atZone(ZONA).toInstant(), ZONA);
        service = new ReservaService(mailService, clock);

        reserva = TestDataFactory.reservaConfirmada("R001", fechaCita);
        service.registrarReserva(reserva);
    }

    @Test
    void deberiaCancelarReservaDentroDelPlazoPermitido() {
        ResultadoCancelacionReserva resultado = service.cancelarReserva("cancelar/R001");

        assertTrue(resultado.isCancelada());
        assertEquals("Se canceló correctamente la cita", resultado.getMensaje());
        assertEquals(EstadoReserva.CANCELADA, reserva.getEstado());
        assertFalse(reserva.isHorarioOcupado());

        Reserva datos = resultado.getReserva();
        assertEquals("Juan", datos.getCliente().getNombre());
        assertEquals("Pérez", datos.getCliente().getApellido());
        assertEquals(LocalDateTime.of(2026, 6, 25, 10, 0), datos.getFechaHora());
        assertEquals("Ana", datos.getAnfitrion().getNombre());
        assertEquals("Consultorio 3, Av. Corrientes 1234", datos.getUbicacion());
    }

    @Test
    void deberiaInvalidarLinkCancelacionTrasPrimerUso() {
        service.cancelarReserva("cancelar/R001");

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> service.cancelarReserva("cancelar/R001")
        );

        assertEquals("El link de cancelación ya fue utilizado.", ex.getMessage());
    }

    @Test
    void noDeberiaCancelarReservaSiLaCitaYaExpiro() {
        LocalDateTime fechaCita = LocalDateTime.of(2026, 6, 25, 10, 0);
        Clock clockPosterior = Clock.fixed(fechaCita.plusHours(1).atZone(ZONA).toInstant(), ZONA);
        ReservaService servicePosterior = new ReservaService(mailService, clockPosterior);
        Reserva reservaPosterior = TestDataFactory.reservaConfirmada("R002", fechaCita);
        servicePosterior.registrarReserva(reservaPosterior);

        ResultadoCancelacionReserva resultado = servicePosterior.cancelarReserva("cancelar/R002");

        assertFalse(resultado.isCancelada());
        assertEquals("Su cita numero R002 el día 25/06/2026 y 10:00 ya expiró", resultado.getMensaje());
        assertEquals(EstadoReserva.CONFIRMADA, reservaPosterior.getEstado());
        assertTrue(reservaPosterior.isHorarioOcupado());
    }
}
