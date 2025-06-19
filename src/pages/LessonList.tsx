import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Input,
  Select,
  VStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import api from '../services/api';

// Import components
import LessonCard from '../components/lesson/LessonCard';

// Types
interface LessonItem {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: string;
  duration_minutes: number;
  created_at: string;
  tags: string[];
  summary?: string;
}

interface LessonListResponse {
  lessons: LessonItem[];
  total: number;
  skip: number;
  limit: number;
}

interface LessonGenerateRequest {
  subject: string;
  topic: string;
  difficulty: string;
  duration_minutes: number;
  additional_instructions?: string;
}

// Mock data for when API is not available
const mockLessons: LessonItem[] = [
  {
    id: 'mock-1',
    title: 'Introduction to Machine Learning',
    subject: 'Computer Science',
    topic: 'Machine Learning',
    difficulty: 'beginner',
    duration_minutes: 45,
    created_at: new Date().toISOString(),
    tags: ['AI', 'ML', 'Python'],
    summary: 'Learn the fundamentals of machine learning and its applications.'
  },
  {
    id: 'mock-2',
    title: 'Linear Algebra Basics',
    subject: 'Mathematics',
    topic: 'Linear Algebra',
    difficulty: 'intermediate',
    duration_minutes: 60,
    created_at: new Date().toISOString(),
    tags: ['Math', 'Vectors', 'Matrices'],
    summary: 'Understanding vectors, matrices, and linear transformations.'
  },
  {
    id: 'mock-3',
    title: 'React Fundamentals',
    subject: 'Web Development',
    topic: 'React',
    difficulty: 'beginner',
    duration_minutes: 90,
    created_at: new Date().toISOString(),
    tags: ['React', 'JavaScript', 'Frontend'],
    summary: 'Build modern web applications with React components and hooks.'
  }
];

