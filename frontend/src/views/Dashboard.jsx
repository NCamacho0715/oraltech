import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/authService';
import { Stethoscope, LogOut, User as UserIcon, Calendar, ClipboardList, Users, Moon, Sun } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
    const user = getCurrentUser();
    const navigate = useNavigate();

    const [stats, setStats] = React.useState({ totalPatients: 0, totalClinicalHistories: 0, appointmentsToday: 0 });
    const [isDark, setIsDark] = React.useState(document.documentElement.getAttribute('data-theme') === 'dark');

    React.useEffect(() => {
        const fetchStats = async () => {
            const user = getCurrentUser();
            if (user && user.token) {
                try {
                    const res = await axios.get('http://localhost:8080/api/dashboard/stats', {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
                    setStats(res.data);
                } catch (e) {
                    console.error("Error fetching stats", e);
                }
            }
        };
        fetchStats();
    }, []);

    const toggleTheme = () => {
        const nextTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        setIsDark(!isDark);
        localStorage.setItem('theme', nextTheme);
    };

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                        width: '32px', height: '32px', background: 'var(--primary)', 
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' 
                    }}>
                        <Stethoscope size={18} />
                    </div>
                    <h2 style={{ color: 'var(--primary)', fontSize: '1.4rem', margin: 0 }}>OralTech</h2>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button onClick={toggleTheme} style={{ 
                        background: 'var(--secondary-soft)', 
                        color: 'var(--primary)', 
                        padding: '0.5rem', 
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
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
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '1.5rem',
                    marginBottom: '3rem'
                }}>
                    {[
                        { label: 'Pacientes Activos', value: stats.totalPatients, color: 'var(--primary)' },
                        { label: 'Citas para Hoy', value: stats.appointmentsToday, color: '#00b4d8' },
                        { label: 'Historias Clínicas', value: stats.totalClinicalHistories, color: '#48cae4' },
                    ].map((stat, i) => (
                        <div key={i} style={{ 
                            background: 'var(--surface)', 
                            padding: '1.5rem', 
                            borderRadius: '16px', 
                            boxShadow: 'var(--shadow)',
                            borderLeft: `5px solid ${stat.color}`
                        }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</span>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                    gap: '2rem' 
                }}>
                    {[
                        { title: 'Gestión de Pacientes', desc: 'Registrar nuevos pacientes, ver fichas técnicas y acceder a sus historias clínicas.', icon: <Users size={32} />, color: '#0077b6', path: '/patients' },
                        { title: 'Agenda de Citas', desc: 'Organizar la disponibilidad del consultorio y programar citas con pacientes.', icon: <Calendar size={32} />, color: '#0077b6', path: '/appointments' },
                    ].map((item, index) => (
                        <div key={index} className="auth-card" 
                        onClick={() => navigate(item.path)}
                        style={{ 
                            padding: '2.5rem', 
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
                                width: '80px', 
                                height: '80px', 
                                borderRadius: '22px', 
                                backgroundColor: item.color + '15', 
                                color: item.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                                boxShadow: `0 10px 20px ${item.color}10`
                            }}>
                                {item.icon}
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.8rem', lineHeight: '1.5' }}>
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
