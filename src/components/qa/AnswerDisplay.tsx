import React from 'react';
import {
  Box,
  Flex,
  Text,
  Avatar,
  VStack,
  HStack,
  Badge,
  Divider,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import { FiUser, FiClock } from 'react-icons/fi';

interface Reference {
  title: string;
  source: string;
  url?: string;
}

interface AnswerDisplayProps {
  question: string;
  answer: string;
  references?: Reference[];
  timestamp: string;
}

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({
  question,
  answer,
  references = [],
  timestamp,
}) => {
  const userBg = useColorModeValue('blue.50', 'blue.900');
  const aiBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const codeBlockBg = useColorModeValue('gray.100', 'gray.800');
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };
  
  // Create custom components for markdown rendering
  const components = {
    p: (props: any) => <Text my={2} lineHeight="tall" {...props} />,
    a: (props: any) => <Link color="blue.500" isExternal {...props} />,
    code: (props: any) => {
      const { children, className } = props;
      const isCodeBlock = className?.includes('language-');
      
      return isCodeBlock ? (
        <Box
          as="pre"
          p={3}
          my={3}
          borderRadius="md"
          bg={codeBlockBg}
          overflowX="auto"
          fontFamily="monospace"
          fontSize="sm"
          {...props}
        />
      ) : (
        <Box
          as="code"
          fontFamily="monospace"
          px={1}
          bg={codeBlockBg}
          borderRadius="sm"
          fontSize="sm"
          {...props}
        />
      );
    },
    ul: (props: any) => <Box as="ul" pl={6} my={3} {...props} />,
    ol: (props: any) => <Box as="ol" pl={6} my={3} {...props} />,
    li: (props: any) => <Box as="li" my={1} {...props} />,
    blockquote: (props: any) => (
      <Box
        as="blockquote"
        pl={4}
        my={3}
        borderLeftWidth="4px"
        borderLeftColor="gray.300"
        fontStyle="italic"
        {...props}
      />
    ),
  };
  
  return (
    <VStack spacing={4} align="stretch">
      {/* User question */}
      <Flex direction="row">
        <Avatar size="sm" bg="blue.500" icon={<FiUser fontSize="1.2rem" />} mr={3} />
        <Box
          bg={userBg}
          p={3}
          borderRadius="lg"
          borderTopLeftRadius="0"
          maxW="80%"
          boxShadow="sm"
        >
          <Text fontWeight="medium">{question}</Text>
          <HStack mt={2} fontSize="xs" color="gray.500">
            <FiClock />
            <Text>{formatTimestamp(timestamp)}</Text>
          </HStack>
        </Box>
      </Flex>
      
      {/* AI response */}
      <Flex direction="row" justify="flex-end">
        <Box
          bg={aiBg}
          p={3}
          borderRadius="lg"
          borderTopRightRadius="0"
          maxW="90%"
          boxShadow="sm"
        >
          <ReactMarkdown components={components}>{answer}</ReactMarkdown>
          
          {/* References */}
          {references && references.length > 0 && (
            <>
              <Divider my={3} />
              <Text fontSize="sm" fontWeight="bold" mb={2}>
                References:
              </Text>
              <VStack align="start" spacing={2}>
                {references.map((ref, index) => (
                  <Box key={index} fontSize="sm">
                    <HStack mb={1}>
                      <Badge colorScheme="blue">{ref.source}</Badge>
                      <Text fontWeight="medium">{ref.title}</Text>
                    </HStack>
                    {ref.url && (
                      <Link href={ref.url} color="blue.500" isExternal fontSize="xs">
                        {ref.url}
                      </Link>
                    )}
                  </Box>
                ))}
              </VStack>
            </>
          )}
          
          <HStack mt={2} fontSize="xs" color="gray.500" justify="flex-end">
            <FiClock />
            <Text>{formatTimestamp(timestamp)}</Text>
          </HStack>
        </Box>
        <Avatar
          size="sm"
          ml={3}
          name="AI Tutor"
          bg="brand.500"
          src="/logo192.png"
        />
      </Flex>
    </VStack>
  );
};

export default AnswerDisplay;

