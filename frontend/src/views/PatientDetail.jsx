import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPatientById } from '../services/patientService';
import clinicaService from '../services/clinicaService';
import { ArrowLeft, User, MapPin, Briefcase, Heart, Users as GuardianIcon, Phone, Mail, Calendar, Edit2, ClipboardList } from 'lucide-react';

const DetailItem = ({ label, value }) => (
    <div style={{ marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 600 }}>{value || 'No registrado'}</span>
    </div>
);

const Section = ({ icon, title, children }) => (
    <div className="auth-card" style={{ maxWidth: '100%', padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' }}>
            <div style={{ color: 'var(--primary)' }}>{icon}</div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 600 }}>{title}</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {children}
        </div>
    </div>
);

const PatientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasHistoria, setHasHistoria] = useState(null);
    const [creatingHistory, setCreatingHistory] = useState(false);
    const [historiaError, setHistoriaError] = useState('');
    const [createError, setCreateError] = useState('');
    

    useEffect(() => {
        let ignore = false;
        const loadPatientData = async () => {
            try {
                setLoading(true);

                const patientData = await getPatientById(id);
                if (ignore) return;
                setPatient(patientData);

                try {
                    // Sonda ligera (siempre 200): no genera 404 en consola si no hay historia.
                    const { data } = await clinicaService.historiaExists(id);
                    if (ignore) return;
                    setHasHistoria(data?.exists === true);
                } catch (err) {
                    if (ignore) return;
                    setHistoriaError(err.response?.data?.message || err.message || 'No se pudo verificar la historia clínica');
                }
            } catch (error) {
                if (ignore) return;
                console.error('Error loading patient data:', error);
                alert('Error al cargar datos del paciente');
            } finally {
                setLoading(false);
            }
        };

        loadPatientData();
        return () => {
            ignore = true;
        };
    }, [id]);

    const handleCreateHistoria = async () => {
        try {
            setCreatingHistory(true);
            setCreateError('');
            await clinicaService.createHistoria(id);
            navigate(`/patients/${id}/clinica`);
        } catch (error) {
            setCreateError(error.response?.data?.message || error.message || 'Error al crear historia clínica');
        } finally {
            setCreatingHistory(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando información...</div>;
    if (!patient) return <div style={{ padding: '2rem', textAlign: 'center' }}>Paciente no encontrado</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button 
                    onClick={() => navigate('/patients')}
                    style={{ background: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: 500, border: 'none', cursor: 'pointer' }}
                >
                    <ArrowLeft size={18} />
                    Volver al listado
                </button>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                    {historiaError && (
                        <span style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600, alignSelf: 'center' }}>
                            {historiaError}
                        </span>
                    )}
                    {createError && (
                        <span style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600, alignSelf: 'center' }}>
                            {createError}
                        </span>
                    )}
                    {hasHistoria === false && (
                        <button 
                            onClick={handleCreateHistoria}
                            disabled={creatingHistory}
                            className="btn-primary"
                            style={{ 
                                width: 'auto', 
                                padding: '0.6rem 1.2rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem',
                                background: '#10b981', // emerald for create
                                opacity: creatingHistory ? 0.7 : 1
                            }}
                        >
                            <ClipboardList size={18} />
                            {creatingHistory ? 'Creando...' : 'Crear Historia Clínica'}
                        </button>
                    )}
                    {hasHistoria === true && (
                        <button 
                            onClick={() => navigate(`/patients/${id}/clinica`)}
                            className="btn-primary"
                            style={{ 
                                width: 'auto', 
                                padding: '0.6rem 1.2rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem',
                                background: '#4f46e5' // Indigo for clinical
                            }}
                        >
                            <ClipboardList size={18} />
                            Ver Historia Clínica
                        </button>
                    )}
                    <button 
                        onClick={() => navigate(`/patients/edit/${id}`)}
                        className="btn-primary"
                        style={{ width: 'auto', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Edit2 size={18} />
                        Editar Información
                    </button>
                </div>
            </div>

            <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '25px', 
                    background: 'var(--secondary-soft)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    margin: '0 auto 1rem'
                }}>
                    <User size={40} />
                </div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {patient.names} {patient.firstSurname} {patient.secondSurname}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    {patient.idType}: {patient.idNumber} • {patient.age} años
                </p>
            </header>

            <Section icon={<User size={20} />} title="Información Personal">
                <DetailItem label="Nombres" value={patient.names} />
                <DetailItem label="Apellidos" value={`${patient.firstSurname} ${patient.secondSurname || ''}`} />
                <DetailItem label="Identificación" value={`${patient.idType} ${patient.idNumber}`} />
                <DetailItem label="Sexo" value={patient.sex === 'M' ? 'Masculino' : patient.sex === 'F' ? 'Femenino' : 'Otro'} />
                <DetailItem label="Fecha de Nacimiento" value={patient.birthDate} />
                <DetailItem label="Estado Civil" value={patient.civilStatus} />
            </Section>

            <Section icon={<MapPin size={20} />} title="Residencia y Contacto">
                <DetailItem label="Celular" value={patient.cellphone} />
                <DetailItem label="Correo Electrónico" value={patient.email} />
                <DetailItem label="Dirección" value={patient.residenceAddress} />
                <DetailItem label="Lugar de Residencia" value={patient.residencePlace} />
                <DetailItem label="Teléfono Fijo" value={patient.residencePhone} />
            </Section>

            <Section icon={<Briefcase size={20} />} title="Ocupación y EPS">
                <DetailItem label="Ocupación" value={patient.occupation} />
                <DetailItem label="EPS" value={patient.eps} />
                <DetailItem label="Lugar de Trabajo" value={patient.officePlace} />
                <DetailItem label="Teléfono Oficina" value={patient.officePhone} />
            </Section>

            <Section icon={<GuardianIcon size={20} />} title="Contacto de Emergencia y Referencia">
                <DetailItem label="Acudiente" value={patient.guardianName} />
                <DetailItem label="Parentesco" value={patient.guardianRelationship} />
                <DetailItem label="Teléfono Acudiente" value={patient.guardianPhone} />
                <DetailItem label="Referido por" value={patient.referredBy} />
                <DetailItem label="Teléfono Referencia" value={patient.referrerPhone} />
                <DetailItem label="Teléfono Emergencia" value={patient.emergencyPhone} />
            </Section>
        </div>
    );
};

export default PatientDetail;
