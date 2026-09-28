package agendaya.service;

import agendaya.model.Plantilla;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class US0106_ModificarPlantillaTest {

    private PlantillaService service;

    @BeforeEach
    void setUp() {
        service = new PlantillaService();
        service.crearPlantilla(TestDataFactory.plantillaEjemplo("Confirmación de reserva", "Reservas"));
    }

    @Test
    void deberiaActualizarCamposCorrectamente() {
        Plantilla datosNuevos = TestDataFactory.plantillaEjemplo("Confirmación de reserva", "Reservas");
        datosNuevos.setAsunto("Nuevo asunto actualizado");
        datosNuevos.setCuerpo("Nuevo cuerpo del correo");

        service.modificarPlantilla("Confirmación de reserva", datosNuevos);

        Plantilla resultado = service.buscarPorNombre("Confirmación de reserva");
        assertEquals("Nuevo asunto actualizado", resultado.getAsunto());
        assertEquals("Nuevo cuerpo del correo", resultado.getCuerpo());
    }

    @Test
    void deberiaRechazarModificacionSiAsuntoEstaVacio() {
        Plantilla datosNuevos = TestDataFactory.plantillaEjemplo("Confirmación de reserva", "Reservas");
        datosNuevos.setAsunto("");

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.modificarPlantilla("Confirmación de reserva", datosNuevos)
        );

        assertEquals("Los campos Nombre de plantilla, Asunto, Cuerpo y Firma son obligatorios.", ex.getMessage());
    }

    @Test
    void deberiaRechazarModificacionSiNombreEstaVacio() {
        Plantilla datosNuevos = TestDataFactory.plantillaEjemplo("Confirmación de reserva", "Reservas");
        datosNuevos.setNombre("");

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.modificarPlantilla("Confirmación de reserva", datosNuevos)
        );

        assertEquals("Los campos Nombre de plantilla, Asunto, Cuerpo y Firma son obligatorios.", ex.getMessage());
    }
}