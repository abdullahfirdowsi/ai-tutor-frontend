import React from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
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
  Image,
} from '@chakra-ui/react';
import { 
  HamburgerIcon, 
  CloseIcon, 
  MoonIcon, 
  SunIcon, 
  ChevronDownIcon,
  BellIcon 
} from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Move all hooks to the top
  const bg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const logoColor = useColorModeValue('brand.600', 'brand.300');
  const textColor = useColorModeValue('gray.600', 'white');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  // Choose logo based on color mode
  const logoSrc = colorMode === 'dark' ? '/aitutor-short-dark.png' : '/aitutor-short-no-bg.png';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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
        backdropFilter="blur(20px)"
        boxShadow="gradient-sm"
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
            <Image
              src={logoSrc}
              alt="AI Tutor Logo"
              w="40px"
              h="40px"
              borderRadius="lg"
              transition="all 0.3s ease"
              _hover={{ transform: 'scale(1.05)' }}
            />
            <Text
              textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
              fontFamily={'heading'}
              bgGradient="linear(135deg, #A855F7 0%, #3B82F6 100%)"
              bgClip="text"
              fontWeight="bold"
              fontSize="xl"
              as={RouterLink}
              to="/"
              _hover={{ textDecoration: 'none', transform: 'scale(1.02)' }}
              transition="all 0.3s ease"
            >
              AI Tutor
            </Text>
          </HStack>
        </Flex>

        {/* Right side - only user actions, no navigation menu */}
        <HStack spacing={4} justify="flex-end">
          {/* Notifications */}
          <Tooltip label="Notifications" hasArrow>
            <IconButton
              aria-label="Notifications"
              icon={<BellIcon />}
              variant="ghost"
              size="sm"
              position="relative"
              _hover={{ bg: hoverBg }}
              borderRadius="xl"
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
                bgGradient="linear(135deg, #EF4444 0%, #DC2626 100%)"
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
              borderRadius="xl"
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
                borderRadius="xl"
              >
                <HStack spacing={2}>
                  <Avatar 
                    size="sm" 
                    name={currentUser.displayName || undefined} 
                    src={currentUser.photoURL || undefined}
                    border="2px solid"
                    borderColor="brand.200"
                  />
                  <Text display={{ base: 'none', lg: 'block' }} fontSize="sm" fontWeight="medium">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </Text>
                </HStack>
              </MenuButton>
              <MenuList borderRadius="xl" border="1px solid" borderColor={borderColor} boxShadow="gradient-md">
                <MenuItem as={RouterLink} to="/profile" borderRadius="lg" _hover={{ bg: hoverBg }}>
                  Profile Settings
                </MenuItem>
                <MenuItem as={RouterLink} to="/analytics" borderRadius="lg" _hover={{ bg: hoverBg }}>
                  Learning Analytics
                </MenuItem>
                <MenuItem borderRadius="lg" _hover={{ bg: hoverBg }}>
                  Help & Support
                </MenuItem>
                <MenuItem onClick={handleLogout} color="red.500" borderRadius="lg" _hover={{ bg: 'red.50' }}>
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
      
      {/* Space to prevent content from hiding behind fixed navbar */}
      <Box height="72px" />
    </Box>
  );
};

const MobileNav: React.FC = () => {
  // Move hooks to the top
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box
      bg={bg}
      p={4}
      display={{ md: 'none' }}
      borderBottom={1}
      borderColor={borderColor}
    >
      <Text fontSize="sm" color="gray.500" textAlign="center">
        Use the sidebar for navigation on larger screens
      </Text>
    </Box>
  );
};

export default Navbar;