import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatientsPaginated, deletePatient } from '../services/patientService';
import { UserPlus, Search, Edit2, Trash2, Eye, Users, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

const PatientList = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [confirmWord, setConfirmWord] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const navigate = useNavigate();

    // Solo el rol administrador puede eliminar pacientes (el backend lo exige con 403).
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    const isAdmin = currentUser?.role === 'ADMIN';

    const fetchPatients = useCallback(async (targetPage, query) => {
        setLoading(true);
        try {
            const data = await getPatientsPaginated(targetPage, pageSize, query);
            if (data && data.content) {
                setPatients(data.content);
                setTotalPages(data.totalPages || 0);
                setTotalElements(data.totalElements || 0);
            } else if (Array.isArray(data)) {
                setPatients(data);
                setTotalPages(1);
                setTotalElements(data.length);
            }
        } catch (error) {
            console.error('Error loading patients:', error);
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    useEffect(() => {
        let ignore = false;
        const handler = setTimeout(() => {
            if (!ignore) {
                fetchPatients(page, searchTerm);
            }
        }, 250);

        return () => {
            ignore = true;
            clearTimeout(handler);
        };
    }, [page, searchTerm, fetchPatients]);

    const reloadPatients = () => {
        fetchPatients(page, searchTerm);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(0);
    };

    const openDeleteConfirm = (patient) => {
        setDeleteTarget(patient);
        setConfirmWord('');
        setDeleteError('');
    };

    const closeDeleteConfirm = () => {
        if (deleting) return;
        setDeleteTarget(null);
        setConfirmWord('');
        setDeleteError('');
    };

    const handleDelete = async () => {
        if (!deleteTarget || confirmWord.trim() !== 'CONFIRMAR' || deleting) return;
        setDeleting(true);
        setDeleteError('');
        try {
            await deletePatient(deleteTarget.id);
            setDeleteTarget(null);
            setConfirmWord('');
            reloadPatients();
        } catch (error) {
            if (error.response?.status === 403) {
                setDeleteError('Solo un administrador puede eliminar pacientes');
            } else {
                setDeleteError(error.response?.data?.message || error.message || 'Error al eliminar paciente');
            }
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        style={{ border: 'none', background: 'var(--secondary-soft)', color: 'var(--primary)', padding: '0.6rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Volver al Dashboard"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ color: 'var(--text-main)', fontSize: '2rem', fontWeight: 700 }}>Pacientes</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Gestión de la base de datos de pacientes.</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/patients/new')}
                    className="btn-primary" 
                    style={{ width: 'auto', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <UserPlus size={20} />
                    Nuevo Paciente
                </button>
            </div>

            <div className="auth-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '100%' }}>
                <Search size={20} color="var(--text-secondary)" />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre, apellido o identificación..." 
                    aria-label="Buscar pacientes por nombre, apellido o identificación"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ 
                        flex: 1, 
                        border: 'none', 
                        outline: 'none', 
                        fontSize: '1rem', 
                        background: 'transparent'
                    }}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando pacientes...</div>
            ) : patients.length === 0 ? (
                <div className="auth-card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <Users size={48} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>No se encontraron pacientes.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {patients.map(patient => (
                        <div 
                            key={patient.id} 
                            className="auth-card" 
                            style={{ padding: '1.5rem', position: 'relative' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <button
                                    type="button"
                                    aria-label={`Ver historia clínica de ${patient.names} ${patient.firstSurname}`}
                                    onClick={() => navigate(`/patients/${patient.id}`)}
                                    style={{ 
                                        width: '45px', 
                                        height: '45px', 
                                        borderRadius: '12px', 
                                        background: 'var(--secondary-soft)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        color: 'var(--primary)',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Eye size={24} />
                                </button>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button 
                                        type="button"
                                        aria-label="Editar paciente"
                                        onClick={(e) => { e.stopPropagation(); navigate(`/patients/edit/${patient.id}`); }} 
                                        style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }} 
                                        title="Editar"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    {isAdmin && !patient.hasHistoriaClinica && (
                                    <button
                                        type="button"
                                        aria-label="Eliminar paciente"
                                        onClick={(e) => { e.stopPropagation(); openDeleteConfirm(patient); }}
                                        style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                                        title="Eliminar paciente (sin historia clínica)"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    )}
                                </div>
                            </div>
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => navigate(`/patients/${patient.id}`)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        navigate(`/patients/${patient.id}`);
                                    }
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                                    {patient.names} {patient.firstSurname}
                                </h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    {patient.idType}: {patient.idNumber}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', paddingTop: '1rem', marginTop: '1rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        <strong>Edad:</strong> {patient.age} años
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        <strong>Celular:</strong> {patient.cellphone || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && totalElements > 0 && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '2rem',
                        padding: '1rem 1.5rem',
                        background: 'var(--surface)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        flexWrap: 'wrap',
                        gap: '1rem',
                    }}
                >
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Mostrando <strong style={{ color: 'var(--text-main)' }}>{page * pageSize + 1}</strong> a{' '}
                        <strong style={{ color: 'var(--text-main)' }}>{Math.min((page + 1) * pageSize, totalElements)}</strong> de{' '}
                        <strong style={{ color: 'var(--text-main)' }}>{totalElements}</strong> pacientes
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '0.5rem 0.9rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: page === 0 ? 'transparent' : 'var(--secondary-soft)',
                                color: page === 0 ? 'var(--text-secondary)' : 'var(--primary)',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                cursor: page === 0 ? 'not-allowed' : 'pointer',
                                opacity: page === 0 ? 0.5 : 1,
                            }}
                        >
                            <ChevronLeft size={16} /> Anterior
                        </button>

                        <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', padding: '0 0.5rem', fontWeight: 600 }}>
                            Página {page + 1} de {Math.max(1, totalPages)}
                        </span>

                        <button
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '0.5rem 0.9rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: page >= totalPages - 1 ? 'transparent' : 'var(--secondary-soft)',
                                color: page >= totalPages - 1 ? 'var(--text-secondary)' : 'var(--primary)',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                                opacity: page >= totalPages - 1 ? 0.5 : 1,
                            }}
                        >
                            Siguiente <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
                    <button
                        type="button"
                        aria-label="Cerrar modal de eliminación"
                        tabIndex={-1}
                        onClick={closeDeleteConfirm}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'default' }}
                    />
                    <div style={{ position: 'relative', background: 'var(--surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '2rem', borderRadius: '16px', width: '440px', maxWidth: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', zIndex: 1 }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, fontSize: '1.2rem' }}>Eliminar paciente</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0 0 1.5rem 0' }}>
                            Se eliminará a <strong style={{ color: 'var(--text-main)' }}>{deleteTarget.names} {deleteTarget.firstSurname}</strong> ({deleteTarget.idType}: {deleteTarget.idNumber}).
                            Esta acción no se puede deshacer. Para confirmar, escribe <strong style={{ color: 'var(--accent)' }}>CONFIRMAR</strong>.
                        </p>
                        <label htmlFor="confirm-delete-input" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            Escribe CONFIRMAR para continuar:
                        </label>
                        <input
                            id="confirm-delete-input"
                            type="text"
                            value={confirmWord}
                            onChange={(e) => setConfirmWord(e.target.value)}
                            placeholder="Escribe CONFIRMAR"
                            aria-label="Confirmación de eliminación"
                            style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '1rem', outline: 'none', background: 'var(--surface)', color: 'var(--text-main)', marginBottom: '1rem' }}
                        />
                        {deleteError && <p style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600 }}>{deleteError}</p>}
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={closeDeleteConfirm} disabled={deleting} style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting || confirmWord.trim() !== 'CONFIRMAR'}
                                style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 700, cursor: confirmWord.trim() !== 'CONFIRMAR' ? 'not-allowed' : 'pointer', opacity: (deleting || confirmWord.trim() !== 'CONFIRMAR') ? 0.5 : 1 }}
                            >
                                {deleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientList;
