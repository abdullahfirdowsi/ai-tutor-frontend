import React from 'react';
import {
  Box,
  Heading,
  Text,
  Stack,
  HStack,
  Badge,
  Flex,
  Icon,
  Tag,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiClock, FiCalendar } from 'react-icons/fi';

interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    subject: string;
    topic: string;
    difficulty: string;
    duration_minutes: number;
    created_at: string;
    tags: string[];
    summary?: string;
  };
  progress?: {
    progress: number;
    completed: boolean;
  };
  onClick: () => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, progress, onClick }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const summaryColor = useColorModeValue('gray.600', 'gray.300');
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Get color scheme based on difficulty
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'green';
      case 'intermediate':
        return 'blue';
      case 'advanced':
        return 'purple';
      default:
        return 'gray';
    }
  };
  
  // Truncate summary if too long
  const truncateSummary = (summary?: string, maxLength = 100) => {
    if (!summary) return '';
    return summary.length > maxLength 
      ? `${summary.substring(0, maxLength)}...` 
      : summary;
  };
  
  return (
    <Box
      bg={cardBg}
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="md"
      transition="all 0.2s"
      _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
      onClick={onClick}
      cursor="pointer"
      position="relative"
      overflow="hidden"
    >
      {/* Progress indicator (if available) */}
      {progress && (
        <Box
          position="absolute"
          top={0}
          left={0}
          height="4px"
          width={`${progress.progress * 100}%`}
          bg={progress.completed ? 'green.400' : 'blue.400'}
        />
      )}
      
      <Stack spacing={3}>
        <Heading as="h3" size="md">{lesson.title}</Heading>
        
        <HStack>
          <Badge colorScheme={getDifficultyColor(lesson.difficulty)} px={2} py={1}>
            {lesson.difficulty}
          </Badge>
          <Badge colorScheme="teal" px={2} py={1}>
            {lesson.subject}
          </Badge>
        </HStack>
        
        {lesson.summary && (
          <Text color={summaryColor} fontSize="sm">
            {truncateSummary(lesson.summary)}
          </Text>
        )}
        
        <Flex justify="space-between" align="center" fontSize="sm" color="gray.500">
          <HStack>
            <Icon as={FiClock} />
            <Text>{lesson.duration_minutes} min</Text>
          </HStack>
          
          <HStack>
            <Icon as={FiCalendar} />
            <Text>{formatDate(lesson.created_at)}</Text>
          </HStack>
        </Flex>
        
        {lesson.tags && lesson.tags.length > 0 && (
          <Box>
            {lesson.tags.slice(0, 3).map((tag, index) => (
              <Tag key={index} size="sm" colorScheme="gray" mr={2} mt={2}>
                {tag}
              </Tag>
            ))}
            {lesson.tags.length > 3 && (
              <Tag size="sm" colorScheme="gray" mt={2}>
                +{lesson.tags.length - 3} more
              </Tag>
            )}
          </Box>
        )}
        
        {progress && progress.completed && (
          <Badge colorScheme="green" alignSelf="flex-start">
            Completed
          </Badge>
        )}
      </Stack>
    </Box>
  );
};

export default LessonCard;

