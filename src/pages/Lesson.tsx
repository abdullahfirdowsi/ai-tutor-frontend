import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Progress,
  useToast,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tag,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
  Container,
  Divider,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Link,
  Icon,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FiClock, FiExternalLink, FiFileText } from 'react-icons/fi';
import api from '../services/api';

// Import components
import LessonSection from '../components/lesson/LessonSection';
import ExerciseComponent from '../components/lesson/ExerciseComponent';
import ProgressTracker from '../components/lesson/ProgressTracker';

// Types
interface LessonContentSection {
  title: string;
  content: string;
  order: number;
  type: string;
  media_url?: string;
}

interface LessonExercise {
  question: string;
  options?: string[];
  correct_answer?: string;
  explanation?: string;
  difficulty: string;
}

interface LessonResource {
  title: string;
  url: string;
  type: string;
  description?: string;
}

interface LessonData {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: string;
  duration_minutes: number;
  content: LessonContentSection[];
  summary?: string;
  resources: LessonResource[];
  exercises: LessonExercise[];
  created_at: string;
  created_by?: string;
  tags: string[];
}

interface LessonProgress {
  progress: number;
  time_spent: number;
  completed: boolean;
  score?: number;
  last_position?: string;
  notes?: string;
}

const Lesson: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');
  const contentBg = useColorModeValue('gray.50', 'gray.800');
  
  // State
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress>({
    progress: 0,
    time_spent: 0,
    completed: false,
  });
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<number, string>>({});
  const [exerciseScore, setExerciseScore] = useState<number | null>(null);
  
  // Save progress function
  const saveProgress = useCallback(async (isAutoSave: boolean = false) => {
    if (!lessonId || !lesson) return;
    
    try {
      const timeSpent = lessonProgress.time_spent + Math.floor((Date.now() - startTime) / 1000);
      
      const progressPercentage = lesson.content.length > 0 
        ? (currentSectionIndex + 1) / lesson.content.length 
        : 0;
      
      const progressData: LessonProgress = {
        progress: progressPercentage,
        time_spent: timeSpent,
        completed: lessonProgress.completed,
        last_position: currentSectionIndex.toString(),
        score: exerciseScore === null ? undefined : exerciseScore,
      };
      
      await api.post(`/lessons/${lessonId}/progress`, progressData);
      
      setStartTime(Date.now());
      setLessonProgress(progressData);
      
      if (!isAutoSave) {
        toast({
          title: 'Progress saved',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      console.error('Error saving progress:', err);
      if (!isAutoSave) {
        toast({
          title: 'Failed to save progress',
          description: err.response?.data?.detail || 'Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  }, [lessonId, lesson, lessonProgress, currentSectionIndex, exerciseScore, startTime, toast]);
  
  // Fetch lesson data
  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await api.get(`/lessons/${lessonId}`);
        setLesson(response.data);
        
        const progressResponse = await api.get(`/users/me/progress?lesson_id=${lessonId}`);
        if (progressResponse.data && progressResponse.data.completed_lessons) {
          const existingProgress = progressResponse.data.completed_lessons.find(
            (item: any) => item.lesson_id === lessonId
          );
          
          if (existingProgress) {
            setLessonProgress({
              progress: existingProgress.progress || 0,
              time_spent: existingProgress.time_spent || 0,
              completed: existingProgress.completed || false,
              score: existingProgress.score,
              last_position: existingProgress.last_position,
            });
            
            if (existingProgress.last_position) {
              const sectionIndex = parseInt(existingProgress.last_position);
              if (!isNaN(sectionIndex)) {
                setCurrentSectionIndex(sectionIndex);
              }
            }
          }
        }
      } catch (err: any) {
        console.error('Error fetching lesson:', err);
        setError(err.response?.data?.detail || 'Failed to load lesson. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLesson();
    
    const timer = setInterval(() => {
      setLessonProgress(prev => ({
        ...prev,
        time_spent: prev.time_spent + 5,
      }));
    }, 5000);
    
    return () => {
      clearInterval(timer);
      saveProgress(true);
    };
  }, [lessonId, saveProgress]);
  
  // Mark lesson as complete
  const completeLesson = async () => {
    if (!lessonId || !lesson) return;
    
    try {
      let finalScore = exerciseScore;
      if (!finalScore && Object.keys(exerciseAnswers).length > 0) {
        let correctAnswers = 0;
        lesson.exercises.forEach((exercise, index) => {
          if (exerciseAnswers[index] === exercise.correct_answer) {
            correctAnswers++;
          }
        });
        finalScore = lesson.exercises.length > 0 
          ? (correctAnswers / lesson.exercises.length) * 100 
          : null;
        setExerciseScore(finalScore);
      }
      
      const timeSpent = lessonProgress.time_spent + Math.floor((Date.now() - startTime) / 1000);
      
      const progressData: LessonProgress = {
        progress: 1.0,
        time_spent: timeSpent,
        completed: true,
        score: finalScore === null ? undefined : finalScore,
        last_position: currentSectionIndex.toString(),
      };
      
      await api.post(`/lessons/${lessonId}/progress`, progressData);
      
      setLessonProgress(progressData);
      
      toast({
        title: 'Lesson completed!',
        description: 'Your progress has been saved.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      console.error('Error completing lesson:', err);
      toast({
        title: 'Failed to complete lesson',
        description: err.response?.data?.detail || 'Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleAnswerSelect = (exerciseIndex: number, answer: string) => {
    setExerciseAnswers(prev => ({
      ...prev,
      [exerciseIndex]: answer,
    }));
  };
  
  const navigateToSection = (index: number) => {
    if (index >= 0 && index < (lesson?.content.length || 0)) {
      setCurrentSectionIndex(index);
      saveProgress();
    }
  };
  
  const calculateProgress = (): number => {
    if (!lesson || lesson.content.length === 0) return 0;
    return ((currentSectionIndex + 1) / lesson.content.length) * 100;
  };
  
  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Skeleton height="40px" width="70%" />
          <Skeleton height="20px" width="40%" />
          <Skeleton height="400px" />
          <HStack spacing={4}>
            <Skeleton height="40px" width="100px" />
            <Skeleton height="40px" width="100px" />
          </HStack>
        </VStack>
      </Container>
    );
  }
  
  if (error || !lesson) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertTitle mr={2}>Error!</AlertTitle>
          <AlertDescription>{error || 'Failed to load lesson'}</AlertDescription>
        </Alert>
        <Button mt={4} onClick={() => navigate('/lessons')}>
          Back to Lessons
        </Button>
      </Container>
    );
  }
  
  const currentSection = lesson.content[currentSectionIndex];
  const isLastSection = currentSectionIndex === lesson.content.length - 1;
  const isFirstSection = currentSectionIndex === 0;
  
  return (
    <Container maxW="container.xl" py={6}>
      {/* Breadcrumbs */}
      <Breadcrumb mb={6} fontSize="sm">
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate('/')}>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate('/lessons')}>Lessons</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{lesson.title}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      {/* Lesson header - Enhanced */}
      <Card bg={cardBg} mb={8} boxShadow="lg" borderRadius="xl">
        <CardHeader pb={4}>
          <VStack align="stretch" spacing={4}>
            <Heading as="h1" size="2xl" color="brand.600" lineHeight="shorter">
              {lesson.title}
            </Heading>
            
            <HStack spacing={4} flexWrap="wrap">
              <Tag colorScheme="blue" size="lg" px={4} py={2}>
                {lesson.subject}
              </Tag>
              <Tag colorScheme="purple" size="lg" px={4} py={2}>
                {lesson.difficulty}
              </Tag>
              <Flex align="center" bg={contentBg} px={4} py={2} borderRadius="full">
                <Icon as={FiClock} mr={2} color="gray.500" />
                <Text fontSize="sm" fontWeight="medium">{lesson.duration_minutes} minutes</Text>
              </Flex>
            </HStack>
            
            {lesson.summary && (
              <Box p={4} bg={contentBg} borderRadius="lg" borderLeft="4px solid" borderLeftColor="brand.500">
                <Text fontSize="lg" fontStyle="italic" color="gray.700" lineHeight="tall">
                  {lesson.summary}
                </Text>
              </Box>
            )}
            
            {/* Enhanced Progress bar */}
            <Box>
              <Flex justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="medium">
                  Progress: {Math.round(calculateProgress())}%
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Section {currentSectionIndex + 1} of {lesson.content.length}
                </Text>
              </Flex>
              <Progress 
                value={calculateProgress()} 
                size="lg" 
                colorScheme="brand" 
                hasStripe 
                isAnimated
                borderRadius="full"
                bg="gray.100"
              />
            </Box>
          </VStack>
        </CardHeader>
      </Card>
      
      {/* Navigation controls - top */}
      <Flex justify="space-between" mb={6} align="center">
        <Button 
          leftIcon={<ChevronLeftIcon />} 
          onClick={() => navigateToSection(currentSectionIndex - 1)}
          isDisabled={isFirstSection}
          variant="outline"
          size="lg"
        >
          Previous
        </Button>
        
        <ProgressTracker 
          totalSections={lesson.content.length} 
          currentSection={currentSectionIndex + 1} 
          onSectionClick={(index) => navigateToSection(index - 1)} 
        />
        
        <Button 
          rightIcon={<ChevronRightIcon />} 
          onClick={() => navigateToSection(currentSectionIndex + 1)}
          isDisabled={isLastSection}
          colorScheme="brand"
          size="lg"
        >
          Next
        </Button>
      </Flex>
      
      {/* Current section content - Enhanced */}
      <Card bg={cardBg} mb={8} boxShadow="lg" borderRadius="xl">
        <CardBody p={8}>
          <LessonSection 
            title={currentSection.title} 
            content={currentSection.content}
            type={currentSection.type}
            mediaUrl={currentSection.media_url}
          />
        </CardBody>
      </Card>
      
      {/* Exercises - Enhanced */}
      {isLastSection && lesson.exercises.length > 0 && (
        <Card bg={cardBg} mb={8} boxShadow="lg" borderRadius="xl">
          <CardHeader>
            <Heading as="h2" size="xl" color="brand.600" display="flex" alignItems="center">
              <Icon as={FiFileText} mr={3} />
              Practice Exercises
            </Heading>
            <Text color="gray.600" mt={2}>
              Test your understanding with these exercises
            </Text>
          </CardHeader>
          <CardBody pt={0}>
            <VStack spacing={8} align="stretch">
              {lesson.exercises.map((exercise, index) => (
                <ExerciseComponent
                  key={index}
                  exercise={exercise}
                  index={index}
                  selectedAnswer={exerciseAnswers[index]}
                  onAnswerSelect={(answer) => handleAnswerSelect(index, answer)}
                />
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}
      
      {/* Resources - Enhanced */}
      {lesson.resources.length > 0 && (
        <Card bg={cardBg} mb={8} boxShadow="lg" borderRadius="xl">
          <CardHeader>
            <Heading as="h2" size="xl" color="brand.600" display="flex" alignItems="center">
              <Icon as={FiExternalLink} mr={3} />
              Additional Resources
            </Heading>
            <Text color="gray.600" mt={2}>
              Explore these resources to deepen your understanding
            </Text>
          </CardHeader>
          <CardBody pt={0}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {lesson.resources.map((resource, index) => (
                <Box 
                  key={index} 
                  p={6} 
                  borderWidth={2} 
                  borderRadius="xl" 
                  borderColor="gray.200"
                  bg={contentBg}
                  transition="all 0.2s"
                  _hover={{ 
                    borderColor: 'brand.300',
                    transform: 'translateY(-2px)',
                    boxShadow: 'md'
                  }}
                >
                  <VStack align="stretch" spacing={4}>
                    <Heading as="h3" size="md" color="brand.600">
                      {resource.title}
                    </Heading>
                    {resource.description && (
                      <Text fontSize="sm" color="gray.600" lineHeight="tall">
                        {resource.description}
                      </Text>
                    )}
                    <Link 
                      href={resource.url} 
                      isExternal
                      color="brand.500"
                      fontWeight="semibold"
                      display="flex"
                      alignItems="center"
                      _hover={{ color: 'brand.600' }}
                    >
                      <Icon as={FiExternalLink} mr={2} />
                      Open Resource
                    </Link>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>
      )}
      
      {/* Navigation controls - bottom */}
      <Flex justify="space-between" mt={8}>
        <Button 
          leftIcon={<ChevronLeftIcon />} 
          onClick={() => navigateToSection(currentSectionIndex - 1)}
          isDisabled={isFirstSection}
          variant="outline"
          size="lg"
        >
          Previous
        </Button>
        
        <HStack spacing={4}>
          <Button onClick={() => saveProgress()} colorScheme="gray" size="lg">
            Save Progress
          </Button>
          {isLastSection && (
            <Button onClick={completeLesson} colorScheme="green" size="lg">
              Complete Lesson
            </Button>
          )}
        </HStack>
        
        <Button 
          rightIcon={<ChevronRightIcon />} 
          onClick={() => navigateToSection(currentSectionIndex + 1)}
          isDisabled={isLastSection}
          colorScheme="brand"
          size="lg"
        >
          Next
        </Button>
      </Flex>
    </Container>
  );
};

export default Lesson;