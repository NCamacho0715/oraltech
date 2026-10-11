import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatientsPaginated, deletePatient } from '../services/patientService';
import { UserPlus, Search, ArrowLeft } from 'lucide-react';
import {
    PatientGrid,
    PatientPagination,
    DeletePatientModal,
} from '../components/patients/PatientListComponents';

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

    const fetchPatientsRef = useRef(fetchPatients);
    useEffect(() => {
        fetchPatientsRef.current = fetchPatients;
    });

    useEffect(() => {
        let ignore = false;
        const handler = setTimeout(() => {
            if (!ignore) {
                fetchPatientsRef.current(page, searchTerm);
            }
        }, 250);

        return () => {
            ignore = true;
            clearTimeout(handler);
        };
    }, [page, searchTerm]);

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
        <div style={{ padding: '2rem', maxWidth: '1650px', width: '100%', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button 
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        style={{ border: 'none', background: 'var(--secondary-soft)', color: 'var(--primary)', padding: '0.6rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Volver al Dashboard"
                        aria-label="Volver al Dashboard"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ color: 'var(--text-main)', fontSize: '2rem', fontWeight: 700 }}>Pacientes</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Gestión de la base de datos de pacientes.</p>
                    </div>
                </div>
                <button 
                    type="button"
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

            <PatientGrid 
                loading={loading}
                patients={patients}
                navigate={navigate}
                isAdmin={isAdmin}
                openDeleteConfirm={openDeleteConfirm}
            />

            {!loading && totalElements > 0 && (
                <PatientPagination 
                    page={page}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    setPage={setPage}
                />
            )}

            {deleteTarget && (
                <DeletePatientModal 
                    deleteTarget={deleteTarget}
                    confirmWord={confirmWord}
                    setConfirmWord={setConfirmWord}
                    deleteError={deleteError}
                    deleting={deleting}
                    closeDeleteConfirm={closeDeleteConfirm}
                    handleDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default PatientList;
