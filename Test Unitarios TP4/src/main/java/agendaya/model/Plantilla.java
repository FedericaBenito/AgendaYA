package agendaya.model;

public class Plantilla {

    private String nombre;
    private String asunto;
    private String cuerpo;
    private String firma;
    private String categoria;
    private String imagenEncabezado;
    private boolean enUso;
    private Cliente destinatario;
    private Profesional remitente;

    public Plantilla(String nombre, String asunto, String cuerpo, String firma,
                     String categoria, Cliente destinatario, Profesional remitente) {
        this.nombre = nombre;
        this.asunto = asunto;
        this.cuerpo = cuerpo;
        this.firma = firma;
        this.categoria = categoria;
        this.destinatario = destinatario;
        this.remitente = remitente;
        this.enUso = false;
        this.imagenEncabezado = null;
    }

    public String getNombre()              { return nombre; }
    public void setNombre(String nombre)   { this.nombre = nombre; }

    public String getAsunto()              { return asunto; }
    public void setAsunto(String asunto)   { this.asunto = asunto; }

    public String getCuerpo()              { return cuerpo; }
    public void setCuerpo(String cuerpo)   { this.cuerpo = cuerpo; }

    public String getFirma()               { return firma; }
    public void setFirma(String firma)     { this.firma = firma; }

    public String getCategoria()                { return categoria; }
    public void setCategoria(String categoria)  { this.categoria = categoria; }

    public String getImagenEncabezado()                       { return imagenEncabezado; }
    public void setImagenEncabezado(String imagenEncabezado)  { this.imagenEncabezado = imagenEncabezado; }

    public boolean isEnUso()            { return enUso; }
    public void setEnUso(boolean enUso) { this.enUso = enUso; }

    public Cliente getDestinatario()                  { return destinatario; }
    public void setDestinatario(Cliente destinatario) { this.destinatario = destinatario; }

    public Profesional getRemitente()                   { return remitente; }
    public void setRemitente(Profesional remitente)     { this.remitente = remitente; }
}
