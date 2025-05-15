"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [currentUser, loading, router]);

  if (loading || (!loading && (currentUser === undefined || currentUser !== null && typeof currentUser === 'object' && !currentUser.id))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Skeleton className="h-12 w-1/2 mb-4" />
        <Skeleton className="h-8 w-1/3" />
      </div>
    );
  }

  // This part should ideally not be reached if redirection works correctly.
  // It's a fallback or can be shown briefly during the redirect.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
       <p className="text-foreground">Loading TaskTrak...</p>
    </div>
  );
}
