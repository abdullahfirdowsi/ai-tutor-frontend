import React, { useState, useEffect } from 'react';
import {
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Box,
  Icon,
  useColorModeValue,
  Select,
  Button,
  Flex,
  Badge,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
} from '@chakra-ui/react';
import {
  FiTrendingUp,
  FiClock,
  FiBook,
  FiHelpCircle,
  FiTarget,
  FiAward,
  FiCalendar,
  FiBarChart3,
  FiPieChart,
  FiActivity,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import api from '../services/api';

interface AnalyticsData {
  overview: {
    total_lessons_completed: number;
    total_time_spent: number;
    total_questions_asked: number;
    current_streak: number;
    average_score: number;
    lessons_this_week: number;
    lessons_this_month: number;
    improvement_rate: number;
  };
  daily_activity: Array<{
    date: string;
    lessons_completed: number;
    time_spent: number;
    questions_asked: number;
  }>;
  subject_breakdown: Array<{
    subject: string;
    lessons_completed: number;
    time_spent: number;
    average_score: number;
  }>;
  difficulty_progress: Array<{
    difficulty: string;
    completed: number;
    total: number;
    percentage: number;
  }>;
  weekly_goals: {
    current_week: number;
    goal: number;
    completion_rate: number;
    streak: number;
  };
  learning_trends: Array<{
    week: string;
    lessons: number;
    time: number;
    score: number;
  }>;
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');

  const cardBg = useColorModeValue('white', 'gray.700');
  const statBg = useColorModeValue('gray.50', 'gray.800');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const response = await api.get(`/analytics/dashboard?range=${timeRange}`);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setHasError(true);
      // Set mock data for demonstration
      setAnalyticsData({
        overview: {
          total_lessons_completed: 24,
          total_time_spent: 1440, // minutes
          total_questions_asked: 156,
          current_streak: 7,
          average_score: 87.5,
          lessons_this_week: 5,
          lessons_this_month: 18,
          improvement_rate: 12.5,
        },
        daily_activity: [
          { date: '2024-01-01', lessons_completed: 2, time_spent: 60, questions_asked: 8 },
          { date: '2024-01-02', lessons_completed: 1, time_spent: 45, questions_asked: 5 },
          { date: '2024-01-03', lessons_completed: 3, time_spent: 90, questions_asked: 12 },
          { date: '2024-01-04', lessons_completed: 2, time_spent: 75, questions_asked: 9 },
          { date: '2024-01-05', lessons_completed: 1, time_spent: 30, questions_asked: 4 },
          { date: '2024-01-06', lessons_completed: 4, time_spent: 120, questions_asked: 15 },
          { date: '2024-01-07', lessons_completed: 2, time_spent: 60, questions_asked: 7 },
        ],
        subject_breakdown: [
          { subject: 'Mathematics', lessons_completed: 8, time_spent: 480, average_score: 92 },
          { subject: 'Physics', lessons_completed: 6, time_spent: 360, average_score: 85 },
          { subject: 'Programming', lessons_completed: 5, time_spent: 300, average_score: 88 },
          { subject: 'Chemistry', lessons_completed: 3, time_spent: 180, average_score: 82 },
          { subject: 'Biology', lessons_completed: 2, time_spent: 120, average_score: 90 },
        ],
        difficulty_progress: [
          { difficulty: 'Beginner', completed: 12, total: 15, percentage: 80 },
          { difficulty: 'Intermediate', completed: 8, total: 12, percentage: 67 },
          { difficulty: 'Advanced', completed: 4, total: 10, percentage: 40 },
        ],
        weekly_goals: {
          current_week: 5,
          goal: 7,
          completion_rate: 71,
          streak: 3,
        },
        learning_trends: [
          { week: 'Week 1', lessons: 8, time: 240, score: 82 },
          { week: 'Week 2', lessons: 10, time: 300, score: 85 },
          { week: 'Week 3', lessons: 12, time: 360, score: 88 },
          { week: 'Week 4', lessons: 15, time: 450, score: 90 },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const COLORS = ['#3182CE', '#805AD5', '#38A169', '#F59E0B', '#EF4444'];

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Skeleton height="60px" />
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} height="120px" borderRadius="xl" />
            ))}
          </SimpleGrid>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            <Skeleton height="400px" borderRadius="xl" />
            <Skeleton height="400px" borderRadius="xl" />
          </SimpleGrid>
        </VStack>
      </Container>
    );
  }

  if (hasError && !analyticsData) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <AlertTitle mr={2}>Unable to load analytics</AlertTitle>
          <AlertDescription>
            There was an error loading your learning analytics. Please try again.
          </AlertDescription>
        </Alert>
        <Button mt={4} leftIcon={<FiRefreshCw />} onClick={fetchAnalytics} colorScheme="brand">
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <VStack align="start" spacing={2}>
            <Heading as="h1" size="2xl" color="brand.600">
              Learning Analytics
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Track your progress and insights
            </Text>
          </VStack>
          
          <HStack spacing={4}>
            <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} w="auto">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </Select>
            <Button leftIcon={<FiRefreshCw />} onClick={fetchAnalytics} variant="outline">
              Refresh
            </Button>
          </HStack>
        </Flex>

        {hasError && (
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <AlertTitle mr={2}>Limited Data</AlertTitle>
            <AlertDescription>
              Showing sample data. Connect to the backend for real analytics.
            </AlertDescription>
          </Alert>
        )}

        {/* Overview Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
            <CardBody>
              <Stat>
                <HStack mb={2}>
                  <Icon as={FiBook} color="blue.500" boxSize={6} />
                </HStack>
                <StatNumber fontSize="2xl" color="blue.500">
                  {analyticsData?.overview.total_lessons_completed || 0}
                </StatNumber>
                <StatLabel>Lessons Completed</StatLabel>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {analyticsData?.overview.improvement_rate || 0}% this month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
            <CardBody>
              <Stat>
                <HStack mb={2}>
                  <Icon as={FiClock} color="green.500" boxSize={6} />
                </HStack>
                <StatNumber fontSize="2xl" color="green.500">
                  {formatTime(analyticsData?.overview.total_time_spent || 0)}
                </StatNumber>
                <StatLabel>Total Study Time</StatLabel>
                <StatHelpText>
                  {analyticsData?.overview.lessons_this_week || 0} lessons this week
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
            <CardBody>
              <Stat>
                <HStack mb={2}>
                  <Icon as={FiHelpCircle} color="purple.500" boxSize={6} />
                </HStack>
                <StatNumber fontSize="2xl" color="purple.500">
                  {analyticsData?.overview.total_questions_asked || 0}
                </StatNumber>
                <StatLabel>Questions Asked</StatLabel>
                <StatHelpText>AI interactions</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
            <CardBody>
              <Stat>
                <HStack mb={2}>
                  <Icon as={FiTarget} color="orange.500" boxSize={6} />
                </HStack>
                <StatNumber fontSize="2xl" color="orange.500">
                  {analyticsData?.overview.average_score || 0}%
                </StatNumber>
                <StatLabel>Average Score</StatLabel>
                <StatHelpText>
                  🔥 {analyticsData?.overview.current_streak || 0} day streak
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Charts Grid */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Daily Activity Chart */}
          <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
            <CardHeader>
              <HStack>
                <Icon as={FiActivity} color="brand.500" />
                <Heading size="md">Daily Activity</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData?.daily_activity || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="lessons_completed"
                    stackId="1"
                    stroke="#3182CE"
                    fill="#3182CE"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="time_spent"
                    stackId="2"
                    stroke="#805AD5"
                    fill="#805AD5"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Subject Breakdown */}
          <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
            <CardHeader>
              <HStack>
                <Icon as={FiPieChart} color="brand.500" />
                <Heading size="md">Subject Breakdown</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData?.subject_breakdown || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ subject, percentage }) => `${subject} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="lessons_completed"
                  >
                    {(analyticsData?.subject_breakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Learning Trends */}
          <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
            <CardHeader>
              <HStack>
                <Icon as={FiTrendingUp} color="brand.500" />
                <Heading size="md">Learning Trends</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData?.learning_trends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="lessons"
                    stroke="#3182CE"
                    strokeWidth={3}
                    dot={{ fill: '#3182CE', strokeWidth: 2, r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#38A169"
                    strokeWidth={3}
                    dot={{ fill: '#38A169', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Difficulty Progress */}
          <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
            <CardHeader>
              <HStack>
                <Icon as={FiBarChart3} color="brand.500" />
                <Heading size="md">Difficulty Progress</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                {(analyticsData?.difficulty_progress || []).map((item, index) => (
                  <Box key={index}>
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="medium">{item.difficulty}</Text>
                      <Badge colorScheme={item.percentage >= 80 ? 'green' : item.percentage >= 60 ? 'yellow' : 'red'}>
                        {item.completed}/{item.total}
                      </Badge>
                    </HStack>
                    <Progress
                      value={item.percentage}
                      colorScheme={item.percentage >= 80 ? 'green' : item.percentage >= 60 ? 'yellow' : 'red'}
                      size="lg"
                      borderRadius="full"
                    />
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      {item.percentage}% complete
                    </Text>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Weekly Goals */}
        <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
          <CardHeader>
            <HStack justify="space-between">
              <HStack>
                <Icon as={FiTarget} color="brand.500" />
                <Heading size="md">Weekly Goals</Heading>
              </HStack>
              <Badge colorScheme="brand" variant="subtle" px={3} py={1}>
                Week {new Date().getWeek()}
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              <VStack spacing={4}>
                <Text fontSize="sm" color="gray.500">Current Progress</Text>
                <Box textAlign="center">
                  <Text fontSize="3xl" fontWeight="bold" color="brand.500">
                    {analyticsData?.weekly_goals.current_week || 0}
                  </Text>
                  <Text color="gray.600">of {analyticsData?.weekly_goals.goal || 7} lessons</Text>
                </Box>
                <Progress
                  value={analyticsData?.weekly_goals.completion_rate || 0}
                  colorScheme="brand"
                  size="lg"
                  borderRadius="full"
                  w="full"
                />
              </VStack>

              <Divider orientation="vertical" display={{ base: 'none', md: 'block' }} />

              <VStack spacing={4}>
                <Text fontSize="sm" color="gray.500">Completion Rate</Text>
                <Box textAlign="center">
                  <Text fontSize="3xl" fontWeight="bold" color="green.500">
                    {analyticsData?.weekly_goals.completion_rate || 0}%
                  </Text>
                  <Text color="gray.600">this week</Text>
                </Box>
                <Badge colorScheme="green" variant="subtle" px={3} py={1}>
                  {analyticsData?.weekly_goals.streak || 0} week streak
                </Badge>
              </VStack>

              <Divider orientation="vertical" display={{ base: 'none', md: 'block' }} />

              <VStack spacing={4}>
                <Text fontSize="sm" color="gray.500">Recommendation</Text>
                <Box textAlign="center">
                  <Icon as={FiAward} boxSize={8} color="orange.500" mb={2} />
                  <Text fontWeight="medium">
                    {(analyticsData?.weekly_goals.completion_rate || 0) >= 100
                      ? 'Goal achieved! 🎉'
                      : `${(analyticsData?.weekly_goals.goal || 7) - (analyticsData?.weekly_goals.current_week || 0)} more lessons to go`
                    }
                  </Text>
                </Box>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

// Helper function to get week number
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function() {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

export default Analytics;