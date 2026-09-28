package agendaya.service;

import agendaya.model.Reserva;

public class ResultadoCancelacionReserva {

    private final boolean cancelada;
    private final String mensaje;
    private final Reserva reserva;

    public ResultadoCancelacionReserva(boolean cancelada, String mensaje, Reserva reserva) {
        this.cancelada = cancelada;
        this.mensaje = mensaje;
        this.reserva = reserva;
    }

    public boolean isCancelada() { return cancelada; }

    public String getMensaje() { return mensaje; }

    public Reserva getReserva() { return reserva; }
}
