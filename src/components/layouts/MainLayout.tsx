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
        <Box flex="1" p={4} ml={{ base: 0, md: '280px' }}>
          <Outlet />
        </Box>
      </Flex>
    </Box>
  );
};

export default MainLayout;