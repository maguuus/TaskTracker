import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export function ProtectedRoute({ children }) {
    const [currentUser] = useUser();
    if (!currentUser) {
        return <Navigate to="/login" replace/>;
    }
    return children;
}