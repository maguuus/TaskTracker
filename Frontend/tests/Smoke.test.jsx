import { render } from '@testing-library/react';
import App from '../src/App';
import Board from '../src/pages/Board';
import Home from '../src/pages/Home';
import Login from '../src/pages/Login';
import { ProjectProvider } from '../src/context/ProjectContext';
import { BrowserRouter } from 'react-router-dom';

function Mock({ children }) {
    return (
        <ProjectProvider>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </ProjectProvider>
    );
}

it('компонент App', () => {
    render(<ProjectProvider> <App /> </ProjectProvider>);
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
