package agendaya.service;

import agendaya.model.Plantilla;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class PlantillaService {

    private final List<Plantilla> plantillas = new ArrayList<>();

    public List<Plantilla> listarPlantillas() {
        return plantillas;
    }

    public void crearPlantilla(Plantilla plantilla) {
        validarCamposObligatorios(plantilla);
        if (existeConNombre(plantilla.getNombre())) {
            throw new IllegalArgumentException(
                    "Ya existe una plantilla con ese nombre. Por favor ingrese un nombre distinto.");
        }
        plantillas.add(plantilla);
    }

    public void modificarPlantilla(String nombreActual, Plantilla datosNuevos) {
        validarCamposObligatorios(datosNuevos);
        Plantilla existente = buscarPorNombre(nombreActual);
        if (existente == null) {
            throw new IllegalStateException("No existe una plantilla con ese nombre.");
        }
        existente.setNombre(datosNuevos.getNombre());
        existente.setAsunto(datosNuevos.getAsunto());
        existente.setCuerpo(datosNuevos.getCuerpo());
        existente.setFirma(datosNuevos.getFirma());
        existente.setCategoria(datosNuevos.getCategoria());
        existente.setImagenEncabezado(datosNuevos.getImagenEncabezado());
        existente.setDestinatario(datosNuevos.getDestinatario());
        existente.setRemitente(datosNuevos.getRemitente());
    }

    public void eliminarPlantilla(String nombre) {
        Plantilla plantilla = buscarPorNombre(nombre);
        if (plantilla == null) {
            throw new IllegalStateException("No existe una plantilla con ese nombre.");
        }
        if (plantilla.isEnUso()) {
            throw new IllegalStateException(
                    "No es posible eliminar esta plantilla porque está siendo utilizada actualmente.");
        }
        plantillas.remove(plantilla);
    }

    public Plantilla duplicarPlantilla(String nombreOriginal) {
        Plantilla original = buscarPorNombre(nombreOriginal);
        if (original == null) {
            throw new IllegalStateException("No existe una plantilla con ese nombre.");
        }
        String nombreCopia = "Copia de " + original.getNombre();
        if (existeConNombre(nombreCopia)) {
            throw new IllegalArgumentException(
                    "Ya existe una plantilla con ese nombre. Por favor ingrese un nombre distinto.");
        }
        Plantilla copia = new Plantilla(
                nombreCopia,
                original.getAsunto(),
                original.getCuerpo(),
                original.getFirma(),
                original.getCategoria(),
                original.getDestinatario(),
                original.getRemitente()
        );
        copia.setImagenEncabezado(original.getImagenEncabezado());
        plantillas.add(copia);
        return copia;
    }

    public List<Plantilla> buscarPlantillas(String textoBusqueda, String categoria) {
        return plantillas.stream()
                .filter(p -> textoBusqueda == null || textoBusqueda.isBlank()
                        || p.getNombre().toLowerCase().contains(textoBusqueda.toLowerCase()))
                .filter(p -> categoria == null || categoria.isBlank()
                        || p.getCategoria().equalsIgnoreCase(categoria))
                .collect(Collectors.toList());
    }

    public String previsualizarPlantilla(Plantilla plantilla) {
        if (esVacio(plantilla.getAsunto()) || esVacio(plantilla.getCuerpo())) {
            throw new IllegalArgumentException(
                    "Debe completar al menos el Asunto y el Cuerpo para previsualizar la plantilla.");
        }
        String nombreCliente = plantilla.getDestinatario() != null
                ? plantilla.getDestinatario().getNombre() + " " + plantilla.getDestinatario().getApellido()
                : "Cliente";
        String nombreProfesional = plantilla.getRemitente() != null
                ? plantilla.getRemitente().getNombre() + " " + plantilla.getRemitente().getApellido()
                : "Profesional";
        return plantilla.getCuerpo()
                .replace("{{nombre_cliente}}", nombreCliente)
                .replace("{{nombre_profesional}}", nombreProfesional);
    }

    private void validarCamposObligatorios(Plantilla p) {
        if (esVacio(p.getNombre()) || esVacio(p.getAsunto())
                || esVacio(p.getCuerpo()) || esVacio(p.getFirma())) {
            throw new IllegalArgumentException(
                    "Los campos Nombre de plantilla, Asunto, Cuerpo y Firma son obligatorios.");
        }
    }

    private boolean esVacio(String valor) {
        return valor == null || valor.isBlank();
    }

    public Plantilla buscarPorNombre(String nombre) {
        return plantillas.stream()
                .filter(p -> p.getNombre().equalsIgnoreCase(nombre))
                .findFirst()
                .orElse(null);
    }

    private boolean existeConNombre(String nombre) {
        return buscarPorNombre(nombre) != null;
    }
}