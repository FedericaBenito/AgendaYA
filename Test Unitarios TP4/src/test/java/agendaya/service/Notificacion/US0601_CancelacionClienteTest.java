package agendaya.service.Notificacion;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class US0601_CancelacionClienteTest {

    private NotificacionService service;

    @BeforeEach
    void setUp() {
        service = new NotificacionService();
    }

    @Test
    void deberiaEnviarNotificacionConFormatoCorrectoAlCliente() {
        service.notificarCancelacionACliente("R-300", "2026-10-15", "16:00", "cliente@test.com");

        assertEquals(1, service.getCorreosEnviados().size());
        assertEquals("cliente@test.com", service.getCorreosEnviados().get(0));
        assertEquals("CANCELACIÓN RESERVA NÚMERO R-300", service.getAsuntosEnviados().get(0));
        assertTrue(service.getCuerposEnviados().get(0).contains("cancelada por el profesional"));
    }

    @Test
    void deberiaEvitarEnviarNotificacionesDuplicadasAlCliente() {
        service.notificarCancelacionACliente("R-301", "2026-11-20", "11:00", "cliente@test.com");
        service.notificarCancelacionACliente("R-301", "2026-11-20", "11:00", "cliente@test.com");

        assertEquals(1, service.getCorreosEnviados().size(), "Debe existir un solo registro de envío en la lista");
    }

    @Test
    void elCuerpoDelCorreoDebeContenerFechaYHoraDeLaReservaCancelada() {
        service.notificarCancelacionACliente("R-302", "2026-12-05", "18:00", "cliente@test.com");

        String cuerpo = service.getCuerposEnviados().get(0);
        assertTrue(cuerpo.contains("fecha 2026-12-05"));
        assertTrue(cuerpo.contains("hora: 18:00"));
    }
}