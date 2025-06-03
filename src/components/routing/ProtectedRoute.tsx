import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Center, Spinner } from '@chakra-ui/react';

const ProtectedRoute: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <Center height="100vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
};

export default ProtectedRoute;

