"use client"

import React from "react"
import { useState, useEffect, useMemo } from "react"
import { createMock, updateMock, type Mock, type MockFormData } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { isValidJson, formatJson } from "@/lib/utils"
import { AlertCircle, Code } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface MockFormProps {
  projectId: string
  mock?: Mock | null
  onSuccess: () => void
  onCancel: () => void
}

const formSchema = z.object({
  path: z
    .string()
    .min(1, "Path is required")
    .startsWith("/", "Path must start with /")
    .regex(/^\/[a-zA-Z0-9_\-/]*$/, "Path contains invalid characters"),
  method: z.string().min(1, "Method is required"),
  description: z.string().optional(),
  response_body: z
    .string()
    .min(1, "Response body is required")
    .refine((value) => isValidJson(value), {
      message: "Response body must be valid JSON",
    }),
})

export default function MockForm({ projectId, mock, onSuccess, onCancel }: MockFormProps): React.ReactElement {
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [initialized, setInitialized] = useState<boolean>(false)

  // Helper function to ensure always having a valid method value
  const ensureMethod = (method: string | undefined | null): string => {
    if (!method) return "GET";
    
    // Ensure the method is one of the valid acceptable values, ignoring case
    const validMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];
    const normalizedMethod = method.toUpperCase();
    
    // Find a match (case insensitive)
    const matchedMethod = validMethods.find(m => m.toUpperCase() === normalizedMethod);
    return matchedMethod || "GET";
  };

  // Use useMemo to avoid unnecessary rerenders
  const defaultValues = useMemo(() => ({
    path: mock?.path || "/",
    method: ensureMethod(mock?.method),
    description: mock?.description || "",
    response_body: typeof mock?.response_body === "string" 
      ? mock.response_body 
      : mock?.response_body 
        ? JSON.stringify(mock.response_body, null, 2)
        : JSON.stringify({ message: "Success" }, null, 2),
  }), [mock]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!initialized) {
      console.log('Initializing form with values:', defaultValues);
      form.reset(defaultValues);
      setInitialized(true);
    }
  }, [initialized, form, defaultValues]);

  useEffect(() => {
    console.log('Mock changed, resetting form with:', {
      path: mock?.path || "/",
      method: mock?.method || "GET",
      response_body: typeof mock?.response_body === "string" 
        ? mock.response_body 
        : mock?.response_body 
          ? JSON.stringify(mock.response_body, null, 2)
          : JSON.stringify({ message: "Success" }, null, 2),
    });
    
    form.reset({
      path: mock?.path || "/",
      method: mock?.method || "GET",
      response_body: typeof mock?.response_body === "string" 
        ? mock.response_body 
        : mock?.response_body 
          ? JSON.stringify(mock.response_body, null, 2)
          : JSON.stringify({ message: "Success" }, null, 2),
    });
  }, [mock, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      setApiError(null)

      // Parse response body to JSON object
      const submissionData: MockFormData = {
        ...values,
        response_body: JSON.parse(values.response_body),
      }

      if (mock) {
        await updateMock(mock.id, submissionData)
      } else {
        await createMock(projectId, submissionData)
      }

      onSuccess()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred while saving the mock API";
      setApiError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatResponseBody = () => {
    const currentValue = form.getValues("response_body")
    if (isValidJson(currentValue)) {
      const formatted = formatJson(currentValue)
      form.setValue("response_body", formatted, { shouldValidate: true })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {apiError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="path"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Path*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="/users" className="font-mono" />
              </FormControl>
              <FormDescription>Example: /users or /products/123 (must start with /)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Brief description of this endpoint" />
              </FormControl>
              <FormDescription>Optional: Add a description to help identify this mock API</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="method"
          render={({ field }) => {
            // Use helper function to ensure method value is valid
            const methodValue = ensureMethod(field.value);
            console.log('Method field value:', methodValue);
            
            return (
              <FormItem>
                <FormLabel>Method*</FormLabel>
                <div className="relative">
                  <Select 
                    onValueChange={field.onChange}
                    value={methodValue}
                  >
                    <FormControl>
                      <SelectTrigger className="text-base font-medium">
                        <SelectValue placeholder="Select a method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="response_body"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Response Body (JSON)*</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={formatResponseBody} className="h-8 gap-1">
                  <Code className="h-3.5 w-3.5" />
                  Format JSON
                </Button>
              </div>
              <FormControl>
                <Textarea {...field} rows={10} className="font-mono text-sm" />
              </FormControl>
              <FormDescription>Tip: You can add &quot;statusCode&quot;: 201 to customize the HTTP status code</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mock ? "Update Mock API" : "Create Mock API"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
