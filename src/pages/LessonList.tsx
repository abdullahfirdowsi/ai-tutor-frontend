import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
  useToast,
  useColorModeValue,
  HStack,
  InputGroup,
  InputLeftElement,
  Icon,
  Card,
  CardBody,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { FiPlus, FiSearch, FiBook } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import EmptyState from '../components/common/EmptyState';

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

const LessonList: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Move all hooks to the top
  const cardBg = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // State
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
  
  // Fetch lessons function
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
    } catch (err: any) {
      console.error('Error fetching lessons:', err);
      setError('Failed to load lessons. Please check your connection and try again.');
      setLessons([]);
    } finally {
      setIsLoading(false);
    }
  }, [subjectFilter, difficultyFilter]);
  
  // Fetch lessons
  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);
  
  // Generate a new lesson
  const generateLesson = async (data: LessonGenerateRequest) => {
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
        description: err.response?.data?.detail || 'Please try again later.',
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
  
  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" mb={8} borderRadius="lg">
          <AlertIcon />
          <AlertTitle mr={2}>Error Loading Lessons</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchLessons} colorScheme="brand">
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <VStack align="start" spacing={2}>
          <Heading as="h1" size="xl">
            Lessons
          </Heading>
          <Text color={headingColor}>
            Discover and create AI-powered learning experiences
          </Text>
        </VStack>
        <Button 
          colorScheme="brand" 
          leftIcon={<FiPlus />} 
          onClick={onOpen}
          size="lg"
        >
          Generate Lesson
        </Button>
      </Flex>
      
      {/* Filters */}
      <Card bg={cardBg} mb={8} boxShadow="sm">
        <CardBody>
          <VStack spacing={6}>
            <HStack w="full" align="end" spacing={4}>
              <FormControl flex={2}>
                <FormLabel fontSize="sm" fontWeight="medium">Search Lessons</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search by title, topic, or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="lg"
                  />
                </InputGroup>
              </FormControl>
              
              <FormControl flex={1}>
                <FormLabel fontSize="sm" fontWeight="medium">Subject</FormLabel>
                <Select
                  placeholder="All Subjects"
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  size="lg"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl flex={1}>
                <FormLabel fontSize="sm" fontWeight="medium">Difficulty</FormLabel>
                <Select
                  placeholder="All Difficulties"
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  size="lg"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              </FormControl>
            </HStack>
            
            {/* Filter summary */}
            {(searchTerm || subjectFilter || difficultyFilter) && (
              <HStack w="full" justify="space-between" pt={4} borderTop="1px solid" borderColor={borderColor}>
                <Text fontSize="sm" color={headingColor}>
                  {filteredLessons.length} lesson{filteredLessons.length !== 1 ? 's' : ''} found
                </Text>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm('');
                    setSubjectFilter('');
                    setDifficultyFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>
      
      {/* Lessons grid */}
      {isLoading ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {Array(6).fill(0).map((_, index) => (
            <Card key={index} bg={cardBg}>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Skeleton height="24px" width="80%" />
                  <HStack>
                    <Skeleton height="20px" width="60px" />
                    <Skeleton height="20px" width="80px" />
                  </HStack>
                  <Skeleton height="16px" width="100%" />
                  <Skeleton height="16px" width="70%" />
                  <HStack justify="space-between">
                    <Skeleton height="16px" width="50px" />
                    <Skeleton height="16px" width="80px" />
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : filteredLessons.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredLessons.map(lesson => (
            <LessonCard 
              key={lesson.id} 
              lesson={lesson} 
              onClick={() => navigate(`/lessons/${lesson.id}`)} 
            />
          ))}
        </SimpleGrid>
      ) : (
        <EmptyState
          icon={FiBook}
          title="No lessons found"
          description={
            lessons.length === 0 
              ? "No lessons available yet. Create your first lesson to get started."
              : "Try adjusting your search criteria or create a new lesson."
          }
          actionLabel="Generate Lesson"
          onAction={onOpen}
        />
      )}
      
      {/* Generate Lesson Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Generate New Lesson</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="generate-lesson-form" onSubmit={handleSubmit(generateLesson)}>
              <VStack spacing={6} align="stretch">
                <FormControl isInvalid={!!errors.subject}>
                  <FormLabel>Subject</FormLabel>
                  <Input
                    placeholder="e.g., Mathematics, Physics, Computer Science"
                    size="lg"
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
                    size="lg"
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
                    size="lg"
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
                    size="lg"
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
                    size="lg"
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