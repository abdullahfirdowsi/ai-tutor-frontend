import React from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  HStack,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { 
  HamburgerIcon, 
  CloseIcon, 
  MoonIcon, 
  SunIcon, 
  ChevronDownIcon,
  BellIcon 
} from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Move all hooks to the top
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const logoColor = useColorModeValue('brand.600', 'brand.300');
  const textColor = useColorModeValue('gray.600', 'white');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box>
      <Flex
        bg={bg}
        color={textColor}
        minH={'72px'}
        py={{ base: 2 }}
        px={{ base: 4, md: 8 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={borderColor}
        align={'center'}
        position="fixed"
        top="0"
        width="100%"
        zIndex="sticky"
        backdropFilter="blur(10px)"
        boxShadow="sm"
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
            _hover={{ bg: hoverBg }}
          />
        </Flex>
        
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }} align="center">
          <HStack spacing={3}>
            <Box
              w="40px"
              h="40px"
              bg="brand.500"
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
              fontWeight="bold"
              fontSize="lg"
            >
              AI
            </Box>
            <Text
              textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
              fontFamily={'heading'}
              color={logoColor}
              fontWeight="bold"
              fontSize="xl"
              as={RouterLink}
              to="/"
              _hover={{ textDecoration: 'none', color: 'brand.500' }}
            >
              AI Tutor Pro
            </Text>
          </HStack>
        </Flex>

        {/* Desktop Navigation */}
        <HStack
          spacing={8}
          display={{ base: 'none', md: 'flex' }}
          flex={1}
          justify="center"
        >
          <NavLink to="/" isActive={isActive('/')}>Dashboard</NavLink>
          <NavLink to="/lessons" isActive={isActive('/lessons') || location.pathname.startsWith('/lessons')}>
            Lessons
          </NavLink>
          <NavLink to="/qa" isActive={isActive('/qa')}>Q&A</NavLink>
        </HStack>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={4}
          align="center"
        >
          {/* Notifications */}
          <Tooltip label="Notifications" hasArrow>
            <IconButton
              aria-label="Notifications"
              icon={<BellIcon />}
              variant="ghost"
              size="sm"
              position="relative"
              _hover={{ bg: hoverBg }}
            >
              <Badge
                colorScheme="red"
                variant="solid"
                borderRadius="full"
                position="absolute"
                top="-1"
                right="-1"
                fontSize="xs"
                minW="18px"
                h="18px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                3
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Color mode toggle */}
          <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`} hasArrow>
            <IconButton
              aria-label="Toggle color mode"
              onClick={toggleColorMode}
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              variant="ghost"
              size="sm"
              _hover={{ bg: hoverBg }}
            />
          </Tooltip>
          
          {currentUser && (
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                variant="ghost"
                size="sm"
                _hover={{ bg: hoverBg }}
              >
                <HStack spacing={2}>
                  <Avatar 
                    size="sm" 
                    name={currentUser.displayName || undefined} 
                    src={currentUser.photoURL || undefined}
                  />
                  <Text display={{ base: 'none', lg: 'block' }} fontSize="sm" fontWeight="medium">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </Text>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to="/profile">Profile Settings</MenuItem>
                <MenuItem>Learning Analytics</MenuItem>
                <MenuItem>Help & Support</MenuItem>
                <MenuItem onClick={handleLogout} color="red.500">Sign Out</MenuItem>
              </MenuList>
            </Menu>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
      
      {/* Space to prevent content from hiding behind fixed navbar */}
      <Box height="72px" />
    </Box>
  );
};

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  isActive: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, isActive }) => {
  // Move hooks to the top
  const activeColor = useColorModeValue('brand.600', 'brand.300');
  const hoverColor = useColorModeValue('brand.500', 'brand.400');
  const inactiveColor = useColorModeValue('gray.600', 'gray.300');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  
  return (
    <Text
      as={RouterLink}
      to={to}
      px={3}
      py={2}
      borderRadius="md"
      fontWeight={isActive ? '600' : '500'}
      color={isActive ? activeColor : inactiveColor}
      _hover={{
        textDecoration: 'none',
        color: hoverColor,
        bg: hoverBg,
      }}
      transition="all 0.2s"
    >
      {children}
    </Text>
  );
};

const MobileNav: React.FC = () => {
  const location = useLocation();
  
  // Move hooks to the top
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <Stack
      bg={bg}
      p={4}
      display={{ md: 'none' }}
      borderBottom={1}
      borderColor={borderColor}
      spacing={4}
    >
      <MobileNavLink to="/" isActive={isActive('/')}>Dashboard</MobileNavLink>
      <MobileNavLink to="/lessons" isActive={isActive('/lessons')}>Lessons</MobileNavLink>
      <MobileNavLink to="/qa" isActive={isActive('/qa')}>Q&A</MobileNavLink>
      <MobileNavLink to="/profile" isActive={isActive('/profile')}>Profile</MobileNavLink>
    </Stack>
  );
};

interface MobileNavLinkProps {
  to: string;
  children: React.ReactNode;
  isActive: boolean;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, children, isActive }) => {
  // Move hooks to the top
  const activeColor = useColorModeValue('brand.600', 'brand.300');
  const inactiveColor = useColorModeValue('gray.600', 'gray.300');
  const hoverColor = useColorModeValue('brand.500', 'brand.400');
  
  return (
    <Text
      as={RouterLink}
      to={to}
      py={2}
      fontWeight={isActive ? '600' : '500'}
      color={isActive ? activeColor : inactiveColor}
      _hover={{
        textDecoration: 'none',
        color: hoverColor,
      }}
    >
      {children}
    </Text>
  );
};

export default Navbar;