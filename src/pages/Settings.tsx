import React, { useState, useEffect } from 'react';
import {
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  FormControl,
  FormLabel,
  Switch,
  Select,
  Input,
  Button,
  Divider,
  useToast,
  useColorMode,
  Icon,
  Badge,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiSettings,
  FiUser,
  FiBell,
  FiShield,
  FiMoon,
  FiSun,
  FiGlobe,
  FiTarget,
  FiBook,
  FiSave,
  FiRefreshCw,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface UserSettings {
  // Learning Preferences
  learning_preferences: {
    difficulty_preference: 'beginner' | 'intermediate' | 'advanced' | 'adaptive';
    lesson_duration_preference: number; // minutes
    daily_goal: number; // lessons per day
    weekly_goal: number; // lessons per week
    preferred_subjects: string[];
    learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    ai_assistance_level: 'minimal' | 'moderate' | 'extensive';
  };
  
  // Notification Settings
  notifications: {
    email_notifications: boolean;
    push_notifications: boolean;
    daily_reminders: boolean;
    weekly_progress_reports: boolean;
    achievement_notifications: boolean;
    lesson_recommendations: boolean;
    reminder_time: string; // HH:MM format
  };
  
  // Privacy Settings
  privacy: {
    profile_visibility: 'public' | 'private';
    share_progress: boolean;
    data_collection: boolean;
    analytics_tracking: boolean;
  };
  
  // Accessibility Settings
  accessibility: {
    font_size: 'small' | 'medium' | 'large' | 'extra-large';
    high_contrast: boolean;
    reduce_motion: boolean;
    screen_reader_support: boolean;
  };
  
  // Language & Region
  localization: {
    language: string;
    timezone: string;
    date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    time_format: '12h' | '24h';
  };
}

const Settings: React.FC = () => {
  const { currentUser } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const sectionBg = useColorModeValue('gray.50', 'gray.800');
  
  const [settings, setSettings] = useState<UserSettings>({
    learning_preferences: {
      difficulty_preference: 'adaptive',
      lesson_duration_preference: 30,
      daily_goal: 2,
      weekly_goal: 10,
      preferred_subjects: ['Mathematics', 'Physics'],
      learning_style: 'visual',
      ai_assistance_level: 'moderate',
    },
    notifications: {
      email_notifications: true,
      push_notifications: true,
      daily_reminders: true,
      weekly_progress_reports: true,
      achievement_notifications: true,
      lesson_recommendations: true,
      reminder_time: '09:00',
    },
    privacy: {
      profile_visibility: 'private',
      share_progress: false,
      data_collection: true,
      analytics_tracking: true,
    },
    accessibility: {
      font_size: 'medium',
      high_contrast: false,
      reduce_motion: false,
      screen_reader_support: false,
    },
    localization: {
      language: 'en',
      timezone: 'UTC',
      date_format: 'MM/DD/YYYY',
      time_format: '12h',
    },
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/users/me/settings');
      setSettings(response.data);
    } catch (error) {
      console.warn('Failed to fetch settings, using defaults:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      await api.put('/users/me/settings', settings);
      setHasChanges(false);
      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Failed to save settings',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      setHasChanges(true);
      return newSettings;
    });
  };

  const resetToDefaults = () => {
    setSettings({
      learning_preferences: {
        difficulty_preference: 'adaptive',
        lesson_duration_preference: 30,
        daily_goal: 2,
        weekly_goal: 10,
        preferred_subjects: [],
        learning_style: 'visual',
        ai_assistance_level: 'moderate',
      },
      notifications: {
        email_notifications: true,
        push_notifications: true,
        daily_reminders: true,
        weekly_progress_reports: true,
        achievement_notifications: true,
        lesson_recommendations: true,
        reminder_time: '09:00',
      },
      privacy: {
        profile_visibility: 'private',
        share_progress: false,
        data_collection: true,
        analytics_tracking: true,
      },
      accessibility: {
        font_size: 'medium',
        high_contrast: false,
        reduce_motion: false,
        screen_reader_support: false,
      },
      localization: {
        language: 'en',
        timezone: 'UTC',
        date_format: 'MM/DD/YYYY',
        time_format: '12h',
      },
    });
    setHasChanges(true);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={2}>
            <Heading as="h1" size="2xl" color="brand.600">
              Settings
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Customize your learning experience
            </Text>
          </VStack>
          
          <HStack spacing={4}>
            <Button
              leftIcon={<FiRefreshCw />}
              onClick={resetToDefaults}
              variant="outline"
            >
              Reset to Defaults
            </Button>
            <Button
              leftIcon={<FiSave />}
              onClick={saveSettings}
              colorScheme="brand"
              isLoading={isLoading}
              loadingText="Saving..."
              isDisabled={!hasChanges}
            >
              Save Changes
            </Button>
          </HStack>
        </HStack>

        {hasChanges && (
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <AlertTitle mr={2}>Unsaved Changes</AlertTitle>
            <AlertDescription>
              You have unsaved changes. Don't forget to save your preferences.
            </AlertDescription>
          </Alert>
        )}

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Learning Preferences */}
          <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
            <CardHeader>
              <HStack>
                <Icon as={FiBook} color="brand.500" />
                <Heading size="md">Learning Preferences</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <FormControl>
                  <FormLabel>Difficulty Preference</FormLabel>
                  <Select
                    value={settings.learning_preferences.difficulty_preference}
                    onChange={(e) => updateSetting('learning_preferences.difficulty_preference', e.target.value)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="adaptive">Adaptive (Recommended)</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Preferred Lesson Duration</FormLabel>
                  <HStack>
                    <Slider
                      value={settings.learning_preferences.lesson_duration_preference}
                      onChange={(value) => updateSetting('learning_preferences.lesson_duration_preference', value)}
                      min={15}
                      max={120}
                      step={15}
                      flex={1}
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                    <Text minW="60px">{settings.learning_preferences.lesson_duration_preference} min</Text>
                  </HStack>
                </FormControl>

                <SimpleGrid columns={2} spacing={4}>
                  <FormControl>
                    <FormLabel>Daily Goal</FormLabel>
                    <NumberInput
                      value={settings.learning_preferences.daily_goal}
                      onChange={(_, value) => updateSetting('learning_preferences.daily_goal', value)}
                      min={1}
                      max={10}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Weekly Goal</FormLabel>
                    <NumberInput
                      value={settings.learning_preferences.weekly_goal}
                      onChange={(_, value) => updateSetting('learning_preferences.weekly_goal', value)}
                      min={1}
                      max={50}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Learning Style</FormLabel>
                  <Select
                    value={settings.learning_preferences.learning_style}
                    onChange={(e) => updateSetting('learning_preferences.learning_style', e.target.value)}
                  >
                    <option value="visual">Visual</option>
                    <option value="auditory">Auditory</option>
                    <option value="kinesthetic">Kinesthetic</option>
                    <option value="reading">Reading/Writing</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>AI Assistance Level</FormLabel>
                  <Select
                    value={settings.learning_preferences.ai_assistance_level}
                    onChange={(e) => updateSetting('learning_preferences.ai_assistance_level', e.target.value)}
                  >
                    <option value="minimal">Minimal - Let me figure it out</option>
                    <option value="moderate">Moderate - Guide me when needed</option>
                    <option value="extensive">Extensive - Help me every step</option>
                  </Select>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          {/* Notifications */}
          <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
            <CardHeader>
              <HStack>
                <Icon as={FiBell} color="brand.500" />
                <Heading size="md">Notifications</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="email-notifications" mb="0" flex={1}>
                    Email Notifications
                  </FormLabel>
                  <Switch
                    id="email-notifications"
                    isChecked={settings.notifications.email_notifications}
                    onChange={(e) => updateSetting('notifications.email_notifications', e.target.checked)}
                    colorScheme="brand"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="push-notifications" mb="0" flex={1}>
                    Push Notifications
                  </FormLabel>
                  <Switch
                    id="push-notifications"
                    isChecked={settings.notifications.push_notifications}
                    onChange={(e) => updateSetting('notifications.push_notifications', e.target.checked)}
                    colorScheme="brand"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="daily-reminders" mb="0" flex={1}>
                    Daily Study Reminders
                  </FormLabel>
                  <Switch
                    id="daily-reminders"
                    isChecked={settings.notifications.daily_reminders}
                    onChange={(e) => updateSetting('notifications.daily_reminders', e.target.checked)}
                    colorScheme="brand"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="weekly-reports" mb="0" flex={1}>
                    Weekly Progress Reports
                  </FormLabel>
                  <Switch
                    id="weekly-reports"
                    isChecked={settings.notifications.weekly_progress_reports}
                    onChange={(e) => updateSetting('notifications.weekly_progress_reports', e.target.checked)}
                    colorScheme="brand"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="achievements" mb="0" flex={1}>
                    Achievement Notifications
                  </FormLabel>
                  <Switch
                    id="achievements"
                    isChecked={settings.notifications.achievement_notifications}
                    onChange={(e) => updateSetting('notifications.achievement_notifications', e.target.checked)}
                    colorScheme="brand"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Daily Reminder Time</FormLabel>
                  <Input
                    type="time"
                    value={settings.notifications.reminder_time}
                    onChange={(e) => updateSetting('notifications.reminder_time', e.target.value)}
                  />
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          {/* Privacy & Security */}
          <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
            <CardHeader>
              <HStack>
                <Icon as={FiShield} color="brand.500" />
                <Heading size="md">Privacy & Security</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <FormControl>
                  <FormLabel>Profile Visibility</FormLabel>
                  <Select
                    value={settings.privacy.profile_visibility}
                    onChange={(e) => updateSetting('privacy.profile_visibility', e.target.value)}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </Select>
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="share-progress" mb="0" flex={1}>
                    Share Progress with Community
                  </FormLabel>
                  <Switch
                    id="share-progress"
                    isChecked={settings.privacy.share_progress}
                    onChange={(e) => updateSetting('privacy.share_progress', e.target.checked)}
                    colorScheme="brand"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="data-collection" mb="0" flex={1}>
                    Allow Data Collection for Improvement
                  </FormLabel>
                  <Switch
                    id="data-collection"
                    isChecked={settings.privacy.data_collection}
                    onChange={(e) => updateSetting('privacy.data_collection', e.target.checked)}
                    colorScheme="brand"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="analytics-tracking" mb="0" flex={1}>
                    Analytics Tracking
                  </FormLabel>
                  <Switch
                    id="analytics-tracking"
                    isChecked={settings.privacy.analytics_tracking}
                    onChange={(e) => updateSetting('privacy.analytics_tracking', e.target.checked)}
                    colorScheme="brand"
                  />
                </FormControl>

                <Alert status="info" borderRadius="md" size="sm">
                  <AlertIcon />
                  <Text fontSize="sm">
                    We use this data to personalize your learning experience and improve our AI tutor.
                  </Text>
                </Alert>
              </VStack>
            </CardBody>
          </Card>

          {/* Appearance & Accessibility */}
          <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
            <CardHeader>
              <HStack>
                <Icon as={colorMode === 'light' ? FiSun : FiMoon} color="brand.500" />
                <Heading size="md">Appearance & Accessibility</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="dark-mode" mb="0" flex={1}>
                    Dark Mode
                  </FormLabel>
                  <Switch
                    id="dark-mode"
                    isChecked={colorMode === 'dark'}
                    onChange={toggleColorMode}
                    colorScheme="brand"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Font Size</FormLabel>
                  <Select
                    value={settings.accessibility.font_size}
                    onChange={(e) => updateSetting('accessibility.font_size', e.target.value)}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                  </Select>
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="high-contrast" mb="0" flex={1}>
                    High Contrast Mode
                  </FormLabel>
                  <Switch
                    id="high-contrast"
                    isChecked={settings.accessibility.high_contrast}
                    onChange={(e) => updateSetting('accessibility.high_contrast', e.target.checked)}
                    colorScheme="brand"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="reduce-motion" mb="0" flex={1}>
                    Reduce Motion
                  </FormLabel>
                  <Switch
                    id="reduce-motion"
                    isChecked={settings.accessibility.reduce_motion}
                    onChange={(e) => updateSetting('accessibility.reduce_motion', e.target.checked)}
                    colorScheme="brand"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="screen-reader" mb="0" flex={1}>
                    Screen Reader Support
                  </FormLabel>
                  <Switch
                    id="screen-reader"
                    isChecked={settings.accessibility.screen_reader_support}
                    onChange={(e) => updateSetting('accessibility.screen_reader_support', e.target.checked)}
                    colorScheme="brand"
                  />
                </FormControl>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Language & Region */}
        <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
          <CardHeader>
            <HStack>
              <Icon as={FiGlobe} color="brand.500" />
              <Heading size="md">Language & Region</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
              <FormControl>
                <FormLabel>Language</FormLabel>
                <Select
                  value={settings.localization.language}
                  onChange={(e) => updateSetting('localization.language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="zh">中文</option>
                  <option value="ja">日本語</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Timezone</FormLabel>
                <Select
                  value={settings.localization.timezone}
                  onChange={(e) => updateSetting('localization.timezone', e.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Date Format</FormLabel>
                <Select
                  value={settings.localization.date_format}
                  onChange={(e) => updateSetting('localization.date_format', e.target.value)}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Time Format</FormLabel>
                <Select
                  value={settings.localization.time_format}
                  onChange={(e) => updateSetting('localization.time_format', e.target.value)}
                >
                  <option value="12h">12 Hour</option>
                  <option value="24h">24 Hour</option>
                </Select>
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Save Button */}
        <HStack justify="center" pt={4}>
          <Button
            leftIcon={<FiSave />}
            onClick={saveSettings}
            colorScheme="brand"
            size="lg"
            isLoading={isLoading}
            loadingText="Saving Settings..."
            isDisabled={!hasChanges}
          >
            Save All Settings
          </Button>
        </HStack>
      </VStack>
    </Container>
  );
};

export default Settings;