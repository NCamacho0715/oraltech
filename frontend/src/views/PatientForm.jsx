import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPatient, updatePatient, getPatientById } from '../services/patientService';
import { ArrowLeft, Save, User, MapPin, Phone, Briefcase, Heart, Users as GuardianIcon } from 'lucide-react';

const SectionHeader = ({ icon, title }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', marginTop: '2rem', borderBottom: '2px solid var(--secondary-soft)', paddingBottom: '0.5rem' }}>
        <div style={{ color: 'var(--primary)' }}>{icon}</div>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 600 }}>{title}</h3>
    </div>
);

const PatientForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        firstSurname: '',
        secondSurname: '',
        names: '',
        idType: 'CC',
        idNumber: '',
        email: '',
        sex: 'M',
        birthDate: '',
        civilStatus: 'SOLTERO',
        occupation: '',
        eps: '',
        residenceAddress: '',
        residencePhone: '',
        residencePlace: '',
        officePlace: '',
        officePhone: '',
        emergencyPhone: '',
        cellphone: '',
        guardianName: '',
        guardianRelationship: '',
        guardianPhone: '',
        referredBy: '',
        referrerPhone: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let ignore = false;
        if (id) {
            const loadPatient = async () => {
                try {
                    const data = await getPatientById(id);
                    if (!ignore) {
                        setFormData(data);
                    }
                } catch (error) {
                    if (!ignore) {
                        console.error('Error loading patient:', error);
                        alert('Error al cargar datos del paciente');
                    }
                }
            };
            loadPatient();
        }
        return () => {
            ignore = true;
        };
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await updatePatient(id, formData);
            } else {
                await createPatient(formData);
            }
            navigate('/patients');
        } catch (error) {
            console.error('Error saving patient:', error);
            alert('Error al guardar datos del paciente: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1300px', width: '100%', margin: '0 auto' }}>
            <button 
                onClick={() => navigate('/patients')}
                style={{ background: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontWeight: 500 }}
            >
                <ArrowLeft size={18} />
                Volver al listado
            </button>

            <div className="auth-card" style={{ maxWidth: '100%', padding: '3rem' }}>
                <h1 style={{ color: 'var(--text-main)', fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {isEdit ? 'Editar Paciente' : 'Nuevo Registro de Paciente'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Complete todos los campos necesarios para la historia clínica.
                </p>

                <form onSubmit={handleSubmit}>
                    
                    <SectionHeader icon={<User size={22} />} title="Identificación Personal" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label htmlFor="patient-names">Nombre(s)</label>
                            <input id="patient-names" type="text" name="names" value={formData.names} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient-firstSurname">Primer Apellido</label>
                            <input id="patient-firstSurname" type="text" name="firstSurname" value={formData.firstSurname} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient-secondSurname">Segundo Apellido</label>
                            <input id="patient-secondSurname" type="text" name="secondSurname" value={formData.secondSurname} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient-idType">Tipo ID</label>
                            <select id="patient-idType" name="idType" value={formData.idType} onChange={handleChange}>
                                <option value="CC">Cédula de Ciudadanía</option>
                                <option value="TI">Tarjeta de Identidad</option>
                                <option value="RC">Registro Civil</option>
                                <option value="CE">Cédula de Extranjería</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient-idNumber">Número Identificación</label>
                            <input id="patient-idNumber" type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient-email">Correo Electrónico</label>
                            <input id="patient-email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="paciente@ejemplo.com" aria-label="Correo Electrónico" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient-sex">Sexo</label>
                            <select id="patient-sex" name="sex" value={formData.sex} onChange={handleChange}>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                                <option value="O">Otro</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient-birthDate">Fecha de Nacimiento</label>
                            <input id="patient-birthDate" type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient-civilStatus">Estado Civil</label>
                            <select id="patient-civilStatus" name="civilStatus" value={formData.civilStatus} onChange={handleChange}>
                                <option value="SOLTERO">Soltero(a)</option>
                                <option value="CASADO">Casado(a)</option>
                                <option value="DIVORCIADO">Divorciado(a)</option>
                                <option value="VIUDO">Viudo(a)</option>
                                <option value="UNION_LIBRE">Unión Libre</option>
                            </select>
                        </div>
                    </div>

                    <SectionHeader icon={<MapPin size={22} />} title="Residencia y Contacto" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label htmlFor="patient-residenceAddress">Dirección Residencia</label>
                            <input id="patient-residenceAddress" type="text" name="residenceAddress" value={formData.residenceAddress} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient-residencePlace">Lugar Residencia (Ciudad/Barrio)</label>
                            <input id="patient-residencePlace" type="text" name="residencePlace" value={formData.residencePlace} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient-residencePhone">Teléfono Residencia</label>
                            <input id="patient-residencePhone" type="text" name="residencePhone" value={formData.residencePhone} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient-cellphone">Celular</label>
                            <input id="patient-cellphone" type="text" name="cellphone" value={formData.cellphone} onChange={handleChange} />
                        </div>
                    </div>

                    <SectionHeader icon={<Briefcase size={22} />} title="Ocupación y EPS" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label htmlFor="patient-occupation">Ocupación</label>
                            <input id="patient-occupation" type="text" name="occupation" value={formData.occupation} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient-eps">EPS / Aseguradora</label>
                            <input id="patient-eps" type="text" name="eps" value={formData.eps} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient-officePlace">Lugar Oficina</label>
                            <input id="patient-officePlace" type="text" name="officePlace" value={formData.officePlace} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient-officePhone">Teléfono Oficina</label>
                            <input id="patient-officePhone" type="text" name="officePhone" value={formData.officePhone} onChange={handleChange} />
                        </div>
                    </div>

                    <SectionHeader icon={<GuardianIcon size={22} />} title="Acudiente y Referencia" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label htmlFor="patient-guardianName">Nombre del Acudiente</label>
                            <input id="patient-guardianName" type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient-guardianRelationship">Parentesco Acudiente</label>
                            <input id="patient-guardianRelationship" type="text" name="guardianRelationship" value={formData.guardianRelationship} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient-guardianPhone">Teléfono Acudiente</label>
                            <input id="patient-guardianPhone" type="text" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient-referredBy">Referido por (Persona)</label>
                            <input id="patient-referredBy" type="text" name="referredBy" value={formData.referredBy} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient-referrerPhone">Teléfono Referencia</label>
                            <input id="patient-referrerPhone" type="text" name="referrerPhone" value={formData.referrerPhone} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient-emergencyPhone">Teléfono Emergencias</label>
                            <input id="patient-emergencyPhone" type="text" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} />
                        </div>
                    </div>

                    <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem' }}>
                            <Save size={20} />
                            {loading ? 'Guardando...' : (isEdit ? 'Actualizar Paciente' : 'Registrar Paciente')}
                        </button>
                        <button type="button" onClick={() => navigate('/patients')} style={{ flex: 1, color: 'var(--text-secondary)', background: '#f5f5f5', borderRadius: '8px', fontWeight: 600 }}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientForm;
