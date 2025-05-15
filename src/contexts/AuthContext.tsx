"use client";

import type { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import type { ReactNode } from "react";
import { createContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import type { UserProfile } from "@/types";
// Placeholder for a function to get user profile (including role)
// This would typically involve a Firestore read
async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  // In a real app, fetch from Firestore: /users/{userId}
  // For now, assume a default role or mock.
  // This needs to be implemented properly based on how roles are stored.
  console.warn("fetchUserProfile is a placeholder. Implement role fetching.");
  // Example: if (userId === 'admin_user_id') return { id: userId, email: 'admin@example.com', role: 'admin' };
  return { id: userId, email: "user@example.com", role: "user" }; 
}


interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  firebaseUser: null,
  loading: true,
  isAdmin: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // In a real app, you'd fetch the user's profile, including their role, from Firestore
        // For now, we'll mock a profile or assign a default role.
        // This needs to be replaced with actual Firestore logic.
        const userProfile = await fetchUserProfile(user.uid);
        if (userProfile) {
          setCurrentUser(userProfile);
        } else {
          // Fallback or create a new profile if one doesn't exist
           setCurrentUser({
            id: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'user', // Default role
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{ currentUser, firebaseUser, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
