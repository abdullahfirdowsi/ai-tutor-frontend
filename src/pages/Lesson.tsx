import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
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
  
  // Create refs to track progress and debounced function
  const debouncedSaveProgressRef = useRef<ReturnType<typeof debounce> | null>(null);
  const lastSaveTimeRef = useRef<number>(Date.now());
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveQueueRef = useRef<boolean>(false);
  const pendingSaveRef = useRef<Promise<void> | null>(null);
  const shouldCancelSavesRef = useRef<boolean>(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<LessonProgress | null>(null);
  const lastProgressStateRef = useRef<{
    sectionIndex: number;
    timeSpent: number;
    completed: boolean;
    score: number | null;
    lastSaved: number;
    exerciseAnswers: Record<number, string>;
    settleTime: number;
  }>({
    sectionIndex: 0,
    timeSpent: 0,
    completed: false,
    score: null,
    lastSaved: Date.now(),
    exerciseAnswers: {},
    settleTime: Date.now()
  });
  const isSavingRef = useRef<boolean>(false);
  const saveAttemptsRef = useRef<number>(0);
  
  // Helper function to create progress data
  const createProgressData = useCallback((): LessonProgress => {
    const now = Date.now();
    return {
      progress: (lesson?.content?.length ?? 0) > 0 
        ? (currentSectionIndex + 1) / (lesson?.content?.length ?? 1) 
        : 0,
      time_spent: lessonProgress.time_spent + Math.floor((now - startTime) / 1000),
      completed: lessonProgress.completed,
      last_position: currentSectionIndex.toString(),
      score: exerciseScore === null ? undefined : exerciseScore,
    };
  }, [lesson, currentSectionIndex, lessonProgress.time_spent, startTime, 
      lessonProgress.completed, exerciseScore]);

  // The actual progress saving implementation
  const saveProgressImpl = useCallback(async (progressData: LessonProgress, isAutoSave: boolean = false) => {
    if (!lessonId || !lesson) return;
    
    // If cancellation is requested, skip this save operation
    if (shouldCancelSavesRef.current) {
      console.log('Save operations are being cancelled, skipping...');
      return;
    }
    
    // Handle save queue - if another save is requested while one is in progress
    if (isSavingRef.current) {
      console.log('Save operation already in progress, queueing...');
      saveQueueRef.current = true;
      
      // Wait for the current save to complete before proceeding
      if (pendingSaveRef.current) {
        try {
          await pendingSaveRef.current;
        } catch (err) {
          console.error('Error waiting for pending save:', err);
        }
      }
      
      // If cancellation was requested while waiting, exit
      if (shouldCancelSavesRef.current) return;
    }
    
    // Calculate current values for checking changes
    const now = Date.now();
    const timeSpent = progressData.time_spent;
    const currentScore = exerciseScore === null ? null : exerciseScore;
    const timeSinceLastSave = now - lastProgressStateRef.current.lastSaved;
    const timeSinceSettled = now - lastProgressStateRef.current.settleTime;
    
    // Check if exercise answers have changed
    const exerciseAnswersChanged = Object.keys(exerciseAnswers).length !== Object.keys(lastProgressStateRef.current.exerciseAnswers).length ||
      Object.keys(exerciseAnswers).some(key => exerciseAnswers[parseInt(key)] !== lastProgressStateRef.current.exerciseAnswers[parseInt(key)]);
    
    // For auto-saves, require more significant changes
    const significantTimeChange = Math.abs(timeSpent - lastProgressStateRef.current.timeSpent) > (isAutoSave ? 30 : 15);
    
    const hasChanged = 
      currentSectionIndex !== lastProgressStateRef.current.sectionIndex ||
      significantTimeChange ||
      progressData.completed !== lastProgressStateRef.current.completed ||
      currentScore !== lastProgressStateRef.current.score ||
      exerciseAnswersChanged;
    
    // Skip auto-save if nothing significant changed or if it's too soon since last save
    // For auto-saves, also check if user has been on current section long enough (settled)
    if (isAutoSave && 
        (!hasChanged || timeSinceLastSave < 30000 || timeSinceSettled < 5000)) {
      console.log('Skipping auto-save: No changes, too soon, or user not settled');
      return;
    }
    
    // Skip if the data is identical to the last save
    if (lastSavedDataRef.current && 
        lastSavedDataRef.current.progress === progressData.progress &&
        lastSavedDataRef.current.time_spent === progressData.time_spent &&
        lastSavedDataRef.current.completed === progressData.completed &&
        lastSavedDataRef.current.last_position === progressData.last_position &&
        lastSavedDataRef.current.score === progressData.score) {
      console.log('Skipping save: Data identical to last saved state');
      return;
    }
    
    // Reset the queue flag
    saveQueueRef.current = false;
    
    try {
      isSavingRef.current = true;
      
      // Track save attempts for exponential backoff if needed
      saveAttemptsRef.current++;
      
      // Store the progress data to avoid redundant saves later
      lastSavedDataRef.current = progressData;
      
      // Create a promise for this save operation and store it
      const savePromise = (async () => {
        // Add a small random delay to prevent API race conditions
        // For auto-saves, use a longer randomized delay with exponential backoff
        if (isAutoSave) {
          const backoffFactor = Math.min(saveAttemptsRef.current, 5); // Cap at 5 for reasonable delays
          const maxDelay = 200 * Math.pow(2, backoffFactor - 1);
          await new Promise(resolve => setTimeout(resolve, Math.random() * maxDelay));
        }
        
        // If cancellation was requested during the delay, exit
        if (shouldCancelSavesRef.current) return;
        
        await api.post(`/lessons/${lessonId}/progress`, lastSavedDataRef.current!);
      })();
      
      pendingSaveRef.current = savePromise;
      
      // Wait for the API call to complete
      await savePromise;
      
      setStartTime(Date.now());
      setLessonProgress(progressData);
      
      // Update last progress state reference including the save timestamp
      lastProgressStateRef.current = {
        sectionIndex: currentSectionIndex,
        timeSpent: progressData.time_spent,
        completed: progressData.completed,
        score: currentScore,
        lastSaved: Date.now(),
        exerciseAnswers: { ...exerciseAnswers }, // Store a copy of current exercise answers
        settleTime: lastProgressStateRef.current.settleTime // Preserve settle time
      };
      
      // Reset save attempts counter after successful save
      saveAttemptsRef.current = 0;
      
      // Only show toast for manual saves
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
    } finally {
      // Clear the pending save reference
      pendingSaveRef.current = null;
      isSavingRef.current = false;
      
      // If there's a save queued up, process it now, but only if it's a manual save
      // or if it's been a while since the last auto-save
      if (saveQueueRef.current && !shouldCancelSavesRef.current) {
        const now = Date.now();
        const processQueue = !isAutoSave || 
                             (now - lastProgressStateRef.current.lastSaved > 60000);
        
        if (processQueue) {
          console.log('Processing queued save request');
          // Use a longer delay for auto-saves to prevent rapid successive API calls
          const delay = isAutoSave ? 2000 : 500;
          setTimeout(() => {
            const newProgressData = createProgressData();
            saveProgressImpl(newProgressData, isAutoSave);
          }, delay);
        } else {
          console.log('Clearing queued auto-save since a save just completed');
          saveQueueRef.current = false;
        }
      }
    }
  }, [lessonId, lesson, currentSectionIndex, exerciseAnswers, exerciseScore, toast, setStartTime, setLessonProgress, createProgressData]);
  
  // Initialize the debounced save function once
  // Initialize the debounced save function once
  useEffect(() => {
    // Reset cancellation flag when component mounts
    shouldCancelSavesRef.current = false;
    
    // Create a debounced version of the save function with better settings
    debouncedSaveProgressRef.current = debounce((isAutoSave: boolean = false) => {
      const progressData = createProgressData();
      saveProgressImpl(progressData, isAutoSave);
    }, 2000, { 
      leading: false,
      trailing: true,
      maxWait: 5000
    });
    
    // Set initial progress state
    lastProgressStateRef.current = {
      sectionIndex: currentSectionIndex,
      timeSpent: lessonProgress.time_spent,
      completed: lessonProgress.completed,
      score: exerciseScore,
      lastSaved: Date.now(),
      exerciseAnswers: { ...exerciseAnswers },
      settleTime: Date.now()
    };
    
    // Initialize lastSavedDataRef
    lastSavedDataRef.current = {
      progress: lessonProgress.progress,
      time_spent: lessonProgress.time_spent,
      completed: lessonProgress.completed,
      last_position: currentSectionIndex.toString(),
      score: exerciseScore === null ? undefined : exerciseScore
    };
    
    return () => {
      // Signal that all save operations should be cancelled
      shouldCancelSavesRef.current = true;
      
      // Cancel any debounced operations
      if (debouncedSaveProgressRef.current) {
        debouncedSaveProgressRef.current.cancel();
      }
    };
  }, [currentSectionIndex, exerciseAnswers, exerciseScore, lessonProgress.completed, 
      lessonProgress.progress, lessonProgress.time_spent, createProgressData, saveProgressImpl]);
  
  // Save progress function - uses the stable debounced reference
  // Enhanced save progress function with better coordination
  const saveProgress = useCallback((isAutoSave: boolean = false) => {
    // Skip if cancellation is in progress
    if (shouldCancelSavesRef.current) return;
    
    // Implement stricter rate limiting for auto-saves
    if (isAutoSave) {
      const now = Date.now();
      
      // More aggressive throttling for auto-saves (60 seconds)
      if (now - lastSaveTimeRef.current < 60000) {
        console.log('Rate limiting auto-save, too soon since last save');
        return; // Skip if less than 60 seconds have passed for auto-saves
      }
      
      // Skip auto-save if a save is in progress or queued
      if (isSavingRef.current || saveQueueRef.current) {
        console.log('Skipping auto-save as a save operation is already in progress or queued');
        return;
      }
      
      // Update last save time reference
      lastSaveTimeRef.current = now;
    } else {
      // For manual saves, still implement a minimal rate limit (2 seconds)
      // to prevent accidental double-clicks
      const now = Date.now();
      if (now - lastSaveTimeRef.current < 2000) {
        console.log('Rate limiting manual save, too soon since last save');
        return;
      }
      lastSaveTimeRef.current = now;
    }
    
    // Use the debounced function if available
    if (debouncedSaveProgressRef.current) {
      debouncedSaveProgressRef.current(isAutoSave);
    }
  }, []);
  
  // Fetch lesson data and handle autosave
  // We need to disable the exhaustive-deps rule here to prevent unnecessary 
  // re-fetching and cleanup operations
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    
    // Setup auto-save timer only if we have a valid lesson
    // Using recursive setTimeout instead of setInterval to prevent overlapping calls
    const setupAutoSave = () => {
      // Clear any existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
      
      // Function to schedule the next auto-save
      const scheduleNextAutoSave = () => {
        // Skip if component is unmounting
        if (shouldCancelSavesRef.current) return;
        
        autoSaveTimerRef.current = setTimeout(() => {
          // Update time spent
          setLessonProgress(prev => ({
            ...prev,
            time_spent: prev.time_spent + 60,
          }));
          
          // Only trigger save if not already saving and user has been on the section for a while
          const now = Date.now();
          const userSettled = now - lastProgressStateRef.current.settleTime > 10000;
          
          if (!isSavingRef.current && !saveQueueRef.current && userSettled) {
            saveProgress(true);
          } else {
            console.log('Skipping auto-save: save in progress, queued, or user not settled');
          }
          
          // Schedule the next auto-save
          scheduleNextAutoSave();
        }, 60000);
      };
      
      // Start the auto-save cycle
      scheduleNextAutoSave();
    };
    
    if (lesson) {
      setupAutoSave();
    }
    
    return () => {
      // Signal that saves should be cancelled
      shouldCancelSavesRef.current = true;
      
      // Clear auto-save timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
      
      // Cancel any pending save operations
      if (debouncedSaveProgressRef.current) {
        debouncedSaveProgressRef.current.cancel();
      }
      
      // Only attempt a final save if not already saving
       if (!isSavingRef.current) {
         const finalSaveData: LessonProgress = {
           progress: (lesson?.content?.length ?? 0) > 0 
             ? (currentSectionIndex + 1) / (lesson?.content?.length ?? 1) 
             : 0,
          time_spent: lessonProgress.time_spent + Math.floor((Date.now() - startTime) / 1000),
          completed: lessonProgress.completed,
          last_position: currentSectionIndex.toString(),
          score: exerciseScore === null ? undefined : exerciseScore,
        };
        
        // Direct API call without debouncing for the final save
        api.post(`/lessons/${lessonId}/progress`, finalSaveData)
          .catch(err => console.error('Error during final save:', err));
      }
    };
  }, [lessonId, saveProgress, lesson, currentSectionIndex, exerciseScore, 
      lessonProgress.completed, lessonProgress.time_spent, startTime]);
  
  // Mark lesson as complete
  const completeLesson = async () => {
    if (!lessonId || !lesson) return;
    
    // Signal that ongoing saves should be cancelled
    shouldCancelSavesRef.current = true;
    
    // Wait for any in-progress save to complete
    if (isSavingRef.current) {
      console.log('Waiting for ongoing save operation to complete...');
      if (pendingSaveRef.current) {
        try {
          await pendingSaveRef.current;
        } catch (err) {
          console.error('Error waiting for pending save to complete:', err);
        }
      } else {
        // Fallback wait if no pending save reference exists
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Cancel any pending operations
    if (debouncedSaveProgressRef.current) {
      debouncedSaveProgressRef.current.cancel();
    }
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    
    // Reset save state
    saveQueueRef.current = false;
    isSavingRef.current = false;
    pendingSaveRef.current = null;
    
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
  
  // Handle exercise answer selection with debounced progress save
  const handleAnswerSelect = (exerciseIndex: number, answer: string) => {
    // First, check if the answer is actually changing
    if (exerciseAnswers[exerciseIndex] === answer) {
      return; // No change, skip update and save
    }
    
    setExerciseAnswers(prev => ({
      ...prev,
      [exerciseIndex]: answer,
    }));
    
    // Update the lastProgressStateRef to track exercise answer changes
    const now = Date.now();
    const updatedAnswers = { 
      ...lastProgressStateRef.current.exerciseAnswers,
      [exerciseIndex]: answer
    };
    
    // Update progress state ref with new exercise answers
    lastProgressStateRef.current = {
      ...lastProgressStateRef.current,
      exerciseAnswers: updatedAnswers
    };
    
    // Only save after multiple answers or if it's been a while
    const answersCount = Object.keys(updatedAnswers).length;
    const significantChange = answersCount % 3 === 0; // Save every 3 answers
    const timeSinceLastSave = now - lastSaveTimeRef.current;
    
    if (significantChange || timeSinceLastSave > 30000) {
      // Only trigger a save if it's been a while or we have multiple answers
      lastSaveTimeRef.current = now;
      saveProgress(true); // Use auto-save mode to avoid showing toasts
    }
  };
  
  const navigateToSection = (index: number) => {
    if (index >= 0 && index < (lesson?.content.length || 0)) {
      // Check if we're actually changing sections to avoid unnecessary saves
      if (index === currentSectionIndex) return;
      
      // Clear any pending navigation timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
      
      // Update the current section index
      setCurrentSectionIndex(index);
      
      // Reset the "settle time" when navigation occurs
      lastProgressStateRef.current = {
        ...lastProgressStateRef.current,
        settleTime: Date.now()
      };
      
      // Only save if we've moved more than one section or if it's been a while
      const now = Date.now();
      const significantNavigation = Math.abs(index - currentSectionIndex) > 1;
      const enoughTimePassed = now - lastSaveTimeRef.current > 20000;
      
      if (significantNavigation || enoughTimePassed) {
        // Mark the current time to prevent immediate auto-saves
        lastSaveTimeRef.current = now;
        
        // Wait for user to "settle" on this section before saving
        // This prevents saves during rapid navigation through sections
        navigationTimeoutRef.current = setTimeout(() => {
          // Only save if we're still on this section after the delay
          if (currentSectionIndex === index && !isSavingRef.current && !saveQueueRef.current) {
            console.log('User settled on section, saving progress');
            saveProgress(true); // Use auto-save mode to avoid showing toasts during navigation
          }
        }, 3000); // Wait 3 seconds for user to settle
      }
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
          <Button 
            onClick={() => {
              // Force a manual save with user feedback
              lastSaveTimeRef.current = Date.now();
              
              // Update settle time to indicate user action
              lastProgressStateRef.current = {
                ...lastProgressStateRef.current,
                settleTime: Date.now() - 20000 // Set as if user has been settled for a while
              };
              
              // Cancel any navigation timeout to prevent duplicate saves
              if (navigationTimeoutRef.current) {
                clearTimeout(navigationTimeoutRef.current);
                navigationTimeoutRef.current = null;
              }
              
              saveProgress(false);
            }} 
            colorScheme="gray" 
            size="lg"
            isDisabled={isSavingRef.current} // Disable while saving
          >
            {isSavingRef.current ? 'Saving...' : 'Save Progress'}
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