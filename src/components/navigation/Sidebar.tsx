import React from 'react';
import {
  Box,
  Flex,
  Icon,
  Stack,
  useColorModeValue,
  Text,
  VStack,
  Divider,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiBook, 
  FiHelpCircle, 
  FiUser, 
  FiTrendingUp,
  FiSettings,
  FiBookmark
} from 'react-icons/fi';

interface NavItemProps {
  icon: React.ElementType;
  children: React.ReactNode;
  to: string;
  isActive: boolean;
  badge?: string | number;
  tooltip?: string;
}

const NavItem = ({ icon, children, to, isActive, badge, tooltip }: NavItemProps) => {
  // Move all hooks to the top
  const bg = useColorModeValue('white', 'gray.800');
  const activeBg = useColorModeValue('brand.50', 'brand.900');
  const activeColor = useColorModeValue('brand.600', 'brand.300');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const hoverTextColor = useColorModeValue('gray.800', 'white');

  const content = (
    <Box
      as={RouterLink}
      to={to}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
      w="full"
    >
      <Flex
        align="center"
        p="3"
        mx="2"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : textColor}
        fontWeight={isActive ? '600' : '500'}
        transition="all 0.2s"
        _hover={{
          bg: isActive ? activeBg : hoverBg,
          color: isActive ? activeColor : hoverTextColor,
          transform: 'translateX(2px)',
        }}
        position="relative"
      >
        {isActive && (
          <Box
            position="absolute"
            left="-2"
            top="0"
            bottom="0"
            w="1"
            bg="brand.500"
            borderRadius="full"
          />
        )}
        
        <Icon
          mr="3"
          fontSize="18"
          as={icon}
          transition="all 0.2s"
        />
        
        <Text fontSize="sm" flex="1">
          {children}
        </Text>
        
        {badge && (
          <Badge
            colorScheme={isActive ? 'brand' : 'gray'}
            variant="subtle"
            borderRadius="full"
            fontSize="xs"
            minW="20px"
            textAlign="center"
          >
            {badge}
          </Badge>
        )}
      </Flex>
    </Box>
  );

  return tooltip ? (
    <Tooltip label={tooltip} placement="right" hasArrow>
      {content}
    </Tooltip>
  ) : content;
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  // Move all hooks to the top
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const progressBg = useColorModeValue('brand.50', 'brand.900');
  const progressTextColor = useColorModeValue('brand.700', 'brand.300');
  const progressSubColor = useColorModeValue('gray.600', 'gray.400');
  const progressBarBg = useColorModeValue('brand.100', 'brand.800');

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Box
      position="fixed"
      height="calc(100vh - 72px)"
      w={{ base: 'full', md: '280px' }}
      display={{ base: 'none', md: 'block' }}
      bg={bg}
      borderRight="1px"
      borderRightColor={borderColor}
      pt={6}
      pb={4}
      overflowY="auto"
      boxShadow="sm"
    >
      <VStack spacing={6} align="stretch" px={4}>
        {/* Main Navigation */}
        <Box>
          <Text
            fontSize="xs"
            fontWeight="bold"
            color={labelColor}
            textTransform="uppercase"
            letterSpacing="wide"
            mb={3}
            px={2}
          >
            Main
          </Text>
          <Stack spacing={1} align="stretch">
            <NavItem 
              icon={FiHome} 
              to="/" 
              isActive={isActive('/')}
              tooltip="View your learning dashboard"
            >
              Dashboard
            </NavItem>
            
            <NavItem 
              icon={FiBook} 
              to="/lessons" 
              isActive={isActive('/lessons')}
              badge="12"
              tooltip="Browse and take lessons"
            >
              Lessons
            </NavItem>
            
            <NavItem 
              icon={FiHelpCircle} 
              to="/qa" 
              isActive={isActive('/qa')}
              badge="3"
              tooltip="Ask questions and get AI help"
            >
              Q&A Assistant
            </NavItem>
          </Stack>
        </Box>

        <Divider />

        {/* Learning Tools */}
        <Box>
          <Text
            fontSize="xs"
            fontWeight="bold"
            color={labelColor}
            textTransform="uppercase"
            letterSpacing="wide"
            mb={3}
            px={2}
          >
            Learning Tools
          </Text>
          <Stack spacing={1} align="stretch">
            <NavItem 
              icon={FiTrendingUp} 
              to="/analytics" 
              isActive={isActive('/analytics')}
              tooltip="View your learning progress"
            >
              Analytics
            </NavItem>
            
            <NavItem 
              icon={FiBookmark} 
              to="/bookmarks" 
              isActive={isActive('/bookmarks')}
              badge="5"
              tooltip="Your saved lessons and notes"
            >
              Bookmarks
            </NavItem>
          </Stack>
        </Box>

        <Divider />

        {/* Account */}
        <Box>
          <Text
            fontSize="xs"
            fontWeight="bold"
            color={labelColor}
            textTransform="uppercase"
            letterSpacing="wide"
            mb={3}
            px={2}
          >
            Account
          </Text>
          <Stack spacing={1} align="stretch">
            <NavItem 
              icon={FiUser} 
              to="/profile" 
              isActive={isActive('/profile')}
              tooltip="Manage your profile"
            >
              Profile
            </NavItem>
            
            <NavItem 
              icon={FiSettings} 
              to="/settings" 
              isActive={isActive('/settings')}
              tooltip="App settings and preferences"
            >
              Settings
            </NavItem>
          </Stack>
        </Box>

        {/* Progress Summary */}
        <Box
          bg={progressBg}
          p={4}
          borderRadius="lg"
          mx={2}
        >
          <Text fontSize="sm" fontWeight="600" mb={2} color={progressTextColor}>
            Weekly Progress
          </Text>
          <Text fontSize="xs" color={progressSubColor} mb={3}>
            5 of 7 lessons completed
          </Text>
          <Box
            w="full"
            h="2"
            bg={progressBarBg}
            borderRadius="full"
            overflow="hidden"
          >
            <Box
              w="71%"
              h="full"
              bg="brand.500"
              borderRadius="full"
              transition="width 0.3s ease"
            />
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default Sidebar;