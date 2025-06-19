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
  Button,
  Skeleton,
  useToast,
  IconButton,
  useDisclosure,
  Card,
  CardHeader,
  CardBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useBreakpointValue,
  Icon,
} from '@chakra-ui/react';
import { 
  FiMessageSquare, 
  FiClock, 
  FiPlus,
  FiSidebar,
  FiWifi,
  FiRefreshCw
} from 'react-icons/fi';
import api from '../services/api';

// Import components
import QuestionInput from '../components/qa/QuestionInput';
import AnswerDisplay from '../components/qa/AnswerDisplay';
import SessionList from '../components/qa/SessionList';
import SessionHeader from '../components/qa/SessionHeader';

// Import types
import { 
  QASession, 
  QAMessage, 
  QASessionsResponse, 
  CreateSessionRequest,
  UpdateSessionRequest,
  AskQuestionRequest 
} from '../types/qa';

const QAInterface: React.FC = () => {
  const location = useLocation();
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isOpen: isHistoryOpen, onToggle: toggleHistory } = useDisclosure();
  const { isOpen: isNewSessionOpen, onOpen: openNewSession, onClose: closeNewSession } = useDisclosure();
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const isMobile = useBreakpointValue({ base: true, lg: false });
  
  // State
  const [sessions, setSessions] = useState<QASession[]>([]);
  const [activeSession, setActiveSession] = useState<QASession | null>(null);
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(true);
  const [hasNetworkError, setHasNetworkError] = useState<boolean>(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  
  // New session form
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionTopic, setNewSessionTopic] = useState('');
  
  // Extract lesson ID from query params if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const lessonId = params.get('lessonId');
    if (lessonId) {
      setSelectedLessonId(lessonId);
    }
  }, [location]);
  
  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    setHasNetworkError(false);
    
    try {
      const response = await api.get<QASessionsResponse>('/qa/sessions');
      setSessions(response.data.sessions || []);
      
      // Auto-select the most recent session if none is selected
      if (!activeSession && response.data.sessions && response.data.sessions.length > 0) {
        const mostRecent = response.data.sessions[0];
        setActiveSession(mostRecent);
        setMessages(mostRecent.messages || []);
      }
    } catch (err: any) {
      console.warn('Failed to fetch sessions:', err);
      
      // Only show network error for critical failures
      if (err.code === 'NETWORK_ERROR' || !err.response || err.response?.status >= 500) {
        setHasNetworkError(true);
      } else {
        // For other errors, just show empty state
        setSessions([]);
      }
    } finally {
      setIsLoadingSessions(false);
    }
  }, [activeSession]);
  
  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Generate session title from first question
  const generateSessionTitle = (question: string): string => {
    const words = question.split(' ').slice(0, 6);
    return words.join(' ') + (question.split(' ').length > 6 ? '...' : '');
  };
  
  // Auto-generate topic from question content
  const generateTopic = (question: string): string => {
    const mathKeywords = ['equation', 'algebra', 'calculus', 'geometry', 'math', 'formula'];
    const physicsKeywords = ['physics', 'force', 'energy', 'motion', 'quantum', 'mechanics'];
    const programmingKeywords = ['code', 'programming', 'function', 'algorithm', 'javascript', 'python'];
    const chemistryKeywords = ['chemistry', 'molecule', 'reaction', 'element', 'compound'];
    
    const lowerQuestion = question.toLowerCase();
    
    if (mathKeywords.some(keyword => lowerQuestion.includes(keyword))) return 'Mathematics';
    if (physicsKeywords.some(keyword => lowerQuestion.includes(keyword))) return 'Physics';
    if (programmingKeywords.some(keyword => lowerQuestion.includes(keyword))) return 'Programming';
    if (chemistryKeywords.some(keyword => lowerQuestion.includes(keyword))) return 'Chemistry';
    
    return 'General';
  };
  
  // Create new session
  const createSession = async (title?: string, topic?: string): Promise<QASession> => {
    const sessionData: CreateSessionRequest = {
      title: title || 'New Conversation',
      topic: topic,
      lesson_id: selectedLessonId || undefined,
    };
    
    const response = await api.post('/qa/sessions', sessionData);
    const newSession = response.data;
    
    setSessions(prev => [newSession, ...prev]);
    return newSession;
  };
  
  // Handle question submission with optimistic updates
  const handleQuestionSubmit = async (question: string, context?: string) => {
    setIsLoading(true);
    
    try {
      let currentSession = activeSession;
      
      // Create new session if none exists
      if (!currentSession) {
        const title = generateSessionTitle(question);
        const topic = generateTopic(question);
        currentSession = await createSession(title, topic);
        setActiveSession(currentSession);
      }
      
      // Optimistic update - add question immediately
      const optimisticMessage: QAMessage = {
        id: `temp-${Date.now()}`,
        question,
        answer: '',
        created_at: new Date().toISOString(),
        lesson_id: selectedLessonId || undefined,
        references: [],
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Send question to API
      const requestData: AskQuestionRequest = {
        question,
        context,
        session_id: currentSession.id,
        lesson_id: selectedLessonId || undefined,
      };
      
      const response = await api.post('/qa/ask', requestData);
      const actualMessage = response.data;
      
      // Replace optimistic message with actual response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id ? actualMessage : msg
        )
      );
      
      // Update session in list
      setSessions(prev => 
        prev.map(session => 
          session.id === currentSession!.id 
            ? { 
                ...session, 
                message_count: session.message_count + 1,
                updated_at: new Date().toISOString(),
                messages: [...(session.messages || []), actualMessage]
              }
            : session
        )
      );
      
    } catch (err: any) {
      console.error('Error submitting question:', err);
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
      
      toast({
        title: 'Unable to process question',
        description: 'Please check your connection and try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle session selection
  const handleSessionSelect = (session: QASession) => {
    setActiveSession(session);
    setMessages(session.messages || []);
    
    if (isMobile) {
      toggleHistory();
    }
  };
  
  // Handle session update
  const handleSessionUpdate = async (sessionId: string, updates: UpdateSessionRequest) => {
    await api.put(`/qa/sessions/${sessionId}`, updates);
    
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, ...updates, updated_at: new Date().toISOString() }
          : session
      )
    );
    
    if (activeSession?.id === sessionId) {
      setActiveSession(prev => prev ? { ...prev, ...updates } : null);
    }
  };
  
  // Handle session deletion
  const handleSessionDelete = async (sessionId: string) => {
    try {
      await api.delete(`/qa/sessions/${sessionId}`);
      
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      if (activeSession?.id === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          handleSessionSelect(remainingSessions[0]);
        } else {
          setActiveSession(null);
          setMessages([]);
        }
      }
      
      toast({
        title: 'Conversation deleted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to delete conversation',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handle new session creation
  const handleNewSession = async () => {
    try {
      const title = newSessionTitle.trim() || 'New Conversation';
      const topic = newSessionTopic.trim() || undefined;
      
      const newSession = await createSession(title, topic);
      setActiveSession(newSession);
      setMessages([]);
      
      setNewSessionTitle('');
      setNewSessionTopic('');
      closeNewSession();
      
      toast({
        title: 'New conversation started',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to create conversation',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Show network error only for critical failures
  if (hasNetworkError) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} textAlign="center">
          <Icon as={FiWifi} boxSize={16} color="red.400" />
          <VStack spacing={4}>
            <Heading size="lg" color="red.500">Connection Problem</Heading>
            <Text color="gray.600" maxW="md">
              We're having trouble connecting to our servers. Please check your internet connection and try again.
            </Text>
          </VStack>
          <HStack spacing={4}>
            <Button 
              leftIcon={<FiRefreshCw />}
              onClick={fetchSessions} 
              colorScheme="brand"
            >
              Try Again
            </Button>
            <Button 
              leftIcon={<FiPlus />}
              onClick={openNewSession}
              variant="outline"
            >
              Start Offline Session
            </Button>
          </HStack>
        </VStack>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            AI Tutor Conversations
          </Heading>
          <Text color="gray.600">
            Have natural conversations with your AI tutor. Each session keeps context for better learning.
          </Text>
        </Box>

        <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
          {/* Main conversation area */}
          <Box flex={3}>
            <Card boxShadow="lg" borderRadius="xl">
              <CardHeader>
                {activeSession ? (
                  <SessionHeader 
                    session={activeSession}
                    onSessionUpdate={handleSessionUpdate}
                  />
                ) : (
                  <HStack justify="space-between">
                    <HStack>
                      <FiMessageSquare />
                      <Text fontWeight="bold" fontSize="lg">
                        Select a conversation or start a new one
                      </Text>
                    </HStack>
                    <Button 
                      leftIcon={<FiPlus />}
                      colorScheme="brand"
                      size="sm"
                      onClick={openNewSession}
                    >
                      New Chat
                    </Button>
                  </HStack>
                )}
                
                {/* Mobile controls */}
                <HStack mt={3} display={{ base: 'flex', lg: 'none' }}>
                  <Button 
                    leftIcon={<FiSidebar />}
                    size="sm" 
                    variant="outline"
                    onClick={toggleHistory}
                  >
                    Conversations
                  </Button>
                  <Button 
                    leftIcon={<FiPlus />}
                    colorScheme="brand"
                    size="sm"
                    onClick={openNewSession}
                  >
                    New
                  </Button>
                </HStack>
              </CardHeader>
              
              <CardBody>
                <Flex direction="column" height="60vh">
                  {/* Messages area */}
                  <VStack 
                    spacing={6} 
                    align="stretch" 
                    overflowY="auto" 
                    flex={1}
                    px={2}
                    pb={4}
                  >
                    {!activeSession ? (
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
                          Welcome to AI Tutor Conversations
                        </Text>
                        <Text fontSize="sm" mt={2} maxW="md">
                          Start a new conversation or select an existing one to continue learning with context-aware discussions.
                        </Text>
                        <Button 
                          mt={4}
                          leftIcon={<FiPlus />}
                          colorScheme="brand"
                          onClick={openNewSession}
                        >
                          Start New Conversation
                        </Button>
                      </Flex>
                    ) : messages.length === 0 ? (
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
                          Start the conversation
                        </Text>
                        <Text fontSize="sm" mt={2} maxW="md">
                          Ask your first question to begin this learning session.
                        </Text>
                      </Flex>
                    ) : (
                      messages.map((message, index) => (
                        <AnswerDisplay 
                          key={message.id || index} 
                          question={message.question}
                          answer={message.answer}
                          references={message.references}
                          timestamp={message.created_at}
                        />
                      ))
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
                  {activeSession && (
                    <Box pt={6} borderTop="1px" borderColor="gray.200">
                      <QuestionInput 
                        onSubmit={handleQuestionSubmit} 
                        isLoading={isLoading} 
                        hasLessonContext={!!selectedLessonId}
                      />
                    </Box>
                  )}
                </Flex>
              </CardBody>
            </Card>
          </Box>
          
          {/* Sessions sidebar - Desktop */}
          <Box 
            flex={1} 
            minWidth={{ lg: '320px' }}
            display={{ base: 'none', lg: 'block' }}
          >
            <Card boxShadow="lg" borderRadius="xl">
              <CardHeader>
                <HStack justify="space-between">
                  <HStack>
                    <FiClock />
                    <Heading as="h2" size="md">Conversations</Heading>
                  </HStack>
                  <Button
                    leftIcon={<FiPlus />}
                    size="sm"
                    colorScheme="brand"
                    onClick={openNewSession}
                  >
                    New
                  </Button>
                </HStack>
              </CardHeader>
              
              <CardBody pt={0}>
                <Box height="60vh" overflowY="auto">
                  {isLoadingSessions ? (
                    <VStack spacing={3} align="stretch">
                      {Array(5).fill(0).map((_, i) => (
                        <Skeleton key={i} height="80px" borderRadius="lg" />
                      ))}
                    </VStack>
                  ) : (
                    <SessionList
                      sessions={sessions}
                      activeSessionId={activeSession?.id}
                      onSessionSelect={handleSessionSelect}
                      onSessionEdit={(session) => {
                        // Edit functionality handled by SessionHeader
                      }}
                      onSessionDelete={handleSessionDelete}
                    />
                  )}
                </Box>
              </CardBody>
            </Card>
          </Box>
        </Flex>

        {/* Mobile sessions collapse */}
        <Box display={{ base: 'block', lg: 'none' }}>
          {isHistoryOpen && (
            <Card boxShadow="lg" borderRadius="xl">
              <CardHeader>
                <HStack justify="space-between">
                  <HStack>
                    <FiClock />
                    <Heading as="h2" size="md">Conversations</Heading>
                  </HStack>
                  <IconButton
                    aria-label="Close conversations"
                    icon={<Icon as={FiPlus} />}
                    size="sm"
                    variant="ghost"
                    onClick={toggleHistory}
                  />
                </HStack>
              </CardHeader>
              
              <CardBody pt={0}>
                <Box maxHeight="50vh" overflowY="auto">
                  <SessionList
                    sessions={sessions}
                    activeSessionId={activeSession?.id}
                    onSessionSelect={handleSessionSelect}
                    onSessionEdit={(session) => {
                      // Edit functionality handled by SessionHeader
                    }}
                    onSessionDelete={handleSessionDelete}
                  />
                </Box>
              </CardBody>
            </Card>
          )}
        </Box>
      </VStack>

      {/* New Session Modal */}
      <Modal isOpen={isNewSessionOpen} onClose={closeNewSession} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Start New Conversation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Title (optional)</FormLabel>
                <Input
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}
                  placeholder="Enter conversation title or leave blank for auto-generation"
                  size="lg"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Topic (optional)</FormLabel>
                <Input
                  value={newSessionTopic}
                  onChange={(e) => setNewSessionTopic(e.target.value)}
                  placeholder="e.g., Mathematics, Physics, Programming"
                  size="lg"
                />
              </FormControl>
              
              <Text fontSize="sm" color="gray.600">
                If you leave the title blank, it will be automatically generated from your first question.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeNewSession}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleNewSession}>
              Start Conversation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default QAInterface;