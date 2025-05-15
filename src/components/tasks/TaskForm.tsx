
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { 
  ref, 
  set, 
  push, 
  update, 
  serverTimestamp // Correct import for RTDB server timestamp
} from "firebase/database";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { database } from "@/lib/firebase/firebase"; // Import Realtime Database instance

// Zod Schema for form validation
const taskFormSchema = z.object({
  description: z.string()
    .min(10, "Description must be at least 10 characters.")
    .max(500, "Description can be at most 500 characters."),
  date: z.date({ required_error: "Please select a date." }),
  week: z.string().min(1, "Please select a week."),
  progress: z.number().min(0, "Progress must be at least 0.").max(100, "Progress can be at most 100."),
  timeSpent: z.number().positive("Time spent must be a positive number.").max(24, "Time spent cannot exceed 24 hours for a single task log."),
  challengesFaced: z.string().max(1000, "Challenges faced can be at most 1000 characters.").optional().or(z.literal("")),
  supportNeeded: z.string().max(1000, "Support needed can be at most 1000 characters.").optional().or(z.literal("")),
  selfRating: z.coerce.number().min(1, "Self-rating must be between 1 and 5.").max(5, "Self-rating must be between 1 and 5."),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  initialData?: Task; 
  onSubmitSuccess?: (data: Task) => void;
}

const getWeekOptions = () => {
  return Array.from({ length: 5 }, (_, i) => {
    const weekNum = i + 1;
    return {
      value: `Week ${String(weekNum).padStart(2, '0')}`,
      label: `Week ${String(weekNum).padStart(2, '0')}`,
    };
  });
};

// Helper function to calculate the week number within a month (1-5)
const calculateWeekNumberForMonth = (d: Date): number => {
  const dayOfMonth = d.getDate();
  // Week 1: 1-7, Week 2: 8-14, Week 3: 15-21, Week 4: 22-28, Week 5: 29+
  return Math.min(Math.ceil(dayOfMonth / 7), 5); 
};


const selfRatingOptions = [
  { value: 1, label: "1 - Needs Improvement" },
  { value: 2, label: "2 - Fair" },
  { value: 3, label: "3 - Good" },
  { value: 4, label: "4 - Very Good" },
  { value: 5, label: "5 - Excellent" },
];

export function TaskForm({ initialData, onSubmitSuccess }: TaskFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      description: initialData?.description || "",
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      week: initialData?.week || getWeekOptions()[calculateWeekNumberForMonth(new Date()) - 1]?.value || getWeekOptions()[0].value,
      progress: initialData?.progress || 0,
      timeSpent: initialData?.timeSpent || 0,
      challengesFaced: initialData?.challengesFaced || "",
      supportNeeded: initialData?.supportNeeded || "",
      selfRating: initialData?.selfRating || 3,
    },
  });

  const progressValue = form.watch("progress");

  async function onSubmit(values: TaskFormValues) {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in to create or update a task.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    
    const commonTaskData = {
      description: values.description,
      date: format(values.date, "yyyy-MM-dd"), // Keep date as string for RTDB
      week: values.week,
      progress: values.progress,
      timeSpent: values.timeSpent,
      challengesFaced: values.challengesFaced || "",
      supportNeeded: values.supportNeeded || "",
      selfRating: values.selfRating,
    };

    try {
      if (initialData?.id) {
        // Update existing task in RTDB
        const taskRef = ref(database, `tasks/${initialData.id}`);
        await update(taskRef, {
          ...commonTaskData,
          userDisplayName: currentUser.displayName || currentUser.email || "Unknown User", 
          updatedAt: serverTimestamp(), // Use serverTimestamp() from firebase/database
        });
        toast({ title: "Task Updated!", description: "Your task has been successfully updated in Realtime Database." });
        
        if (onSubmitSuccess) {
          const updatedTaskForClient: Task = {
            ...initialData, 
            ...commonTaskData,
            userDisplayName: currentUser.displayName || currentUser.email || "Unknown User",
            updatedAt: Date.now(), // Client-side timestamp for immediate UI update
          };
          onSubmitSuccess(updatedTaskForClient);
        } else {
          router.push("/dashboard"); 
        }

      } else {
        // Create new task in RTDB
        const tasksRef = ref(database, 'tasks');
        const newTaskRef = push(tasksRef); // Generate unique ID for new task
        
        const newTaskPayload = {
          ...commonTaskData,
          userId: currentUser.id,
          userDisplayName: currentUser.displayName || currentUser.email || "Unknown User",
          createdAt: serverTimestamp(), // Use serverTimestamp() from firebase/database
          updatedAt: serverTimestamp(), // Use serverTimestamp() from firebase/database
        };
        await set(newTaskRef, newTaskPayload);
        toast({ title: "Task Saved!", description: "Your new task has been successfully saved to Realtime Database." });

        if (onSubmitSuccess) {
          const savedTaskForClient: Task = {
            ...commonTaskData,
            id: newTaskRef.key!, // Use the key from push() as ID
            userId: currentUser.id,
            userDisplayName: currentUser.displayName || currentUser.email || "Unknown User",
            createdAt: Date.now(), // Client-side timestamp
            updatedAt: Date.now(), // Client-side timestamp
          };
          onSubmitSuccess(savedTaskForClient);
        } else {
           form.reset({
             ...values, 
             date: new Date(), 
             week: getWeekOptions()[calculateWeekNumberForMonth(new Date()) - 1]?.value || getWeekOptions()[0].value,
             progress: 0, 
           }); 
           router.push("/dashboard"); 
        }
      }
    } catch (error) {
      console.error("Error saving task to Realtime Database: ", error);
      toast({
        title: "Database Error",
        description: "Could not save task to Realtime Database. Please check console for details and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
 useEffect(() => {
    const currentSelectedDate = form.getValues('date');
    if (currentSelectedDate) {
        const newWeekNumber = calculateWeekNumberForMonth(currentSelectedDate);
        const weekOptions = getWeekOptions();
        const targetWeekValue = weekOptions[newWeekNumber - 1]?.value || weekOptions[0].value;

        // Only update if the week is different or if it's a new form and not yet submitted
        if (form.getValues('week') !== targetWeekValue || (!initialData && !form.formState.isSubmitted)) {
            form.setValue('week', targetWeekValue, { shouldValidate: true });
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch('date'), initialData, form.setValue, form.getValues, form.formState.isSubmitted]);



  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the task you completed..."
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("2000-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="week"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Week</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select week" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getWeekOptions().map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="progress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Progress ({progressValue}%)</FormLabel>
              <FormControl>
                <Slider
                  defaultValue={[field.value]}
                  onValueChange={(value) => field.onChange(value[0])}
                  max={100}
                  step={1}
                  className="py-2"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timeSpent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Spent (Hours)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="challengesFaced"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Challenges Faced (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any challenges you faced while working on this task"
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supportNeeded"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Support Needed (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Do you need any support to complete this task?"
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
            control={form.control}
            name="selfRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Self-Rating (1-5)</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={String(field.value)} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selfRatingOptions.map(option => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

        <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={isLoading || !form.formState.isDirty && !!initialData}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData?.id ? "Update Task" : "Save Task"}
            </Button>
        </div>
      </form>
    </Form>
  );
}

