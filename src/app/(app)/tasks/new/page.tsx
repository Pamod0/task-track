
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from 'lucide-react';
import { TaskForm } from '@/components/tasks/TaskForm';

export const metadata: Metadata = {
  title: 'New Task - TaskTrak',
  description: 'Add a new task to your daily log.',
};

export default function NewTaskPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-lg rounded-xl">
        <CardHeader className="p-6">
          <div className="flex items-center space-x-3 mb-2">
            <PlusCircle className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold text-primary">Log New Task</CardTitle>
          </div>
          <CardDescription className="text-base">
            Detail the task you&apos;ve completed. Provide a clear description, the completion date,
            and relevant tags. AI can assist by suggesting tags based on your description.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <TaskForm />
        </CardContent>
      </Card>
    </div>
  );
}
