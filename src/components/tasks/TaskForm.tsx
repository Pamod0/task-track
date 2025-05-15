
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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

// Zod Schema for form validation
const taskFormSchema = z.object({
  description: z.string()
    .min(10, "Description must be at least 10 characters.")
    .max(500, "Description can be at most 500 characters."),
  date: z.date({ required_error: "Please select a date." }),
  week: z.string().min(1, "Please select a week."),
  progress: z.number().min(0, "Progress must be at least 0.").max(100, "Progress can be at most 100."),
  timeSpent: z.number().positive("Time spent must be a positive number.").max(24, "Time spent cannot exceed 24 hours for a single task log."), // Assuming max 24h for a single log
  challengesFaced: z.string().max(1000, "Challenges faced can be at most 1000 characters.").optional().or(z.literal("")),
  supportNeeded: z.string().max(1000, "Support needed can be at most 1000 characters.").optional().or(z.literal("")),
  selfRating: z.coerce.number().min(1, "Self-rating must be between 1 and 5.").max(5, "Self-rating must be between 1 and 5."),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  initialData?: Partial<Task>;
  onSubmitSuccess?: (data: Task) => void;
}

const getWeekOptions = () => {
  return Array.from({ length: 52 }, (_, i) => {
    const weekNum = i + 1;
    return {
      value: `Week ${String(weekNum).padStart(2, '0')}`,
      label: `Week ${String(weekNum).padStart(2, '0')}`,
    };
  });
};

// Helper function to calculate week number
const calculateWeekNumber = (d: Date): number => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
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
      week: initialData?.week || getWeekOptions()[calculateWeekNumber(new Date()) - 1]?.value || getWeekOptions()[0].value,
      progress: initialData?.progress || 0,
      timeSpent: initialData?.timeSpent || 0,
      challengesFaced: initialData?.challengesFaced || "",
      supportNeeded: initialData?.supportNeeded || "",
      selfRating: initialData?.selfRating || 3, // Default to 3-Good
    },
  });

  const progressValue = form.watch("progress");

  async function onSubmit(values: TaskFormValues) {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in to create a task.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    
    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: currentUser.id,
      userDisplayName: currentUser.displayName || currentUser.email,
      description: values.description,
      date: format(values.date, "yyyy-MM-dd"), // Format date to string for storage
      week: values.week,
      progress: values.progress,
      timeSpent: values.timeSpent,
      challengesFaced: values.challengesFaced,
      supportNeeded: values.supportNeeded,
      selfRating: values.selfRating,
    };

    // TODO: Replace console.log with actual Firestore submission logic
    console.log("Task data to be saved:", taskData);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: initialData ? "Task Updated!" : "Task Saved!",
      description: "Your task details have been saved successfully (simulated).",
    });

    if (onSubmitSuccess) {
      onSubmitSuccess({
        ...taskData,
        id: initialData?.id || crypto.randomUUID(),
        createdAt: initialData?.createdAt || Date.now(),
        updatedAt: Date.now(),
      });
    } else {
       form.reset(); 
       router.push("/dashboard"); 
    }
    setIsLoading(false);
  }
  
  useEffect(() => {
    // Set default week based on current date if not editing and if not already set by initialData
    if (!initialData?.week) {
      const currentFormWeek = form.getValues('week');
      const weekOptions = getWeekOptions();
      const calculatedCurrentWeekNum = calculateWeekNumber(new Date());
      const targetWeekIndex = calculatedCurrentWeekNum - 1;
      
      let expectedCurrentWeekValue: string | undefined;
      if (targetWeekIndex >= 0 && targetWeekIndex < weekOptions.length) {
        expectedCurrentWeekValue = weekOptions[targetWeekIndex]?.value;
      } else {
        expectedCurrentWeekValue = weekOptions[0]?.value; // Fallback
      }

      // If the form's current week value isn't what we expect the current week to be, update it.
      // This handles cases where defaultValues might not have run with the most up-to-date Date or if form is reset.
      if (expectedCurrentWeekValue && currentFormWeek !== expectedCurrentWeekValue) {
         // Also ensure currentFormWeek is not already a valid week from initialData that somehow differs from calculated
         const isCurrentFormWeekInitial = initialData?.week === currentFormWeek;
         if(!isCurrentFormWeekInitial) {
            form.setValue('week', expectedCurrentWeekValue);
         }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.week, form.getValues, form.setValue]);


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
                      onSelect={field.onChange}
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
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
                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value)}>
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
            <Button type="submit" className="w-full sm:w-auto" disabled={isLoading || !form.formState.isValid}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Update Task" : "Save Task"}
            </Button>
        </div>
      </form>
    </Form>
  );
}

// Removed global Date prototype extension
// The calculateWeekNumber function is now defined at the top of this file.
// Removed declare global { interface Date { getWeek(): number; } }

