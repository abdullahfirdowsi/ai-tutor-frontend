import React, { useState } from 'react';
import { Button, Icon, useToast } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface GoogleSignInButtonProps {
  text?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ 
  text = 'Sign in with Google'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
      toast({
        title: 'Success',
        description: 'Successfully signed in with Google',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      let errorMessage = 'Failed to sign in with Google';
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up blocked by your browser. Please allow pop-ups for this site and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      w="full"
      variant="outline"
      leftIcon={<Icon as={FcGoogle} boxSize="20px" />}
      onClick={handleGoogleSignIn}
      isLoading={isLoading}
      loadingText="Signing in"
      size="lg"
      _hover={{ bg: 'gray.50' }}
    >
      {text}
    </Button>
  );
};

export default GoogleSignInButton;