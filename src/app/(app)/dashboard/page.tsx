"use client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, CalendarDays, CheckSquare, Users } from "lucide-react";
import Image from "next/image";

export default function DashboardPage() {
  const { currentUser } = useAuth();

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">
            Welcome back, {currentUser?.displayName || currentUser?.email}!
          </CardTitle>
          <CardDescription className="text-lg">
            Here&apos;s an overview of your tasks and team activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is your personal dashboard. Your task history and insights will appear here.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Tasks</CardTitle>
            <CheckSquare className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 / 8</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Progress</CardTitle>
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">Target: 80%</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Completion (Admin)</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
            <p className="text-xs text-muted-foreground">Avg. team completion</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Productivity Overview</CardTitle>
            <CardDescription>Visual representation of task completion over time.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-6">
            {/* Placeholder for a chart */}
            <Image 
              src="https://placehold.co/600x300.png" 
              alt="Productivity Chart Placeholder" 
              width={600} 
              height={300}
              data-ai-hint="bar chart"
              className="rounded-md shadow-md"
            />
        </CardContent>
      </Card>

    </div>
  );
}