const LessonList: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // State
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUsingMockData, setIsUsingMockData] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form handling for lesson generation
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<LessonGenerateRequest>();
  
  // Fetch lessons
  useEffect(() => {
    fetchLessons();
  }, [subjectFilter, difficultyFilter]);
  
  const fetchLessons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query params
      let queryParams = '?limit=50';
      if (subjectFilter) queryParams += `&subject=${encodeURIComponent(subjectFilter)}`;
      if (difficultyFilter) queryParams += `&difficulty=${encodeURIComponent(difficultyFilter)}`;
      
      const response = await api.get<LessonListResponse>(`/lessons${queryParams}`);
      setLessons(response.data.lessons);
      setIsUsingMockData(false);
    } catch (err: any) {
      console.error('Error fetching lessons:', err);
      
      // Use mock data when API is not available
      console.warn('API not available, using mock data');
      setLessons(mockLessons);
      setIsUsingMockData(true);
      
      toast({
        title: 'Using Demo Data',
        description: 'Backend API is not available. Showing demo lessons.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [subjectFilter, difficultyFilter, toast]);
  
  // Generate a new lesson
  const generateLesson = async (data: LessonGenerateRequest) => {
    if (isUsingMockData) {
      toast({
        title: 'Demo Mode',
        description: 'Lesson generation is not available in demo mode. Backend API is required.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const response = await api.post('/lessons/generate', data);
      
      toast({
        title: 'Lesson generated!',
        description: 'Your new lesson is ready.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Navigate to the new lesson
      navigate(`/lessons/${response.data.id}`);
      onClose();
      reset();
    } catch (err: any) {
      console.error('Error generating lesson:', err);
      toast({
        title: 'Failed to generate lesson',
        description: 'Backend API is not available. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Filter lessons by search term
  const filteredLessons = lessons.filter(lesson => 
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lesson.summary && lesson.summary.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Extract unique subjects for filter dropdown
  const subjects = Array.from(new Set(lessons.map(lesson => lesson.subject)));
  
  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(6).fill(0).map((_, index) => (
      <Box key={index} p={5} shadow="md" borderWidth="1px" borderRadius="md">
        <Skeleton height="24px" width="70%" mb={4} />
        <Skeleton height="16px" width="40%" mb={2} />
        <Skeleton height="16px" width="60%" mb={4} />
        <Skeleton height="12px" width="30%" mb={2} />
        <Skeleton height="12px" width="20%" />
      </Box>
    ));
  };
  
  return (
    <Container maxW="container.xl" py={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="xl">
          Lessons {isUsingMockData && <Text as="span" fontSize="sm" color="orange.500">(Demo Mode)</Text>}
        </Heading>
        <Button 
          colorScheme="brand" 
          leftIcon={<FiPlus />} 
          onClick={onOpen}
          isDisabled={isUsingMockData}
        >
          Generate Lesson
        </Button>
      </Flex>
      
      {/* Demo mode warning */}
      {isUsingMockData && (
        <Alert status="warning" mb={6} borderRadius="md">
          <AlertIcon />
          <AlertTitle mr={2}>Demo Mode Active</AlertTitle>
          <AlertDescription>
            Backend API is not available. Showing demo lessons. Some features may be limited.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Filters */}
      <Flex 
        mb={6} 
        direction={{ base: 'column', md: 'row' }}
        gap={4}
        bg={cardBg}
        p={4}
        borderRadius="md"
        boxShadow="sm"
      >
        <FormControl flex={2}>
          <FormLabel htmlFor="search">Search</FormLabel>
          <Flex align="center" position="relative">
            <Input
              id="search"
              placeholder="Search by title, topic, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              paddingLeft="40px"
            />
            <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)">
              <FiSearch />
            </Box>
          </Flex>
        </FormControl>
        
        <FormControl flex={1}>
          <FormLabel htmlFor="subject">Subject</FormLabel>
          <Select
            id="subject"
            placeholder="All Subjects"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </Select>
        </FormControl>
        
        <FormControl flex={1}>
          <FormLabel htmlFor="difficulty">Difficulty</FormLabel>
          <Select
            id="difficulty"
            placeholder="All Difficulties"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </Select>
        </FormControl>
      </Flex>
      
      {/* Lessons grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {isLoading ? (
          renderSkeletons()
        ) : filteredLessons.length > 0 ? (
          filteredLessons.map(lesson => (
            <LessonCard 
              key={lesson.id} 
              lesson={lesson} 
              onClick={() => {
                if (isUsingMockData) {
                  toast({
                    title: 'Demo Mode',
                    description: 'Lesson viewing is not available in demo mode.',
                    status: 'warning',
                    duration: 3000,
                    isClosable: true,
                  });
                } else {
                  navigate(`/lessons/${lesson.id}`);
                }
              }} 
            />
          ))
        ) : (
          <Box gridColumn="span 3" textAlign="center" py={10}>
            <Text fontSize="lg">No lessons found. Try adjusting your filters or generate a new lesson.</Text>
            {!isUsingMockData && (
              <Button mt={4} colorScheme="brand" onClick={onOpen}>Generate Lesson</Button>
            )}
          </Box>
        )}
      </SimpleGrid>
      
      {/* Generate Lesson Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Generate New Lesson</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="generate-lesson-form" onSubmit={handleSubmit(generateLesson)}>
              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={!!errors.subject}>
                  <FormLabel>Subject</FormLabel>
                  <Input
                    placeholder="e.g., Mathematics, Physics, Computer Science"
                    {...register('subject', {
                      required: 'Subject is required',
                      minLength: { value: 2, message: 'Subject must be at least 2 characters' }
                    })}
                  />
                  <FormErrorMessage>{errors.subject?.message}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!errors.topic}>
                  <FormLabel>Topic</FormLabel>
                  <Input
                    placeholder="e.g., Linear Algebra, Quantum Mechanics, Web Development"
                    {...register('topic', {
                      required: 'Topic is required',
                      minLength: { value: 2, message: 'Topic must be at least 2 characters' }
                    })}
                  />
                  <FormErrorMessage>{errors.topic?.message}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!errors.difficulty}>
                  <FormLabel>Difficulty</FormLabel>
                  <Select
                    placeholder="Select difficulty"
                    {...register('difficulty', {
                      required: 'Difficulty is required'
                    })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </Select>
                  <FormErrorMessage>{errors.difficulty?.message}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!errors.duration_minutes}>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <Input
                    type="number"
                    placeholder="e.g., 30"
                    {...register('duration_minutes', {
                      required: 'Duration is required',
                      min: { value: 5, message: 'Duration must be at least 5 minutes' },
                      max: { value: 120, message: 'Duration must be at most 120 minutes' }
                    })}
                  />
                  <FormErrorMessage>{errors.duration_minutes?.message}</FormErrorMessage>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Additional Instructions (Optional)</FormLabel>
                  <Input
                    placeholder="Any specific requirements or focus areas"
                    {...register('additional_instructions')}
                  />
                </FormControl>
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              form="generate-lesson-form"
              type="submit"
              colorScheme="brand"
              isLoading={isGenerating}
              loadingText="Generating..."
              isDisabled={isUsingMockData}
            >
              Generate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default LessonList;