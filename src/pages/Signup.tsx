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
  Progress,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff, FiMail, FiUser } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Color mode values
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm<SignupFormData>();

  const watchPassword = watch('password');

  // Password strength calculation
  const getPasswordStrength = (password: string): number => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(watchPassword || '');

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 50) return 'red';
    if (strength < 75) return 'yellow';
    return 'green';
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength < 25) return 'Very weak';
    if (strength < 50) return 'Weak';
    if (strength < 75) return 'Good';
    return 'Strong';
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await signup(data.email, data.password, data.name);
      navigate('/');
      toast({
        title: 'Welcome to AI Tutor Pro!',
        description: 'Your account has been successfully created. Let\'s start learning!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Account creation failed',
        description: error.message || 'An error occurred while creating your account. Please try again.',
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
        <Heading size="lg" color={textColor}>Create your account</Heading>
        <Text color={mutedTextColor}>
          Join thousands of learners on AI Tutor Pro
        </Text>
      </VStack>

      {/* Google Sign Up */}
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
          <FormControl id="name" isInvalid={!!errors.name}>
            <FormLabel color={textColor}>Full Name</FormLabel>
            <InputGroup>
              <Input
                type="text"
                placeholder="Enter your full name"
                size="lg"
                {...register('name', {
                  required: 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                  pattern: {
                    value: /^[a-zA-Z\s]+$/,
                    message: 'Name can only contain letters and spaces',
                  },
                })}
              />
              <InputRightElement h="full" pointerEvents="none">
                <Icon as={FiUser} color="gray.400" />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
          </FormControl>
          
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
                placeholder="Create a strong password"
                size="lg"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
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
            
            {/* Password strength indicator */}
            {watchPassword && (
              <VStack mt={2} align="stretch">
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="xs" color={mutedTextColor}>Password strength</Text>
                  <Text fontSize="xs" color={`${getPasswordStrengthColor(passwordStrength)}.500`}>
                    {getPasswordStrengthText(passwordStrength)}
                  </Text>
                </HStack>
                <Progress
                  value={passwordStrength}
                  colorScheme={getPasswordStrengthColor(passwordStrength)}
                  size="sm"
                  borderRadius="full"
                />
              </VStack>
            )}
            
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>
          
          <FormControl id="confirmPassword" isInvalid={!!errors.confirmPassword}>
            <FormLabel color={textColor}>Confirm Password</FormLabel>
            <InputGroup>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                size="lg"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === watchPassword || 'Passwords do not match'
                })}
              />
              <InputRightElement h="full">
                <Button
                  variant="ghost"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  <Icon as={showConfirmPassword ? FiEyeOff : FiEye} color="gray.400" />
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
          </FormControl>

          {/* Terms and conditions */}
          <FormControl isInvalid={!!errors.agreeToTerms}>
            <Checkbox
              {...register('agreeToTerms', {
                required: 'You must agree to the terms and conditions'
              })}
              colorScheme="brand"
            >
              <Text fontSize="sm" color={textColor}>
                I agree to the{' '}
                <Link color="brand.500" _hover={{ color: 'brand.600' }}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link color="brand.500" _hover={{ color: 'brand.600' }}>
                  Privacy Policy
                </Link>
              </Text>
            </Checkbox>
            <FormErrorMessage>{errors.agreeToTerms?.message}</FormErrorMessage>
          </FormControl>
          
          <Button
            type="submit"
            colorScheme="brand"
            size="lg"
            w="full"
            isLoading={isLoading}
            loadingText="Creating account..."
          >
            Create Account
          </Button>
        </VStack>
      </form>

      {/* Sign in link */}
      <Text textAlign="center" fontSize="sm" color={textColor}>
        Already have an account?{' '}
        <Link
          as={RouterLink}
          to="/login"
          color="brand.500"
          fontWeight="semibold"
          _hover={{ color: 'brand.600' }}
        >
          Sign in here
        </Link>
      </Text>
    </VStack>
  );
};

export default Signup;