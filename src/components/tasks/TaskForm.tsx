
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, PlusCircle, Tag, X } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { suggestTaskTags } from "@/ai/flows/suggest-task-tags";
import type { Task } from "@/types";
import { useAuth } from "@/hooks/useAuth";

// Zod Schema for form validation
const taskFormSchema = z.object({
  description: z.string()
    .min(10, "Description must be at least 10 characters.")
    .max(500, "Description can be at most 500 characters."),
  date: z.date({ required_error: "Please select a date." }),
  tags: z.array(
      z.string()
        .min(1, "Tag cannot be empty.")
        .max(20, "Tag can be at most 20 characters.")
        .regex(/^[a-zA-Z0-9-]+$/, "Tags can only contain letters, numbers, and hyphens.")
    )
    .max(10, "You can add up to 10 tags.")
    .min(1, "Please add at least one tag."),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  initialData?: Partial<Task>;
  onSubmitSuccess?: (data: Task) => void;
}

export function TaskForm({ initialData, onSubmitSuccess }: TaskFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [currentCustomTag, setCurrentCustomTag] = useState("");

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      description: initialData?.description || "",
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      tags: initialData?.tags || [],
    },
  });

  const currentTags = form.watch("tags");

  const handleAddTag = (tagValue?: string) => {
    const tagToAdd = (tagValue || currentCustomTag).trim().toLowerCase();
    if (tagToAdd && !currentTags.includes(tagToAdd) && currentTags.length < 10) {
      if (!/^[a-zA-Z0-9-]+$/.test(tagToAdd)) {
        toast({ title: "Invalid Tag Format", description: "Tags can only contain letters, numbers, and hyphens.", variant: "destructive", duration: 3000 });
        return;
      }
      form.setValue("tags", [...currentTags, tagToAdd], { shouldValidate: true });
      setCurrentCustomTag("");
      setSuggestedTags(prev => prev.filter(t => t.toLowerCase() !== tagToAdd));
    } else if (currentTags.includes(tagToAdd)) {
      toast({ title: "Tag already added.", variant: "default", duration: 2000 });
    } else if (currentTags.length >= 10) {
      toast({ title: "Maximum 10 tags allowed.", variant: "default", duration: 2000 });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove), { shouldValidate: true });
  };

  const handleSuggestTags = async () => {
    const description = form.getValues("description");
    if (!description || description.length < 10) {
      toast({ title: "Please enter a longer description to get tag suggestions.", variant: "default" });
      return;
    }
    setIsAISuggesting(true);
    setSuggestedTags([]);
    try {
      const result = await suggestTaskTags({ taskDescription: description });
      const newSuggestions = result.suggestedTags
        .map(st => st.toLowerCase())
        .filter(st => /^[a-zA-Z0-9-]+$/.test(st) && !currentTags.includes(st));
      
      setSuggestedTags([...new Set(newSuggestions)].slice(0, 5)); // Unique suggestions, max 5

      if (newSuggestions.length === 0 && result.suggestedTags.length > 0) {
        toast({ title: "AI suggestions are already in your tags list or do not meet format criteria.", variant: "default" });
      } else if (result.suggestedTags.length === 0) {
        toast({ title: "No tag suggestions from AI for this description.", variant: "default" });
      }
    } catch (error) {
      console.error("Error suggesting tags:", error);
      toast({ title: "Failed to get AI tag suggestions.", variant: "destructive" });
    } finally {
      setIsAISuggesting(false);
    }
  };

  async function onSubmit(values: TaskFormValues) {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in to create a task.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    
    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { date: Date } = {
      userId: currentUser.id,
      userDisplayName: currentUser.displayName || currentUser.email,
      description: values.description,
      date: values.date, // Keep as Date object for now, format later
      tags: values.tags,
    };

    // TODO: Replace console.log with actual Firestore submission logic
    console.log("Task data to be saved:", {
      ...taskData,
      date: format(taskData.date, "yyyy-MM-dd"), // Format date to string for storage
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: initialData ? "Task Updated!" : "Task Created!",
      description: "Your task has been saved successfully (simulated).",
    });

    if (onSubmitSuccess) {
      onSubmitSuccess({
        ...taskData,
        id: initialData?.id || crypto.randomUUID(),
        date: format(taskData.date, "yyyy-MM-dd"),
        createdAt: initialData?.createdAt || Date.now(),
        updatedAt: Date.now(),
      });
    } else {
       form.reset(); // Reset form on successful submission
       setSuggestedTags([]);
       // Consider redirecting or updating a list of tasks here
       // router.push("/dashboard"); 
    }
    setIsLoading(false);
  }
  
  // Autofetch suggestions when description is valid
  useEffect(() => {
    const description = form.watch('description');
    if (description && description.length >= 10 && form.formState.errors.description === undefined) {
      const timer = setTimeout(() => {
        handleSuggestTags();
      }, 1500); // Debounce AI call
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch('description'), form.formState.errors.description]);


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
              <FormDescription>
                Be specific about what you accomplished. AI will suggest tags based on this.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date Completed</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full sm:w-[240px] justify-start text-left font-normal",
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

        <div className="space-y-4">
            <FormItem>
                <FormLabel htmlFor="custom-tag-input">Tags</FormLabel>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <FormControl>
                    <Input
                        id="custom-tag-input"
                        placeholder="Add a tag (e.g., meeting)"
                        value={currentCustomTag}
                        onChange={(e) => setCurrentCustomTag(e.target.value)}
                        onKeyDown={(e) => {
                        if (e.key === "Enter" && currentCustomTag.trim()) {
                            e.preventDefault();
                            handleAddTag();
                        }
                        }}
                        className="flex-grow"
                    />
                    </FormControl>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddTag()} disabled={!currentCustomTag.trim() || currentTags.length >= 10}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Tag
                    </Button>
                </div>
                <FormDescription>
                    Press Enter or click "Add Tag". Tags are alphanumeric with hyphens. At least 1, max 10 tags.
                </FormDescription>
                <FormMessage>{form.formState.errors.tags?.message || form.formState.errors.tags?.root?.message}</FormMessage>
                
                {currentTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                    {currentTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-sm py-1 px-2">
                        {tag}
                        <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                            aria-label={`Remove tag ${tag}`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                        </Badge>
                    ))}
                    </div>
                )}
            </FormItem>

            <FormItem>
                <div className="flex items-center justify-between">
                    <FormLabel>AI Suggested Tags</FormLabel>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSuggestTags}
                        disabled={isAISuggesting || !form.getValues("description") || form.formState.errors.description !== undefined}
                    >
                        {isAISuggesting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                        <Tag className="mr-2 h-4 w-4" />
                        )}
                        {isAISuggesting ? "Suggesting..." : "Get Suggestions"}
                    </Button>
                </div>
                {isAISuggesting && <p className="text-sm text-muted-foreground">AI is analyzing your description...</p>}
                {!isAISuggesting && suggestedTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                    {suggestedTags.map((tag) => (
                        <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground text-sm py-1 px-2"
                        onClick={() => handleAddTag(tag)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') {e.preventDefault(); handleAddTag(tag);}}}
                        >
                        <PlusCircle className="mr-1 h-3 w-3" />
                        {tag}
                        </Badge>
                    ))}
                    </div>
                )}
                {!isAISuggesting && suggestedTags.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                        {form.getValues("description") && form.formState.errors.description === undefined ? 
                        (initialData || currentTags.length > 0 ? "No new AI suggestions or try rephrasing." : "AI will suggest tags after you write a valid description.") :
                        "Write a valid description (min 10 chars) to get AI tag suggestions."}
                    </p>
                )}
            </FormItem>
        </div>


        <Button type="submit" className="w-full sm:w-auto" disabled={isLoading || !form.formState.isValid}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update Task" : "Log Task"}
        </Button>
      </form>
    </Form>
  );
}

