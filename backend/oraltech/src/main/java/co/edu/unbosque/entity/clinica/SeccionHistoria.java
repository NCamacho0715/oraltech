package co.edu.unbosque.entity.clinica;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Secciones singleton de la historia clínica sujetas a inmutabilidad (HU-2).
 * El slug identifica la sección en la URL de desbloqueo y en la tabla
 * {@code desbloqueo_seccion}; el nombre se usa en los mensajes 409.
 */
@Getter
public enum SeccionHistoria {
    ANAMNESIS("anamnesis", "Anamnesis"),
    ANTECEDENTES("antecedentes", "Antecedentes"),
    EXAMEN("examen", "Examen Clínico"),
    PULPAR("pulpar", "Análisis Pulpar"),
    PERIODONTAL("periodontal", "Análisis Periodontal"),
    COMPLEMENTARIO("complementario", "Exámenes Complementarios"),
    DIAGNOSTICO("diagnostico", "Diagnóstico"),
    PRONOSTICO("pronostico", "Pronóstico"),
    CONSENTIMIENTO("consentimiento", "Consentimiento"),
    PROTESIS("protesis", "Prótesis"),
    ODONTOGRAMA("odontograma", "Odontograma");

    private final String slug;
    private final String nombre;

    SeccionHistoria(String slug, String nombre) {
        this.slug = slug;
        this.nombre = nombre;
    }

    public static SeccionHistoria fromSlug(String slug) {
        for (SeccionHistoria s : values()) {
            if (s.slug.equalsIgnoreCase(slug)) {
                return s;
            }
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Sección desconocida: " + slug);
    }

    public String mensajeBloqueo() {
        return nombre + " ya registrada y bloqueada";
    }
}
