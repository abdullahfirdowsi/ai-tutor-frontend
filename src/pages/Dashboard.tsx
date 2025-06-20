import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Progress,
  Icon,
  useColorModeValue,
  HStack,
  VStack,
  Badge,
  SimpleGrid,
  Container,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Skeleton,
} from '@chakra-ui/react';
import { 
  FiBook, 
  FiClock, 
  FiHelpCircle, 
  FiTrendingUp,
  FiTarget,
  FiAward,
  FiCalendar,
  FiPlay,
  FiChevronRight,
  FiWifi,
  FiRefreshCw
} from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface UserProgress {
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

interface RecentActivity {
  type: string;
  title: string;
  time: string;
  score?: number;
}

interface RecommendedLesson {
  id: string;
  title: string;
  difficulty: string;
  duration_minutes: number;
}

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [recommendedLessons, setRecommendedLessons] = useState<RecommendedLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const cardBg = useColorModeValue('white', 'gray.800');
  const gradientBg = useColorModeValue(
    'linear(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
    'linear(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)'
  );
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const subtleTextColor = useColorModeValue('gray.500', 'gray.500');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        // Fetch user progress
        const progressResponse = await api.get('/users/me/progress');
        setUserProgress(progressResponse.data);

        // Fetch recent activity
        try {
          const activityResponse = await api.get('/users/me/activity?limit=5');
          setRecentActivity(activityResponse.data.activities || []);
        } catch (activityError) {
          console.warn('No recent activity available:', activityError);
          setRecentActivity([]);
        }

        // Fetch recommended lessons
        try {
          const recommendedResponse = await api.get('/lessons/recommended?limit=3');
          setRecommendedLessons(recommendedResponse.data.lessons || []);
        } catch (recommendedError) {
          console.warn('No recommended lessons available:', recommendedError);
          setRecommendedLessons([]);
        }

      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format minutes into hours and minutes
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Skeleton height="200px" borderRadius="3xl" />
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} height="120px" borderRadius="2xl" />
            ))}
          </SimpleGrid>
          <Grid templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(3, 1fr)' }} gap={8}>
            <GridItem colSpan={{ base: 1, lg: 2 }}>
              <Skeleton height="400px" borderRadius="2xl" />
            </GridItem>
            <GridItem>
              <Skeleton height="400px" borderRadius="2xl" />
            </GridItem>
          </Grid>
        </VStack>
      </Container>
    );
  }

  if (hasError) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="2xl" mb={6} boxShadow="gradient-md">
          <AlertIcon />
          <AlertTitle mr={2}>Connection Error</AlertTitle>
          <AlertDescription>
            Unable to connect to the AI Tutor service. Please check your internet connection and try again.
          </AlertDescription>
        </Alert>
        
        <VStack spacing={8} textAlign="center">
          <Icon as={FiWifi} boxSize={16} color="red.400" />
          <VStack spacing={4}>
            <Heading size="lg" color="red.500">Service Unavailable</Heading>
            <Text color={mutedTextColor} maxW="md">
              The dashboard service is currently unavailable. Please ensure you have an active internet connection and the service is running.
            </Text>
          </VStack>
          <Button 
            leftIcon={<FiRefreshCw />}
            onClick={() => window.location.reload()} 
            colorScheme="brand"
            size="lg"
            borderRadius="xl"
          >
            Try Again
          </Button>
        </VStack>
      </Container>
    );
  }

  const stats = {
    lessonsCompleted: userProgress?.completed_lessons?.length || 0,
    totalTimeSpent: userProgress?.total_time_spent ? Math.floor(userProgress.total_time_spent / 60) : 0,
    questionsAsked: userProgress?.statistics?.questions_asked || 0,
    streak: userProgress?.statistics?.streak || 0,
    weeklyGoal: userProgress?.statistics?.weekly_goal || 5,
    completedThisWeek: userProgress?.statistics?.completed_this_week || 0,
  };

  return (
    <Container maxW="container.xl" py={8}>
      {/* Welcome Header */}
      <Box
        bgGradient={gradientBg}
        borderRadius="3xl"
        p={8}
        mb={8}
        position="relative"
        overflow="hidden"
        boxShadow="gradient-lg"
        border="1px solid"
        borderColor="brand.200"
      >
        <Box position="relative" zIndex={1}>
          <HStack justify="space-between" align="start" mb={4}>
            <VStack align="start" spacing={2}>
              <Text fontSize="lg" color={mutedTextColor}>
                {getGreeting()}, {currentUser?.displayName?.split(' ')[0] || 'Student'}! 👋
              </Text>
              <Heading size="xl" fontWeight="bold" color={textColor}>
                Ready to continue learning?
              </Heading>
              <Text color={mutedTextColor} maxW="md">
                {stats.streak > 0 
                  ? `You're on a ${stats.streak}-day learning streak! Keep it up to reach your weekly goal.`
                  : 'Start your learning journey today!'
                }
              </Text>
            </VStack>
            <VStack align="end" spacing={2}>
              {stats.streak > 0 && (
                <Badge variant="gradient" px={4} py={2} borderRadius="full" fontSize="sm">
                  🔥 {stats.streak} Day Streak
                </Badge>
              )}
              <Text fontSize="sm" color={mutedTextColor}>
                {stats.completedThisWeek}/{stats.weeklyGoal} lessons this week
              </Text>
            </VStack>
          </HStack>
          
          {userProgress?.current_lesson ? (
            <Card bg="whiteAlpha.200" backdropFilter="blur(10px)" border="1px solid" borderColor="whiteAlpha.300" borderRadius="2xl">
              <CardBody>
                <HStack justify="space-between" mb={3}>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color={mutedTextColor}>Continue Learning</Text>
                    <Text fontWeight="bold" color={textColor}>{userProgress.current_lesson.title}</Text>
                  </VStack>
                  <Button
                    leftIcon={<FiPlay />}
                    colorScheme="whiteAlpha"
                    variant="solid"
                    size="sm"
                    as={RouterLink}
                    to={`/lessons/${userProgress.current_lesson.lesson_id}`}
                    borderRadius="xl"
                  >
                    Resume
                  </Button>
                </HStack>
                <Progress 
                  value={userProgress.current_lesson.progress * 100} 
                  colorScheme="yellow"
                  bg="whiteAlpha.300"
                  borderRadius="full"
                  size="sm"
                />
                <HStack justify="space-between" mt={2} fontSize="sm" color={mutedTextColor}>
                  <Text>{Math.round(userProgress.current_lesson.progress * 100)}% complete</Text>
                </HStack>
              </CardBody>
            </Card>
          ) : (
            <Card bg="whiteAlpha.200" backdropFilter="blur(10px)" border="1px solid" borderColor="whiteAlpha.300" borderRadius="2xl">
              <CardBody textAlign="center">
                <VStack spacing={3}>
                  <Icon as={FiBook} boxSize={8} color={mutedTextColor} />
                  <VStack spacing={1}>
                    <Text fontWeight="bold" color={textColor}>Ready to start learning?</Text>
                    <Text fontSize="sm" color={mutedTextColor}>Browse our lessons to begin your journey</Text>
                  </VStack>
                  <Button
                    leftIcon={<FiBook />}
                    colorScheme="whiteAlpha"
                    variant="solid"
                    size="sm"
                    as={RouterLink}
                    to="/lessons"
                    borderRadius="xl"
                  >
                    Browse Lessons
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          )}
        </Box>
        
        {/* Background decoration */}
        <Box
          position="absolute"
          top="-50%"
          right="-20%"
          w="400px"
          h="400px"
          borderRadius="full"
          bgGradient="radial(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)"
          filter="blur(100px)"
        />
      </Box>
      
      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={8}>
        <StatCard
          icon={FiBook}
          label="Lessons Completed"
          value={stats.lessonsCompleted}
          helpText="Total completed"
          colorScheme="blue"
        />
        <StatCard
          icon={FiClock}
          label="Learning Time"
          value={formatTime(stats.totalTimeSpent)}
          helpText="Total time spent"
          colorScheme="green"
        />
        <StatCard
          icon={FiHelpCircle}
          label="Questions Asked"
          value={stats.questionsAsked}
          helpText="AI interactions"
          colorScheme="purple"
        />
        <StatCard
          icon={FiTarget}
          label="Weekly Goal"
          value={`${stats.completedThisWeek}/${stats.weeklyGoal}`}
          helpText="Lessons this week"
          colorScheme="orange"
        />
      </SimpleGrid>
      
      <Grid templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(3, 1fr)' }} gap={8}>
        {/* Recent Activity */}
        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <Card bg={cardBg} h="fit-content" borderRadius="2xl" boxShadow="gradient-md">
            <CardHeader>
              <HStack justify="space-between">
                <HStack>
                  <Icon as={FiTrendingUp} color="brand.500" />
                  <Heading size="md" color={textColor}>Recent Activity</Heading>
                </HStack>
                <Button variant="ghost" size="sm" rightIcon={<FiChevronRight />} borderRadius="xl">
                  View All
                </Button>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              {recentActivity.length > 0 ? (
                <VStack spacing={4} align="stretch">
                  {recentActivity.map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
                  ))}
                </VStack>
              ) : (
                <VStack spacing={4} py={8} textAlign="center" color={subtleTextColor}>
                  <Icon as={FiTrendingUp} boxSize={12} />
                  <VStack spacing={2}>
                    <Text fontWeight="medium">No recent activity</Text>
                    <Text fontSize="sm">
                      Start learning to see your progress here!
                    </Text>
                  </VStack>
                  <Button
                    leftIcon={<FiBook />}
                    colorScheme="brand"
                    variant="outline"
                    size="sm"
                    as={RouterLink}
                    to="/lessons"
                    borderRadius="xl"
                  >
                    Browse Lessons
                  </Button>
                </VStack>
              )}
            </CardBody>
          </Card>
        </GridItem>
        
        {/* Quick Actions & Recommendations */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            {/* Quick Actions */}
            <Card bg={cardBg} borderRadius="2xl" boxShadow="gradient-md">
              <CardHeader>
                <Heading size="md" color={textColor}>Quick Actions</Heading>
              </CardHeader>
              <CardBody pt={0}>
                <VStack spacing={3} align="stretch">
                  <Button
                    leftIcon={<FiBook />}
                    colorScheme="brand"
                    variant="outline"
                    justifyContent="flex-start"
                    as={RouterLink}
                    to="/lessons"
                    borderRadius="xl"
                  >
                    Browse Lessons
                  </Button>
                  <Button
                    leftIcon={<FiHelpCircle />}
                    colorScheme="purple"
                    variant="outline"
                    justifyContent="flex-start"
                    as={RouterLink}
                    to="/qa"
                    borderRadius="xl"
                  >
                    Ask AI Tutor
                  </Button>
                  <Button
                    leftIcon={<FiCalendar />}
                    colorScheme="green"
                    variant="outline"
                    justifyContent="flex-start"
                    borderRadius="xl"
                  >
                    Schedule Study Time
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Recommended Lessons */}
            <Card bg={cardBg} borderRadius="2xl" boxShadow="gradient-md">
              <CardHeader>
                <Heading size="md" color={textColor}>Recommended for You</Heading>
              </CardHeader>
              <CardBody pt={0}>
                {recommendedLessons.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    {recommendedLessons.map((lesson) => (
                      <RecommendedLessonCard key={lesson.id} lesson={lesson} />
                    ))}
                  </VStack>
                ) : (
                  <VStack spacing={4} py={6} textAlign="center" color={subtleTextColor}>
                    <Icon as={FiBook} boxSize={10} />
                    <VStack spacing={2}>
                      <Text fontWeight="medium" fontSize="sm">No recommendations yet</Text>
                      <Text fontSize="xs">
                        Complete lessons to get personalized recommendations!
                      </Text>
                    </VStack>
                  </VStack>
                )}
              </CardBody>
              <CardFooter pt={0}>
                <Button
                  variant="ghost"
                  size="sm"
                  width="full"
                  rightIcon={<FiChevronRight />}
                  as={RouterLink}
                  to="/lessons"
                  borderRadius="xl"
                >
                  View All Lessons
                </Button>
              </CardFooter>
            </Card>

            {/* Achievement */}
            {stats.lessonsCompleted >= 10 && (
              <Card bg={cardBg} borderColor="yellow.200" borderWidth="2px" borderRadius="2xl" boxShadow="gradient-md">
                <CardBody textAlign="center">
                  <Icon as={FiAward} boxSize={8} color="yellow.500" mb={2} />
                  <Text fontWeight="bold" mb={1} color={textColor}>Achievement Unlocked!</Text>
                  <Text fontSize="sm" color={mutedTextColor}>
                    Completed {stats.lessonsCompleted}+ lessons!
                  </Text>
                </CardBody>
              </Card>
            )}
          </VStack>
        </GridItem>
      </Grid>
    </Container>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  helpText: string;
  colorScheme: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, helpText, colorScheme }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  
  return (
    <Card bg={cardBg} borderRadius="2xl" boxShadow="gradient-md">
      <CardBody>
        <Stat>
          <HStack mb={2}>
            <Icon as={icon} color={`${colorScheme}.500`} boxSize={5} />
            <StatLabel fontSize="sm" fontWeight="medium" color={textColor}>{label}</StatLabel>
          </HStack>
          <StatNumber fontSize="2xl" fontWeight="bold" bgGradient="linear(135deg, #A855F7 0%, #3B82F6 100%)" bgClip="text">
            {value}
          </StatNumber>
          <StatHelpText fontSize="xs" color={mutedTextColor}>{helpText}</StatHelpText>
        </Stat>
      </CardBody>
    </Card>
  );
};

