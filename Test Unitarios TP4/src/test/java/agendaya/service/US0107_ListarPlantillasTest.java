package agendaya.service;

import agendaya.model.Plantilla;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class US0107_ListarPlantillasTest {

    private PlantillaService service;

    @BeforeEach
    void setUp() {
        service = new PlantillaService();
    }

    @Test
    void deberiaListarTodasLasPlantillasExistentes() {
        service.crearPlantilla(TestDataFactory.plantillaEjemplo("Confirmación de reserva", "Reservas"));
        service.crearPlantilla(TestDataFactory.plantillaEjemplo("Cancelación de reserva", "Cancelaciones"));

        List<Plantilla> resultado = service.listarPlantillas();

        assertEquals(2, resultado.size(), "Debería devolver las 2 plantillas cargadas");
    }

    @Test
    void deberiaDevolverListaVaciaSiNoHayPlantillas() {
        List<Plantilla> resultado = service.listarPlantillas();

        assertNotNull(resultado, "La lista nunca debe ser null");
        assertTrue(resultado.isEmpty(), "Debe estar vacía si no se cargó ninguna plantilla");
    }

    @Test
    void deberiaConservarDatosDelDestinatarioAlListar() {
        service.crearPlantilla(TestDataFactory.plantillaEjemplo("Recordatorio 24hs", "Recordatorios"));

        Plantilla resultado = service.listarPlantillas().get(0);

        assertEquals("Juan", resultado.getDestinatario().getNombre());
        assertEquals("Pérez", resultado.getDestinatario().getApellido());
        assertEquals("30111222", resultado.getDestinatario().getDni());
        assertEquals("juan.perez@mail.com", resultado.getDestinatario().getCorreo());
    }
}