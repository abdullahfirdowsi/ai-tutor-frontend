import React, { useState } from 'react';
import {
  HStack,
  Text,
  Badge,
  IconButton,
  Input,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { FiEdit, FiMessageSquare, FiBook } from 'react-icons/fi';
import { QASession, UpdateSessionRequest } from '../../types/qa';

interface SessionHeaderProps {
  session: QASession;
  onSessionUpdate: (sessionId: string, updates: UpdateSessionRequest) => Promise<void>;
}

const SessionHeader: React.FC<SessionHeaderProps> = ({
  session,
  onSessionUpdate,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [title, setTitle] = useState(session.title);
  const [topic, setTopic] = useState(session.topic || '');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSessionUpdate(session.id, {
        title: title.trim(),
        topic: topic.trim() || undefined,
      });
      
      toast({
        title: 'Session updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to update session',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle(session.title);
    setTopic(session.topic || '');
    onClose();
  };

  return (
    <>
      <HStack justify="space-between" align="center">
        <HStack spacing={3}>
          <FiMessageSquare />
          <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
            {session.title}
          </Text>
          
          {session.lesson_id && (
            <Badge colorScheme="blue" variant="subtle" display="flex" alignItems="center">
              <FiBook style={{ marginRight: '4px' }} />
              Lesson Context
            </Badge>
          )}
          
          {session.topic && (
            <Badge colorScheme="purple" variant="outline">
              {session.topic}
            </Badge>
          )}
        </HStack>
        
        <IconButton
          aria-label="Edit session"
          icon={<FiEdit />}
          size="sm"
          variant="ghost"
          onClick={onOpen}
        />
      </HStack>

      <Modal isOpen={isOpen} onClose={handleCancel} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Conversation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter conversation title"
                  size="lg"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Topic (optional)</FormLabel>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Mathematics, Physics, Programming"
                  size="lg"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              colorScheme="brand" 
              onClick={handleSave}
              isLoading={isLoading}
              loadingText="Saving..."
              isDisabled={!title.trim()}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SessionHeader;