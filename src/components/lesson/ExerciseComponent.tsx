import React, { useState } from 'react';
import {
  Box,
  Text,
  Radio,
  RadioGroup,
  Stack,
  Button,
  Collapse,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';

interface ExerciseProps {
  exercise: {
    question: string;
    options?: string[];
    correct_answer?: string;
    explanation?: string;
    difficulty: string;
  };
  index: number;
  selectedAnswer?: string;
  onAnswerSelect: (answer: string) => void;
}

const ExerciseComponent: React.FC<ExerciseProps> = ({
  exercise,
  index,
  selectedAnswer,
  onAnswerSelect,
}) => {
  const { isOpen, onToggle } = useDisclosure();
  const [showAnswer, setShowAnswer] = useState(false);
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  
  const isCorrect = selectedAnswer === exercise.correct_answer;
  const isAnswered = !!selectedAnswer;
  
  // Get color scheme based on difficulty
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'green';
      case 'medium':
        return 'blue';
      case 'hard':
        return 'purple';
      default:
        return 'gray';
    }
  };
  
  return (
    <Box
      p={4}
      borderRadius="md"
      borderWidth="1px"
      borderColor={isAnswered ? (isCorrect ? 'green.200' : 'red.200') : 'gray.200'}
      bg={cardBg}
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Text fontWeight="bold">Question {index + 1}</Text>
          <Badge colorScheme={getDifficultyColor(exercise.difficulty)}>
            {exercise.difficulty}
          </Badge>
        </HStack>
        
        <Text>{exercise.question}</Text>
        
        {exercise.options && (
          <RadioGroup
            value={selectedAnswer}
            onChange={onAnswerSelect}
            isDisabled={showAnswer}
          >
            <Stack direction="column">
              {exercise.options.map((option, optIndex) => (
                <Radio key={optIndex} value={option}>
                  {option}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        )}
        
        {!exercise.options && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Free Response Question</AlertTitle>
            <Text>This is a free response question. Think about your answer before checking.</Text>
          </Alert>
        )}
        
        <HStack justify="space-between">
          <Button
            size="sm"
            colorScheme={showAnswer ? 'gray' : 'blue'}
            variant={showAnswer ? 'outline' : 'solid'}
            onClick={() => {
              setShowAnswer(!showAnswer);
              if (!selectedAnswer && exercise.correct_answer) {
                onAnswerSelect(exercise.correct_answer);
              }
            }}
          >
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </Button>
          
          {exercise.explanation && (
            <Button size="sm" onClick={onToggle} variant="ghost">
              {isOpen ? 'Hide Explanation' : 'Show Explanation'}
            </Button>
          )}
        </HStack>
        
        {showAnswer && exercise.correct_answer && (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            <Text fontWeight="bold">Correct Answer: {exercise.correct_answer}</Text>
          </Alert>
        )}
        
        <Collapse in={isOpen} animateOpacity>
          <Box
            p={4}
            bg={useColorModeValue('blue.50', 'blue.900')}
            borderRadius="md"
            mt={2}
          >
            <Text fontWeight="bold">Explanation:</Text>
            <Text>{exercise.explanation}</Text>
          </Box>
        </Collapse>
      </VStack>
    </Box>
  );
};

export default ExerciseComponent;

