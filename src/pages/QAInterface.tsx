import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Badge,
  Button,
  Alert,
  AlertIcon,
  Skeleton,
  useToast,
  IconButton,
  Collapse,
  useDisclosure,
  Card,
  CardHeader,
  CardBody,
} from '@chakra-ui/react';
import { FiMessageSquare, FiChevronDown, FiChevronUp, FiHistory } from 'react-icons/fi';
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
  const { isOpen: isHistoryOpen, onToggle: toggleHistory } = useDisclosure();
  
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
  
  // Fetch QA history function
  const fetchQAHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setError(null);
    
    try {
      const response = await api.get<QAHistoryResponse>('/qa/history');
      setQaHistory(response.data.items);
    } catch (err: any) {
      console.error('Error fetching QA history:', err);
      setError('Failed to load Q&A history. Please check your connection and try again.');
      setQaHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);
  
  // Fetch QA history
  useEffect(() => {
    fetchQAHistory();
  }, [fetchQAHistory]);
  
  // Scroll to bottom of conversation when new items are added
  useEffect(() => {
    scrollToBottom();
  }, [qaItems]);
  
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
      setError('Failed to process your question. Please try again.');
      
      toast({
        title: 'Error',
        description: 'Failed to process your question. Please check your connection and try again.',
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
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            AI Tutor Q&A
          </Heading>
          <Text color="gray.600">
            Get instant help from your AI tutor. Ask questions and receive detailed explanations.
          </Text>
        </Box>

        <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
          {/* Main conversation area - Enhanced */}
          <Box flex={3}>
            <Card boxShadow="lg" borderRadius="xl">
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <HStack>
                    <FiMessageSquare />
                    <Text fontWeight="bold" fontSize="lg">
                      {selectedLessonId ? 'Lesson Q&A' : 'General Q&A'}
                    </Text>
                    {selectedLessonId && (
                      <Badge colorScheme="blue" px={3} py={1}>Lesson Context</Badge>
                    )}
                  </HStack>
                  
                  <HStack>
                    <Button 
                      size="sm" 
                      onClick={startNewConversation} 
                      variant="outline"
                      leftIcon={<FiMessageSquare />}
                    >
                      New Chat
                    </Button>
                    
                    {/* Mobile history toggle */}
                    <IconButton
                      aria-label="Toggle history"
                      icon={<FiHistory />}
                      size="sm"
                      variant="outline"
                      onClick={toggleHistory}
                      display={{ base: 'flex', lg: 'none' }}
                    />
                  </HStack>
                </Flex>
              </CardHeader>
              
              <CardBody>
                <Flex 
                  direction="column" 
                  height="60vh"
                >
                  {/* Messages area */}
                  <VStack 
                    spacing={6} 
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
                        textAlign="center"
                      >
                        <FiMessageSquare size={48} />
                        <Text mt={4} fontSize="lg" fontWeight="medium">
                          Start a conversation with your AI tutor
                        </Text>
                        <Text fontSize="sm" mt={2} maxW="md">
                          Ask any question about your lessons, get explanations, or request help with specific topics.
                        </Text>
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
                      <Alert status="error" borderRadius="lg">
                        <AlertIcon />
                        {error}
                      </Alert>
                    )}
                    
                    {/* Loading indicator */}
                    {isLoading && (
                      <Box p={6} borderRadius="lg" bg={cardBg}>
                        <VStack spacing={3}>
                          <Skeleton height="20px" width="80%" />
                          <Skeleton height="20px" width="60%" />
                          <Skeleton height="20px" width="70%" />
                        </VStack>
                      </Box>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </VStack>
                  
                  {/* Question input */}
                  <Box pt={6} borderTop="1px" borderColor="gray.200">
                    <QuestionInput 
                      onSubmit={handleQuestionSubmit} 
                      isLoading={isLoading} 
                      hasLessonContext={!!selectedLessonId}
                    />
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          </Box>
          
          {/* History sidebar - Collapsible on mobile */}
          <Box 
            flex={1} 
            minWidth={{ lg: '320px' }}
            display={{ base: 'none', lg: 'block' }}
          >
            <Card boxShadow="lg" borderRadius="xl">
              <CardHeader>
                <HStack justify="space-between">
                  <HStack>
                    <FiHistory />
                    <Heading as="h2" size="md">Question History</Heading>
                  </HStack>
                  <Badge variant="subtle" colorScheme="gray">
                    {qaHistory.length}
                  </Badge>
                </HStack>
              </CardHeader>
              
              <CardBody pt={0}>
                <Box height="60vh" overflowY="auto">
                  {isLoadingHistory ? (
                    <VStack spacing={4} align="stretch">
                      <Skeleton height="80px" borderRadius="lg" />
                      <Skeleton height="80px" borderRadius="lg" />
                      <Skeleton height="80px" borderRadius="lg" />
                    </VStack>
                  ) : error ? (
                    <Alert status="error" borderRadius="lg">
                      <AlertIcon />
                      <Text fontSize="sm">Failed to load history</Text>
                    </Alert>
                  ) : qaHistory.length > 0 ? (
                    <VStack spacing={3} align="stretch">
                      {qaHistory.map(item => (
                        <QAHistoryItem 
                          key={item.id} 
                          item={item} 
                          onClick={() => loadQAItem(item)} 
                        />
                      ))}
                    </VStack>
                  ) : (
                    <Box textAlign="center" py={12} color="gray.500">
                      <FiHistory size={32} style={{ margin: '0 auto 16px' }} />
                      <Text fontWeight="medium">No questions yet</Text>
                      <Text fontSize="sm" mt={1}>
                        Start asking to build your history
                      </Text>
                    </Box>
                  )}
                </Box>
              </CardBody>
            </Card>
          </Box>
        </Flex>

        {/* Mobile history collapse */}
        <Collapse in={isHistoryOpen} animateOpacity>
          <Card boxShadow="lg" borderRadius="xl" display={{ base: 'block', lg: 'none' }}>
            <CardHeader>
              <HStack justify="space-between">
                <HStack>
                  <FiHistory />
                  <Heading as="h2" size="md">Question History</Heading>
                </HStack>
                <IconButton
                  aria-label="Close history"
                  icon={<FiChevronUp />}
                  size="sm"
                  variant="ghost"
                  onClick={toggleHistory}
                />
              </HStack>
            </CardHeader>
            
            <CardBody pt={0}>
              <Box maxHeight="40vh" overflowY="auto">
                {qaHistory.length > 0 ? (
                  <VStack spacing={3} align="stretch">
                    {qaHistory.slice(0, 10).map(item => (
                      <QAHistoryItem 
                        key={item.id} 
                        item={item} 
                        onClick={() => {
                          loadQAItem(item);
                          toggleHistory();
                        }} 
                      />
                    ))}
                  </VStack>
                ) : (
                  <Text color="gray.500" textAlign="center" py={8}>
                    No questions yet. Start asking to build your history.
                  </Text>
                )}
              </Box>
            </CardBody>
          </Card>
        </Collapse>
      </VStack>
    </Container>
  );
};

export default QAInterface;