package agendaya.service;

import agendaya.model.Plantilla;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class US0103_DuplicarPlantillaTest {

    private PlantillaService service;

    @BeforeEach
    void setUp() {
        service = new PlantillaService();
        service.crearPlantilla(TestDataFactory.plantillaEjemplo("Recordatorio 24hs", "Recordatorios"));
    }

    @Test
    void deberiaDuplicarConNombreSugeridoAutomaticamente() {
        Plantilla copia = service.duplicarPlantilla("Recordatorio 24hs");

        assertEquals("Copia de Recordatorio 24hs", copia.getNombre());
        assertEquals(2, service.listarPlantillas().size());
    }

    @Test
    void deberiaConservarDatosDelOriginalEnLaCopia() {
        Plantilla original = service.buscarPorNombre("Recordatorio 24hs");
        Plantilla copia = service.duplicarPlantilla("Recordatorio 24hs");

        assertEquals(original.getAsunto(), copia.getAsunto());
        assertEquals(original.getCuerpo(), copia.getCuerpo());
        assertEquals(original.getFirma(), copia.getFirma());
        assertEquals(original.getCategoria(), copia.getCategoria());
        assertEquals(original.getDestinatario().getCorreo(), copia.getDestinatario().getCorreo());
        assertEquals(original.getRemitente().getDni(), copia.getRemitente().getDni());
    }

    @Test
    void deberiaRechazarDuplicacionSiLaCopiaYaExiste() {
        service.duplicarPlantilla("Recordatorio 24hs");

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.duplicarPlantilla("Recordatorio 24hs")
        );

        assertEquals("Ya existe una plantilla con ese nombre. Por favor ingrese un nombre distinto.", ex.getMessage());
    }
}