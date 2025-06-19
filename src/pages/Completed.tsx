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
  Badge,
  Progress,
  Icon,
  useColorModeValue,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Box,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import {
  FiBook,
  FiClock,
  FiAward,
  FiSearch,
  FiDownload,
  FiShare2,
  FiMoreVertical,
  FiCalendar,
  FiTarget,
  FiRefreshCw,
  FiEdit,
  FiTrash2,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface CompletedLesson {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: string;
  duration_minutes: number;
  completed_at: string;
  score: number;
  time_spent: number;
  attempts: number;
  tags: string[];
  certificate_earned: boolean;
}

interface CompletionStats {
  total_completed: number;
  total_time_spent: number;
  average_score: number;
  certificates_earned: number;
  subjects_mastered: number;
  completion_streak: number;
  this_month: number;
  this_week: number;
}

const Completed: React.FC = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.700');
  
  const [completedLessons, setCompletedLessons] = useState<CompletedLesson[]>([]);
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [sortBy, setSortBy] = useState('completed_at');

  useEffect(() => {
    fetchCompletedLessons();
  }, []);

  const fetchCompletedLessons = async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const [lessonsResponse, statsResponse] = await Promise.all([
        api.get('/users/me/completed-lessons'),
        api.get('/users/me/completion-stats')
      ]);
      
      setCompletedLessons(lessonsResponse.data.lessons || []);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to fetch completed lessons:', error);
      setHasError(true);
      
      // Mock data for demonstration
      const mockLessons: CompletedLesson[] = [
        {
          id: '1',
          title: 'Introduction to Linear Algebra',
          subject: 'Mathematics',
          topic: 'Linear Algebra',
          difficulty: 'intermediate',
          duration_minutes: 45,
          completed_at: '2024-01-15T10:30:00Z',
          score: 92,
          time_spent: 48,
          attempts: 1,
          tags: ['algebra', 'vectors', 'matrices'],
          certificate_earned: true,
        },
        {
          id: '2',
          title: 'Quantum Mechanics Basics',
          subject: 'Physics',
          topic: 'Quantum Physics',
          difficulty: 'advanced',
          duration_minutes: 60,
          completed_at: '2024-01-14T14:20:00Z',
          score: 88,
          time_spent: 65,
          attempts: 2,
          tags: ['quantum', 'physics', 'mechanics'],
          certificate_earned: true,
        },
        {
          id: '3',
          title: 'React Hooks Deep Dive',
          subject: 'Programming',
          topic: 'React',
          difficulty: 'intermediate',
          duration_minutes: 40,
          completed_at: '2024-01-13T16:45:00Z',
          score: 95,
          time_spent: 42,
          attempts: 1,
          tags: ['react', 'hooks', 'javascript'],
          certificate_earned: true,
        },
        {
          id: '4',
          title: 'Organic Chemistry Fundamentals',
          subject: 'Chemistry',
          topic: 'Organic Chemistry',
          difficulty: 'beginner',
          duration_minutes: 35,
          completed_at: '2024-01-12T09:15:00Z',
          score: 78,
          time_spent: 40,
          attempts: 1,
          tags: ['chemistry', 'organic', 'molecules'],
          certificate_earned: false,
        },
        {
          id: '5',
          title: 'Machine Learning Algorithms',
          subject: 'Computer Science',
          topic: 'Machine Learning',
          difficulty: 'advanced',
          duration_minutes: 75,
          completed_at: '2024-01-11T11:00:00Z',
          score: 85,
          time_spent: 80,
          attempts: 1,
          tags: ['ml', 'algorithms', 'ai'],
          certificate_earned: true,
        },
      ];

      const mockStats: CompletionStats = {
        total_completed: 24,
        total_time_spent: 1440,
        average_score: 87.2,
        certificates_earned: 18,
        subjects_mastered: 5,
        completion_streak: 7,
        this_month: 12,
        this_week: 3,
      };

      setCompletedLessons(mockLessons);
      setStats(mockStats);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDifficultyColor = (difficulty: string): string => {
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

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'green';
    if (score >= 80) return 'blue';
    if (score >= 70) return 'yellow';
    return 'red';
  };

  // Filter and sort lessons
  const filteredLessons = completedLessons
    .filter(lesson => {
      const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lesson.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lesson.topic.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = !subjectFilter || lesson.subject === subjectFilter;
      const matchesDifficulty = !difficultyFilter || lesson.difficulty === difficultyFilter;
      
      return matchesSearch && matchesSubject && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'subject':
          return a.subject.localeCompare(b.subject);
        case 'completed_at':
        default:
          return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
      }
    });

  const subjects = Array.from(new Set(completedLessons.map(lesson => lesson.subject)));

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
          <Skeleton height="400px" borderRadius="xl" />
        </VStack>
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
              Completed Lessons
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Review your learning achievements and progress
            </Text>
          </VStack>
          
          <HStack spacing={4}>
            <Button leftIcon={<FiDownload />} variant="outline">
              Export
            </Button>
            <Button leftIcon={<FiRefreshCw />} onClick={fetchCompletedLessons} variant="outline">
              Refresh
            </Button>
          </HStack>
        </Flex>

        {hasError && (
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <AlertTitle mr={2}>Limited Data</AlertTitle>
            <AlertDescription>
              Showing sample data. Connect to the backend for real completion history.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        {stats && (
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
              <CardBody>
                <Stat>
                  <HStack mb={2}>
                    <Icon as={FiBook} color="blue.500" boxSize={6} />
                  </HStack>
                  <StatNumber fontSize="2xl" color="blue.500">
                    {stats.total_completed}
                  </StatNumber>
                  <StatLabel>Total Completed</StatLabel>
                  <StatHelpText>
                    {stats.this_month} this month
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
                    {formatTime(stats.total_time_spent)}
                  </StatNumber>
                  <StatLabel>Total Time</StatLabel>
                  <StatHelpText>
                    Learning time invested
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
              <CardBody>
                <Stat>
                  <HStack mb={2}>
                    <Icon as={FiTarget} color="purple.500" boxSize={6} />
                  </HStack>
                  <StatNumber fontSize="2xl" color="purple.500">
                    {stats.average_score}%
                  </StatNumber>
                  <StatLabel>Average Score</StatLabel>
                  <StatHelpText>
                    Across all lessons
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
              <CardBody>
                <Stat>
                  <HStack mb={2}>
                    <Icon as={FiAward} color="orange.500" boxSize={6} />
                  </HStack>
                  <StatNumber fontSize="2xl" color="orange.500">
                    {stats.certificates_earned}
                  </StatNumber>
                  <StatLabel>Certificates</StatLabel>
                  <StatHelpText>
                    🔥 {stats.completion_streak} day streak
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Filters */}
        <Card bg={cardBg} borderRadius="xl" boxShadow="sm">
          <CardBody>
            <HStack spacing={4} wrap="wrap">
              <InputGroup flex={2} minW="250px">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search completed lessons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              
              <Select
                placeholder="All Subjects"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                maxW="200px"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </Select>
              
              <Select
                placeholder="All Difficulties"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                maxW="200px"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
              
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                maxW="200px"
              >
                <option value="completed_at">Recently Completed</option>
                <option value="score">Highest Score</option>
                <option value="title">Title A-Z</option>
                <option value="subject">Subject</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {/* Completed Lessons Grid */}
        {filteredLessons.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredLessons.map(lesson => (
              <Card
                key={lesson.id}
                bg={cardBg}
                borderRadius="xl"
                boxShadow="lg"
                transition="all 0.2s"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
                cursor="pointer"
                onClick={() => navigate(`/lessons/${lesson.id}`)}
              >
                <CardHeader pb={3}>
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <Badge
                        colorScheme={getDifficultyColor(lesson.difficulty)}
                        variant="subtle"
                        px={2}
                        py={1}
                      >
                        {lesson.difficulty}
                      </Badge>
                      <Menu>
                        <MenuButton
                          as={Button}
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Icon as={FiMoreVertical} />
                        </MenuButton>
                        <MenuList>
                          <MenuItem icon={<FiBook />}>
                            Retake Lesson
                          </MenuItem>
                          <MenuItem icon={<FiShare2 />}>
                            Share Achievement
                          </MenuItem>
                          <MenuItem icon={<FiDownload />}>
                            Download Certificate
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </HStack>
                    
                    <Heading as="h3" size="md" noOfLines={2}>
                      {lesson.title}
                    </Heading>
                    
                    <HStack spacing={2}>
                      <Badge colorScheme="blue" variant="outline">
                        {lesson.subject}
                      </Badge>
                      {lesson.certificate_earned && (
                        <Tooltip label="Certificate earned">
                          <Badge colorScheme="yellow" variant="solid">
                            <Icon as={FiAward} mr={1} />
                            Certified
                          </Badge>
                        </Tooltip>
                      )}
                    </HStack>
                  </VStack>
                </CardHeader>
                
                <CardBody pt={0}>
                  <VStack spacing={4} align="stretch">
                    {/* Score */}
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="medium">Score</Text>
                        <Text fontSize="sm" color={`${getScoreColor(lesson.score)}.500`} fontWeight="bold">
                          {lesson.score}%
                        </Text>
                      </HStack>
                      <Progress
                        value={lesson.score}
                        colorScheme={getScoreColor(lesson.score)}
                        size="sm"
                        borderRadius="full"
                      />
                    </Box>
                    
                    {/* Stats */}
                    <SimpleGrid columns={2} spacing={4} fontSize="sm">
                      <VStack spacing={1}>
                        <Icon as={FiClock} color="gray.500" />
                        <Text fontWeight="medium">{formatTime(lesson.time_spent)}</Text>
                        <Text color="gray.500" fontSize="xs">Time spent</Text>
                      </VStack>
                      
                      <VStack spacing={1}>
                        <Icon as={FiCalendar} color="gray.500" />
                        <Text fontWeight="medium">{formatDate(lesson.completed_at)}</Text>
                        <Text color="gray.500" fontSize="xs">Completed</Text>
                      </VStack>
                    </SimpleGrid>
                    
                    {/* Tags */}
                    {lesson.tags.length > 0 && (
                      <HStack spacing={1} wrap="wrap">
                        {lesson.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} size="sm" colorScheme="gray" variant="subtle">
                            {tag}
                          </Badge>
                        ))}
                        {lesson.tags.length > 3 && (
                          <Badge size="sm" colorScheme="gray" variant="subtle">
                            +{lesson.tags.length - 3}
                          </Badge>
                        )}
                      </HStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
            <CardBody py={16} textAlign="center">
              <VStack spacing={6}>
                <Icon as={FiBook} boxSize={16} color="gray.400" />
                <VStack spacing={2}>
                  <Heading size="lg" color="gray.600">
                    {searchTerm || subjectFilter || difficultyFilter
                      ? 'No matching lessons found'
                      : 'No completed lessons yet'
                    }
                  </Heading>
                  <Text color="gray.500" maxW="md">
                    {searchTerm || subjectFilter || difficultyFilter
                      ? 'Try adjusting your search criteria or filters.'
                      : 'Start learning to see your completed lessons here!'
                    }
                  </Text>
                </VStack>
                <Button
                  leftIcon={<FiBook />}
                  colorScheme="brand"
                  onClick={() => navigate('/lessons')}
                >
                  Browse Lessons
                </Button>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  );
};

export default Completed;