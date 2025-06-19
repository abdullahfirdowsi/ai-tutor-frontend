import { supabase } from '../lib/supabase';
import { userService, lessonService, progressService, qaService, aiService } from './supabaseService';
import { auth } from '../firebase';

// Enhanced API service that uses Supabase instead of external backend
class ApiService {
  private async getCurrentUserId(): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.uid;
  }

  // User endpoints
  async getUser() {
    const userId = await this.getCurrentUserId();
    return { data: await userService.getUser(userId) };
  }

  async updateUser(userData: { display_name?: string; avatar_url?: string }) {
    const userId = await this.getCurrentUserId();
    return { data: await userService.updateUser(userId, userData) };
  }

  async createUserProfile() {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const userData = {
      id: user.uid,
      email: user.email!,
      display_name: user.displayName,
      avatar_url: user.photoURL,
    };

    return { data: await userService.createUser(userData) };
  }

  // Lesson endpoints
  async getLessons(params?: { subject?: string; difficulty?: string; limit?: number }) {
    const lessons = await lessonService.getLessons(params);
    return {
      data: {
        lessons,
        total: lessons.length,
        skip: 0,
        limit: params?.limit || 50
      }
    };
  }

  async getLesson(lessonId: string) {
    return { data: await lessonService.getLesson(lessonId) };
  }

  async generateLesson(lessonData: {
    subject: string;
    topic: string;
    difficulty: string;
    duration_minutes: number;
    additional_instructions?: string;
  }) {
    const userId = await this.getCurrentUserId();
    
    // Generate lesson content (mock implementation)
    const generatedLesson = {
      title: `${lessonData.topic} - ${lessonData.difficulty} Level`,
      subject: lessonData.subject,
      topic: lessonData.topic,
      difficulty: lessonData.difficulty,
      duration_minutes: lessonData.duration_minutes,
      content: [
        {
          title: "Introduction",
          content: `# Introduction to ${lessonData.topic}\n\nWelcome to this ${lessonData.difficulty} level lesson on ${lessonData.topic}. In this lesson, you'll learn the fundamental concepts and practical applications.\n\n## Learning Objectives\n- Understand the core principles\n- Apply concepts to real-world scenarios\n- Practice with hands-on exercises`,
          order: 1,
          type: "text"
        },
        {
          title: "Core Concepts",
          content: `# Core Concepts\n\nLet's dive into the main concepts of ${lessonData.topic}:\n\n## Key Principles\n1. **Foundation**: Understanding the basics\n2. **Application**: How to use these concepts\n3. **Best Practices**: Industry standards and recommendations\n\n${lessonData.additional_instructions ? `\n## Additional Focus Areas\n${lessonData.additional_instructions}` : ''}`,
          order: 2,
          type: "text"
        },
        {
          title: "Practical Examples",
          content: `# Practical Examples\n\nHere are some real-world examples of ${lessonData.topic}:\n\n## Example 1: Basic Implementation\n\`\`\`\n// Sample code or example\nfunction example() {\n  return "This is a practical example";\n}\n\`\`\`\n\n## Example 2: Advanced Usage\nMore complex scenarios and edge cases.`,
          order: 3,
          type: "text"
        }
      ],
      summary: `A comprehensive ${lessonData.difficulty} level introduction to ${lessonData.topic} covering fundamental concepts and practical applications.`,
      resources: [
        {
          title: `${lessonData.topic} Documentation`,
          url: "#",
          type: "documentation",
          description: "Official documentation and reference materials"
        },
        {
          title: "Practice Exercises",
          url: "#",
          type: "exercises",
          description: "Additional practice problems and solutions"
        }
      ],
      exercises: [
        {
          question: `What is the main purpose of ${lessonData.topic}?`,
          options: [
            "To solve complex problems",
            "To improve efficiency",
            "To provide better user experience",
            "All of the above"
          ],
          correct_answer: "All of the above",
          explanation: `${lessonData.topic} serves multiple purposes including solving complex problems, improving efficiency, and enhancing user experience.`,
          difficulty: lessonData.difficulty
        },
        {
          question: `Which of the following is a key principle in ${lessonData.topic}?`,
          options: [
            "Simplicity",
            "Scalability",
            "Maintainability",
            "All of the above"
          ],
          correct_answer: "All of the above",
          explanation: "Good practices in any field typically emphasize simplicity, scalability, and maintainability.",
          difficulty: lessonData.difficulty
        }
      ],
      tags: [lessonData.subject.toLowerCase(), lessonData.topic.toLowerCase(), lessonData.difficulty],
      created_by: userId
    };

    return { data: await lessonService.createLesson(generatedLesson) };
  }

  // Progress endpoints
  async getUserProgress(params?: { lesson_id?: string }) {
    const userId = await this.getCurrentUserId();
    const progressData = await progressService.getUserProgress(userId, params?.lesson_id);
    
    // Transform data to match expected format
    const completedLessons = progressData.filter(p => p.completed);
    const currentLesson = progressData.find(p => !p.completed && p.progress > 0);
    const totalTimeSpent = progressData.reduce((sum, p) => sum + (p.time_spent || 0), 0);

    return {
      data: {
        completed_lessons: completedLessons.map(p => ({
          lesson_id: p.lesson_id,
          title: (p.lessons as any)?.title || 'Unknown Lesson',
          completed: p.completed,
          completion_date: p.completed ? p.updated_at : undefined,
          score: p.score,
          time_spent: p.time_spent
        })),
        current_lesson: currentLesson ? {
          lesson_id: currentLesson.lesson_id,
          title: (currentLesson.lessons as any)?.title || 'Unknown Lesson',
          progress: currentLesson.progress,
          last_position: currentLesson.last_position
        } : undefined,
        total_time_spent: totalTimeSpent,
        statistics: {
          questions_asked: 0 // Will be populated from QA history
        }
      }
    };
  }

  async updateLessonProgress(lessonId: string, progressData: {
    progress?: number;
    time_spent?: number;
    completed?: boolean;
    score?: number;
    last_position?: string;
    notes?: string;
  }) {
    const userId = await this.getCurrentUserId();
    return { data: await progressService.updateProgress(userId, lessonId, progressData) };
  }

  // QA endpoints
  async getQAHistory() {
    const userId = await this.getCurrentUserId();
    const history = await qaService.getQAHistory(userId);
    
    return {
      data: {
        items: history,
        total: history.length,
        skip: 0,
        limit: 50
      }
    };
  }

  async askQuestion(questionData: {
    question: string;
    context?: string;
    lesson_id?: string;
  }) {
    const userId = await this.getCurrentUserId();
    
    // Generate AI response
    const answer = await aiService.generateAnswer(
      questionData.question,
      questionData.context,
      questionData.lesson_id
    );

    // Save to database
    const qaEntry = {
      user_id: userId,
      question: questionData.question,
      answer,
      lesson_id: questionData.lesson_id || null,
      references: [] // Could be populated with relevant lesson references
    };

    return { data: await qaService.createQAEntry(qaEntry) };
  }

  // Utility method to check if Supabase is configured
  isConfigured(): boolean {
    return !!(process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_ANON_KEY);
  }
}

