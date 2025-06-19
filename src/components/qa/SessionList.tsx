import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Icon,
  useColorModeValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
} from '@chakra-ui/react';
import { FiMessageCircle, FiClock, FiBook, FiMoreVertical, FiEdit, FiTrash2 } from 'react-icons/fi';
import { QASession } from '../../types/qa';

interface SessionListProps {
  sessions: QASession[];
  activeSessionId?: string;
  onSessionSelect: (session: QASession) => void;
  onSessionEdit: (session: QASession) => void;
  onSessionDelete: (sessionId: string) => void;
  isLoading?: boolean;
}

const SessionList: React.FC<SessionListProps> = ({
  sessions,
  activeSessionId,
  onSessionSelect,
  onSessionEdit,
  onSessionDelete,
  isLoading = false,
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  const activeBg = useColorModeValue('brand.50', 'brand.900');
  const activeColor = useColorModeValue('brand.600', 'brand.300');
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 168) { // 7 days
        return date.toLocaleDateString([], { weekday: 'short' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch {
      return '';
    }
  };
  
  const truncateTitle = (title: string, maxLength = 40) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  if (sessions.length === 0) {
    return (
      <Box textAlign="center" py={8} color="gray.500">
        <Icon as={FiMessageCircle} boxSize={8} mb={3} />
        <Text fontWeight="medium">No conversations yet</Text>
        <Text fontSize="sm" mt={1}>
          Start a new conversation to begin
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={2} align="stretch">
      {sessions.map((session) => {
        const isActive = session.id === activeSessionId;
        
        return (
          <Box
            key={session.id}
            p={3}
            borderRadius="lg"
            bg={isActive ? activeBg : cardBg}
            borderWidth="1px"
            borderColor={isActive ? 'brand.200' : 'transparent'}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ 
              bg: isActive ? activeBg : hoverBg,
              transform: 'translateY(-1px)',
              boxShadow: 'sm'
            }}
            onClick={() => onSessionSelect(session)}
            position="relative"
          >
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={1} flex={1} minW={0}>
                <Text
                  fontWeight={isActive ? "600" : "medium"}
                  color={isActive ? activeColor : undefined}
                  fontSize="sm"
                  noOfLines={2}
                  lineHeight="short"
                >
                  {truncateTitle(session.title)}
                </Text>
                
                {session.topic && (
                  <Text fontSize="xs" color="gray.500" noOfLines={1}>
                    {session.topic}
                  </Text>
                )}
                
                <HStack spacing={3} fontSize="xs" color="gray.500">
                  <HStack spacing={1}>
                    <Icon as={FiMessageCircle} />
                    <Text>{session.message_count}</Text>
                  </HStack>
                  
                  <HStack spacing={1}>
                    <Icon as={FiClock} />
                    <Text>{formatDate(session.updated_at)}</Text>
                  </HStack>
                  
                  {session.lesson_id && (
                    <Tooltip label="Lesson context" hasArrow>
                      <HStack spacing={1}>
                        <Icon as={FiBook} color="blue.500" />
                      </HStack>
                    </Tooltip>
                  )}
                </HStack>
              </VStack>
              
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FiMoreVertical />}
                  size="xs"
                  variant="ghost"
                  onClick={(e) => e.stopPropagation()}
                  opacity={0.7}
                  _hover={{ opacity: 1 }}
                />
                <MenuList>
                  <MenuItem 
                    icon={<FiEdit />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSessionEdit(session);
                    }}
                  >
                    Edit Title
                  </MenuItem>
                  <MenuItem 
                    icon={<FiTrash2 />} 
                    color="red.500"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSessionDelete(session.id);
                    }}
                  >
                    Delete
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
            
            {session.is_active && (
              <Badge
                position="absolute"
                top={2}
                right={2}
                colorScheme="green"
                variant="solid"
                size="sm"
              >
                Active
              </Badge>
            )}
          </Box>
        );
      })}
    </VStack>
  );
};

export default SessionList;