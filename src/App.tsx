import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';

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
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Box className="App">
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
    </ErrorBoundary>
  );
}

export default App;