import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import AuthHeader from '../components/common/AuthHeader';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(credentials);
            navigate('/dashboard'); // We'll create a simple dashboard later
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Error al iniciar sesión. Verifique sus credenciales.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card login-page-card">
                <AuthHeader subtitle="Bienvenido de nuevo. Ingrese sus credenciales." />

                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message" style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
                    
                    <div className="form-group">
                        <label htmlFor="username">Usuario</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder="Nombre de usuario"
                                value={credentials.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                                style={{ paddingRight: '2.8rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                                style={{
                                    position: 'absolute',
                                    right: '0.8rem',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px',
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <RefreshCw className="animate-spin" size={20} /> : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
