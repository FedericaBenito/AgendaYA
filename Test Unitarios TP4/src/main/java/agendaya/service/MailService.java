package agendaya.service;

import agendaya.model.Mail;

import java.util.ArrayList;
import java.util.List;

public class MailService {

    private final List<Mail> mailsEnviados = new ArrayList<>();

    public void enviar(String destinatario, String asunto, String cuerpo) {
        mailsEnviados.add(new Mail(destinatario, asunto, cuerpo));
    }

    public List<Mail> getMailsEnviados() {
        return List.copyOf(mailsEnviados);
    }

    public void limpiar() {
        mailsEnviados.clear();
    }
}
