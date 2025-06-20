import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { 
  Box, 
  Flex, 
  Heading, 
  Text,
  VStack,
  useColorModeValue,
  Container,
  HStack,
  Icon,
  Image,
} from '@chakra-ui/react';
import { FiShield, FiZap, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const AuthLayout: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  
  // Move all hooks to the top
  const bgGradient = useColorModeValue(
    'linear(to-br, brand.50, purple.50)',
    'linear(to-br, gray.900, gray.800)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const featureIconBg = useColorModeValue('brand.100', 'brand.900');
  const featureTitleColor = useColorModeValue('gray.800', 'white');
  const featureDescColor = useColorModeValue('gray.600', 'gray.300');
  const socialProofBg = useColorModeValue('white', 'gray.800');
  const socialProofTextColor = useColorModeValue('gray.600', 'gray.300');
  const socialProofSubColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Redirect to dashboard if already authenticated
  if (!isLoading && currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box minHeight="100vh" bgGradient={bgGradient}>
      <Container maxW="container.xl" py={8}>
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          align="center"
          justify="center"
          minH="calc(100vh - 4rem)"
          gap={12}
        >
          {/* Left side - Branding and features */}
          <VStack
            spacing={8}
            align={{ base: 'center', lg: 'start' }}
            flex={1}
            maxW={{ base: 'full', lg: '500px' }}
            textAlign={{ base: 'center', lg: 'left' }}
          >
            {/* Logo and brand */}
            <VStack spacing={4} align={{ base: 'center', lg: 'start' }}>
              <HStack spacing={3}>
                <Image
                  src="/aitutor-nobackground.png"
                  alt="AI Tutor Logo"
                  w="80px"
                  h="80px"
                  borderRadius="xl"
                  boxShadow="lg"
                />
                <VStack align="start" spacing={0}>
                  <Heading size="xl" color={headingColor}>
                    AI Tutor
                  </Heading>
                  <Text color={textColor} fontSize="lg">
                    Powered by VizTalk AI
                  </Text>
                </VStack>
              </HStack>
              
              <Text
                fontSize="xl"
                color={textColor}
                maxW="md"
                lineHeight="tall"
              >
                Experience the future of education with AI-powered lessons, 
                personalized learning paths, and instant Q&A assistance.
              </Text>
            </VStack>

            {/* Features */}
            <VStack spacing={6} align="stretch" w="full" maxW="md">
              <FeatureItem
                icon={FiZap}
                title="AI-Powered Learning"
                description="Get personalized lessons generated specifically for your learning style and pace"
                iconBg={featureIconBg}
                titleColor={featureTitleColor}
                descColor={featureDescColor}
              />
              <FeatureItem
                icon={FiUsers}
                title="Interactive Q&A"
                description="Ask questions anytime and get instant, contextual answers from our AI tutor"
                iconBg={featureIconBg}
                titleColor={featureTitleColor}
                descColor={featureDescColor}
              />
              <FeatureItem
                icon={FiShield}
                title="Progress Tracking"
                description="Monitor your learning journey with detailed analytics and achievements"
                iconBg={featureIconBg}
                titleColor={featureTitleColor}
                descColor={featureDescColor}
              />
            </VStack>

            {/* Social proof */}
            <Box
              p={6}
              bg={socialProofBg}
              borderRadius="xl"
              boxShadow="md"
              w="full"
              maxW="md"
            >
              <Text fontSize="sm" color={socialProofTextColor} mb={2}>
                Trusted by learners worldwide
              </Text>
              <HStack spacing={6}>
                <VStack spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold" color="brand.500">10K+</Text>
                  <Text fontSize="xs" color={socialProofSubColor}>
                    Active Learners
                  </Text>
                </VStack>
                <VStack spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold" color="brand.500">50K+</Text>
                  <Text fontSize="xs" color={socialProofSubColor}>
                    Lessons Completed
                  </Text>
                </VStack>
                <VStack spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold" color="brand.500">95%</Text>
                  <Text fontSize="xs" color={socialProofSubColor}>
                    Satisfaction Rate
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </VStack>

          {/* Right side - Auth form */}
          <Box
            bg={cardBg}
            p={8}
            borderRadius="2xl"
            boxShadow="2xl"
            w="full"
            maxW="450px"
            border="1px solid"
            borderColor={borderColor}
          >
            <Outlet />
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

interface FeatureItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
  iconBg: string;
  titleColor: string;
  descColor: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ 
  icon, 
  title, 
  description, 
  iconBg, 
  titleColor, 
  descColor 
}) => {
  return (
    <HStack spacing={4} align="start">
      <Box
        p={3}
        bg={iconBg}
        borderRadius="lg"
        color="brand.500"
        flexShrink={0}
      >
        <Icon as={icon} boxSize={6} />
      </Box>
      <VStack align="start" spacing={1}>
        <Text fontWeight="bold" color={titleColor}>
          {title}
        </Text>
        <Text fontSize="sm" color={descColor}>
          {description}
        </Text>
      </VStack>
    </HStack>
  );
};

export default AuthLayout;