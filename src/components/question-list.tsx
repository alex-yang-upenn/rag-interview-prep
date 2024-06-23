'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Input } from "./ui/input"
import { Button } from './ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./ui/accordion"

type Props = {}

// Define the schema for form validation
const JobTypeSchema = z.object({
  input: z.string().min(1, 'Input is required'),
});

type JobTypeInput = z.infer<typeof JobTypeSchema>;

const QuestionList = (prop: Props) => {
  const [result, setResult] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<JobTypeInput>({
    resolver: zodResolver(JobTypeSchema),
    defaultValues: {input: ''},
  })

  const handleSubmit = async (values: JobTypeInput) => {
    setIsLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout
  
      const response = await fetch('/api/get-interview-questions', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ "job type": values.input }),
        signal: controller.signal
      });
  
      clearTimeout(timeoutId);
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unknown error occurred');
      }
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Form {...form}>
        <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField disabled={isLoading} control={form.control} name="input" render={({ field } ) => (
            <FormItem>
              <FormLabel className="text-lg">Enter your job title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Name" />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}>
          </FormField>
          <Button type="submit" className="self-start hover:bg-[#2F006B] hover:text-white">
            {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Generating interview questions</>) : ("Generate interview questions") }
          </Button>
        </form>
      </Form>
      <div>
        {result.length > 0 
          ? (<Accordion type="single" collapsible>
            {result.map((question, index) => (
              <AccordionItem key={index} value={index.toString()}>
                <AccordionTrigger>{question}</AccordionTrigger>
                <AccordionContent>
                  Try this question out!
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>)
          : <></>
        }
      </div>
    </div>
  )
}

export default QuestionList