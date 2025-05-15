import type { Metadata } from 'next';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Admin Dashboard - TaskTrak',
  description: 'Admin overview of team task completion.',
};

export default function AdminDashboardPage() {
  return (
    <AuthGuard adminOnly={true}>
      <div className="container mx-auto py-8">
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-2 mb-2">
              <ShieldAlert className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl font-bold text-primary">Admin Dashboard</CardTitle>
            </div>
            <CardDescription className="text-lg">
              Monitor your team&apos;s daily and monthly task progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>This area is restricted to administrators.</p>
            <p>Here you will find tools to view overall team productivity, manage users (future), and configure application settings (future).</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Team Task Overview</CardTitle>
                    <CardDescription>Monthly breakdown of tasks by team member.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Image 
                      src="https://placehold.co/500x250.png" 
                      alt="Team Task Chart Placeholder" 
                      width={500} 
                      height={250}
                      data-ai-hint="table data"
                      className="rounded-md shadow-md"
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>User Management (Coming Soon)</CardTitle>
                    <CardDescription>View and manage team members.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Functionality to add, edit, or remove users will be available here in a future update.</p>
                     <Image 
                      src="https://placehold.co/500x250.png" 
                      alt="User Management Placeholder" 
                      width={500} 
                      height={250}
                      data-ai-hint="user interface"
                      className="rounded-md shadow-md mt-4"
                    />
                </CardContent>
            </Card>
        </div>

      </div>
    </AuthGuard>
  );
}
