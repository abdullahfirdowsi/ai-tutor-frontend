import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import { Box, Center, Spinner, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import api from './services/api';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Lesson from './pages/Lesson';
import LessonList from './pages/LessonList';
import QAInterface from './pages/QAInterface';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Components
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';
import ProtectedRoute from './components/routing/ProtectedRoute';

function App() {
  const { isInitialized } = useSupabaseAuth();

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <Center height="100vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }

  // Check if Supabase is configured
  const isSupabaseConfigured = api.service.isConfigured();

  return (
    <Box className="App">
      {/* Show warning if Supabase is not configured */}
      {!isSupabaseConfigured && (
        <Alert status="warning" position="fixed" top="0" zIndex="banner">
          <AlertIcon />
          <AlertTitle mr={2}>Database Not Connected!</AlertTitle>
          <AlertDescription>
            Please connect to Supabase using the "Connect to Supabase" button in the top right to enable full functionality.
          </AlertDescription>
        </Alert>
      )}
      
      <Box pt={!isSupabaseConfigured ? "60px" : "0"}>
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/lessons" element={<LessonList />} />
              <Route path="/lessons/:lessonId" element={<Lesson />} />
              <Route path="/qa" element={<QAInterface />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;