package co.edu.unbosque.dto.clinica;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AnalisisPeriodontalResponse {
    private Long id;
    private Boolean bolsaPeriodontal;
    private Boolean pseudoBolsa;
    private Boolean movilidadDental;
    private Boolean perdidaOsea;
    private Boolean retraccionGingival;
    private Boolean calculosSupra;
    private Boolean calculosSub;
    private Boolean reabsorcionRadicular;
    private Boolean sangrado;
    private Boolean exudadoSupuracion;
    private Boolean inflamacion;
    private Boolean cambioColor;
}
