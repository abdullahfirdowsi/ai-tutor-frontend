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
  FiChevronRight
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
    'linear(to-r, brand.500, purple.500)',
    'linear(to-r, brand.600, purple.600)'
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        // Fetch user progress - this is the main data we need
        try {
          const progressResponse = await api.get('/users/me/progress');
          setUserProgress(progressResponse.data);
        } catch (progressError) {
          console.warn('No progress data available yet:', progressError);
          // Set empty progress instead of error
          setUserProgress({
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

        // Fetch recent activity - optional data
        try {
          const activityResponse = await api.get('/users/me/activity?limit=5');
          setRecentActivity(activityResponse.data.activities || []);
        } catch (activityError) {
          console.warn('No recent activity available:', activityError);
          setRecentActivity([]);
        }

        // Fetch recommended lessons - optional data
        try {
          const recommendedResponse = await api.get('/lessons/recommended?limit=3');
          setRecommendedLessons(recommendedResponse.data.lessons || []);
        } catch (recommendedError) {
          console.warn('No recommended lessons available:', recommendedError);
          setRecommendedLessons([]);
        }

      } catch (err: any) {
        console.error('Critical error fetching dashboard data:', err);
        // Only set error for critical failures (like network issues)
        if (err.code === 'NETWORK_ERROR' || err.response?.status >= 500) {
          setHasError(true);
        } else {
          // For other errors, just show empty state
          setUserProgress({
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
          <Skeleton height="200px" borderRadius="2xl" />
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} height="120px" borderRadius="xl" />
            ))}
          </SimpleGrid>
          <Grid templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(3, 1fr)' }} gap={8}>
            <GridItem colSpan={{ base: 1, lg: 2 }}>
              <Skeleton height="400px" borderRadius="xl" />
            </GridItem>
            <GridItem>
              <Skeleton height="400px" borderRadius="xl" />
            </GridItem>
          </Grid>
        </VStack>
      </Container>
    );
  }

  if (hasError) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <AlertTitle mr={2}>Connection Error</AlertTitle>
          <AlertDescription>
            Unable to connect to the server. Please check your internet connection and try again.
          </AlertDescription>
        </Alert>
        <Button mt={4} onClick={() => window.location.reload()} colorScheme="brand">
          Retry
        </Button>
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
        borderRadius="2xl"
        p={8}
        mb={8}
        color="white"
        position="relative"
        overflow="hidden"
      >
        <Box position="relative" zIndex={1}>
          <HStack justify="space-between" align="start" mb={4}>
            <VStack align="start" spacing={2}>
              <Text fontSize="lg" opacity={0.9}>
                {getGreeting()}, {currentUser?.displayName?.split(' ')[0] || 'Student'}! 👋
              </Text>
              <Heading size="xl" fontWeight="bold">
                Ready to continue learning?
              </Heading>
              <Text opacity={0.9} maxW="md">
                {stats.streak > 0 
                  ? `You're on a ${stats.streak}-day learning streak! Keep it up to reach your weekly goal.`
                  : 'Start your learning journey today!'
                }
              </Text>
            </VStack>
            <VStack align="end" spacing={2}>
              {stats.streak > 0 && (
                <Badge colorScheme="yellow" variant="solid" px={3} py={1} borderRadius="full">
                  🔥 {stats.streak} Day Streak
                </Badge>
              )}
              <Text fontSize="sm" opacity={0.8}>
                {stats.completedThisWeek}/{stats.weeklyGoal} lessons this week
              </Text>
            </VStack>
          </HStack>
          
          {userProgress?.current_lesson ? (
            <Card bg="whiteAlpha.200" backdropFilter="blur(10px)" border="1px solid" borderColor="whiteAlpha.300">
              <CardBody>
                <HStack justify="space-between" mb={3}>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" opacity={0.9}>Continue Learning</Text>
                    <Text fontWeight="bold">{userProgress.current_lesson.title}</Text>
                  </VStack>
                  <Button
                    leftIcon={<FiPlay />}
                    colorScheme="whiteAlpha"
                    variant="solid"
                    size="sm"
                    as={RouterLink}
                    to={`/lessons/${userProgress.current_lesson.lesson_id}`}
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
                <HStack justify="space-between" mt={2} fontSize="sm" opacity={0.9}>
                  <Text>{Math.round(userProgress.current_lesson.progress * 100)}% complete</Text>
                </HStack>
              </CardBody>
            </Card>
          ) : (
            <Card bg="whiteAlpha.200" backdropFilter="blur(10px)" border="1px solid" borderColor="whiteAlpha.300">
              <CardBody textAlign="center">
                <VStack spacing={3}>
                  <Icon as={FiBook} boxSize={8} opacity={0.8} />
                  <VStack spacing={1}>
                    <Text fontWeight="bold">Ready to start learning?</Text>
                    <Text fontSize="sm" opacity={0.8}>Browse our lessons to begin your journey</Text>
                  </VStack>
                  <Button
                    leftIcon={<FiBook />}
                    colorScheme="whiteAlpha"
                    variant="solid"
                    size="sm"
                    as={RouterLink}
                    to="/lessons"
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
          bg="whiteAlpha.100"
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
          <Card bg={cardBg} h="fit-content">
            <CardHeader>
              <HStack justify="space-between">
                <HStack>
                  <Icon as={FiTrendingUp} color="brand.500" />
                  <Heading size="md">Recent Activity</Heading>
                </HStack>
                <Button variant="ghost" size="sm" rightIcon={<FiChevronRight />}>
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
                <VStack spacing={4} py={8} textAlign="center" color="gray.500">
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
            <Card bg={cardBg}>
              <CardHeader>
                <Heading size="md">Quick Actions</Heading>
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
                  >
                    Ask AI Tutor
                  </Button>
                  <Button
                    leftIcon={<FiCalendar />}
                    colorScheme="green"
                    variant="outline"
                    justifyContent="flex-start"
                  >
                    Schedule Study Time
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Recommended Lessons */}
            <Card bg={cardBg}>
              <CardHeader>
                <Heading size="md">Recommended for You</Heading>
              </CardHeader>
              <CardBody pt={0}>
                {recommendedLessons.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    {recommendedLessons.map((lesson) => (
                      <RecommendedLessonCard key={lesson.id} lesson={lesson} />
                    ))}
                  </VStack>
                ) : (
                  <VStack spacing={4} py={6} textAlign="center" color="gray.500">
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
                >
                  View All Lessons
                </Button>
              </CardFooter>
            </Card>

            {/* Achievement */}
            {stats.lessonsCompleted >= 10 && (
              <Card bg={cardBg} borderColor="yellow.200" borderWidth="2px">
                <CardBody textAlign="center">
                  <Icon as={FiAward} boxSize={8} color="yellow.500" mb={2} />
                  <Text fontWeight="bold" mb={1}>Achievement Unlocked!</Text>
                  <Text fontSize="sm" color="gray.600">
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
  
  return (
    <Card bg={cardBg}>
      <CardBody>
        <Stat>
          <HStack mb={2}>
            <Icon as={icon} color={`${colorScheme}.500`} boxSize={5} />
            <StatLabel fontSize="sm" fontWeight="medium">{label}</StatLabel>
          </HStack>
          <StatNumber fontSize="2xl" fontWeight="bold">{value}</StatNumber>
          <StatHelpText fontSize="xs">{helpText}</StatHelpText>
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
    <HStack spacing={3} p={3} borderRadius="lg" _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
      <Icon as={icon} color={color} boxSize={5} />
      <VStack align="start" spacing={0} flex={1}>
        <Text fontWeight="medium" fontSize="sm">{activity.title}</Text>
        <Text fontSize="xs" color="gray.500">{activity.time}</Text>
      </VStack>
      {activity.score && (
        <Badge colorScheme="green" variant="subtle">
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
      borderRadius="lg"
      _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
      cursor="pointer"
      transition="all 0.2s"
      as={RouterLink}
      to={`/lessons/${lesson.id}`}
    >
      <Box
        w="50px"
        h="50px"
        borderRadius="lg"
        bg="brand.100"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <Icon as={FiBook} color="brand.500" />
      </Box>
      <VStack align="start" spacing={1} flex={1}>
        <Text fontWeight="medium" fontSize="sm" noOfLines={2}>
          {lesson.title}
        </Text>
        <HStack spacing={2}>
          <Badge colorScheme={getDifficultyColor(lesson.difficulty)} size="sm">
            {lesson.difficulty}
          </Badge>
          <Text fontSize="xs" color="gray.500">
            {lesson.duration_minutes} min
          </Text>
        </HStack>
      </VStack>
    </HStack>
  );
};

export default Dashboard;