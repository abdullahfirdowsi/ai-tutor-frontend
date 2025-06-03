import React from 'react';
import {
  Box,
  Flex,
  Icon,
  Text,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FiHome, FiBook, FiHelpCircle, FiUser } from 'react-icons/fi';

interface NavItemProps {
  icon: React.ElementType;
  children: React.ReactNode;
  to: string;
  isActive: boolean;
}

const NavItem = ({ icon, children, to, isActive }: NavItemProps) => {
  const textColor = useColorModeValue('gray.600', 'gray.200');
  return (
    <Box
      as={RouterLink}
      to={to}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? 'brand.400' : 'transparent'}
        color={isActive ? 'white' : textColor}
        _hover={{
          bg: 'brand.500',
          color: 'white',
        }}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: 'white',
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Box>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <Box
      position="fixed"
      height="calc(100vh - 60px)"
      w={{ base: 'full', md: 60 }}
      display={{ base: 'none', md: 'block' }}
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      pt={4}
    >
      <Stack spacing={0} align="stretch">
        <NavItem 
          icon={FiHome} 
          to="/" 
          isActive={location.pathname === '/'}
        >
          Dashboard
        </NavItem>
        
        <NavItem 
          icon={FiBook} 
          to="/lessons" 
          isActive={location.pathname.startsWith('/lessons')}
        >
          Lessons
        </NavItem>
        
        <NavItem 
          icon={FiHelpCircle} 
          to="/qa" 
          isActive={location.pathname.startsWith('/qa')}
        >
          Q&A
        </NavItem>
        
        <NavItem 
          icon={FiUser} 
          to="/profile" 
          isActive={location.pathname.startsWith('/profile')}
        >
          Profile
        </NavItem>
      </Stack>
    </Box>
  );
};

export default Sidebar;

