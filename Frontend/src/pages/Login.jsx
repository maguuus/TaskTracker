import { Container, Form, Button, InputGroup } from 'react-bootstrap';
import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useDBUser } from '../DataBaseHook';

function Login() {
    const [login, register] = useDBUser();
    const [, setCurrentUser] = useUser();

    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    
    const [showPassword, setShowPassword] = useState(false);

    async function handleAuth(e, authMethod) {
        e.preventDefault();
        try {
            let response = await authMethod({ email, password });
            setCurrentUser({ ...response, projects: [] });
        } catch (err) {
            alert(err.message || err);
        }
    }

    return (
        <Container 
            fluid 
            className="d-flex align-items-center justify-content-center" 
            style={{ backgroundColor: '#FBCED5', minHeight: '100vh', width: '100vw' }}
        >
            <div 
                className="p-5 text-center d-flex flex-column justify-content-center align-items-center shadow-sm"
                style={{ 
                    backgroundColor: '#EFA6B2', 
                    borderRadius: '60px', 
                    width: '100%', 
                    maxWidth: '420px',
                    aspectRatio: '1.2 / 1'
                }}
            >
                <Form style={{ width: '85%' }}>
                    <InputGroup className="mb-3 overflow-hidden rounded-2 border-0 bg-white">
                        <InputGroup.Text className="bg-white border-0 text-muted pe-1 ps-3">
                            <svg xmlns="http://w3.org" width="14" height="14" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
                                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                            </svg>
                        </InputGroup.Text>
                        <Form.Control
                            type="email"
                            placeholder="placeholder"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border-0 shadow-none ps-2 py-2 text-muted-50 small"
                            style={{ fontSize: '0.85rem' }}
                        />
                    </InputGroup>

                    <InputGroup className="mb-4 overflow-hidden rounded-2 border-0 bg-white">
                        <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border-0 shadow-none ps-3 py-2 text-muted-50 small"
                            style={{ fontSize: '0.85rem' }}
                        />
                        <InputGroup.Text 
                            className="bg-white border-0 text-muted ps-1 pe-3 cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ cursor: 'pointer' }}
                        >
                            <svg xmlns="http://w3.org" width="14" height="14" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
                            </svg>
                        </InputGroup.Text>
                    </InputGroup>

                    <div className="d-flex flex-column gap-2 align-items-center">
                        <Button 
                            onClick={(e) => handleAuth(e, login)} 
                            className="border-0 shadow-none text-white font-weight-bold px-4 py-1 small rounded-pill btn-sm"
                            style={{ backgroundColor: '#EC7A91', fontSize: '0.8rem' }}
                        >
                            Sign In
                        </Button>
                        
                        <Button 
                            variant="link"
                            onClick={(e) => handleAuth(e, register)} 
                            className="text-decoration-none p-0 border-0 shadow-none font-weight-bold text-white opacity-75 small"
                            style={{ fontSize: '0.7rem' }}
                        >
                            Create Account Instead
                        </Button>
                    </div>
                </Form>
            </div>
        </Container>
    );
}

export default Login;
