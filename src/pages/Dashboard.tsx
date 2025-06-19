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
  Stack,
  Button,
  Divider,
  Progress,
  Flex,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiBook, FiClock, FiAward, FiHelpCircle } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const cardBg = useColorModeValue('white', 'gray.700');

  // Mock data - in a real app, this would come from API
  const userProgress = {
    lessonsCompleted: 5,
    currentLesson: {
      id: 'lesson-123',
      title: 'Introduction to Machine Learning',
      progress: 0.4,
    },
    totalTimeSpent: 320, // in minutes
    questionsAsked: 12,
  };

  // Format minutes into hours and minutes
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Box maxW="1200px" mx="auto" px={4}>
      <Heading mb={8}>Welcome, {currentUser?.displayName || 'Student'}!</Heading>
      
      {/* Demo mode notice */}
      <Alert status="info" mb={6} borderRadius="md">
        <AlertIcon />
        <Text>
          <strong>Demo Mode:</strong> This is a demonstration of the AI Tutor interface. 
          Backend API connectivity is limited, so some features show simulated data.
        </Text>
      </Alert>
      
      <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={6} mb={8}>
        <GridItem>
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <Flex align="center">
                  <Icon as={FiBook} mr={2} color="brand.500" />
                  <StatLabel>Lessons Completed</StatLabel>
                </Flex>
                <StatNumber>{userProgress.lessonsCompleted}</StatNumber>
                <StatHelpText>Your learning journey</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <Flex align="center">
                  <Icon as={FiClock} mr={2} color="brand.500" />
                  <StatLabel>Time Spent Learning</StatLabel>
                </Flex>
                <StatNumber>{formatTime(userProgress.totalTimeSpent)}</StatNumber>
                <StatHelpText>Total learning time</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <Flex align="center">
                  <Icon as={FiHelpCircle} mr={2} color="brand.500" />
                  <StatLabel>Questions Asked</StatLabel>
                </Flex>
                <StatNumber>{userProgress.questionsAsked}</StatNumber>
                <StatHelpText>Keep asking to learn more</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
      
      <Grid templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(2, 1fr)' }} gap={8}>
        <GridItem>
          <Card bg={cardBg} mb={6}>
            <CardHeader>
              <Heading size="md">Continue Learning</Heading>
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                <Text fontWeight="bold">{userProgress.currentLesson.title}</Text>
                <Progress 
                  value={userProgress.currentLesson.progress * 100} 
                  colorScheme="brand" 
                  hasStripe
                  rounded="md"
                  size="md"
                />
                <Text>{Math.round(userProgress.currentLesson.progress * 100)}% complete</Text>
              </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
              <Button 
                as={RouterLink} 
                to="/lessons"
                colorScheme="brand" 
                width="full"
              >
                Browse Lessons
              </Button>
            </CardFooter>
          </Card>
          
          <Card bg={cardBg}>
            <CardHeader>
              <Heading size="md">Have a Question?</Heading>
            </CardHeader>
            <CardBody>
              <Text>Ask AI Tutor any question about your lessons or other topics.</Text>
            </CardBody>
            <Divider />
            <CardFooter>
              <Button 
                as={RouterLink} 
                to="/qa" 
                colorScheme="accent" 
                width="full"
              >
                Ask a Question
              </Button>
            </CardFooter>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card bg={cardBg}>
            <CardHeader>
              <Heading size="md">Demo Lessons Available</Heading>
            </CardHeader>
            <CardBody>
              <Stack spacing={4} divider={<Divider />}>
                <RecommendedLesson 
                  id="mock-1"
                  title="Introduction to Machine Learning" 
                  description="Learn the fundamentals of machine learning and its applications"
                  difficulty="Beginner"
                />
                <RecommendedLesson 
                  id="mock-2"
                  title="Linear Algebra Basics" 
                  description="Understanding vectors, matrices, and linear transformations"
                  difficulty="Intermediate"
                />
                <RecommendedLesson 
                  id="mock-3"
                  title="React Fundamentals" 
                  description="Build modern web applications with React components and hooks"
                  difficulty="Beginner"
                />
              </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
              <Button 
                as={RouterLink} 
                to="/lessons" 
                colorScheme="brand" 
                variant="outline" 
                width="full"
              >
                Browse All Lessons
              </Button>
            </CardFooter>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

interface RecommendedLessonProps {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

const RecommendedLesson: React.FC<RecommendedLessonProps> = ({ id, title, description, difficulty }) => {
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={2}>
        <Heading size="sm">{title}</Heading>
        <Text fontSize="sm" color="accent.500" fontWeight="bold">{difficulty}</Text>
      </Flex>
      <Text fontSize="sm" color="gray.500" mb={2}>{description}</Text>
      <Button 
        as={RouterLink} 
        to="/lessons" 
        size="sm" 
        colorScheme="brand"
        variant="outline"
      >
        View Lessons
      </Button>
    </Box>
  );
};

export default Dashboard;