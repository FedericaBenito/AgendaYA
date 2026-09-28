package agendaya.service.Notificacion;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class EnviarConfirmacionProfesionalTest {
    @Test
    void deberiaEnviarConfirmacionAlProfesional(){


        NotificacionService service =
                new NotificacionService();



        boolean enviado =

                service.enviarConfirmacionProfesional(

                        "medico@gmail.com"

                );


        assertTrue(enviado);


    }
}
