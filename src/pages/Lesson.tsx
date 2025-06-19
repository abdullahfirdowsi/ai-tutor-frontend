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
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FiClock } from 'react-icons/fi';
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
  
  // Fetch lesson data
  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await api.get(`/lessons/${lessonId}`);
        setLesson(response.data);
        
        // Check if there's existing progress
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
            
            // Set current section based on last position
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
    
    // Set up timer for tracking time spent
    const timer = setInterval(() => {
      setLessonProgress(prev => ({
        ...prev,
        time_spent: prev.time_spent + 5, // Add 5 seconds
      }));
    }, 5000);
    
    // Clean up
    return () => {
      clearInterval(timer);
      saveProgress(true);
    };
  }, [lessonId]);
  
  // Save progress
  const saveProgress = useCallback(async (isAutoSave: boolean = false) => {
    if (!lessonId || !lesson) return;
    
    try {
      const timeSpent = lessonProgress.time_spent + Math.floor((Date.now() - startTime) / 1000);
      
      // Calculate progress percentage based on current section
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
      
      // Reset start time
      setStartTime(Date.now());
      
      // Update local progress state
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
  
  // Mark lesson as complete
  const completeLesson = async () => {
    if (!lessonId || !lesson) return;
    
    try {
      // Calculate final score from exercises if available
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
        progress: 1.0, // 100%
        time_spent: timeSpent,
        completed: true,
        score: finalScore === null ? undefined : finalScore,
        last_position: currentSectionIndex.toString(),
      };
      
      await api.post(`/lessons/${lessonId}/progress`, progressData);
      
      // Update local progress state
      setLessonProgress(progressData);
      
      toast({
        title: 'Lesson completed!',
        description: 'Your progress has been saved.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirect to dashboard after a delay
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
  
  // Handle exercise answer selection
  const handleAnswerSelect = (exerciseIndex: number, answer: string) => {
    setExerciseAnswers(prev => ({
      ...prev,
      [exerciseIndex]: answer,
    }));
  };
  
  // Navigation between sections
  const navigateToSection = (index: number) => {
    if (index >= 0 && index < (lesson?.content.length || 0)) {
      setCurrentSectionIndex(index);
      saveProgress();
    }
  };
  
  // Calculate progress for progress bar
  const calculateProgress = (): number => {
    if (!lesson || lesson.content.length === 0) return 0;
    return ((currentSectionIndex + 1) / lesson.content.length) * 100;
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Container maxW="container.lg" py={8}>
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
  
  // Error state
  if (error || !lesson) {
    return (
      <Container maxW="container.lg" py={8}>
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
  
  // Current section to display
  const currentSection = lesson.content[currentSectionIndex];
  const isLastSection = currentSectionIndex === lesson.content.length - 1;
  const isFirstSection = currentSectionIndex === 0;
  
  return (
    <Container maxW="container.lg" py={6}>
      {/* Breadcrumbs */}
      <Breadcrumb mb={4} fontSize="sm">
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
      
      {/* Lesson header */}
      <Box bg={cardBg} p={6} borderRadius="md" mb={6} boxShadow="sm">
        <Heading as="h1" size="xl" mb={2}>{lesson.title}</Heading>
        <HStack spacing={4} mb={4}>
          <Tag colorScheme="blue">{lesson.subject}</Tag>
          <Tag colorScheme="purple">{lesson.difficulty}</Tag>
          <Flex align="center">
            <FiClock style={{ marginRight: '0.5rem' }} />
            <Text fontSize="sm">{lesson.duration_minutes} minutes</Text>
          </Flex>
        </HStack>
        
        {lesson.summary && (
          <Text fontSize="md" fontStyle="italic" color="gray.600">
            {lesson.summary}
          </Text>
        )}
        
        {/* Progress bar */}
        <Box mt={4}>
          <Text fontSize="sm" mb={1}>Progress: {Math.round(calculateProgress())}%</Text>
          <Progress value={calculateProgress()} size="sm" colorScheme="brand" hasStripe rounded="md" />
        </Box>
      </Box>
      
      {/* Navigation controls - top */}
      <Flex justify="space-between" mb={4}>
        <Button 
          leftIcon={<ChevronLeftIcon />} 
          onClick={() => navigateToSection(currentSectionIndex - 1)}
          isDisabled={isFirstSection}
          variant="outline"
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
        >
          Next
        </Button>
      </Flex>
      
      {/* Current section content */}
      <Box bg={cardBg} p={6} borderRadius="md" mb={6} boxShadow="sm">
        <LessonSection 
          title={currentSection.title} 
          content={currentSection.content}
          type={currentSection.type}
          mediaUrl={currentSection.media_url}
        />
      </Box>
      
      {/* Exercises - shown on the last section */}
      {isLastSection && lesson.exercises.length > 0 && (
        <Box bg={cardBg} p={6} borderRadius="md" mb={6} boxShadow="sm">
          <Heading as="h2" size="lg" mb={4}>Exercises</Heading>
          <VStack spacing={6} align="stretch">
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
        </Box>
      )}
      
      {/* Resources */}
      {lesson.resources.length > 0 && (
        <Box bg={cardBg} p={6} borderRadius="md" mb={6} boxShadow="sm">
          <Heading as="h2" size="lg" mb={4}>Additional Resources</Heading>
          <VStack spacing={3} align="stretch">
            {lesson.resources.map((resource, index) => (
              <Box key={index} p={3} borderWidth={1} borderRadius="md">
                <Heading as="h3" size="sm">{resource.title}</Heading>
                {resource.description && (
                  <Text fontSize="sm" color="gray.600" mt={1}>{resource.description}</Text>
                )}
                <Button 
                  as="a" 
                  href={resource.url} 
                  target="_blank" 
                  size="sm" 
                  colorScheme="blue" 
                  variant="link" 
                  mt={2}
                >
                  Open Resource
                </Button>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
      
      {/* Navigation controls - bottom */}
      <Flex justify="space-between" mt={6}>
        <Button 
          leftIcon={<ChevronLeftIcon />} 
          onClick={() => navigateToSection(currentSectionIndex - 1)}
          isDisabled={isFirstSection}
          variant="outline"
        >
          Previous
        </Button>
        
        <HStack>
          <Button onClick={() => saveProgress()} colorScheme="gray">
            Save Progress
          </Button>
          {isLastSection && (
            <Button onClick={completeLesson} colorScheme="green">
              Complete Lesson
            </Button>
          )}
        </HStack>
        
        <Button 
          rightIcon={<ChevronRightIcon />} 
          onClick={() => navigateToSection(currentSectionIndex + 1)}
          isDisabled={isLastSection}
          colorScheme="brand"
        >
          Next
        </Button>
      </Flex>
    </Container>
  );
};

export default Lesson;

