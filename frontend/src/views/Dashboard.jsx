import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/authService';
import { Stethoscope, LogOut, User as UserIcon, Calendar, ClipboardList, Users } from 'lucide-react';

const Dashboard = () => {
    const user = getCurrentUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <nav style={{ 
                background: 'var(--surface)', 
                padding: '1rem 2rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                boxShadow: 'var(--shadow)',
                zIndex: 10
            }}>
                <div className="logo-container" style={{ marginBottom: 0 }}>
                    <div className="logo-icon" style={{ width: '32px', height: '32px' }}>
                        <Stethoscope size={18} />
                    </div>
                    <h2 style={{ color: 'var(--primary)', fontSize: '1.4rem' }}>OralTech</h2>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                        <UserIcon size={18} />
                        <span style={{ fontWeight: 500 }}>{user.username} ({user.role})</span>
                    </div>
                    <button onClick={handleLogout} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        color: 'var(--accent)',
                        background: 'none',
                        fontWeight: 600
                    }}>
                        <LogOut size={18} />
                        Salir
                    </button>
                </div>
            </nav>

            <main style={{ flex: 1, padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <header style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        Bienvenido, {user.username}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Panel de gestión del Consultorio Odontológico JG.
                    </p>
                </header>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '2rem' 
                }}>
                    {[
                        { title: 'Pacientes', icon: <Users size={32} />, color: '#0077b6', path: '/patients' },
                        { title: 'Citas Hoy', icon: <Calendar size={32} />, color: '#00b4d8', path: '/dashboard' },
                        { title: 'Historias Clínicas', icon: <ClipboardList size={32} />, color: '#90e0ef', path: '/patients' }
                    ].map((item, index) => (
                        <div key={index} className="auth-card" 
                        onClick={() => navigate(item.path)}
                        style={{ 
                            padding: '2rem', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ 
                                width: '70px', 
                                height: '70px', 
                                borderRadius: '20px', 
                                backgroundColor: item.color + '20', 
                                color: item.color,
                                display: 'flex',
                                alignItems: 'center',
                                justify_content: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                {item.icon}
                            </div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 600 }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Gestionar {item.title.toLowerCase()} del sistema.
                            </p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
