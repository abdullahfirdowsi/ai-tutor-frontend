import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
  Button,
  Alert,
  AlertIcon,
  Skeleton,
  useToast,
} from '@chakra-ui/react';
import { FiMessageSquare, FiClock, FiBook } from 'react-icons/fi';
import api from '../services/api';

// Import components
import QuestionInput from '../components/qa/QuestionInput';
import AnswerDisplay from '../components/qa/AnswerDisplay';
import QAHistoryItem from '../components/qa/QAHistoryItem';

// Types
interface Reference {
  title: string;
  source: string;
  url?: string;
}

interface QAItem {
  id: string;
  question: string;
  answer: string;
  created_at: string;
  lesson_id?: string;
  references: Reference[];
}

interface QAHistoryResponse {
  items: QAItem[];
  total: number;
  skip: number;
  limit: number;
}

// Mock data for when API is not available
const mockQAHistory: QAItem[] = [
  {
    id: 'mock-qa-1',
    question: 'What is machine learning?',
    answer: 'Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every task.',
    created_at: new Date().toISOString(),
    references: [
      {
        title: 'Introduction to Machine Learning',
        source: 'AI Tutor',
        url: '#'
      }
    ]
  },
  {
    id: 'mock-qa-2',
    question: 'How do neural networks work?',
    answer: 'Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes (neurons) that process information using mathematical operations.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    references: []
  }
];

