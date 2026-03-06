import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';
import { authService } from '@/services/authService';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    
    // Double-check with localStorage in case Redux state hasn't hydrated yet
    const hasToken = authService.isAuthenticated();

    if (!isAuthenticated && !hasToken) {
        return <Navigate to="/auth" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