interface ActivityItemProps {
  activity: {
    type: string;
    title: string;
    time: string;
    score?: number;
  };
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.500');
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson_completed':
        return { icon: FiBook, color: 'green.500' };
      case 'question_asked':
        return { icon: FiHelpCircle, color: 'blue.500' };
      case 'lesson_started':
        return { icon: FiPlay, color: 'purple.500' };
      default:
        return { icon: FiBook, color: 'gray.500' };
    }
  };

  const { icon, color } = getActivityIcon(activity.type);

  return (
    <HStack spacing={3} p={3} borderRadius="xl" _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
      <Icon as={icon} color={color} boxSize={5} />
      <VStack align="start" spacing={0} flex={1}>
        <Text fontWeight="medium" fontSize="sm" color={textColor}>{activity.title}</Text>
        <Text fontSize="xs" color={mutedTextColor}>{activity.time}</Text>
      </VStack>
      {activity.score && (
        <Badge variant="gradient" borderRadius="full">
          {activity.score}%
        </Badge>
      )}
    </HStack>
  );
};

interface RecommendedLessonCardProps {
  lesson: {
    id: string;
    title: string;
    difficulty: string;
    duration_minutes: number;
  };
}

const RecommendedLessonCard: React.FC<RecommendedLessonCardProps> = ({ lesson }) => {
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.500');
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'green';
      case 'intermediate':
        return 'blue';
      case 'advanced':
        return 'purple';
      default:
        return 'gray';
    }
  };

  return (
    <HStack
      spacing={3}
      p={3}
      borderRadius="xl"
      _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
      cursor="pointer"
      transition="all 0.2s"
      as={RouterLink}
      to={`/lessons/${lesson.id}`}
    >
      <Box
        w="50px"
        h="50px"
        borderRadius="xl"
        bgGradient="linear(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
        border="1px solid"
        borderColor="brand.200"
      >
        <Icon as={FiBook} color="brand.500" />
      </Box>
      <VStack align="start" spacing={1} flex={1}>
        <Text fontWeight="medium" fontSize="sm" noOfLines={2} color={textColor}>
          {lesson.title}
        </Text>
        <HStack spacing={2}>
          <Badge colorScheme={getDifficultyColor(lesson.difficulty)} size="sm" borderRadius="full">
            {lesson.difficulty}
          </Badge>
          <Text fontSize="xs" color={mutedTextColor}>
            {lesson.duration_minutes} min
          </Text>
        </HStack>
      </VStack>
    </HStack>
  );
};

export default Dashboard;