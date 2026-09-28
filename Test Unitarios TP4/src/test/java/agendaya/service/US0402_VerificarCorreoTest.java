package agendaya.service;

import agendaya.model.Mail;
import agendaya.model.Reserva;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class US0402_VerificarCorreoTest {

    private MailService mailService;
    private ReservaService service;
    private Reserva reserva;

    @BeforeEach
    void setUp() {
        mailService = new MailService();
        service = new ReservaService(mailService);
        reserva = TestDataFactory.reservaPendiente("R001", LocalDateTime.of(2026, 6, 25, 10, 0));
        service.registrarReserva(reserva);
    }

    @Test
    void deberiaEnviarCodigoVerificacionCuandoCorreoEsValido() {
        ResultadoVerificacionCorreo resultado = service.verificarCorreo(reserva, "juan.perez@mail.com");

        assertTrue(resultado.isExitoso());
        assertNotNull(resultado.getCodigoVerificacion());
        assertEquals(1, mailService.getMailsEnviados().size());

        Mail mail = mailService.getMailsEnviados().get(0);
        assertEquals("juan.perez@mail.com", mail.getDestinatario());
        assertTrue(mail.getCuerpo().contains(resultado.getCodigoVerificacion()));
    }

    @Test
    void deberiaRechazarCorreoInvalidoYPedirUnoValido() {
        ResultadoVerificacionCorreo resultado = service.verificarCorreo(reserva, "correo-invalido");

        assertFalse(resultado.isExitoso());
        assertEquals("Ingrese un correo electrónico válido.", resultado.getMensaje());
        assertNull(resultado.getCodigoVerificacion());
        assertTrue(mailService.getMailsEnviados().isEmpty());
    }
}
