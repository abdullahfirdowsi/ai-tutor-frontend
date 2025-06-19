# AI Tutor Pro - Frontend

A modern React-based frontend application for an AI-powered tutoring platform that provides personalized learning experiences through interactive lessons and Q&A sessions.

## 🌟 Features

### Core Functionality
- **Interactive Dashboard** - Personalized learning progress tracking and recommendations
- **AI-Generated Lessons** - Dynamic lesson creation with customizable topics and difficulty levels
- **Real-time Q&A Interface** - Chat-based AI tutoring with context-aware responses
- **User Profile Management** - Complete profile customization and learning analytics
- **Progress Tracking** - Detailed learning statistics and completion tracking

### User Experience
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode** - Automatic system theme detection with manual toggle
- **Real-time Interactions** - Smooth, responsive user interface with loading states
- **Search & Filtering** - Advanced lesson discovery with multiple filter options

### Authentication & Security
- **Firebase Authentication** - Secure login/signup with email and Google OAuth
- **Protected Routes** - Role-based access control for authenticated users
- **Token Management** - Automatic token refresh and secure API communication

## 🛠️ Technology Stack

### Frontend Framework
- **React 18.2.0** - Modern React with hooks and functional components
- **TypeScript 4.9.5** - Type-safe development with full TypeScript support
- **React Router 6.21.0** - Client-side routing with nested route support

### UI/UX Libraries
- **Chakra UI 2.8.2** - Modern component library with built-in accessibility
- **React Icons 4.12.0** - Comprehensive icon library (Feather Icons)
- **Framer Motion 10.16.16** - Smooth animations and transitions
- **React Markdown 9.0.1** - Rich text rendering for lesson content

### State Management & Forms
- **Zustand 4.4.7** - Lightweight state management
- **React Hook Form 7.49.2** - Performant form handling with validation

### Backend Integration
- **Axios 1.6.2** - HTTP client with interceptors for API communication
- **Firebase 10.7.1** - Authentication and real-time database services

### Development Tools
- **Create React App 5.0.1** - Zero-configuration build setup
- **Jest & React Testing Library** - Comprehensive testing framework

## 📁 Project Structure

```
src/
├── components/
│   ├── layouts/
│   │   ├── MainLayout.tsx      # Main app layout with navigation
│   │   └── AuthLayout.tsx      # Authentication pages layout
│   ├── navigation/
│   │   ├── Navbar.tsx          # Fixed navigation bar
│   │   └── Sidebar.tsx         # Collapsible sidebar menu
│   ├── routing/
│   │   └── ProtectedRoute.tsx  # Authentication guard component
│   ├── lesson/
│   │   ├── LessonCard.tsx      # Lesson preview card
│   │   └── LessonSection.tsx   # Individual lesson content section
│   ├── qa/
│   │   ├── QuestionInput.tsx   # Question input with context support
│   │   ├── AnswerDisplay.tsx   # AI response with markdown rendering
│   │   └── QAHistoryItem.tsx   # Historical Q&A item component
│   └── GoogleSignInButton.tsx  # Google OAuth integration
├── contexts/
│   └── AuthContext.tsx         # Authentication state management
├── pages/
│   ├── Dashboard.tsx           # Main dashboard with progress overview
│   ├── LessonList.tsx          # Lesson browser with filters
│   ├── Lesson.tsx              # Individual lesson viewer
│   ├── QAInterface.tsx         # Interactive Q&A chat interface
│   ├── Profile.tsx             # User profile and settings
│   ├── Login.tsx               # User authentication
│   ├── Signup.tsx              # User registration
│   └── NotFound.tsx            # 404 error page
├── services/
│   └── api.ts                  # Axios configuration and interceptors
├── firebase.ts                 # Firebase configuration and setup
├── theme.ts                    # Chakra UI theme customization
└── App.tsx                     # Main application component
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Firebase Project** (for authentication)
- **Backend API** (running on port 8000)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-tutor-pro/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Firebase Configuration
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   
   # API Configuration
   REACT_APP_API_URL=http://localhost:8000/api/v1
   
   # Development Settings
   REACT_APP_USE_FIREBASE_EMULATORS=false
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   
   The application will open at [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

### Development
- **`npm start`** - Runs the app in development mode
- **`npm test`** - Launches the test runner in interactive watch mode
- **`npm run build`** - Builds the app for production
- **`npm run eject`** - Ejects from Create React App (one-way operation)

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password and Google providers
3. Copy your Firebase config to the environment variables
4. (Optional) Set up Firebase emulators for local development

### API Integration
The frontend communicates with a backend API that should provide:
- User authentication endpoints
- Lesson management (CRUD operations)
- AI-powered lesson generation
- Q&A processing with context awareness
- User progress tracking

## 🎨 Theming & Customization

The application uses a custom Chakra UI theme located in `src/theme.ts`:

- **Brand Colors**: Blue-based primary palette
- **Accent Colors**: Purple-based secondary palette
- **Typography**: Inter font family for modern readability
- **Components**: Custom button variants and component styles
- **Color Modes**: Automatic light/dark mode with system preference detection

## 🔐 Authentication Flow

1. **Public Routes**: Login, Signup, 404 pages
2. **Protected Routes**: All main application features
3. **Authentication Guard**: `ProtectedRoute` component redirects unauthenticated users
4. **Token Management**: Automatic refresh and API request interception
5. **Profile Updates**: Real-time profile synchronization between Firebase and backend

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: Base styles (320px+)
- **Tablet**: Medium breakpoint (768px+)
- **Desktop**: Large breakpoint (1024px+)
- **Wide**: Extra large breakpoint (1200px+)

## 🧪 Testing

Run the test suite:
```bash
npm test
```

The project includes:
- Component unit tests
- Integration tests for key user flows
- Jest configuration with React Testing Library

## 🚀 Production Build

Create a production build:
```bash
npm run build
```

This creates an optimized build in the `build/` folder ready for deployment.

## 📦 Deployment

The application can be deployed to:
- **Vercel** (recommended for React apps)
- **Netlify**
- **AWS S3 + CloudFront**
- **Firebase Hosting**

Ensure environment variables are configured in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Projects

- **Backend API**: AI Tutor Pro Backend (FastAPI)
- **AI Service**: Machine Learning models for content generation
- **Database**: PostgreSQL with user progress tracking

---

**Built with ❤️ using React, TypeScript, and Chakra UI**
