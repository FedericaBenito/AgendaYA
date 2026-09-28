package agendaya.service;

import agendaya.model.EstadoReserva;
import agendaya.model.Mail;
import agendaya.model.Reserva;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

import static org.junit.jupiter.api.Assertions.*;

class US0403_ConfirmarReservaTest {

    private static final ZoneId ZONA = ZoneId.of("America/Argentina/Buenos_Aires");

    private MailService mailService;
    private ReservaService service;
    private Reserva reserva;

    @BeforeEach
    void setUp() {
        mailService = new MailService();
        LocalDateTime envioLink = LocalDateTime.of(2026, 6, 20, 8, 0);
        Clock clock = Clock.fixed(
                envioLink.plusHours(6).atZone(ZONA).toInstant(),
                ZONA
        );
        service = new ReservaService(mailService, clock);

        reserva = TestDataFactory.reservaPendiente("R001", LocalDateTime.of(2026, 6, 25, 10, 0));
        reserva.setFechaEnvioLinkConfirmacion(envioLink);
        service.registrarReserva(reserva);
    }

    @Test
    void deberiaConfirmarReservaDentroDeLas12Horas() {
        ResultadoConfirmacionReserva resultado = service.confirmarReserva("confirmar/R001");

        assertTrue(resultado.isConfirmada());
        assertEquals("Su reserva se confirmó", resultado.getMensaje());
        assertTrue(resultado.isPuedeCancelar());
        assertEquals(EstadoReserva.CONFIRMADA, reserva.getEstado());
        assertNotNull(reserva.getLinkCancelacion());

        assertEquals(2, mailService.getMailsEnviados().size());

        Mail mailCliente = mailService.getMailsEnviados().stream()
                .filter(m -> m.getDestinatario().equals("juan.perez@mail.com"))
                .findFirst()
                .orElseThrow();
        Mail mailAdmin = mailService.getMailsEnviados().stream()
                .filter(m -> m.getDestinatario().equals("ana.garcia@agendaya.com"))
                .findFirst()
                .orElseThrow();

        assertTrue(mailCliente.getCuerpo().contains("Juan Pérez"));
        assertTrue(mailCliente.getCuerpo().contains("R001"));
        assertTrue(mailAdmin.getCuerpo().contains("25/06/2026"));
        assertTrue(mailAdmin.getCuerpo().contains("10:00"));
    }

    @Test
    void deberiaExpirarReservaSiPasaronMasDe12Horas() {
        Clock clockExpirado = Clock.fixed(
                Instant.parse("2026-06-21T08:00:00-03:00"),
                ZONA
        );
        ReservaService serviceExpirado = new ReservaService(mailService, clockExpirado);
        serviceExpirado.registrarReserva(reserva);

        ResultadoConfirmacionReserva resultado = serviceExpirado.confirmarReserva("confirmar/R001");

        assertFalse(resultado.isConfirmada());
        assertEquals("Su reserva expiró", resultado.getMensaje());
        assertFalse(resultado.isPuedeCancelar());
        assertEquals(EstadoReserva.EXPIRADA, reserva.getEstado());

        assertEquals(1, mailService.getMailsEnviados().size());
        Mail mail = mailService.getMailsEnviados().get(0);
        assertTrue(mail.getCuerpo().contains("Juan Pérez"));
        assertTrue(mail.getCuerpo().contains("25/06/2026"));
        assertTrue(mail.getCuerpo().contains("R001"));
    }
}
