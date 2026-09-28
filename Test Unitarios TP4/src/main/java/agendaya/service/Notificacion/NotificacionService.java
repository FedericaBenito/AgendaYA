package agendaya.service.Notificacion;

import java.util.ArrayList;
import java.util.List;

public class NotificacionService {

    // ==========================================
    // CÓDIGO DE LUCY (US-01, US-02, US-03)
    // ==========================================
    public boolean enviarConfirmacionProfesional(String email){
        return true;
    }

    public boolean enviarConfirmacionCliente(String email){
        return true;
    }

    public boolean notificarCancelacionProfesional(String email){
        return true;
    }


    // ==========================================
    // TU CÓDIGO - MARCO (US-04, US-05, US-06)
    // ==========================================

    // Listas para que los tests puedan verificar qué se envió
    private List<String> correosEnviados = new ArrayList<>();
    private List<String> asuntosEnviados = new ArrayList<>();
    private List<String> cuerposEnviados = new ArrayList<>();

    // US-04: Cliente cancela -> Notificamos al Profesional
    public void notificarCancelacionAProfesional(String numReserva, String nombreCliente, String fecha, String hora, String emailProfesional) {
        String asunto = "CANCELACIÓN RESERVA NÚMERO " + numReserva;

        if (asuntosEnviados.contains(asunto)) return; // Evita duplicados

        String cuerpo = "Le informamos que la reserva " + numReserva + " ha sido cancelada por el cliente " + nombreCliente + " con fecha " + fecha + " y hora: " + hora + ".";
        registrarEnvio(emailProfesional, asunto, cuerpo);
    }

    // US-05: Profesional reagenda -> Notificamos al Cliente
    public void notificarReagendadoACliente(String numReserva, String nombreCliente, String fechaAnt, String fechaNva, String horaAnt, String horaNva, String modalidad, String emailCliente, boolean usaPlantillaPersonalizada, String asuntoCustom, String cuerpoCustom) {
        long startTime = System.currentTimeMillis();

        String asunto = usaPlantillaPersonalizada ? asuntoCustom : "REAGENDADO DE RESERVA " + numReserva;
        String cuerpo = usaPlantillaPersonalizada ? cuerpoCustom :
                "Reserva Re-agendada\nHola " + nombreCliente + ", hemos actualizado los detalles de su reserva.\n" +
                        "DETALLES DE LA RESERVA\nFecha " + fechaAnt + " a " + fechaNva + "\n" +
                        "Hora " + horaAnt + " a " + horaNva + "\nModalidad " + modalidad + "\nReferencia " + numReserva;

        registrarEnvio(emailCliente, asunto, cuerpo);

        if ((System.currentTimeMillis() - startTime) >= 5000) {
            throw new RuntimeException("El envío tardó más de 5 segundos");
        }
    }

    // US-06: Profesional cancela -> Notificamos al Cliente
    public void notificarCancelacionACliente(String numReserva, String fecha, String hora, String emailCliente) {
        String asunto = "CANCELACIÓN RESERVA NÚMERO " + numReserva;

        if (asuntosEnviados.contains(asunto)) return; // Evita duplicados

        String cuerpo = "Le informamos que la reserva " + numReserva + " con fecha " + fecha + " y hora: " + hora + " ha sido cancelada por el profesional.";
        registrarEnvio(emailCliente, asunto, cuerpo);
    }

    private void registrarEnvio(String email, String asunto, String cuerpo) {
        correosEnviados.add(email);
        asuntosEnviados.add(asunto);
        cuerposEnviados.add(cuerpo);
    }

    public List<String> getCorreosEnviados() { return correosEnviados; }
    public List<String> getAsuntosEnviados() { return asuntosEnviados; }
    public List<String> getCuerposEnviados() { return cuerposEnviados; }

    // ==========================================
    // CÓDIGO DE JOACO (US-07, US-08, US-09)
    // ==========================================

    // US-07: Cliente cancela -> Notificamos al Cliente
    public void notificarCancelacionAClientePropio(String numReserva, String nombreCliente,
                                                   String fecha, String hora, String emailCliente,
                                                   boolean usaPlantillaPersonalizada, String asuntoCustom,
                                                   String cuerpoCustom) {
        long startTime = System.currentTimeMillis();

        String asunto = usaPlantillaPersonalizada ? asuntoCustom : "CANCELACIÓN DE RESERVA " + numReserva;
        if (asuntosEnviados.contains(asunto)) return; // Evita duplicidades

        String cuerpo = usaPlantillaPersonalizada ? cuerpoCustom :
                "Reserva Cancelada\nEstimado/a " + nombreCliente + ", ¡tu reserva fue cancelada!\n" +
                        "Gracias por elegir AgendaYA.\nConfirmamos que la cita programada para el día " + fecha + " a las " + hora + " (ART)\n" +
                        "En caso de requerir una reprogramación … ante cualquier consulta.\nReferencia " + numReserva;

        registrarEnvio(emailCliente, asunto, cuerpo);

        if ((System.currentTimeMillis() - startTime) >= 5000) {
            throw new RuntimeException("El envío tardó más de 5 segundos");
        }
    }

    // US-08: Notificación de reserva pendiente a confirmar
    public void notificarReservaPendiente(String numReserva, String fecha, String hora, String emailCliente,
                                          boolean yaConfirmada) {
        if (yaConfirmada) {
            throw new IllegalStateException("Error: La reserva ya ha sido confirmada previamente.");
        }

        String asunto = "Reserva Pendiente de Confirmación " + numReserva;
        if (asuntosEnviados.contains(asunto)) return; // Evita duplicados

        String cuerpo = "Tu reserva número " + numReserva + " día " + fecha + " y hora " + hora + " está pendiente de confirmación. Para confirmar haga click en el botón de \"Confirmar Reserva\".";

        registrarEnvio(emailCliente, asunto, cuerpo);
    }

    // US-09: Recordatorio 24hs antes
    public void enviarRecordatorio24hs(String numReserva, String nombreCliente, String fecha, String hora,
                                       String nombreProfesional, String estadoReserva, long horasFaltantes,
                                       String emailCliente) {
        if (!"Confirmada".equalsIgnoreCase(estadoReserva)) {
            return; // No envía si la reserva no está confirmada
        }

        if (horasFaltantes != 24) {
            return; // Valida que falten exactamente 24 horas
        }

        String asunto = "Recordatorio de Reserva " + numReserva;
        String cuerpo = "Hola " + nombreCliente + ", te recordamos tu reserva.\n" +
                "Fecha: " + fecha + "\n" +
                "Hora: " + hora + "\n" +
                "Código: " + numReserva + "\n" +
                "Profesional: " + nombreProfesional + "\n" +
                "Tu reserva se encuentra confirmada.";

        registrarEnvio(emailCliente, asunto, cuerpo);
    }
}
