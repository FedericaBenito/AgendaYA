package agendaya.service;

import agendaya.model.Plantilla;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class US0105_CrearPlantillaTest {

    private PlantillaService service;

    @BeforeEach
    void setUp() {
        service = new PlantillaService();
    }

    @Test
    void deberiaCrearPlantillaCuandoTodosLosCamposSonValidos() {
        Plantilla nueva = TestDataFactory.plantillaEjemplo("Bienvenida", "General");

        service.crearPlantilla(nueva);

        assertEquals(1, service.listarPlantillas().size());
        assertNotNull(service.buscarPorNombre("Bienvenida"));
    }

    @Test
    void deberiaRechazarCreacionSiCampoObligatorioEstaVacio() {
        Plantilla incompleta = TestDataFactory.plantillaEjemplo("Bienvenida", "General");
        incompleta.setCuerpo("");

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.crearPlantilla(incompleta)
        );

        assertEquals("Los campos Nombre de plantilla, Asunto, Cuerpo y Firma son obligatorios.", ex.getMessage());
    }

    @Test
    void deberiaRechazarCreacionSiElNombreYaExiste() {
        service.crearPlantilla(TestDataFactory.plantillaEjemplo("Bienvenida", "General"));
        Plantilla duplicada = TestDataFactory.plantillaEjemplo("Bienvenida", "General");

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.crearPlantilla(duplicada)
        );

        assertEquals("Ya existe una plantilla con ese nombre. Por favor ingrese un nombre distinto.", ex.getMessage());
    }
}