// Create and export API instance
const api = new ApiService();

// For backward compatibility, also export methods that match the axios-style interface
export default {
  get: async (url: string) => {
    const [endpoint, params] = url.split('?');
    const searchParams = new URLSearchParams(params);
    
    switch (endpoint) {
      case '/lessons':
        return api.getLessons({
          subject: searchParams.get('subject') || undefined,
          difficulty: searchParams.get('difficulty') || undefined,
          limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
        });
      
      case '/qa/history':
        return api.getQAHistory();
      
      case '/users/me/progress':
        return api.getUserProgress({
          lesson_id: searchParams.get('lesson_id') || undefined
        });
      
      case '/users/me':
        return api.getUser();
      
      default:
        if (endpoint.startsWith('/lessons/')) {
          const lessonId = endpoint.split('/')[2];
          return api.getLesson(lessonId);
        }
        throw new Error(`Endpoint not implemented: ${endpoint}`);
    }
  },

  post: async (url: string, data: any) => {
    switch (url) {
      case '/lessons/generate':
        return api.generateLesson(data);
      
      case '/qa/ask':
        return api.askQuestion(data);
      
      case '/users/me':
        return api.createUserProfile();
      
      default:
        if (url.includes('/progress')) {
          const lessonId = url.split('/')[2];
          return api.updateLessonProgress(lessonId, data);
        }
        throw new Error(`Endpoint not implemented: ${url}`);
    }
  },

  put: async (url: string, data: any) => {
    switch (url) {
      case '/users/me':
        return api.updateUser(data);
      
      default:
        throw new Error(`Endpoint not implemented: ${url}`);
    }
  },

  // Add the service instance for direct access
  service: api
};