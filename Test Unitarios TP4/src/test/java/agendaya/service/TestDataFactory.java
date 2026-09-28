package agendaya.service;

import agendaya.model.Cliente;
import agendaya.model.EstadoReserva;
import agendaya.model.Plantilla;
import agendaya.model.Profesional;
import agendaya.model.Reserva;

import java.time.LocalDateTime;

public class TestDataFactory {

    public static Cliente clienteEjemplo() {
        return new Cliente("Juan", "Pérez", "30111222", "juan.perez@mail.com");
    }

    public static Profesional profesionalEjemplo() {
        return new Profesional("Ana", "García", "25333444", "ana.garcia@agendaya.com");
    }

    public static Plantilla plantillaEjemplo(String nombre, String categoria) {
        return new Plantilla(
                nombre,
                "Asunto de ejemplo",
                "Hola {{nombre_cliente}}, tu turno está confirmado. Saludos, {{nombre_profesional}}",
                "Equipo AgendaYA",
                categoria,
                clienteEjemplo(),
                profesionalEjemplo()
        );
    }

    public static Reserva reservaPendiente(String codigo, LocalDateTime fechaHora) {
        Reserva reserva = new Reserva(
                codigo,
                clienteEjemplo(),
                profesionalEjemplo(),
                fechaHora,
                "Consultorio 3, Av. Corrientes 1234"
        );
        reserva.setLinkConfirmacion("confirmar/" + codigo);
        return reserva;
    }

    public static Reserva reservaConfirmada(String codigo, LocalDateTime fechaHora) {
        Reserva reserva = reservaPendiente(codigo, fechaHora);
        reserva.setEstado(EstadoReserva.CONFIRMADA);
        reserva.setLinkCancelacion("cancelar/" + codigo);
        return reserva;
    }
}