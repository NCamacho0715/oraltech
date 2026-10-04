import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';
import { RefreshCw } from 'lucide-react';
import AuthHeader from '../components/common/AuthHeader';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'DENTIST'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Error al registrar usuario.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card register-page-card">
                <AuthHeader subtitle="Cree una cuenta para el personal del consultorio." />

                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message" style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
                    
                    <div className="form-group">
                        <label htmlFor="name">Nombre Completo</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Ej. Dr. Juan Perez"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <div className="input-wrapper">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="doctor@oraltech.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Usuario</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder="usuario123"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <div className="input-wrapper">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <RefreshCw className="animate-spin" size={20} /> : 'Crear Cuenta'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
