import React from 'react';
import {
  Box,
  Heading,
  Text,
  Image,
  AspectRatio,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';

interface LessonSectionProps {
  title: string;
  content: string;
  type: string;
  mediaUrl?: string;
}

const LessonSection: React.FC<LessonSectionProps> = ({ title, content, type, mediaUrl }) => {
  const codeBlockBg = useColorModeValue('gray.50', 'gray.700');
  
  // Create custom components for markdown rendering
  const components = {
    h1: (props: any) => <Heading as="h1" size="xl" my={4} {...props} />,
    h2: (props: any) => <Heading as="h2" size="lg" my={3} {...props} />,
    h3: (props: any) => <Heading as="h3" size="md" my={2} {...props} />,
    p: (props: any) => <Text my={2} lineHeight="tall" {...props} />,
    code: (props: any) => {
      const { className } = props;
      const isCodeBlock = className?.includes('language-');
      
      return isCodeBlock ? (
        <Box
          as="pre"
          p={4}
          my={4}
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
    ul: (props: any) => <Box as="ul" pl={6} my={4} {...props} />,
    ol: (props: any) => <Box as="ol" pl={6} my={4} {...props} />,
    li: (props: any) => <Box as="li" my={1} {...props} />,
    blockquote: (props: any) => (
      <Box
        as="blockquote"
        pl={4}
        my={4}
        borderLeftWidth="4px"
        borderLeftColor="gray.300"
        fontStyle="italic"
        {...props}
      />
    ),
  };
  
  // Render based on section type
  const renderContent = () => {
    switch (type) {
      case 'video':
        return (
          <VStack spacing={4} align="stretch">
            {mediaUrl && (
              <AspectRatio ratio={16 / 9} mb={4}>
                <iframe
                  title={title}
                  src={mediaUrl}
                  allowFullScreen
                  frameBorder="0"
                />
              </AspectRatio>
            )}
            <ReactMarkdown components={components}>{content}</ReactMarkdown>
          </VStack>
        );
      case 'image':
        return (
          <VStack spacing={4} align="stretch">
            {mediaUrl && (
              <Image
                src={mediaUrl}
                alt={title}
                borderRadius="md"
                maxHeight="400px"
                objectFit="contain"
                mb={4}
              />
            )}
            <ReactMarkdown components={components}>{content}</ReactMarkdown>
          </VStack>
        );
      default: // text
        return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
    }
  };
  
  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>{title}</Heading>
      {renderContent()}
    </Box>
  );
};

export default LessonSection;