const QAInterface: React.FC = () => {
  const location = useLocation();
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationBg = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // State
  const [qaItems, setQaItems] = useState<QAItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [qaHistory, setQaHistory] = useState<QAItem[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState<boolean>(false);
  
  // Extract lesson ID from query params if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const lessonId = params.get('lessonId');
    if (lessonId) {
      setSelectedLessonId(lessonId);
    }
  }, [location]);
  
  // Fetch QA history
  useEffect(() => {
    fetchQAHistory();
  }, []);
  
  // Scroll to bottom of conversation when new items are added
  useEffect(() => {
    scrollToBottom();
  }, [qaItems]);
  
  const fetchQAHistory = async () => {
    setIsLoadingHistory(true);
    setError(null);
    
    try {
      const response = await api.get<QAHistoryResponse>('/qa/history');
      setQaHistory(response.data.items);
      setIsUsingMockData(false);
    } catch (err: any) {
      console.error('Error fetching QA history:', err);
      
      // Use mock data when API is not available
      console.warn('API not available, using mock QA data');
      setQaHistory(mockQAHistory);
      setIsUsingMockData(true);
      
      toast({
        title: 'Using Demo Data',
        description: 'Backend API is not available. Showing demo Q&A history.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleQuestionSubmit = async (question: string, context?: string) => {
    if (isUsingMockData) {
      // Simulate AI response in demo mode
      const mockResponse: QAItem = {
        id: `mock-${Date.now()}`,
        question,
        answer: 'This is a demo response. The AI Tutor backend is not available, so this is a simulated answer. In the full version, you would receive detailed, contextual responses to your questions.',
        created_at: new Date().toISOString(),
        lesson_id: selectedLessonId || undefined,
        references: []
      };
      
      setQaItems(prev => [...prev, mockResponse]);
      setQaHistory(prev => [mockResponse, ...prev]);
      
      toast({
        title: 'Demo Mode',
        description: 'This is a simulated response. Backend API is required for real AI answers.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/qa/ask', {
        question,
        context,
        lesson_id: selectedLessonId
      });
      
      // Add new QA item to the conversation
      setQaItems(prev => [...prev, response.data]);
      
      // Also add to history
      setQaHistory(prev => [response.data, ...prev]);
    } catch (err: any) {
      console.error('Error submitting question:', err);
      setError('Failed to process your question. Backend API is not available.');
      
      toast({
        title: 'Error',
        description: 'Failed to process your question. Backend API is not available.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadQAItem = (item: QAItem) => {
    // Check if already in conversation
    if (!qaItems.some(qaItem => qaItem.id === item.id)) {
      setQaItems(prev => [...prev, item]);
    }
  };
  
  const startNewConversation = () => {
    setQaItems([]);
  };
  
  return (
    <Container maxW="container.xl" py={6}>
      <Heading as="h1" size="xl" mb={6}>
        AI Tutor Q&A {isUsingMockData && <Text as="span" fontSize="sm" color="orange.500">(Demo Mode)</Text>}
      </Heading>
      
      {/* Demo mode warning */}
      {isUsingMockData && (
        <Alert status="warning" mb={6} borderRadius="md">
          <AlertIcon />
          Backend API is not available. You can try the interface, but responses will be simulated.
        </Alert>
      )}
      
      <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
        {/* Main conversation area */}
        <Box flex={3}>
          <Flex 
            direction="column" 
            bg={conversationBg} 
            borderRadius="md" 
            boxShadow="sm" 
            p={4} 
            height="70vh"
          >
            {/* Conversation header */}
            <Flex justify="space-between" align="center" mb={4}>
              <HStack>
                <FiMessageSquare />
                <Text fontWeight="bold">
                  {selectedLessonId ? 'Lesson Q&A' : 'General Q&A'}
                </Text>
                {selectedLessonId && (
                  <Badge colorScheme="blue">Lesson Context</Badge>
                )}
                {isUsingMockData && (
                  <Badge colorScheme="orange">Demo Mode</Badge>
                )}
              </HStack>
              
              <Button size="sm" onClick={startNewConversation} variant="outline">
                New Conversation
              </Button>
            </Flex>
            
            {/* Messages area */}
            <VStack 
              spacing={4} 
              align="stretch" 
              overflowY="auto" 
              flex={1}
              px={2}
              pb={4}
            >
              {qaItems.length === 0 ? (
                <Flex 
                  height="100%" 
                  direction="column" 
                  justify="center" 
                  align="center" 
                  color="gray.500"
                >
                  <FiMessageSquare size={40} />
                  <Text mt={2}>Ask a question to start a conversation</Text>
                  {isUsingMockData && (
                    <Text fontSize="sm" mt={1}>Demo mode - responses will be simulated</Text>
                  )}
                </Flex>
              ) : (
                qaItems.map((item, index) => (
                  <AnswerDisplay 
                    key={item.id || index} 
                    question={item.question}
                    answer={item.answer}
                    references={item.references}
                    timestamp={item.created_at}
                  />
                ))
              )}
              
              {/* Error message */}
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              
              {/* Loading indicator */}
              {isLoading && (
                <Box p={4} borderRadius="md" bg={cardBg}>
                  <Skeleton height="20px" width="80%" mb={2} />
                  <Skeleton height="20px" width="60%" mb={2} />
                  <Skeleton height="20px" width="70%" />
                </Box>
              )}
              
              <div ref={messagesEndRef} />
            </VStack>
            
            {/* Question input */}
            <Box pt={4} borderTop="1px" borderColor="gray.200">
              <QuestionInput 
                onSubmit={handleQuestionSubmit} 
                isLoading={isLoading} 
                hasLessonContext={!!selectedLessonId}
              />
            </Box>
          </Flex>
        </Box>
        
        {/* History sidebar */}
        <Box flex={1} minWidth={{ lg: '300px' }}>
          <Box 
            bg={cardBg} 
            borderRadius="md" 
            boxShadow="sm" 
            p={4} 
            height="70vh" 
            overflowY="auto"
          >
            <Heading as="h2" size="md" mb={4}>Question History</Heading>
            
            {isLoadingHistory ? (
              <VStack spacing={4} align="stretch">
                <Skeleton height="100px" />
                <Skeleton height="100px" />
                <Skeleton height="100px" />
              </VStack>
            ) : qaHistory.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {qaHistory.map(item => (
                  <QAHistoryItem 
                    key={item.id} 
                    item={item} 
                    onClick={() => loadQAItem(item)} 
                  />
                ))}
              </VStack>
            ) : (
              <Text color="gray.500" textAlign="center" py={10}>
                No questions yet. Start asking to build your history.
              </Text>
            )}
          </Box>
        </Box>
      </Flex>
    </Container>
  );
};

export default QAInterface;