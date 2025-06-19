import React from 'react';
import {
  Box,
  Spinner,
  VStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'lg',
  text = 'Loading...',
  fullScreen = false,
}) => {
  // Move all hooks to the top
  const bg = useColorModeValue('white', 'gray.800');
  const emptyColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  
  const content = (
    <VStack spacing={4}>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor={emptyColor}
        color="brand.500"
        size={size}
      />
      {text && (
        <Text
          fontSize="sm"
          color={textColor}
          fontWeight="medium"
        >
          {text}
        </Text>
      )}
    </VStack>
  );

  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg={bg}
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex="overlay"
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={8}
    >
      {content}
    </Box>
  );
};

export default LoadingSpinner;