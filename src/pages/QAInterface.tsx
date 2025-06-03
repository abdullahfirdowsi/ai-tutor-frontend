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
    } catch (err: any) {
      console.error('Error fetching QA history:', err);
      setError(err.response?.data?.detail || 'Failed to load question history.');
    } finally {
      setIsLoadingHistory(false);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleQuestionSubmit = async (question: string, context?: string) => {
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
      setError(err.response?.data?.detail || 'Failed to process your question. Please try again.');
      
      toast({
        title: 'Error',
        description: 'Failed to process your question. Please try again.',
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
      <Heading as="h1" size="xl" mb={6}>AI Tutor Q&A</Heading>
      
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

