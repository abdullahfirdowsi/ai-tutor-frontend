import React from 'react';
import { Heading, Text, Button, Center, VStack, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <Center minHeight="100vh" bg={useColorModeValue('gray.50', 'gray.800')}>
      <VStack spacing={8} textAlign="center" p={8}>
        <Heading size="4xl" color="brand.500">404</Heading>
        <Heading size="xl">Page Not Found</Heading>
        <Text fontSize="lg">
          The page you're looking for doesn't exist or has been moved.
        </Text>
        <Button
          as={RouterLink}
          to="/"
          colorScheme="brand"
          size="lg"
        >
          Return to Homepage
        </Button>
      </VStack>
    </Center>
  );
};

export default NotFound;

