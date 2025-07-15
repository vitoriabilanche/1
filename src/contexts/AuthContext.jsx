
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start loading true

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const getSession = async () => {
      // Attempt to get the current session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (isMounted) {
        // Regardless of error, update user state based on session
        setUser(session?.user ?? null);
        setLoading(false); // Finish initial loading check
      }
       if (error && isMounted) {
          console.error("Error getting session:", error.message); // Log error internally
          // setLoading(false); // Already handled above
       }
    };

    getSession();

    // Set up the listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (isMounted) {
           // Update user state based on the session provided by the listener
           setUser(session?.user ?? null);
           // Set loading to false if it was somehow still true (edge case)
           // Normally, getSession already sets it to false.
           // setLoading(false);
        }
      }
    );

    // Cleanup function to unsubscribe and set mount flag
    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  const login = async (email, password) => {
    // No need to setLoading(true) here, UI state is managed in LoginPage
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    // Return result, AuthProvider's listener will handle the state update
    return { data, error }; // Return the full data object
  };

  const loginWithGoogle = async () => {
    // No need to setLoading(true) here
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    // Return result, Supabase handles redirect, listener handles state update on return
    return { data, error };
  };

  const logout = async () => {
    // No need to setLoading(true) here
    const { error } = await supabase.auth.signOut();
    // Return result, listener handles state update
    return { error };
  };

  const signUp = async (email, password) => {
    // No need to setLoading(true) here
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    // Return result, listener handles state update (or requires confirmation)
    return { data, error };
  };

  const value = {
    user,
    loading,
    login,
    loginWithGoogle,
    logout,
    signUp,
  };

  // Render children only when the initial loading check is complete
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
