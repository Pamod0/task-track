"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from "@/components/ui/skeleton";


interface AuthGuardProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export function AuthGuard({ children, adminOnly = false }: AuthGuardProps) {
  const { currentUser, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.replace(`/login?redirect=${pathname}`);
      } else if (adminOnly && !isAdmin) {
        router.replace('/dashboard?error=unauthorized'); // Or a dedicated unauthorized page
      }
    }
  }, [currentUser, loading, isAdmin, adminOnly, router, pathname]);

  if (loading || !currentUser || (adminOnly && !isAdmin && currentUser)) {
    // Show a loading skeleton or a full-page loader
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl space-y-6">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
