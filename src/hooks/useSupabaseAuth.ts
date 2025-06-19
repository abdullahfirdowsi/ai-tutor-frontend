import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { auth } from '../firebase';
import { userService } from '../services/supabaseService';

export function useSupabaseAuth() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // Check if user exists in Supabase
          await userService.getUser(user.uid);
        } catch (error) {
          // User doesn't exist, create them
          try {
            await userService.createUser({
              id: user.uid,
              email: user.email!,
              display_name: user.displayName,
              avatar_url: user.photoURL,
            });
          } catch (createError) {
            console.error('Error creating user in Supabase:', createError);
          }
        }
      }
      setIsInitialized(true);
    };

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        initializeUser();
      } else {
        setIsInitialized(true);
      }
    });

    return () => unsubscribe();
  }, []);

  return { isInitialized };
}