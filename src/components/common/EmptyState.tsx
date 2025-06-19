import React from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiInbox } from 'react-icons/fi';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = FiInbox,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const iconColor = useColorModeValue('gray.400', 'gray.500');
  const titleColor = useColorModeValue('gray.800', 'gray.200');
  const descriptionColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box
      textAlign="center"
      py={16}
      px={8}
    >
      <VStack spacing={6}>
        <Icon
          as={icon}
          boxSize={16}
          color={iconColor}
        />
        
        <VStack spacing={2}>
          <Text
            fontSize="xl"
            fontWeight="bold"
            color={titleColor}
          >
            {title}
          </Text>
          
          <Text
            fontSize="md"
            color={descriptionColor}
            maxW="md"
            lineHeight="tall"
          >
            {description}
          </Text>
        </VStack>
        
        {actionLabel && onAction && (
          <Button
            colorScheme="brand"
            onClick={onAction}
            size="lg"
          >
            {actionLabel}
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default EmptyState;