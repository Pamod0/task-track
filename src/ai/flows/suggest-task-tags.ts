// This file is machine-generated - edit with caution!

'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting relevant tags for a given task description.
 *
 * - suggestTaskTags - The main function that takes a task description and returns suggested tags.
 * - SuggestTaskTagsInput - The input type for the suggestTaskTags function.
 * - SuggestTaskTagsOutput - The output type for the suggestTaskTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTaskTagsInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The description of the task for which tags are to be suggested.'),
});
export type SuggestTaskTagsInput = z.infer<typeof SuggestTaskTagsInputSchema>;

const SuggestTaskTagsOutputSchema = z.object({
  suggestedTags: z
    .array(z.string())
    .describe('An array of suggested tags for the task.'),
});
export type SuggestTaskTagsOutput = z.infer<typeof SuggestTaskTagsOutputSchema>;

export async function suggestTaskTags(input: SuggestTaskTagsInput): Promise<SuggestTaskTagsOutput> {
  return suggestTaskTagsFlow(input);
}

const suggestTaskTagsPrompt = ai.definePrompt({
  name: 'suggestTaskTagsPrompt',
  input: {schema: SuggestTaskTagsInputSchema},
  output: {schema: SuggestTaskTagsOutputSchema},
  prompt: `You are a helpful assistant that suggests relevant tags for a given task description.

  Task Description: {{{taskDescription}}}

  Please provide an array of relevant tags for the task.`,
});

const suggestTaskTagsFlow = ai.defineFlow(
  {
    name: 'suggestTaskTagsFlow',
    inputSchema: SuggestTaskTagsInputSchema,
    outputSchema: SuggestTaskTagsOutputSchema,
  },
  async input => {
    const {output} = await suggestTaskTagsPrompt(input);
    return output!;
  }
);
