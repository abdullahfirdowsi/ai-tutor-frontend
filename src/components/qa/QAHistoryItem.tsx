import React from 'react';
import {
  Box,
  Text,
  Badge,
  Flex,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiClock, FiBook } from 'react-icons/fi';

interface Reference {
  title: string;
  source: string;
  url?: string;
}

interface QAHistoryItemProps {
  item: {
    id: string;
    question: string;
    answer: string;
    created_at: string;
    lesson_id?: string;
    references: Reference[];
  };
  onClick: () => void;
}

const QAHistoryItem: React.FC<QAHistoryItemProps> = ({ item, onClick }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };
  
  // Truncate text
  const truncateText = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  return (
    <Box
      p={3}
      borderRadius="md"
      borderWidth="1px"
      bg={cardBg}
      cursor="pointer"
      _hover={{ bg: hoverBg }}
      onClick={onClick}
      transition="all 0.2s"
    >
      <Text fontWeight="medium" mb={1}>
        {truncateText(item.question, 80)}
      </Text>
      
      <Flex justify="space-between" align="center" mt={2}>
        <Flex align="center" fontSize="xs" color="gray.500">
          <Icon as={FiClock} mr={1} />
          <Text>{formatDate(item.created_at)}</Text>
        </Flex>
        
        {item.lesson_id && (
          <Badge colorScheme="blue" size="sm">
            <Flex align="center">
              <Icon as={FiBook} mr={1} />
              <Text>Lesson</Text>
            </Flex>
          </Badge>
        )}
      </Flex>
    </Box>
  );
};

export default QAHistoryItem;

