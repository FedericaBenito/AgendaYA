package agendaya.service.Epica_Reservas;

import agendaya.service.MailService;
import agendaya.service.ReservaService;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class US0105_VisualizarDisponibilidadFechasTest {

    private final Clock clockFijo = Clock.fixed(
            Instant.parse("2026-06-20T10:00:00Z"),
            ZoneId.systemDefault()
    );

    @Test
    void debeMostrarFechasConHorariosDisponibles() {
        ReservaService service = new ReservaService(new MailServiceFake(), clockFijo);

        LocalDate fecha1 = LocalDate.of(2030, 6, 25);
        LocalDate fecha2 = LocalDate.of(2030, 6, 26);

        List<LocalDate> resultado = service.visualizarFechasDisponibles(
                Map.of(
                        fecha1, List.of(LocalTime.of(10, 0), LocalTime.of(11, 0)),
                        fecha2, List.of(LocalTime.of(9, 0))
                ),
                Set.of()
        );

        assertEquals(2, resultado.size());
        assertTrue(resultado.contains(fecha1));
        assertTrue(resultado.contains(fecha2));
    }

    @Test
    void noDebeMostrarFechasSinHorariosConfigurados() {
        ReservaService service = new ReservaService(new MailServiceFake(), clockFijo);

        LocalDate fechaSinHorarios = LocalDate.of(2030, 6, 25);
        LocalDate fechaConHorarios = LocalDate.of(2030, 6, 26);

        List<LocalDate> resultado = service.visualizarFechasDisponibles(
                Map.of(
                        fechaSinHorarios, List.of(),
                        fechaConHorarios, List.of(LocalTime.of(9, 0))
                ),
                Set.of()
        );

        assertFalse(resultado.contains(fechaSinHorarios));
        assertTrue(resultado.contains(fechaConHorarios));
    }

    @Test
    void noDebeMostrarFechasConTodosLosHorariosOcupados() {
        ReservaService service = new ReservaService(new MailServiceFake(), clockFijo);

        LocalDate fechaOcupada = LocalDate.of(2030, 6, 25);
        LocalDate fechaLibre = LocalDate.of(2030, 6, 26);

        List<LocalDate> resultado = service.visualizarFechasDisponibles(
                Map.of(
                        fechaOcupada, List.of(LocalTime.of(10, 0)),
                        fechaLibre, List.of(LocalTime.of(9, 0))
                ),
                Set.of(LocalDateTime.of(2030, 6, 25, 10, 0))
        );

        assertFalse(resultado.contains(fechaOcupada));
        assertTrue(resultado.contains(fechaLibre));
    }

    static class MailServiceFake extends MailService {
        @Override
        public void enviar(String destinatario, String asunto, String cuerpo) {
        }
    }
}