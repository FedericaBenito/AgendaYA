package agendaya.model;

public class Profesional {

    private String nombre;
    private String apellido;
    private String dni;
    private String correo;

    public Profesional(String nombre, String apellido, String dni, String correo) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.dni = dni;
        this.correo = correo;
    }

    public String getNombre()   { return nombre; }
    public String getApellido() { return apellido; }
    public String getDni()      { return dni; }
    public String getCorreo()   { return correo; }

    public void setNombre(String nombre)     { this.nombre = nombre; }
    public void setApellido(String apellido) { this.apellido = apellido; }
    public void setDni(String dni)           { this.dni = dni; }
    public void setCorreo(String correo)     { this.correo = correo; }
}