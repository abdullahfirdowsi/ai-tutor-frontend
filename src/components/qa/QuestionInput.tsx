import React, { useState } from 'react';
import {
  Box,
  Textarea,
  Button,
  HStack,
  IconButton,
  Collapse,
  FormControl,
  FormLabel,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiSend, FiChevronUp, FiChevronDown } from 'react-icons/fi';

interface QuestionInputProps {
  onSubmit: (question: string, context?: string) => void;
  isLoading: boolean;
  hasLessonContext?: boolean;
}

const QuestionInput: React.FC<QuestionInputProps> = ({
  onSubmit,
  isLoading,
  hasLessonContext = false,
}) => {
  const [question, setQuestion] = useState<string>('');
  const [context, setContext] = useState<string>('');
  const { isOpen, onToggle } = useDisclosure();
  const textareaBg = useColorModeValue('white', 'gray.700');
  
  const handleSubmit = () => {
    if (question.trim()) {
      onSubmit(question, context.trim() || undefined);
      setQuestion('');
      // Keep context for potential follow-up questions
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  return (
    <Box>
      <FormControl>
        <Textarea
          placeholder={`Ask a question${hasLessonContext ? ' about this lesson' : ''}...`}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          size="md"
          rows={2}
          resize="none"
          bg={textareaBg}
          disabled={isLoading}
        />
      </FormControl>
      
      <HStack mt={2} justify="space-between">
        <IconButton
          aria-label="Add context"
          icon={isOpen ? <FiChevronUp /> : <FiChevronDown />}
          size="sm"
          variant="ghost"
          onClick={onToggle}
        />
        
        <Button
          colorScheme="brand"
          rightIcon={<FiSend />}
          isLoading={isLoading}
          loadingText="Sending..."
          onClick={handleSubmit}
          isDisabled={!question.trim() || isLoading}
        >
          {isLoading ? 'Thinking...' : 'Ask'}
        </Button>
      </HStack>
      
      <Collapse in={isOpen} animateOpacity>
        <Box mt={2}>
          <FormControl>
            <FormLabel fontSize="sm">
              Additional Context (optional)
            </FormLabel>
            <Textarea
              placeholder="Add any additional context for your question..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              size="sm"
              rows={3}
              resize="vertical"
              bg={textareaBg}
              disabled={isLoading}
            />
          </FormControl>
        </Box>
      </Collapse>
    </Box>
  );
};

export default QuestionInput;

