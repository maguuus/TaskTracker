import { Container, Card, Button } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import {useState} from "react";

function Profile() {
    const [currentUser, setCurrentUser] = useUser();
    const navigate = useNavigate();
    
    function onLogout() {
        localStorage.removeItem("token");
        setCurrentUser(null);
        navigate('/login');
    }
    
    return (
        <Container className="mt-5">
            <Card>
                <Card.Body>
                    <h2>Профиль пользователя</h2>
                    <p><strong>Имя: </strong> {currentUser?.name}</p>
                    <p><strong>Email: </strong> {currentUser?.email}</p>

                    <Button variant="danger" onClick={onLogout}>
                        Выйти из аккаунта
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Profile;