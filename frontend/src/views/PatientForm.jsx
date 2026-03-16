import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPatient, updatePatient, getPatientById } from '../services/patientService';
import { ArrowLeft, Save, User, MapPin, Phone, Briefcase, Heart, Users as GuardianIcon } from 'lucide-react';

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
        if (isEdit) {
            loadPatient();
        }
    }, [id]);

    const loadPatient = async () => {
        try {
            const data = await getPatientById(id);
            setFormData(data);
        } catch (error) {
            console.error('Error loading patient:', error);
            alert('Error al cargar datos del paciente');
        }
    };

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

    const SectionHeader = ({ icon, title }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', marginTop: '2rem', borderBottom: '2px solid var(--secondary-soft)', paddingBottom: '0.5rem' }}>
            <div style={{ color: 'var(--primary)' }}>{icon}</div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 600 }}>{title}</h3>
        </div>
    );

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
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
                            <label>Nombre(s)</label>
                            <input type="text" name="names" value={formData.names} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Primer Apellido</label>
                            <input type="text" name="firstSurname" value={formData.firstSurname} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Segundo Apellido</label>
                            <input type="text" name="secondSurname" value={formData.secondSurname} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Tipo ID</label>
                            <select name="idType" value={formData.idType} onChange={handleChange}>
                                <option value="CC">Cédula de Ciudadanía</option>
                                <option value="TI">Tarjeta de Identidad</option>
                                <option value="RC">Registro Civil</option>
                                <option value="CE">Cédula de Extranjería</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Número Identificación</label>
                            <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Correo Electrónico</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="paciente@ejemplo.com" />
                        </div>
                        <div className="form-group">
                            <label>Sexo</label>
                            <select name="sex" value={formData.sex} onChange={handleChange}>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                                <option value="O">Otro</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Fecha de Nacimiento</label>
                            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Estado Civil</label>
                            <select name="civilStatus" value={formData.civilStatus} onChange={handleChange}>
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
                            <label>Dirección Residencia</label>
                            <input type="text" name="residenceAddress" value={formData.residenceAddress} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Lugar Residencia (Ciudad/Barrio)</label>
                            <input type="text" name="residencePlace" value={formData.residencePlace} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Teléfono Residencia</label>
                            <input type="text" name="residencePhone" value={formData.residencePhone} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Celular</label>
                            <input type="text" name="cellphone" value={formData.cellphone} onChange={handleChange} />
                        </div>
                    </div>

                    <SectionHeader icon={<Briefcase size={22} />} title="Ocupación y EPS" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label>Ocupación</label>
                            <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>EPS / Aseguradora</label>
                            <input type="text" name="eps" value={formData.eps} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Lugar Oficina</label>
                            <input type="text" name="officePlace" value={formData.officePlace} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Teléfono Oficina</label>
                            <input type="text" name="officePhone" value={formData.officePhone} onChange={handleChange} />
                        </div>
                    </div>

                    <SectionHeader icon={<GuardianIcon size={22} />} title="Acudiente y Referencia" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label>Nombre del Acudiente</label>
                            <input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Parentesco Acudiente</label>
                            <input type="text" name="guardianRelationship" value={formData.guardianRelationship} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Teléfono Acudiente</label>
                            <input type="text" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Referido por (Persona)</label>
                            <input type="text" name="referredBy" value={formData.referredBy} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Teléfono Referencia</label>
                            <input type="text" name="referrerPhone" value={formData.referrerPhone} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Teléfono Emergencias</label>
                            <input type="text" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} />
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
