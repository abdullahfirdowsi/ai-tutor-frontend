import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';

// Types
interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<UserProfile>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (profile: { displayName?: string, photoURL?: string }) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Convert Firebase User to UserProfile
  const mapUserToProfile = (user: User | null): UserProfile | null => {
    if (!user) return null;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  };

  // Sign up function
  async function signup(email: string, password: string, displayName: string): Promise<UserProfile> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update the user's display name
      await updateProfile(user, { displayName });
      
      // Return the updated user profile
      return {
        uid: user.uid,
        email: user.email,
        displayName,
        photoURL: user.photoURL
      };
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  // Login function
  async function login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  // Logout function
  async function logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  // Reset password function
  async function resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  // Update user profile function
  async function updateUserProfile(profile: { displayName?: string, photoURL?: string }): Promise<void> {
    try {
      if (!auth.currentUser) throw new Error('No authenticated user');
      await updateProfile(auth.currentUser, profile);
      // Update local user state
      setCurrentUser(prev => prev ? { ...prev, ...profile } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Effect to handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(mapUserToProfile(user));
      setIsLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    isLoading,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

