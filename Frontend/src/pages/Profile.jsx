import { Container, Card, Button, Form, Alert, Dropdown } from 'react-bootstrap';
import useUser from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { useDBUser } from "../hooks/DataBaseHook";
import useProject from '../context/ProjectContext';
import { useTheme } from '../context/ThemeContext';

function Profile() {
    const [currentUser, setCurrentUser] = useUser();
    const navigate = useNavigate();

    const [, , , changePassword] = useDBUser();

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [, setCurrentProject] = useProject(); // Проект остается в памяти даже для нового пользователя

    const { theme, setTheme } = useTheme();
    const themes = [
        { id: 'colorful', label: 'Разноцветная', icon: '🎨' },
        { id: 'neon', label: 'Неоновая', icon: '💜' },
        { id: 'beige', label: 'Бежевая', icon: '🤎' },
        { id: 'mono', label: 'Чёрно-белая', icon: '◐' },
    ];
    function onLogout() {
        localStorage.removeItem("token");
        setCurrentUser(null);
        setCurrentProject(null);
        navigate('/login');
    }

    async function handlePasswordSubmit(e) {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        if (newPassword !== confirmPassword) {
            setMessage({ text: 'Новые пароли не совпадают.', type: 'danger' });
            return;
        }
        try {
            await changePassword({ oldPassword, newPassword });
            setMessage({ text: 'Пароль успешно изменен.', type: 'success' });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordForm(false);
        } catch (error) {
            const errorMsg = error.response?.data || "Ошибка при смене пароля.";
            setMessage({ text: errorMsg, type: 'danger' });
        }
    }

    return (
        <div className="profile-page">
            <Container className="profile-container">
                <Card className="profile-card">
                    <Card.Body className="p-4">
                        <div className="profile-header">
                            <h2 className="profile-heading">Профиль пользователя</h2>

                            <Dropdown align="end">
                                <Dropdown.Toggle
                                    variant="link"
                                    className="profile-menu-toggle"
                                    aria-label="Настройки темы"
                                >
                                    ⋮
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="profile-theme-menu">
                                    <Dropdown.Header>Оформление</Dropdown.Header>
                                    {themes.map((item) => (
                                        <Dropdown.Item
                                            key={item.id}
                                            active={theme === item.id}
                                            onClick={() => setTheme(item.id)}
                                        >
                                            {item.icon} {item.label}
                                            {theme === item.id && <span className="ms-auto">✓</span>}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>

                        <div className="mb-4 bg-white bg-opacity-50 p-3 rounded-4">
                            <p className="mb-2 fs-5"><strong>Имя: </strong> {currentUser?.name}</p>
                            <p className="mb-0 fs-5 text-muted"><strong>Email: </strong> {currentUser?.email}</p>
                        </div>


                        {message.text && (
                            <Alert variant={message.type} onClose={() => setMessage({ text: '', type: '' })} dismissible className="rounded-3">
                                {message.text}
                            </Alert>
                        )}

                        <div className="d-flex gap-3 mb-4">
                            <Button
                                variant="dark"
                                className="rounded-pill px-4"
                                style={{ backgroundColor: '#212121', border: 'none' }}
                                onClick={() => setShowPasswordForm(!showPasswordForm)}
                            >
                                {showPasswordForm ? 'Отменить' : 'Сменить пароль'}
                            </Button>
                            <Button
                                variant="danger"
                                className="rounded-pill px-4"
                                onClick={onLogout}
                            >
                                Выйти из аккаунта
                            </Button>
                        </div>


                        {showPasswordForm && (
                            <Form onSubmit={handlePasswordSubmit} className="bg-white bg-opacity-75 p-4 rounded-4 border-0 shadow-sm">
                                <h5 className="mb-3 fw-semibold">Изменение пароля</h5>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted fw-semibold">Старый пароль</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        required
                                        className="rounded-3"
                                        style={{ borderColor: '#e0c0c5' }}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted fw-semibold">Новый пароль</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="rounded-3"
                                        style={{ borderColor: '#e0c0c5' }}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted fw-semibold">Повторите новый пароль</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="rounded-3"
                                        style={{ borderColor: '#e0c0c5' }}
                                    />
                                </Form.Group>

                                <Button
                                    variant="dark"
                                    type="submit"
                                    className="w-100 rounded-pill py-2 mt-2"
                                    style={{ backgroundColor: '#212121', border: 'none' }}
                                >
                                    Сохранить новый пароль
                                </Button>
                            </Form>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}

export default Profile;