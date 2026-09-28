package agendaya.service;

import agendaya.model.Plantilla;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class US0101_PrevisualizarPlantillaTest {

    private PlantillaService service;

    @BeforeEach
    void setUp() {
        service = new PlantillaService();
    }

    @Test
    void deberiaReemplazarPlaceholdersConDatosReales() {
        Plantilla plantilla = TestDataFactory.plantillaEjemplo("Recordatorio", "Recordatorios");

        String preview = service.previsualizarPlantilla(plantilla);

        assertTrue(preview.contains("Juan Pérez"), "Debe mostrar el nombre completo del cliente");
        assertTrue(preview.contains("Ana García"), "Debe mostrar el nombre completo del profesional");
        assertFalse(preview.contains("{{nombre_cliente}}"), "No deben quedar placeholders sin reemplazar");
    }

    @Test
    void deberiaRechazarPrevisualizacionSiCuerpoEstaVacio() {
        Plantilla plantilla = TestDataFactory.plantillaEjemplo("Recordatorio", "Recordatorios");
        plantilla.setCuerpo("");

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.previsualizarPlantilla(plantilla)
        );

        assertEquals("Debe completar al menos el Asunto y el Cuerpo para previsualizar la plantilla.", ex.getMessage());
    }

    @Test
    void deberiaRechazarPrevisualizacionSiAsuntoEstaVacio() {
        Plantilla plantilla = TestDataFactory.plantillaEjemplo("Recordatorio", "Recordatorios");
        plantilla.setAsunto("");

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.previsualizarPlantilla(plantilla)
        );

        assertEquals("Debe completar al menos el Asunto y el Cuerpo para previsualizar la plantilla.", ex.getMessage());
    }
}