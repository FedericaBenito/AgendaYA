package agendaya.service.Epica_Reservas;

import agendaya.service.MailService;
import agendaya.service.ReservaService;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class US0106_VerificarDisponibilidadTest {

    private final Clock clockFijo = Clock.fixed(
            Instant.parse("2026-06-20T10:00:00Z"),
            ZoneId.systemDefault()
    );

    @Test
    void debeIndicarDisponibleSiElHorarioExisteYNoEstaOcupado() {
        ReservaService service = new ReservaService(new MailServiceFake(), clockFijo);

        LocalDateTime horario = LocalDateTime.of(2030, 6, 25, 10, 0);

        boolean disponible = service.verificarDisponibilidad(
                horario,
                Set.of(horario),
                Set.of()
        );

        assertTrue(disponible);
    }

    @Test
    void debeIndicarNoDisponibleSiElHorarioYaEstaOcupado() {
        ReservaService service = new ReservaService(new MailServiceFake(), clockFijo);

        LocalDateTime horario = LocalDateTime.of(2030, 6, 25, 10, 0);

        boolean disponible = service.verificarDisponibilidad(
                horario,
                Set.of(horario),
                Set.of(horario)
        );

        assertFalse(disponible);
    }

    @Test
    void debeIndicarNoDisponibleSiElHorarioNoEstaConfigurado() {
        ReservaService service = new ReservaService(new MailServiceFake(), clockFijo);

        LocalDateTime horarioSolicitado = LocalDateTime.of(2030, 6, 25, 15, 0);
        LocalDateTime horarioConfigurado = LocalDateTime.of(2030, 6, 25, 10, 0);

        boolean disponible = service.verificarDisponibilidad(
                horarioSolicitado,
                Set.of(horarioConfigurado),
                Set.of()
        );

        assertFalse(disponible);
    }

    static class MailServiceFake extends MailService {
        @Override
        public void enviar(String destinatario, String asunto, String cuerpo) {
        }
    }
}
