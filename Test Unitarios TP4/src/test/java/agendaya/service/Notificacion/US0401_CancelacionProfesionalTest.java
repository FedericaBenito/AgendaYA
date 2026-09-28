package agendaya.service.Notificacion;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class US0401_CancelacionProfesionalTest {

    private NotificacionService service;

    @BeforeEach
    void setUp() {
        service = new NotificacionService();
    }

    @Test
    void deberiaEnviarNotificacionConFormatoCorrectoAlProfesional() {
        service.notificarCancelacionAProfesional("R-100", "Juan Perez", "2026-10-15", "14:00", "profesional@test.com");

        assertEquals(1, service.getCorreosEnviados().size());
        assertEquals("profesional@test.com", service.getCorreosEnviados().get(0));
        assertEquals("CANCELACIÓN RESERVA NÚMERO R-100", service.getAsuntosEnviados().get(0));
        assertTrue(service.getCuerposEnviados().get(0).contains("cancelada por el cliente Juan Perez"));
    }

    @Test
    void deberiaEvitarEnviarNotificacionesDuplicadas() {
        service.notificarCancelacionAProfesional("R-101", "Ana", "2026-11-20", "10:00", "profesional@test.com");
        service.notificarCancelacionAProfesional("R-101", "Ana", "2026-11-20", "10:00", "profesional@test.com");

        assertEquals(1, service.getCorreosEnviados().size(), "Debe evitarse el envío duplicado");
    }

    @Test
    void elCuerpoDelCorreoDebeContenerFechaYHora() {
        service.notificarCancelacionAProfesional("R-102", "Luis", "2026-12-01", "09:30", "profesional@test.com");

        String cuerpo = service.getCuerposEnviados().get(0);
        assertTrue(cuerpo.contains("fecha 2026-12-01"));
        assertTrue(cuerpo.contains("hora: 09:30"));
    }
}