package agendaya.service.Notificacion;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class US0501_ReagendadoClienteTest {

    private NotificacionService service;

    @BeforeEach
    void setUp() {
        service = new NotificacionService();
    }

    @Test
    void deberiaEnviarPlantillaGenericaCuandoNoHayPersonalizada() {
        service.notificarReagendadoACliente("R-200", "Maria", "2026-10-10", "2026-10-12", "10:00", "15:00", "Online", "maria@test.com", false, null, null);

        assertEquals("REAGENDADO DE RESERVA R-200", service.getAsuntosEnviados().get(0));
        assertTrue(service.getCuerposEnviados().get(0).contains("Fecha 2026-10-10 a 2026-10-12"));
    }

    @Test
    void deberiaEnviarPlantillaPersonalizadaCuandoExiste() {
        String asuntoCustom = "Tu turno cambió!";
        String cuerpoCustom = "Hola Maria, te esperamos a las 15:00";

        service.notificarReagendadoACliente("R-201", "Maria", "2026-10-10", "2026-10-12", "10:00", "15:00", "Online", "maria@test.com", true, asuntoCustom, cuerpoCustom);

        assertEquals(asuntoCustom, service.getAsuntosEnviados().get(0));
        assertEquals(cuerpoCustom, service.getCuerposEnviados().get(0));
    }

    @Test
    void elEnvioDebeDemorarMenosDeCincoSegundos() {
        assertDoesNotThrow(() -> {
            service.notificarReagendadoACliente("R-202", "Carlos", "2026-11-01", "2026-11-02", "09:00", "10:00", "Presencial", "carlos@test.com", false, null, null);
        }, "El método debe ejecutarse sin lanzar excepción por demorar más de 5 segundos");
    }
}