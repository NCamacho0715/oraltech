-- Appointments table for OralTech scheduling module
CREATE TABLE public.appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id)
        REFERENCES public.patients (id) ON DELETE CASCADE,
    CONSTRAINT chk_appointment_time CHECK (end_time > start_time),
    CONSTRAINT chk_appointment_status CHECK (status IN ('PENDIENTE','CONFIRMADA','COMPLETADA','CANCELADA'))
);

CREATE INDEX idx_appointments_date ON public.appointments (appointment_date);
CREATE INDEX idx_appointments_patient ON public.appointments (patient_id);
CREATE INDEX idx_appointments_status ON public.appointments (status);
