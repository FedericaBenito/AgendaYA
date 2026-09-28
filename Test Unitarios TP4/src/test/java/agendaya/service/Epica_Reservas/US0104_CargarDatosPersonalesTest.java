package agendaya.service.Epica_Reservas;

import agendaya.model.Cliente;
import agendaya.model.EstadoReserva;
import agendaya.model.Reserva;
import agendaya.service.MailService;
import agendaya.service.ReservaService;
import agendaya.service.ResultadoVerificacionCorreo;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class US0104_CargarDatosPersonalesTest {

    @Test
    void debeAceptarCorreoValidoYCargarloEnElCliente() {
        ReservaService service = new ReservaService(new MailServiceFake());
        Cliente cliente = new Cliente("Lourdes", "Palermo", "45876162","lourdes@mail.com");

        Reserva reserva = new Reserva(
                "RES-004",
                cliente,
                null,
                LocalDateTime.of(2030, 6, 25, 10, 0),
                "Online"
        );

        ResultadoVerificacionCorreo resultado = service.verificarCorreo(
                reserva,
                "lourdes@mail.com"
        );

        assertTrue(resultado.isExitoso());
        assertEquals("lourdes@mail.com", reserva.getCliente().getCorreo());
        assertNotNull(resultado.getCodigoVerificacion());
    }

    @Test
    void noDebeAceptarCorreoElectronicoInvalido() {
        ReservaService service = new ReservaService(new MailServiceFake());
        Cliente cliente = new Cliente("Lourdes", "Palermo", "45876162","lourdes@mail.com");

        Reserva reserva = new Reserva(
                "RES-005",
                cliente,
                null,
                LocalDateTime.of(2030, 6, 25, 10, 0),
                "Online"
        );

        ResultadoVerificacionCorreo resultado = service.verificarCorreo(
                reserva,
                "correo-invalido"
        );

        assertFalse(resultado.isExitoso());
        assertEquals("Ingrese un correo electrónico válido.", resultado.getMensaje());
        assertNull(resultado.getCodigoVerificacion());
    }

    @Test
    void noDebeVerificarCorreoSiLaReservaNoEstaPendiente() {
        ReservaService service = new ReservaService(new MailServiceFake());
        Cliente cliente = new Cliente("Lourdes", "Palermo", "45876162","lourdes@mail.com");

        Reserva reserva = new Reserva(
                "RES-006",
                cliente,
                null,
                LocalDateTime.of(2030, 6, 25, 10, 0),
                "Online"
        );

        reserva.setEstado(EstadoReserva.CONFIRMADA);

        IllegalStateException error = assertThrows(
                IllegalStateException.class,
                () -> service.verificarCorreo(reserva, "lourdes@mail.com")
        );

        assertEquals("La reserva debe estar pendiente de confirmación.", error.getMessage());
    }

    static class MailServiceFake extends MailService {
        @Override
        public void enviar(String destinatario, String asunto, String cuerpo) {
        }
    }
}