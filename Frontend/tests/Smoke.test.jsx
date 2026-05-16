import { render } from '@testing-library/react';
import App from '../src/App';
import Board from '../src/pages/Board';
import Home from '../src/pages/Home';
import Login from '../src/pages/Login';
import { ProjectProvider } from '../src/context/ProjectContext';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from '../src/context/UserContext';

function MockApp({ children }) {
    return (
        <UserProvider>
            <ProjectProvider>
                {children}
            </ProjectProvider>
        </UserProvider>
    )
}

function Mock({ children }) {
    return (
        <MockApp>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </MockApp>
    );
}

it('компонент App', () => {
    render(<MockApp> <App /> </MockApp>);
});

it('компонент Board', () => {
    render(
        <Mock>
            <Board />
        </Mock>
    );
});

it('компонент Home', () => {
    render(
        <Mock>
            <Home />
        </Mock>
    );
});

it('компонент Login', () => {
    render(
        <Mock>
            <Login />
        </Mock>
    );
});
