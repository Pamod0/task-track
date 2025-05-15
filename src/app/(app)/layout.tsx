import type { ReactNode } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen bg-background">
          <AppSidebar />
          <SidebarInset className="flex-1 flex flex-col overflow-auto">
            {/* Optional Header can go here if needed */}
            {/* <Header /> */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
