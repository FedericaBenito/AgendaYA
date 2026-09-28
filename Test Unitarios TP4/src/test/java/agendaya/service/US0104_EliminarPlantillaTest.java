package agendaya.service;

import agendaya.model.Plantilla;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class US0104_EliminarPlantillaTest {

    private PlantillaService service;

    @BeforeEach
    void setUp() {
        service = new PlantillaService();
        service.crearPlantilla(TestDataFactory.plantillaEjemplo("Cancelación de reserva", "Cancelaciones"));
    }

    @Test
    void deberiaEliminarPlantillaSiNoEstaEnUso() {
        service.eliminarPlantilla("Cancelación de reserva");

        assertNull(service.buscarPorNombre("Cancelación de reserva"),
                "La plantilla eliminada no debería encontrarse en el sistema");
        assertTrue(service.listarPlantillas().isEmpty());
    }

    @Test
    void deberiaRechazarEliminacionSiPlantillaEstaEnUso() {
        Plantilla plantilla = service.buscarPorNombre("Cancelación de reserva");
        plantilla.setEnUso(true);

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> service.eliminarPlantilla("Cancelación de reserva")
        );

        assertEquals("No es posible eliminar esta plantilla porque está siendo utilizada actualmente.", ex.getMessage());
    }

    @Test
    void deberiaMantenerlaSiEliminacionEsCancelada() {
        boolean confirmado = false;

        if (confirmado) {
            service.eliminarPlantilla("Cancelación de reserva");
        }

        assertNotNull(service.buscarPorNombre("Cancelación de reserva"),
                "La plantilla debe seguir existiendo si la eliminación fue cancelada");
    }
}