package agendaya.service.Notificacion;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class US0901_Recordatorio24hsTest {

    private NotificacionService service;

    @BeforeEach
    void setUp() {
        service = new NotificacionService();
    }

    @Test
    void escenario1_envioRecordatorioExactamente24HorasAntes() {
        service.enviarRecordatorio24hs("R-700", "Joaco", "2026-12-01",
                "15:00", "Dr. Gomez", "Confirmada", 24,
                "joaco@mail.com");

        assertEquals(1, service.getCorreosEnviados().size());
        assertEquals("Recordatorio de Reserva R-700", service.getAsuntosEnviados().get(0));
        assertTrue(service.getCuerposEnviados().get(0).contains("Profesional: Dr. Gomez"));
        assertTrue(service.getCuerposEnviados().get(0).contains("Tu reserva se encuentra confirmada."));
    }

    @Test
    void escenario2_reservaSinEstadoConfirmadoNoEnviaMail() {
        service.enviarRecordatorio24hs("R-701", "Joaco", "2026-12-02", "16:00",
                "Dr. Gomez", "Pendiente", 24, "joaco@mail.com");
        service.enviarRecordatorio24hs("R-702", "Joaco", "2026-12-02", "16:00",
                "Dr. Gomez", "Cancelada", 24, "joaco@mail.com");

        assertEquals(0, service.getCorreosEnviados().size(),
                "No debe enviar mail si no está Confirmada");
    }

    @Test
    void escenario3_validacionMomentoDeEnvio() {
        service.enviarRecordatorio24hs("R-703", "Joaco", "2026-12-03", "17:00",
                "Dr. Gomez", "Confirmada", 25, "joaco@mail.com"); // Más de 24hs
        service.enviarRecordatorio24hs("R-704", "Joaco", "2026-12-03", "17:00",
                "Dr. Gomez", "Confirmada", 10, "joaco@mail.com"); // Menos de 24hs

        assertEquals(0, service.getCorreosEnviados().size(),
                "Solo debe enviarse cuando falten exactamente 24 horas");
    }
}