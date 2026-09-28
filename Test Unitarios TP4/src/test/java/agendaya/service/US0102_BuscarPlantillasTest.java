package agendaya.service;

import agendaya.model.Plantilla;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class US0102_BuscarPlantillasTest {

    private PlantillaService service;

    @BeforeEach
    void setUp() {
        service = new PlantillaService();
        service.crearPlantilla(TestDataFactory.plantillaEjemplo("Confirmación de reserva", "Reservas"));
        service.crearPlantilla(TestDataFactory.plantillaEjemplo("Cancelación de reserva", "Cancelaciones"));
        service.crearPlantilla(TestDataFactory.plantillaEjemplo("Recordatorio 24hs", "Recordatorios"));
    }

    @Test
    void deberiaFiltrarPorTextoDeBusqueda() {
        List<Plantilla> resultado = service.buscarPlantillas("reserva", null);

        assertEquals(2, resultado.size(), "Debería encontrar las 2 plantillas que contienen 'reserva'");
    }

    @Test
    void deberiaFiltrarPorCategoria() {
        List<Plantilla> resultado = service.buscarPlantillas(null, "Recordatorios");

        assertEquals(1, resultado.size());
        assertEquals("Recordatorio 24hs", resultado.get(0).getNombre());
    }

    @Test
    void deberiaDevolverListaVaciaSiNadaCoincide() {
        List<Plantilla> resultado = service.buscarPlantillas("bienvenida", "General");

        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());
    }
}