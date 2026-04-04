package co.edu.unbosque.dto.clinica;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ExamenClinicoResponse {
    private Long id;

    // Tejidos blandos
    private String lengua;
    private String carrillos;
    private String frenillos;
    private String paladar;
    private String pisoBoca;
    private String labios;
    private String comisuras;
    private String glandulas;
    private String pigmentaciones;

    // Tejidos duros
    private Boolean hipoplasias;
    private Boolean amelogenesis;
    private Boolean manchas;
    private Boolean desgastes;
    private Boolean tdFracturas;
    private Boolean agenesia;
    private Boolean supernumerario;
    private String ausenteObs;

    // Maxilares
    private Boolean micrognasia;
    private Boolean macrognasia;
    private Boolean torus;
    private String maxOtros;

    // ATM
    private Boolean dolorArticular;
    private Boolean dolorMuscular;
    private Boolean ruidos;
    private Boolean limitacion;
    private Boolean desviacion;
    private String atmObservaciones;

    // Oclusión
    private BigDecimal sobremordidaH;
    private BigDecimal sobremordidaV;
    private String oclusionTipo;
    private String lineaMedia;
    private String patronMasticacion;

    // Hábitos
    private String higiene;
    private Boolean habHalitosis;
    private Boolean bruxismo;
    private String habOtros;
}
