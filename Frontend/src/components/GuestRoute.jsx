import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export function GuestRoute({ children }) {
    const [currentUser] = useUser();
    if (currentUser) {
        return <Navigate to="/profile" replace/>;
    }
    return children;
}