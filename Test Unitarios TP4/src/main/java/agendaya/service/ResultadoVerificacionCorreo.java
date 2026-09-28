package agendaya.service;

public class ResultadoVerificacionCorreo {

    private final boolean exitoso;
    private final String mensaje;
    private final String codigoVerificacion;

    public ResultadoVerificacionCorreo(boolean exitoso, String mensaje, String codigoVerificacion) {
        this.exitoso = exitoso;
        this.mensaje = mensaje;
        this.codigoVerificacion = codigoVerificacion;
    }

    public boolean isExitoso() { return exitoso; }

    public String getMensaje() { return mensaje; }

    public String getCodigoVerificacion() { return codigoVerificacion; }
}
