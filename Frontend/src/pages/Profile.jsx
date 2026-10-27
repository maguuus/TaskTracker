import { Container, Card, Button, Form, Alert, Dropdown, Modal, ListGroup } from 'react-bootstrap';
import useUser from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useDBUser } from "../hooks/DataBaseHook";
import useProject from '../context/ProjectContext';
import { useTheme } from '../context/ThemeContext';
import FriendsModal from "../components/FriendModal";
import AddFriendsModal from "../components/AddFriendsModal";
import FriendRequestsModal from "../components/FriendRequestsModal";
import { avatarsIdImageArray } from '../hooks/Avatar';

function Profile() {
    const [currentUser, setCurrentUser] = useUser();
    const navigate = useNavigate();

    const [, , , changePassword, changeAvatar] = useDBUser();

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [, setCurrentProject] = useProject(); // Проект остается в памяти даже для нового пользователя
    const [showFriends, setShowFriends] = useState(false);
    const [showAddFriends, setShowAddFriends] = useState(false);
    const [showFriendRequests, setShowFriendRequests] = useState(false);


    const { theme, setTheme } = useTheme();
    const themes = [
        { id: 'colorful', label: 'Разноцветная', icon: '🎨' },
        { id: 'neon', label: 'Неоновая', icon: '💜' },
        { id: 'beige', label: 'Бежевая', icon: '🤎' },
        { id: 'mono', label: 'Чёрно-белая', icon: '◐' },
    ];


    const savedAvatar = avatarsIdImageArray.find(avatar=>avatar.id == currentUser?.avatar) ?? avatarsIdImageArray[8];
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

    async function handleAvatarChange(avatar) {
        try {
            await changeAvatar({avatar : avatar.id});
            setCurrentUser({
                ...currentUser,
                avatar: avatar.id
            });

            setMessage({
                text: 'Аватар успешно изменен.',
                type: 'success'
            });
        } catch (error) {
            setMessage({text: 'Ошибка при смене аватара.', type: 'danger'});
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
                        <div className='profile-main-info'>
                            <div className='avatar'>
                                <img 
                                    className='avatarka'
                                    src = {savedAvatar.image}
                                    alt = "Аватар"
                                />
                                <Dropdown>
                                    <Dropdown.Toggle
                                        variant="dark"
                                        className="avatar-button"
                                    >
                                        Сменить аватарку
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className='avatar-menu'>
                                        <div className='avatar-grid'>
                                            {avatarsIdImageArray.map((avatar) => (
                                                <button
                                                    key={avatar.id}
                                                    type="button"
                                                    className='avatar-option'
                                                    onClick={()=>handleAvatarChange(avatar)}
                                                >
                                                    <img
                                                        src={avatar.image}
                                                        alt={`Аватар ${avatar.id}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </Dropdown.Menu>                            
                                </Dropdown>
                            </div>

                            <div className="user-info">
                                <p className="mb-2 fs-5"><strong>Имя: </strong> {currentUser?.name}</p>
                                <p className="mb-0 fs-5 text-muted"><strong>Email: </strong> {currentUser?.email}</p>
                            </div>
                        </div>
                        {message.text && (
                            <Alert variant={message.type} onClose={() => setMessage({ text: '', type: '' })} dismissible className="rounded-3">
                                {message.text}
                            </Alert>
                        )}

                        <div className="d-flex gap-3 mb-4 profile-actions ">
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
                        <div className="d-flex gap-3">
                            <Button
                                variant="dark"
                                className="rounded-pill px-4"
                                style={{ backgroundColor: '#212121', border: 'none' }}
                                onClick={() => setShowFriends(true)}
                            >
                                Избранные
                            </Button>

                            <Button
                                variant="dark"
                                className="rounded-pill px-6"
                                style={{ backgroundColor: '#212121', border: 'none' }}
                                onClick={() => setShowAddFriends(true)}
                            >
                                Добавить в избранные
                            </Button>

                            <Button
                                variant="dark"
                                className="rounded-pill px-8"
                                onClick={() => setShowFriendRequests(true)}
                            >
                                Заявки на добавление в проект
                            </Button>
                        </div>

                        <FriendsModal
                            show={showFriends}
                            onHide={() => setShowFriends(false)}
                        />

                        <AddFriendsModal
                            show={showAddFriends}
                            onHide={() => setShowAddFriends(false)}
                        />

                        <FriendRequestsModal
                            show={showFriendRequests}
                            onHide={() => setShowFriendRequests(false)}
                        />

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