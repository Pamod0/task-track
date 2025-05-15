
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from 'lucide-react'; // Changed icon
import { TaskForm } from '@/components/tasks/TaskForm';

export const metadata: Metadata = {
  title: 'Task Details - TaskTrak',
  description: 'Enter the details of your task.',
};

export default function NewTaskPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-lg rounded-xl">
        <CardHeader className="p-6">
          <div className="flex items-center space-x-3 mb-2">
            <FileText className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold text-primary">Task Details</CardTitle>
          </div>
          <CardDescription className="text-base">
            Enter the details of your task. Provide a clear description, date, progress, time spent, and other relevant information.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <TaskForm />
        </CardContent>
      </Card>
    </div>
  );
}
