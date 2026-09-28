package agendaya.model;

public class Mail {

    private final String destinatario;
    private final String asunto;
    private final String cuerpo;

    public Mail(String destinatario, String asunto, String cuerpo) {
        this.destinatario = destinatario;
        this.asunto = asunto;
        this.cuerpo = cuerpo;
    }

    public String getDestinatario() { return destinatario; }

    public String getAsunto() { return asunto; }

    public String getCuerpo() { return cuerpo; }
}
