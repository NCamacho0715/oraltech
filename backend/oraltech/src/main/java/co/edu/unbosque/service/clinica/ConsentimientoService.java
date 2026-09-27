package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.ConsentimientoRequest;
import co.edu.unbosque.dto.clinica.ConsentimientoResponse;
import co.edu.unbosque.entity.clinica.Consentimiento;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.repository.clinica.ConsentimientoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConsentimientoService {

    private final ConsentimientoRepository repo;
    private final HistoriaClinicaService historiaService;
    private final HistoriaClinicaGuard guard;

    @Transactional
    public ConsentimientoResponse upsert(UUID historiaId, ConsentimientoRequest req) {
        HistoriaClinica historia = historiaService.findOrThrow(historiaId);
        guard.requireActiva(historia);
        guard.registrarActividad(historia);

        // Validate signatures
        guard.validateSignatureSize(req.getFirmaPaciente(), "firmaPaciente");
        guard.validateSignatureSize(req.getFirmaOdontologo(), "firmaOdontologo");
        guard.validateSignatureSize(req.getFirmaTestigo(), "firmaTestigo");

        Consentimiento c = repo.findByHistoriaClinicaId(historiaId)
                .orElseGet(() -> {
                    Consentimiento newC = new Consentimiento();
                    newC.setHistoriaClinica(historia);
                    return newC;
                });

        c.setContenido(req.getContenido());
        c.setPacienteNombre(req.getPacienteNombre());
        c.setPacienteCc(req.getPacienteCc());
        c.setOdontologoNombre(req.getOdontologoNombre());
        c.setOdontologoCc(req.getOdontologoCc());
        c.setFirmaPaciente(req.getFirmaPaciente());
        c.setFirmaOdontologo(req.getFirmaOdontologo());
        c.setFirmaTestigo(req.getFirmaTestigo());

        return toResponse(repo.save(c));
    }

    @Transactional(readOnly = true)
    public ConsentimientoResponse get(UUID historiaId) {
        Consentimiento c = repo.findByHistoriaClinicaId(historiaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consentimiento no encontrado"));
        return toResponse(c);
    }

    private ConsentimientoResponse toResponse(Consentimiento c) {
        return ConsentimientoResponse.builder()
                .id(c.getId())
                .contenido(c.getContenido())
                .pacienteNombre(c.getPacienteNombre())
                .pacienteCc(c.getPacienteCc())
                .odontologoNombre(c.getOdontologoNombre())
                .odontologoCc(c.getOdontologoCc())
                .fecha(c.getFecha())
                .firmaPaciente(c.getFirmaPaciente())
                .firmaOdontologo(c.getFirmaOdontologo())
                .firmaTestigo(c.getFirmaTestigo())
                .createdAt(c.getAudit().getCreatedAt())
                .createdBy(c.getAudit().getCreatedBy())
                .updatedAt(c.getAudit().getUpdatedAt())
                .updatedBy(c.getAudit().getUpdatedBy())
                .build();
    }
}
