import React, { useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Link,
  Text,
  useToast,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  Icon,
  Divider,
  Heading,
  VStack,
  HStack,
  Checkbox,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff, FiMail } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Color mode values
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/');
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Sign in failed',
        description: error.message || 'Please check your credentials and try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <VStack spacing={2} textAlign="center">
        <Heading size="lg" color={textColor}>Welcome back</Heading>
        <Text color={mutedTextColor}>
          Sign in to continue your learning journey
        </Text>
      </VStack>

      {/* Google Sign In */}
      <GoogleSignInButton text="Continue with Google" />

      {/* Divider */}
      <HStack>
        <Divider />
        <Text fontSize="sm" color={mutedTextColor} px={3}>
          or
        </Text>
        <Divider />
      </HStack>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={6}>
          <FormControl id="email" isInvalid={!!errors.email}>
            <FormLabel color={textColor}>Email address</FormLabel>
            <InputGroup>
              <Input
                type="email"
                placeholder="Enter your email"
                size="lg"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: 'Please enter a valid email address',
                  },
                })}
              />
              <InputRightElement h="full" pointerEvents="none">
                <Icon as={FiMail} color="gray.400" />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>
          
          <FormControl id="password" isInvalid={!!errors.password}>
            <FormLabel color={textColor}>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                size="lg"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              <InputRightElement h="full">
                <Button
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <Icon as={showPassword ? FiEyeOff : FiEye} color="gray.400" />
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>

          {/* Remember me and forgot password */}
          <HStack justify="space-between" w="full">
            <Checkbox {...register('rememberMe')} colorScheme="brand">
              <Text fontSize="sm" color={textColor}>Remember me</Text>
            </Checkbox>
            <Link
              as={RouterLink}
              to="/forgot-password"
              fontSize="sm"
              color="brand.500"
              _hover={{ color: 'brand.600' }}
            >
              Forgot password?
            </Link>
          </HStack>
          
          <Button
            type="submit"
            colorScheme="brand"
            size="lg"
            w="full"
            isLoading={isLoading}
            loadingText="Signing in..."
          >
            Sign In
          </Button>
        </VStack>
      </form>

      {/* Sign up link */}
      <Text textAlign="center" fontSize="sm" color={textColor}>
        Don't have an account?{' '}
        <Link
          as={RouterLink}
          to="/signup"
          color="brand.500"
          fontWeight="semibold"
          _hover={{ color: 'brand.600' }}
        >
          Create one now
        </Link>
      </Text>
    </VStack>
  );
};

export default Login;