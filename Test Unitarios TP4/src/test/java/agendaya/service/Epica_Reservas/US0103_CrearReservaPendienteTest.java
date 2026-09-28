package agendaya.service.Epica_Reservas;

import agendaya.model.EstadoReserva;
import agendaya.model.Reserva;
import agendaya.service.MailService;
import agendaya.service.ReservaService;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class US0103_CrearReservaPendienteTest {

    @Test
    void alCrearReservaDebeQuedarPendienteDeConfirmacion() {
        Reserva reserva = new Reserva(
                "RES-001",
                null,
                null,
                LocalDateTime.of(2030, 6, 25, 10, 0),
                "Online"
        );

        assertEquals(EstadoReserva.PENDIENTE_CONFIRMACION, reserva.getEstado());
    }

    @Test
    void alCrearReservaElHorarioDebeQuedarOcupado() {
        Reserva reserva = new Reserva(
                "RES-002",
                null,
                null,
                LocalDateTime.of(2030, 6, 25, 11, 0),
                "Consultorio"
        );

        assertTrue(reserva.isHorarioOcupado());
    }

    @Test
    void debeRegistrarReservaYBuscarlaPorLinkDeConfirmacion() {
        ReservaService service = new ReservaService(new MailServiceFake());

        Reserva reserva = new Reserva(
                "RES-003",
                null,
                null,
                LocalDateTime.of(2030, 6, 25, 12, 0),
                "Online"
        );

        reserva.setLinkConfirmacion("confirmar/RES-003");

        service.registrarReserva(reserva);

        Reserva encontrada = service.buscarPorLinkConfirmacion("confirmar/RES-003");

        assertNotNull(encontrada);
        assertEquals("RES-003", encontrada.getCodigo());
        assertEquals(EstadoReserva.PENDIENTE_CONFIRMACION, encontrada.getEstado());
    }

static class MailServiceFake extends MailService {
        @Override
        public void enviar(String destinatario, String asunto, String cuerpo) {
        }
    }
}
