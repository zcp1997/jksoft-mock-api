"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { updateProject, createProject, type Project, type ProjectFormData } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ProjectFormProps {
  project?: Project | null
  onSuccess: () => void
  onCancel: () => void
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  url_suffix: z
    .string()
    .min(1, "URL suffix is required")
    .startsWith("/", "URL suffix must start with /")
    .regex(/^\/[a-zA-Z0-9_\-]*$/, "URL suffix can only have one level (no additional slashes)")
    .refine(val => !val.substring(1).includes('/'), {
      message: "URL suffix can only have one level (no additional slashes)"
    }),
})

export default function ProjectForm({ project, onSuccess, onCancel }: ProjectFormProps): React.ReactElement {
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      url_suffix: "/",
    },
  })

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name || "",
        description: project.description || "",
        url_suffix: project.url_suffix || "/",
      })
    }
  }, [project, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      setApiError(null)

      if (project) {
        await updateProject(project.id, values as ProjectFormData)
      } else {
        await createProject(values as ProjectFormData)
      }

      onSuccess()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error saving project"
      setApiError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {apiError && (
          <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">Name*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="My API Project" className="focus-visible:ring-indigo-500" />
              </FormControl>
              <FormMessage className="text-amber-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">Description</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Brief description of the project" 
                  rows={3} 
                  className="resize-none focus-visible:ring-indigo-500" 
                />
              </FormControl>
              <FormDescription className="text-gray-500 text-xs">Optional: Add a description to help identify this project</FormDescription>
              <FormMessage className="text-amber-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url_suffix"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">URL Suffix*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="/myapi" className="font-mono focus-visible:ring-indigo-500" />
              </FormControl>
              <FormDescription className="text-gray-500 text-xs">
                Example: /myapi (only one level, no additional slashes)
              </FormDescription>
              <FormMessage className="text-amber-600" />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isSubmitting ? "Saving..." : project ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </form>
    </Form>
  )
}