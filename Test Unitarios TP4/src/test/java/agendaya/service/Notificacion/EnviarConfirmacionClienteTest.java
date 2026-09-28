package agendaya.service.Notificacion;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class EnviarConfirmacionClienteTest {
    @Test
    void deberiaEnviarConfirmacionAlCliente(){


        NotificacionService service =
                new NotificacionService();



        boolean enviado =

                service.enviarConfirmacionCliente(

                        "cliente@gmail.com"

                );

        assertTrue(enviado);

    }
}
