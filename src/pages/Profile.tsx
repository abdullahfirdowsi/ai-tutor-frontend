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
  CardHeader,
  Skeleton,
  Alert,
  AlertIcon,
  useColorModeValue,
  Progress,
  Badge,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { 
  FiEdit, 
  FiClock, 
  FiBook, 
  FiHelpCircle, 
  FiTrendingUp, 
  FiAward,
  FiCalendar,
  FiTarget,
  FiWifi,
  FiRefreshCw
} from 'react-icons/fi';
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
  statistics: {
    questions_asked?: number;
    streak?: number;
    weekly_goal?: number;
    completed_this_week?: number;
    average_score?: number;
    total_study_days?: number;
  };
  last_active?: string;
}

const Profile: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const toast = useToast();
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const statBg = useColorModeValue('gray.50', 'gray.800');
  const progressBg = useColorModeValue('brand.50', 'brand.900');
  
  // State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [progressData, setProgressData] = useState<LearningProgress | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState<boolean>(true);
  const [hasNetworkError, setHasNetworkError] = useState<boolean>(false);
  
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
      setHasNetworkError(false);
      
      try {
        const response = await api.get('/users/me/progress');
        setProgressData(response.data);
      } catch (err: any) {
        console.warn('Failed to fetch learning progress:', err);
        
        // Only show network error for critical failures
        if (err.code === 'NETWORK_ERROR' || !err.response || err.response?.status >= 500) {
          setHasNetworkError(true);
        } else {
          // For other errors, show empty progress state
          setProgressData({
            completed_lessons: [],
            total_time_spent: 0,
            statistics: {
              questions_asked: 0,
              streak: 0,
              weekly_goal: 7,
              completed_this_week: 0,
            }
          });
        }
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
        title: 'Profile updated successfully',
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
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  };

  // Calculate weekly progress
  const weeklyProgress = progressData?.statistics?.completed_this_week || 0;
  const weeklyGoal = progressData?.statistics?.weekly_goal || 7;
  const progressPercentage = weeklyGoal > 0 ? (weeklyProgress / weeklyGoal) * 100 : 0;
  
  return (
    <Container maxW="container.xl" py={8}>
      {/* Header */}
      <VStack spacing={2} align="start" mb={8}>
        <Heading as="h1" size="2xl" color="brand.600">
          Your Profile
        </Heading>
        <Text color="gray.600" fontSize="lg">
          Manage your account and track your learning progress
        </Text>
      </VStack>
      
      <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={8}>
        {/* Profile Info */}
        <GridItem>
          <Card bg={cardBg} boxShadow="lg" borderRadius="xl">
            <CardHeader>
              <Heading size="lg" color="brand.600">Profile Information</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={6}>
                {/* Avatar and basic info */}
                <VStack spacing={4}>
                  <Avatar 
                    size="2xl" 
                    name={currentUser?.displayName || 'User'} 
                    src={currentUser?.photoURL || undefined}
                    border="4px solid"
                    borderColor="brand.100"
                  />
                  
                  {!isEditing ? (
                    <VStack spacing={2} textAlign="center">
                      <Heading as="h2" size="lg" color="gray.800">
                        {currentUser?.displayName || 'User'}
                      </Heading>
                      <Text color="gray.500" fontSize="md">
                        {currentUser?.email}
                      </Text>
                      <Button 
                        leftIcon={<FiEdit />} 
                        onClick={() => setIsEditing(true)}
                        colorScheme="brand"
                        variant="outline"
                        mt={4}
                      >
                        Edit Profile
                      </Button>
                    </VStack>
                  ) : (
                    <Box w="full">
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <VStack spacing={4} align="stretch">
                          <FormControl isInvalid={!!errors.display_name}>
                            <FormLabel>Display Name</FormLabel>
                            <Input
                              {...register('display_name', {
                                required: 'Display name is required',
                                minLength: { value: 2, message: 'Minimum length should be 2 characters' }
                              })}
                              size="lg"
                            />
                            <FormErrorMessage>{errors.display_name?.message}</FormErrorMessage>
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel>Avatar URL (optional)</FormLabel>
                            <Input {...register('avatar_url')} size="lg" />
                          </FormControl>
                          
                          <HStack spacing={3} justify="flex-end" mt={4}>
                            <Button onClick={handleCancel} variant="outline">
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              colorScheme="brand" 
                              isLoading={isLoading}
                              loadingText="Saving..."
                            >
                              Save Changes
                            </Button>
                          </HStack>
                        </VStack>
                      </form>
                    </Box>
                  )}
                </VStack>
                
                <Divider />
                
                {/* Account Information */}
                <VStack align="stretch" spacing={4} w="full">
                  <Heading as="h3" size="md" color="gray.700">Account Details</Heading>
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <Text fontWeight="medium" color="gray.600">Email:</Text>
                      <Text>{currentUser?.email}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="medium" color="gray.600">Member since:</Text>
                      <Text>{formatDate(currentUser?.uid ? new Date().toISOString() : undefined)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="medium" color="gray.600">Email verified:</Text>
                      <Badge colorScheme={currentUser?.email ? 'green' : 'red'} variant="subtle">
                        {currentUser?.email ? 'Verified' : 'Not verified'}
                      </Badge>
                    </HStack>
                  </VStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
        
        {/* Learning Progress */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            {/* Stats Overview */}
            <Card bg={cardBg} boxShadow="lg" borderRadius="xl">
              <CardHeader>
                <Heading size="lg" color="brand.600">Learning Statistics</Heading>
              </CardHeader>
              <CardBody>
                {isLoadingProgress ? (
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                    {Array(4).fill(0).map((_, i) => (
                      <Skeleton key={i} height="100px" borderRadius="lg" />
                    ))}
                  </SimpleGrid>
                ) : hasNetworkError ? (
                  <VStack spacing={6} textAlign="center" py={8}>
                    <Icon as={FiWifi} boxSize={12} color="red.400" />
                    <VStack spacing={2}>
                      <Text fontWeight="medium" color="red.500">Connection Problem</Text>
                      <Text fontSize="sm" color="gray.600">
                        Unable to load your learning statistics
                      </Text>
                    </VStack>
                    <Button 
                      leftIcon={<FiRefreshCw />}
                      size="sm"
                      colorScheme="brand"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  </VStack>
                ) : progressData ? (
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                    <Card bg={statBg} borderRadius="lg">
                      <CardBody textAlign="center">
                        <Stat>
                          <HStack justify="center" mb={2}>
                            <Icon as={FiBook} color="blue.500" boxSize={6} />
                          </HStack>
                          <StatNumber fontSize="2xl" color="blue.500">
                            {progressData.completed_lessons?.length || 0}
                          </StatNumber>
                          <StatLabel fontSize="sm">Lessons Completed</StatLabel>
                        </Stat>
                      </CardBody>
                    </Card>
                    
                    <Card bg={statBg} borderRadius="lg">
                      <CardBody textAlign="center">
                        <Stat>
                          <HStack justify="center" mb={2}>
                            <Icon as={FiClock} color="green.500" boxSize={6} />
                          </HStack>
                          <StatNumber fontSize="2xl" color="green.500">
                            {formatTime(Math.floor((progressData.total_time_spent || 0) / 60))}
                          </StatNumber>
                          <StatLabel fontSize="sm">Study Time</StatLabel>
                        </Stat>
                      </CardBody>
                    </Card>
                    
                    <Card bg={statBg} borderRadius="lg">
                      <CardBody textAlign="center">
                        <Stat>
                          <HStack justify="center" mb={2}>
                            <Icon as={FiHelpCircle} color="purple.500" boxSize={6} />
                          </HStack>
                          <StatNumber fontSize="2xl" color="purple.500">
                            {progressData.statistics?.questions_asked || 0}
                          </StatNumber>
                          <StatLabel fontSize="sm">Questions Asked</StatLabel>
                        </Stat>
                      </CardBody>
                    </Card>
                    
                    <Card bg={statBg} borderRadius="lg">
                      <CardBody textAlign="center">
                        <Stat>
                          <HStack justify="center" mb={2}>
                            <Icon as={FiTrendingUp} color="orange.500" boxSize={6} />
                          </HStack>
                          <StatNumber fontSize="2xl" color="orange.500">
                            {progressData.statistics?.streak || 0}
                          </StatNumber>
                          <StatLabel fontSize="sm">Day Streak</StatLabel>
                        </Stat>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                ) : (
                  <VStack spacing={6} textAlign="center" py={8} color="gray.500">
                    <Icon as={FiBook} boxSize={12} />
                    <VStack spacing={2}>
                      <Text fontWeight="medium">No learning data yet</Text>
                      <Text fontSize="sm">
                        Start taking lessons to see your progress here!
                      </Text>
                    </VStack>
                    <Button
                      leftIcon={<FiBook />}
                      colorScheme="brand"
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = '/lessons'}
                    >
                      Browse Lessons
                    </Button>
                  </VStack>
                )}
              </CardBody>
            </Card>

            {/* Weekly Goal Progress */}
            {progressData && !hasNetworkError && (
              <Card bg={cardBg} boxShadow="lg" borderRadius="xl">
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="lg" color="brand.600">Weekly Goal</Heading>
                    <Icon as={FiTarget} color="brand.500" boxSize={6} />
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="lg" fontWeight="medium">
                        {weeklyProgress} of {weeklyGoal} lessons
                      </Text>
                      <Badge 
                        colorScheme={progressPercentage >= 100 ? 'green' : 'blue'} 
                        variant="subtle"
                        px={3}
                        py={1}
                      >
                        {Math.round(progressPercentage)}%
                      </Badge>
                    </HStack>
                    <Progress 
                      value={progressPercentage} 
                      colorScheme={progressPercentage >= 100 ? 'green' : 'brand'}
                      size="lg"
                      borderRadius="full"
                      bg="gray.100"
                    />
                    <Text fontSize="sm" color="gray.600">
                      {progressPercentage >= 100 
                        ? '🎉 Goal achieved! Keep up the great work!' 
                        : `${weeklyGoal - weeklyProgress} more lessons to reach your goal`
                      }
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Recent Activity */}
            {progressData?.completed_lessons && progressData.completed_lessons.length > 0 && !hasNetworkError && (
              <Card bg={cardBg} boxShadow="lg" borderRadius="xl">
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="lg" color="brand.600">Recent Completions</Heading>
                    <Icon as={FiAward} color="brand.500" boxSize={6} />
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {progressData.completed_lessons.slice(0, 5).map((lesson, index) => (
                      <HStack 
                        key={index} 
                        p={4} 
                        bg={statBg} 
                        borderRadius="lg"
                        justify="space-between"
                      >
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium" noOfLines={1}>
                            {lesson.title}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Completed: {formatDate(lesson.completion_date)}
                          </Text>
                        </VStack>
                        {lesson.score !== undefined && (
                          <Badge 
                            colorScheme={lesson.score >= 80 ? 'green' : lesson.score >= 60 ? 'yellow' : 'red'}
                            variant="subtle"
                            px={3}
                            py={1}
                          >
                            {Math.round(lesson.score)}%
                          </Badge>
                        )}
                      </HStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            )}
          </VStack>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default Profile;