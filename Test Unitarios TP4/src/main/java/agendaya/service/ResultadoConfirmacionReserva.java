package agendaya.service;

public class ResultadoConfirmacionReserva {

    private final boolean confirmada;
    private final String mensaje;
    private final boolean puedeCancelar;

    public ResultadoConfirmacionReserva(boolean confirmada, String mensaje, boolean puedeCancelar) {
        this.confirmada = confirmada;
        this.mensaje = mensaje;
        this.puedeCancelar = puedeCancelar;
    }

    public boolean isConfirmada() { return confirmada; }

    public String getMensaje() { return mensaje; }

    public boolean isPuedeCancelar() { return puedeCancelar; }
}
