package agendaya.service.Notificacion;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class US0801_ReservaPendienteTest {

    private NotificacionService service;

    @BeforeEach
    void setUp() {
        service = new NotificacionService();
    }

    @Test
    void escenario1_mailEnviadoCorrectamente() {
        service.notificarReservaPendiente("R-600", "2026-11-01", "09:00",
                "cliente@mail.com", false);

        assertEquals(1, service.getCorreosEnviados().size());
        assertTrue(service.getCuerposEnviados().get(0).contains("Tu reserva número R-600 día 2026-11-01 y hora 09:00 está pendiente de confirmación"));
        assertTrue(service.getCuerposEnviados().get(0).contains("Confirmar Reserva"));
    }

    @Test
    void validacion_enviaUnUnicoMailPendiente() {
        service.notificarReservaPendiente("R-601", "2026-11-02", "10:00",
                "cliente@mail.com", false);
        service.notificarReservaPendiente("R-601", "2026-11-02", "10:00",
                "cliente@mail.com", false);

        assertEquals(1, service.getCorreosEnviados().size(), "Solo debe enviar un mail");
    }

    @Test
    void escenario2_reintentoReservaYaConfirmada() {
        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> service.notificarReservaPendiente("R-602", "2026-11-03", "11:00",
                        "cliente@mail.com", true)
        );

        assertEquals("Error: La reserva ya ha sido confirmada previamente.", ex.getMessage(),
                "Debe arrojar error para mostrar pop-up");
        assertEquals(0, service.getCorreosEnviados().size(),
                "No se debe volver a confirmar ni enviar mail");
    }
}