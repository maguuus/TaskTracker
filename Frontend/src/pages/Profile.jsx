import {Container, Card, Button, Form, Alert} from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import {useState} from "react";
import {useDBUser} from "../DataBaseHook.jsx";

function Profile() {
    const [currentUser, setCurrentUser] = useUser();
    const navigate = useNavigate();
    
    const [, , , changePassword] = useDBUser();

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    
    function onLogout() {
        localStorage.removeItem("token");
        setCurrentUser(null);
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
        <Container className="mt-5" style={{ maxWidth: '600px' }}>
            <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                    <h2 className="mb-4">Профиль пользователя</h2>

                    <div className="mb-4">
                        <p className="mb-2 fs-5"><strong>Имя: </strong> {currentUser?.name}</p>
                        <p className="mb-0 fs-5 text-muted"><strong>Email: </strong> {currentUser?.email}</p>
                    </div>

                    {message.text && (
                        <Alert variant={message.type} onClose={() => setMessage({ text: '', type: '' })} dismissible>
                            {message.text}
                        </Alert>
                    )}

                    <div className="d-flex gap-3 mb-4">
                        <Button
                            variant="outline-primary"
                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                        >
                            {showPasswordForm ? 'Отменить смену пароля' : 'Сменить пароль'}
                        </Button>
                        <Button variant="danger" onClick={onLogout}>
                            Выйти из аккаунта
                        </Button>
                    </div>

                    {showPasswordForm && (
                        <Form onSubmit={handlePasswordSubmit} className="bg-light p-3 rounded border">
                            <Form.Group className="mb-3">
                                <Form.Label>Старый пароль</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Новый пароль</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Повторите новый пароль</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Button variant="success" type="submit" className="w-100">
                                Сохранить новый пароль
                            </Button>
                        </Form>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Profile;