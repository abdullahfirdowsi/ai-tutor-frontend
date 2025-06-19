import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import Navbar from '../navigation/Navbar';
import Sidebar from '../navigation/Sidebar';

const MainLayout: React.FC = () => {
  return (
    <Box minHeight="100vh">
      <Navbar />
      <Flex>
        <Sidebar />
        <Box 
          flex="1" 
          p={4} 
          ml={{ base: 0, md: '240px' }} // Default width, will be overridden by sidebar state
          transition="margin-left 0.3s ease"
          style={{
            marginLeft: 'var(--sidebar-width, 240px)'
          }}
        >
          <Outlet />
        </Box>
      </Flex>
    </Box>
  );
};

export default MainLayout;