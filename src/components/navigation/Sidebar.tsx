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
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiBook, 
  FiHelpCircle, 
  FiUser, 
  FiTrendingUp,
  FiSettings,
  FiBookmark,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import api from '../../services/api';

interface NavItemProps {
  icon: React.ElementType;
  children: React.ReactNode;
  to: string;
  isActive: boolean;
  badge?: string | number;
  tooltip?: string;
  isCollapsed?: boolean;
}

interface SidebarCounts {
  userLessons: number;
  availableLessons: number;
  userQuestions: number;
  completedLessons: number;
}

const NavItem = ({ icon, children, to, isActive, badge, tooltip, isCollapsed }: NavItemProps) => {
  // Call all hooks at the top level, unconditionally
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
        justify={isCollapsed ? 'center' : 'flex-start'}
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
          mr={isCollapsed ? "0" : "3"}
          fontSize="18"
          as={icon}
          transition="all 0.2s"
        />
        
        {!isCollapsed && (
          <>
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
          </>
        )}
      </Flex>
    </Box>
  );

  if (tooltip && isCollapsed) {
    return (
      <Tooltip label={`${children}${badge ? ` (${badge})` : ''}`} placement="right" hasArrow>
        {content}
      </Tooltip>
    );
  }
  
  if (tooltip) {
    return (
      <Tooltip label={tooltip} placement="right" hasArrow>
        {content}
      </Tooltip>
    );
  }
  
  return content;
};

const Sidebar: React.FC = () => {
  // Call all hooks at the top level, unconditionally
  const location = useLocation();
  const { isOpen: isCollapsed, onToggle } = useDisclosure();
  const [counts, setCounts] = useState<SidebarCounts>({
    userLessons: 0,
    availableLessons: 0,
    userQuestions: 0,
    completedLessons: 0,
  });
  const [userProgress, setUserProgress] = useState<any>(null);
  
  const sidebarBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const progressTextColor = useColorModeValue('brand.700', 'brand.300');
  const progressSubColor = useColorModeValue('gray.600', 'gray.400');
  const progressBarBg = useColorModeValue('brand.100', 'brand.800');

  // Fetch real-time user-specific counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const progressResponse = await api.get('/users/me/progress');
        const progressData = progressResponse.data;
        setUserProgress(progressData);

        const completedLessons = progressData?.completed_lessons?.length || 0;

        const qaResponse = await api.get('/qa/history?limit=1');
        const userQuestions = qaResponse.data.total || 0;

        const lessonsResponse = await api.get('/lessons?limit=1');
        const availableLessons = lessonsResponse.data.total || 0;

        let userLessons = 0;
        try {
          const userLessonsResponse = await api.get('/lessons/my-lessons?limit=1');
          userLessons = userLessonsResponse.data.total || 0;
        } catch (error) {
          console.warn('User-specific lessons endpoint not available');
        }

        setCounts({
          userLessons,
          availableLessons,
          userQuestions,
          completedLessons,
        });
      } catch (error) {
        console.warn('Failed to fetch sidebar counts:', error);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const weeklyProgress = userProgress?.statistics?.completed_this_week || 0;
  const weeklyGoal = userProgress?.statistics?.weekly_goal || 7;
  const progressPercentage = weeklyGoal > 0 ? (weeklyProgress / weeklyGoal) * 100 : 0;

  const sidebarWidth = isCollapsed ? '80px' : '200px';

  // Update CSS variable for MainLayout
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', sidebarWidth);
  }, [sidebarWidth]);

  return (
    <Box
      position="fixed"
      height="calc(100vh - 72px)"
      w={{ base: 'full', md: sidebarWidth }}
      display={{ base: 'none', md: 'block' }}
      bg={sidebarBg}
      borderRight="1px"
      borderRightColor={borderColor}
      pt={4}
      pb={4}
      overflowY="auto"
      boxShadow="sm"
      transition="width 0.3s ease"
    >
      <VStack spacing={4} align="stretch" px={2}>
        {/* Collapse Toggle */}
        <Flex justify={isCollapsed ? 'center' : 'flex-end'} px={2}>
          <IconButton
            aria-label="Toggle sidebar"
            icon={<Icon as={isCollapsed ? FiChevronRight : FiChevronLeft} />}
            size="sm"
            variant="ghost"
            onClick={onToggle}
          />
        </Flex>

        {/* Main Navigation */}
        <Box>
          {!isCollapsed && (
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
          )}
          <VStack spacing={1} align="stretch">
            <NavItem 
              icon={FiHome} 
              to="/" 
              isActive={isActive('/')}
              tooltip="Dashboard"
              isCollapsed={isCollapsed}
            >
              Dashboard
            </NavItem>
            
            <NavItem 
              icon={FiBook} 
              to="/lessons" 
              isActive={isActive('/lessons')}
              badge={counts.availableLessons > 0 ? counts.availableLessons : undefined}
              tooltip={`${counts.availableLessons} lessons available`}
              isCollapsed={isCollapsed}
            >
              Lessons
            </NavItem>
            
            <NavItem 
              icon={FiHelpCircle} 
              to="/qa" 
              isActive={isActive('/qa')}
              badge={counts.userQuestions > 0 ? counts.userQuestions : undefined}
              tooltip={`${counts.userQuestions} questions asked`}
              isCollapsed={isCollapsed}
            >
              Q&A
            </NavItem>
          </VStack>
        </Box>

        {!isCollapsed && <Divider />}

        {/* Progress */}
        <Box>
          {!isCollapsed && (
            <Text
              fontSize="xs"
              fontWeight="bold"
              color={labelColor}
              textTransform="uppercase"
              letterSpacing="wide"
              mb={3}
              px={2}
            >
              Progress
            </Text>
          )}
          <VStack spacing={1} align="stretch">
            <NavItem 
              icon={FiTrendingUp} 
              to="/analytics" 
              isActive={isActive('/analytics')}
              tooltip="Analytics"
              isCollapsed={isCollapsed}
            >
              Analytics
            </NavItem>
            
            <NavItem 
              icon={FiBookmark} 
              to="/completed" 
              isActive={isActive('/completed')}
              badge={counts.completedLessons > 0 ? counts.completedLessons : undefined}
              tooltip={`${counts.completedLessons} completed`}
              isCollapsed={isCollapsed}
            >
              Completed
            </NavItem>
          </VStack>
        </Box>

        {!isCollapsed && <Divider />}

        {/* Account */}
        <Box>
          {!isCollapsed && (
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
          )}
          <VStack spacing={1} align="stretch">
            <NavItem 
              icon={FiUser} 
              to="/profile" 
              isActive={isActive('/profile')}
              tooltip="Profile"
              isCollapsed={isCollapsed}
            >
              Profile
            </NavItem>
            
            <NavItem 
              icon={FiSettings} 
              to="/settings" 
              isActive={isActive('/settings')}
              tooltip="Settings"
              isCollapsed={isCollapsed}
            >
              Settings
            </NavItem>
          </VStack>
        </Box>

        {/* Weekly Goal Progress - only show when expanded */}
        {!isCollapsed && userProgress && (
          <Box
            bg={useColorModeValue('brand.50', 'brand.900')}
            p={3}
            borderRadius="lg"
            mx={2}
          >
            <Text fontSize="xs" fontWeight="600" mb={2} color={progressTextColor}>
              Weekly Goal
            </Text>
            <Text fontSize="xs" color={progressSubColor} mb={2}>
              {weeklyProgress}/{weeklyGoal}
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