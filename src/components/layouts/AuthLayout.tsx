import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Box, Center, Flex, Heading, Image } from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';

const AuthLayout: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  // Redirect to dashboard if already authenticated
  if (!isLoading && currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <Flex minHeight="100vh" width="full" align="center" justifyContent="center">
      <Box 
        borderWidth={1}
        px={4}
        width="full"
        maxWidth="500px"
        borderRadius={4}
        textAlign="center"
        boxShadow="lg"
        p={4}
      >
        <Box textAlign="center" mb={8}>
          {/* Logo image */}
          <Center mb={2}>
            <Image 
              src="/logo192.png" 
              alt="AI Tutor Logo" 
              boxSize="80px" 
            />
          </Center>
          <Heading as="h2" size="xl">AI Tutor</Heading>
          <Box color="gray.500">
            Your personalized learning experience
          </Box>
        </Box>
        
        <Box my={8} textAlign="left">
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};

export default AuthLayout;

