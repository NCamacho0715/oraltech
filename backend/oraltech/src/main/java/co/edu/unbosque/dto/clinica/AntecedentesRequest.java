package co.edu.unbosque.dto.clinica;

import lombok.Data;

@Data
public class AntecedentesRequest {
    // Familiares
    private Boolean famCardiacos;
    private Boolean famDiabetes;
    private Boolean famHipertension;
    private Boolean famCancer;
    private Boolean famEpilepsia;
    private String famOtros;

    // Patológicos
    private Boolean hepatitis;
    private Boolean fiebreReumatica;
    private Boolean patDiabetes;
    private Boolean ulcera;
    private Boolean patEpilepsia;
    private Boolean patHipertension;
    private Boolean convulsiones;
    private String alergias;
    private Boolean mareos;
    private Boolean fracturas;
    private Boolean hemorragias;
    private Boolean cicatrizacion;
    private Boolean infartos;
    private Boolean valvulas;
    private Boolean renales;
    private Boolean respiratorios;
    private Boolean vih;

    // Toxicológicos
    private Boolean fuma;
    private Boolean alcohol;
    private String cafe;
    private String medicamentos;
    private String alergiaMedicamentos;
    private Boolean alergiaAnestesia;

    // Médicos personales
    private Boolean tratamiento;
    private Boolean embarazo;
    private Integer mesesEmbarazo;
    private Boolean cirugias;
    private Boolean transfusiones;

    // Estomatológicos
    private Boolean luxacion;
    private Boolean amigdalitis;
    private Boolean infecciones;
    private Boolean halitosis;
    private Boolean fuegos;
    private Short cepilladoFreq;
    private String sedaFreq;
    private String otrosHabitos;
    private String ultimaVisita;
    private String motivoVisita;

    // Observaciones
    private String observaciones;
}
