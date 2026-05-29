import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { useUser } from '../context/UserContext'
import { useDBUser } from '../DataBaseHook';
import api from '../api';


// const projectMeta1 = {
//     id: 0,
//     name: "Project 1",
//     icon: '📁',
//     header: 'Head1',
//     subhead: 'Субголова',
//     imageAlt: 'Портрет  проекта',
//     title: 'Титул',
//     subtitle: 'Субтитул',
//     bodyText: 'Лорем ипсум долор сит амет, консектетур адиписцинг элит, сед ду элисмод темпор.',
// };

// const projectMeta2 = {
//     id: 1,
//     name: "Project 2",
//     icon: '📁',
//     header: 'Head2',
//     subhead: 'Субголова',
//     imageAlt: 'Портрет  проекта',
//     title: 'Титул',
//     subtitle: 'Субтитул',
//     bodyText: 'Лорем ипсум долор сит амет, консектетур адиписцинг элит, сед ду элисмод темпор.',
// };

// const projectMeta3 = {
//     id: 2,
//     name: "Project 3",
//     icon: '📁',
//     header: 'Head3',
//     subhead: 'Субголова',
//     imageAlt: 'Портрет  проекта',
//     title: 'Титул',
//     subtitle: 'Субтитул',
//     bodyText: 'Лорем ипсум долор сит амет, консектетур адиписцинг элит, сед ду элисмод темпор.',
// };

const mockUser = (email) => ({
    id: 1,
    email: email,
    projects: [projectMeta1, projectMeta2, projectMeta3]
})

function Login() {

    const [login, register, getMe] = useDBUser();

    const [currentUser, setCurrentUser] = useUser();

    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')

    async function onLogin(e) {
        e.preventDefault();
        try {
            let response = await login({ email: email, password: password });
            const token = response.accessToken;
            
            localStorage.setItem('token', token);
            
            let profileResponse = await getMe();
            setCurrentUser({...profileResponse, projects: []});
        }
        catch (e) {
            const errorMessage = e.response?.data || "Ошибка сети или неверные данные";
            alert("Ошибка: " + errorMessage);
        }
    }

    async function onRegister(e) {
        e.preventDefault();
        try {
            let response = await register({ email: email, password: password });
            const token = response.accessToken;

            localStorage.setItem('token', token);

            let profileResponse = await getMe();

            setCurrentUser({...profileResponse, projects: []});
        }
        catch (e) {
            const errorMessage = e.response?.data || "Ошибка сети или неверные данные";
            alert("Ошибка: " + errorMessage);
        }
    }

    return (
        <Container fluid className="h-100 d-flex align-items-center justify-content-center">
            <Row>
                <Col>
                    <h3 className="text-center mb-3">Войдите в аккаунт: </h3>

                    <Form>
                        <Form.Group className="mb-3 form-floating" controlId="formEmail">
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Form.Label>Адрес почты</Form.Label>
                        </Form.Group>

                        <Form.Group className="mb-3 form-floating" controlId="formPassword">
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Form.Label>Пропускающее слово</Form.Label>
                        </Form.Group>

                        <Button variant="primary" onClick={onLogin} className="w-100">
                            Залогиниться
                        </Button>
                        <Button variant="primary" onClick={onRegister} className="w-100">
                            Зарегистрироваться
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;