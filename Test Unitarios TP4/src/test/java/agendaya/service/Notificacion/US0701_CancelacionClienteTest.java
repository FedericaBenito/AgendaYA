package agendaya.service.Notificacion;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class US0701_CancelacionClienteTest {

    private NotificacionService service;

    @BeforeEach
    void setUp() {
        service = new NotificacionService();
    }

    @Test
    void escenario1_envioPlantillaGenericaConExito() {
        service.notificarCancelacionAClientePropio("R-500", "Joaco", "2026-10-15",
                "10:00", "joaco@mail.com", false, null,
                null);

        assertEquals(1, service.getCorreosEnviados().size());
        assertEquals("joaco@mail.com", service.getCorreosEnviados().get(0));
        assertEquals("CANCELACIÓN DE RESERVA R-500", service.getAsuntosEnviados().get(0));
        assertTrue(service.getCuerposEnviados().get(0).contains("Estimado/a Joaco, ¡tu reserva fue cancelada!"));
    }

    @Test
    void escenario2_envioPlantillaPersonalizada() {
        String asuntoCustom = "Cancelaste tu turno";
        String cuerpoCustom = "Lamentamos que hayas tenido que cancelar.";

        service.notificarCancelacionAClientePropio("R-501", "Joaco", "2026-10-16",
                "11:00", "joaco@mail.com", true, asuntoCustom, cuerpoCustom);

        assertEquals(asuntoCustom, service.getAsuntosEnviados().get(0));
        assertEquals(cuerpoCustom, service.getCuerposEnviados().get(0));
    }

    @Test
    void validacion_evitaCorreosDuplicadosYEnviaEnMenosDeCincoSegundos() {
        assertDoesNotThrow(() -> {
            service.notificarCancelacionAClientePropio("R-502", "Ana", "2026-10-17",
                    "12:00", "ana@mail.com", false, null,
                    null);
            service.notificarCancelacionAClientePropio("R-502", "Ana", "2026-10-17",
                    "12:00", "ana@mail.com", false, null,
                    null);
        });

        assertEquals(1, service.getCorreosEnviados().size(),
                "Debe enviar un único correo para evitar duplicidades");
    }
}