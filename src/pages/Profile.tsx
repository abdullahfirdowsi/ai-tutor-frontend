import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Divider,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Icon,
  Card,
  CardBody,
  Skeleton,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUser, FiEdit, FiClock, FiBook, FiHelpCircle } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface ProfileFormData {
  display_name: string;
  avatar_url?: string;
}

interface LearningProgress {
  completed_lessons: Array<{
    lesson_id: string;
    title: string;
    completed: boolean;
    completion_date?: string;
    score?: number;
    time_spent: number;
  }>;
  current_lesson?: {
    lesson_id: string;
    title: string;
    progress: number;
    last_position?: string;
  };
  total_time_spent: number;
  statistics: Record<string, any>;
  last_active?: string;
}

const Profile: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [progressData, setProgressData] = useState<LearningProgress | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form handling
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProfileFormData>();
  
  // Initialize form with current user data
  useEffect(() => {
    if (currentUser) {
      setValue('display_name', currentUser.displayName || '');
      setValue('avatar_url', currentUser.photoURL || '');
    }
  }, [currentUser, setValue]);
  
  // Fetch learning progress
  useEffect(() => {
    const fetchProgress = async () => {
      setIsLoadingProgress(true);
      setError(null);
      
      try {
        const response = await api.get('/users/me/progress');
        setProgressData(response.data);
      } catch (err: any) {
        console.error('Error fetching learning progress:', err);
        setError(err.response?.data?.detail || 'Failed to load learning progress.');
      } finally {
        setIsLoadingProgress(false);
      }
    };
    
    fetchProgress();
  }, []);
  
  // Update profile
  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    
    try {
      // Update in Firebase Auth
      await updateUserProfile({
        displayName: data.display_name,
        photoURL: data.avatar_url,
      });
      
      // Update in backend
      await api.put('/users/me', {
        display_name: data.display_name,
        avatar_url: data.avatar_url,
      });
      
      toast({
        title: 'Profile updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast({
        title: 'Update failed',
        description: err.message || 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancel editing
  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };
  
  // Format minutes into hours and minutes
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };
  
  return (
    <Container maxW="container.lg" py={6}>
      <Heading as="h1" size="xl" mb={6}>Your Profile</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* Profile Info */}
        <Box bg={cardBg} p={6} borderRadius="md" boxShadow="sm">
          <Flex direction="column" align="center" mb={6}>
            <Avatar 
              size="2xl" 
              name={currentUser?.displayName || 'User'} 
              src={currentUser?.photoURL || undefined}
              mb={4}
            />
            
            {!isEditing ? (
              <VStack spacing={1}>
                <Heading as="h2" size="lg">{currentUser?.displayName || 'User'}</Heading>
                <Text color="gray.500">{currentUser?.email}</Text>
                <Button 
                  leftIcon={<FiEdit />} 
                  onClick={() => setIsEditing(true)}
                  size="sm"
                  mt={4}
                  colorScheme="brand"
                >
                  Edit Profile
                </Button>
              </VStack>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
                <VStack spacing={4} align="stretch">
                  <FormControl isInvalid={!!errors.display_name}>
                    <FormLabel>Display Name</FormLabel>
                    <Input
                      {...register('display_name', {
                        required: 'Display name is required',
                        minLength: { value: 2, message: 'Minimum length should be 2 characters' }
                      })}
                    />
                    <FormErrorMessage>{errors.display_name?.message}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Avatar URL (optional)</FormLabel>
                    <Input {...register('avatar_url')} />
                  </FormControl>
                  
                  <HStack spacing={4} justify="flex-end" mt={2}>
                    <Button onClick={handleCancel} variant="outline">
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      colorScheme="brand" 
                      isLoading={isLoading}
                    >
                      Save
                    </Button>
                  </HStack>
                </VStack>
              </form>
            )}
          </Flex>
          
          <Divider my={6} />
          
          <Heading as="h3" size="md" mb={4}>Account Information</Heading>
          <VStack align="stretch" spacing={3}>
            <HStack>
              <Text fontWeight="bold" minWidth="120px">Email:</Text>
              <Text>{currentUser?.email}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold" minWidth="120px">Account ID:</Text>
              <Text fontSize="sm" color="gray.500">{currentUser?.uid}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold" minWidth="120px">Email Verified:</Text>
              <Text>{currentUser?.email ? 'Yes' : 'No'}</Text>
            </HStack>
          </VStack>
        </Box>
        
        {/* Learning Progress */}
        <Box bg={cardBg} p={6} borderRadius="md" boxShadow="sm">
          <Heading as="h3" size="md" mb={6}>Learning Progress</Heading>
          
          {isLoadingProgress ? (
            <VStack spacing={4} align="stretch">
              <Skeleton height="100px" />
              <Skeleton height="100px" />
              <Skeleton height="100px" />
            </VStack>
          ) : error ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          ) : progressData ? (
            <VStack spacing={6} align="stretch">
              {/* Stats */}
              <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                <Card>
                  <CardBody>
                    <Stat>
                      <Flex align="center">
                        <Icon as={FiBook} mr={2} color="brand.500" />
                        <StatLabel>Completed Lessons</StatLabel>
                      </Flex>
                      <StatNumber>
                        {progressData.completed_lessons?.length || 0}
                      </StatNumber>
                    </Stat>
                  </CardBody>
                </Card>
                
                <Card>
                  <CardBody>
                    <Stat>
                      <Flex align="center">
                        <Icon as={FiClock} mr={2} color="brand.500" />
                        <StatLabel>Learning Time</StatLabel>
                      </Flex>
                      <StatNumber>
                        {formatTime(progressData.total_time_spent / 60 || 0)}
                      </StatNumber>
                    </Stat>
                  </CardBody>
                </Card>
                
                <Card>
                  <CardBody>
                    <Stat>
                      <Flex align="center">
                        <Icon as={FiHelpCircle} mr={2} color="brand.500" />
                        <StatLabel>Questions Asked</StatLabel>
                      </Flex>
                      <StatNumber>
                        {progressData.statistics?.questions_asked || 0}
                      </StatNumber>
                    </Stat>
                  </CardBody>
                </Card>
              </SimpleGrid>
              
              {/* Current Lesson */}
              {progressData.current_lesson && (
                <Box>
                  <Heading as="h4" size="sm" mb={2}>Currently Learning</Heading>
                  <Box p={3} borderWidth={1} borderRadius="md">
                    <Text fontWeight="bold">{progressData.current_lesson.title}</Text>
                    <Text fontSize="sm" mt={1}>
                      Progress: {Math.round(progressData.current_lesson.progress * 100)}%
                    </Text>
                  </Box>
                </Box>
              )}
              
              {/* Recent Completed Lessons */}
              {progressData.completed_lessons && progressData.completed_lessons.length > 0 && (
                <Box>
                  <Heading as="h4" size="sm" mb={2}>Recently Completed</Heading>
                  <VStack align="stretch" spacing={2}>
                    {progressData.completed_lessons.slice(0, 3).map((lesson, index) => (
                      <Box key={index} p={3} borderWidth={1} borderRadius="md">
                        <Text fontWeight="bold">{lesson.title}</Text>
                        <Flex justify="space-between" fontSize="sm" mt={1}>
                          <Text>Completed: {formatDate(lesson.completion_date)}</Text>
                          {lesson.score !== undefined && (
                            <Text>Score: {Math.round(lesson.score)}%</Text>
                          )}
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}
              
              {/* Last Active */}
              {progressData.last_active && (
                <Text fontSize="sm" color="gray.500">
                  Last active: {formatDate(progressData.last_active)}
                </Text>
              )}
            </VStack>
          ) : (
            <Text color="gray.500" textAlign="center">
              No learning progress data available yet. Start taking lessons to track your progress!
            </Text>
          )}
        </Box>
      </SimpleGrid>
    </Container>
  );
};

export default Profile;

