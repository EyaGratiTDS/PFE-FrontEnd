import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../Loading/LoadingSpinner';

interface ProtectedRouteProps {}

const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <LoadingSpinner />
  }
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;