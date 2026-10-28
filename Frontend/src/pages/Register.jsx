import { useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDBUser } from '../hooks/DataBaseHook';

function Register() {
    const [, register] = useDBUser();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleRegister(e) {
        e.preventDefault();
        setError('');

        if (name.trim().includes('@')) {
            setError('Логин не должен содержать символ @.');
            return;
        }

        if (!name.trim()) {
            setError('Введите логин.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Пароли не совпадают.');
            return;
        }

        setLoading(true);

        try {
            await register({
                name: name.trim(),
                email: email.trim(),
                password
            });

            navigate('/login', {
                state: { message: 'Регистрация успешна. Теперь войдите в аккаунт.' }
            });
        } catch (err) {
            const data = err.response?.data;
            setError(
                typeof data === 'string'
                    ? data
                    : data?.message || 'Не удалось зарегистрироваться.'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container
            fluid
            className="d-flex align-items-start justify-content-center"
            style={{
                backgroundColor: 'var(--auth-page-bg, #FBCED5)',
                minHeight: '100vh',
                width: '100%',
                paddingTop: '70px'
            }}
        >
            <div
                className="p-5 text-center d-flex flex-column justify-content-center align-items-center shadow-sm"
                style={{
                    backgroundColor: 'var(--auth-card-bg, #EFA6B2)',
                    borderRadius: '60px',
                    width: '100%',
                    maxWidth: '420px'
                }}
            >
                <h3 className="text-center mb-4">Регистрация</h3>

                <Form onSubmit={handleRegister}>
                    <Form.Group className="mb-3">
                        <Form.Label>Логин</Form.Label>
                        <Form.Control
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Придумайте логин"
                            autoComplete="username"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Введите email"
                            autoComplete="email"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Пароль</Form.Label>
                        <Form.Control
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Повторите пароль</Form.Label>
                        <Form.Control
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                        />
                    </Form.Group>

                    {error && (
                        <div className="text-danger small mb-3">{error}</div>
                    )}

                    <Button type="submit" className="w-100" disabled={loading}>
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </Button>
                </Form>

                <div className="text-center mt-3">
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
                </div>
            </div>
        </Container>
    );
}

export default Register;
