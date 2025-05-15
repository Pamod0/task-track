import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from 'lucide-react';
// import TaskForm component once it's created

export const metadata: Metadata = {
  title: 'New Task - TaskTrak',
  description: 'Add a new task to your daily log.',
};

export default function NewTaskPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2 mb-2">
            <PlusCircle className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold text-primary">Add New Task</CardTitle>
          </div>
          <CardDescription>
            Log your completed tasks for the day. Include a description and relevant tags.
            AI will help suggest tags based on your description.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for TaskForm component */}
          <p className="text-muted-foreground">Task form will be here.</p>
          <div className="mt-6 p-6 border border-dashed rounded-md">
            <h3 className="text-lg font-semibold mb-2">Task Form Preview:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Task Description (Textarea)</li>
              <li>Date Picker (Defaults to today)</li>
              <li>AI Suggested Tags (Editable Badges)</li>
              <li>Custom Tag Input</li>
              <li>Submit Button</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
