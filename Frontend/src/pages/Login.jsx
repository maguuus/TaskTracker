import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { useState } from 'react'

export function Login() {

    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')

    function Submit(e) {
        e.preventDefault();
        alert(`Email: ${email}\nPassword: ${password}`)
    }

    return (
        <Container fluid className="h-100 d-flex align-items-center justify-content-center">
            <Row>
                <Col>
                    <h3 className="text-center mb-3">Войдите в аккаунт: </h3>

                    <Form onSubmit={Submit}>
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

                        <Button variant="primary" type="submit" className="w-100">
                            Подписаться в
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}