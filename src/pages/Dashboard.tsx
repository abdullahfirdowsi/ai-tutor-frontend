import React from 'react';
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

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const cardBg = useColorModeValue('white', 'gray.800');
  const gradientBg = useColorModeValue(
    'linear(to-r, brand.500, purple.500)',
    'linear(to-r, brand.600, purple.600)'
  );

  // Mock data - in a real app, this would come from API
  const userProgress = {
    lessonsCompleted: 12,
    currentLesson: {
      id: 'lesson-123',
      title: 'Advanced React Patterns',
      progress: 0.65,
      timeRemaining: 25,
    },
    totalTimeSpent: 1240, // in minutes
    questionsAsked: 47,
    streak: 7,
    weeklyGoal: 5,
    completedThisWeek: 3,
  };

  const recentActivity = [
    {
      type: 'lesson_completed',
      title: 'JavaScript Fundamentals',
      time: '2 hours ago',
      score: 95,
    },
    {
      type: 'question_asked',
      title: 'How do closures work in JavaScript?',
      time: '4 hours ago',
    },
    {
      type: 'lesson_started',
      title: 'React State Management',
      time: '1 day ago',
    },
  ];

  const upcomingLessons = [
    {
      id: '1',
      title: 'TypeScript Advanced Types',
      difficulty: 'Advanced',
      duration: 45,
      thumbnail: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '2',
      title: 'Node.js Performance',
      difficulty: 'Intermediate',
      duration: 60,
      thumbnail: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ];

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
                You're on a {userProgress.streak}-day learning streak! Keep it up to reach your weekly goal.
              </Text>
            </VStack>
            <VStack align="end" spacing={2}>
              <Badge colorScheme="yellow" variant="solid" px={3} py={1} borderRadius="full">
                🔥 {userProgress.streak} Day Streak
              </Badge>
              <Text fontSize="sm" opacity={0.8}>
                {userProgress.completedThisWeek}/{userProgress.weeklyGoal} lessons this week
              </Text>
            </VStack>
          </HStack>
          
          {userProgress.currentLesson && (
            <Card bg="whiteAlpha.200" backdropFilter="blur(10px)" border="1px solid" borderColor="whiteAlpha.300">
              <CardBody>
                <HStack justify="space-between" mb={3}>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" opacity={0.9}>Continue Learning</Text>
                    <Text fontWeight="bold">{userProgress.currentLesson.title}</Text>
                  </VStack>
                  <Button
                    leftIcon={<FiPlay />}
                    colorScheme="whiteAlpha"
                    variant="solid"
                    size="sm"
                    as={RouterLink}
                    to="/lessons"
                  >
                    Resume
                  </Button>
                </HStack>
                <Progress 
                  value={userProgress.currentLesson.progress * 100} 
                  colorScheme="yellow"
                  bg="whiteAlpha.300"
                  borderRadius="full"
                  size="sm"
                />
                <HStack justify="space-between" mt={2} fontSize="sm" opacity={0.9}>
                  <Text>{Math.round(userProgress.currentLesson.progress * 100)}% complete</Text>
                  <Text>{userProgress.currentLesson.timeRemaining} min remaining</Text>
                </HStack>
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
          value={userProgress.lessonsCompleted}
          helpText="Total completed"
          colorScheme="blue"
        />
        <StatCard
          icon={FiClock}
          label="Learning Time"
          value={formatTime(userProgress.totalTimeSpent)}
          helpText="Total time spent"
          colorScheme="green"
        />
        <StatCard
          icon={FiHelpCircle}
          label="Questions Asked"
          value={userProgress.questionsAsked}
          helpText="AI interactions"
          colorScheme="purple"
        />
        <StatCard
          icon={FiTarget}
          label="Weekly Goal"
          value={`${userProgress.completedThisWeek}/${userProgress.weeklyGoal}`}
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
              <VStack spacing={4} align="stretch">
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))}
              </VStack>
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
                <VStack spacing={4} align="stretch">
                  {upcomingLessons.map((lesson) => (
                    <RecommendedLessonCard key={lesson.id} lesson={lesson} />
                  ))}
                </VStack>
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
            <Card bg={cardBg} borderColor="yellow.200" borderWidth="2px">
              <CardBody textAlign="center">
                <Icon as={FiAward} boxSize={8} color="yellow.500" mb={2} />
                <Text fontWeight="bold" mb={1}>Achievement Unlocked!</Text>
                <Text fontSize="sm" color="gray.600">
                  Completed 10+ lessons this month
                </Text>
              </CardBody>
            </Card>
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
    duration: number;
    thumbnail: string;
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
            {lesson.duration} min
          </Text>
        </HStack>
      </VStack>
    </HStack>
  );
};

export default Dashboard;