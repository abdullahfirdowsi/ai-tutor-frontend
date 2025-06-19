import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Icon,
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
import api from '../../services/api';

interface NavItemProps {
  icon: React.ElementType;
  children: React.ReactNode;
  to: string;
  isActive: boolean;
  badge?: string | number;
  tooltip?: string;
}

interface SidebarCounts {
  totalLessons: number;
  pendingQuestions: number;
  bookmarks: number;
}

const NavItem = ({ icon, children, to, isActive, badge, tooltip }: NavItemProps) => {
  // Move all hooks to the top
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
  const [counts, setCounts] = useState<SidebarCounts>({
    totalLessons: 0,
    pendingQuestions: 0,
    bookmarks: 0,
  });
  const [userProgress, setUserProgress] = useState<any>(null);
  
  // Move all hooks to the top
  const sidebarBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const progressBg = useColorModeValue('brand.50', 'brand.900');
  const progressTextColor = useColorModeValue('brand.700', 'brand.300');
  const progressSubColor = useColorModeValue('gray.600', 'gray.400');
  const progressBarBg = useColorModeValue('brand.100', 'brand.800');

  // Fetch real-time counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch lessons count
        const lessonsResponse = await api.get('/lessons?limit=1');
        const totalLessons = lessonsResponse.data.total || 0;

        // Fetch Q&A history count (pending/recent questions)
        const qaResponse = await api.get('/qa/history?limit=1');
        const pendingQuestions = qaResponse.data.total || 0;

        // Fetch user progress for bookmarks/saved items
        const progressResponse = await api.get('/users/me/progress');
        setUserProgress(progressResponse.data);
        
        // For now, use completed lessons as bookmarks count
        const bookmarks = progressResponse.data?.completed_lessons?.length || 0;

        setCounts({
          totalLessons,
          pendingQuestions,
          bookmarks,
        });
      } catch (error) {
        console.warn('Failed to fetch sidebar counts:', error);
        // Keep default values (0) on error
      }
    };

    fetchCounts();
    
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Calculate weekly progress
  const weeklyProgress = userProgress?.statistics?.completed_this_week || 0;
  const weeklyGoal = userProgress?.statistics?.weekly_goal || 7;
  const progressPercentage = weeklyGoal > 0 ? (weeklyProgress / weeklyGoal) * 100 : 0;

  return (
    <Box
      position="fixed"
      height="calc(100vh - 72px)"
      w={{ base: 'full', md: '280px' }}
      display={{ base: 'none', md: 'block' }}
      bg={sidebarBg}
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
          <VStack spacing={1} align="stretch">
            <NavItem 
              icon={FiHome} 
              to="/" 
              isActive={isActive('/')}
              tooltip="Your learning dashboard"
            >
              Dashboard
            </NavItem>
            
            <NavItem 
              icon={FiBook} 
              to="/lessons" 
              isActive={isActive('/lessons')}
              badge={counts.totalLessons > 0 ? counts.totalLessons : undefined}
              tooltip="Browse and take lessons"
            >
              Lessons
            </NavItem>
            
            <NavItem 
              icon={FiHelpCircle} 
              to="/qa" 
              isActive={isActive('/qa')}
              badge={counts.pendingQuestions > 0 ? counts.pendingQuestions : undefined}
              tooltip="Ask questions and get AI help"
            >
              Q&A
            </NavItem>
          </VStack>
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
            Tools
          </Text>
          <VStack spacing={1} align="stretch">
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
              badge={counts.bookmarks > 0 ? counts.bookmarks : undefined}
              tooltip="Your completed lessons"
            >
              Completed
            </NavItem>
          </VStack>
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
          <VStack spacing={1} align="stretch">
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
          </VStack>
        </Box>

        {/* Progress Summary */}
        {userProgress && (
          <Box
            bg={progressBg}
            p={4}
            borderRadius="lg"
            mx={2}
          >
            <Text fontSize="sm" fontWeight="600" mb={2} color={progressTextColor}>
              Weekly Goal
            </Text>
            <Text fontSize="xs" color={progressSubColor} mb={3}>
              {weeklyProgress} of {weeklyGoal} lessons
            </Text>
            <Box
              w="full"
              h="2"
              bg={progressBarBg}
              borderRadius="full"
              overflow="hidden"
            >
              <Box
                w={`${Math.min(progressPercentage, 100)}%`}
                h="full"
                bg="brand.500"
                borderRadius="full"
                transition="width 0.3s ease"
              />
            </Box>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default Sidebar;