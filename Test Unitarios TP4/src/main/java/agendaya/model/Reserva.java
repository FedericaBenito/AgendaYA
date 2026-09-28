package agendaya.model;

import java.time.LocalDateTime;

public class Reserva {

    private String codigo;
    private Cliente cliente;
    private Profesional anfitrion;
    private LocalDateTime fechaHora;
    private String ubicacion;
    private EstadoReserva estado;
    private LocalDateTime fechaEnvioLinkConfirmacion;
    private String linkConfirmacion;
    private String linkCancelacion;
    private boolean linkCancelacionUsado;
    private boolean horarioOcupado;

    public Reserva(String codigo, Cliente cliente, Profesional anfitrion,
                   LocalDateTime fechaHora, String ubicacion) {
        this.codigo = codigo;
        this.cliente = cliente;
        this.anfitrion = anfitrion;
        this.fechaHora = fechaHora;
        this.ubicacion = ubicacion;
        this.estado = EstadoReserva.PENDIENTE_CONFIRMACION;
        this.linkCancelacionUsado = false;
        this.horarioOcupado = true;
    }

    public String getCodigo() { return codigo; }

    public Cliente getCliente() { return cliente; }

    public Profesional getAnfitrion() { return anfitrion; }

    public LocalDateTime getFechaHora() { return fechaHora; }

    public String getUbicacion() { return ubicacion; }

    public EstadoReserva getEstado() { return estado; }

    public void setEstado(EstadoReserva estado) { this.estado = estado; }

    public LocalDateTime getFechaEnvioLinkConfirmacion() { return fechaEnvioLinkConfirmacion; }

    public void setFechaEnvioLinkConfirmacion(LocalDateTime fechaEnvioLinkConfirmacion) {
        this.fechaEnvioLinkConfirmacion = fechaEnvioLinkConfirmacion;
    }

    public String getLinkConfirmacion() { return linkConfirmacion; }

    public void setLinkConfirmacion(String linkConfirmacion) { this.linkConfirmacion = linkConfirmacion; }

    public String getLinkCancelacion() { return linkCancelacion; }

    public void setLinkCancelacion(String linkCancelacion) { this.linkCancelacion = linkCancelacion; }

    public boolean isLinkCancelacionUsado() { return linkCancelacionUsado; }

    public void setLinkCancelacionUsado(boolean linkCancelacionUsado) {
        this.linkCancelacionUsado = linkCancelacionUsado;
    }

    public boolean isHorarioOcupado() { return horarioOcupado; }

    public void setHorarioOcupado(boolean horarioOcupado) { this.horarioOcupado = horarioOcupado; }
}
