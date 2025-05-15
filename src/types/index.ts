export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role: UserRole;
}

export interface Task {
  id: string;
  userId: string;
  userDisplayName?: string; // For admin view convenience
  description: string;
  date: string; // ISO string e.g., YYYY-MM-DD
  tags: string[];
  createdAt: number; // Firestore Timestamp or JS milliseconds
  updatedAt: number; // Firestore Timestamp or JS milliseconds
}
