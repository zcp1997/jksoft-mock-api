"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Info } from "lucide-react"
import { getProject, type Project } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import MockList from "@/components/mock/MockList"
import LogList from "@/components/log/LogList"
import { getMockBaseUrl } from "@/lib/utils"
import { Loading } from "@/components/ui/loading"

export default function ProjectDetailPage(): React.ReactElement {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("mocks")

  const projectId = params.id as string

  useEffect(() => {
    const loadProject = async (): Promise<void> => {
      try {
        setLoading(true)
        const data = await getProject(projectId)
        setProject(data)
        setError(null)
      } catch (err) {
        setError("Failed to load project details. Please try again.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      loadProject()
    }
  }, [projectId])

  if (loading) {
    return (
      <Loading text="Loading project details..." />
    )
  }

  if (error || !project) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="rounded-full bg-orange-100 p-2">
                <Info className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium text-orange-800">{error || "Project not found"}</h3>
                <p className="text-sm text-orange-700 mt-1">Please check the project ID or try again later.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6">
          <Link href="/" passHref>
            <Button variant="outline">
              <ChevronLeft className="h-4 w-4 mr-2" /> Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-6">
        <Link href="/" passHref>
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Projects
          </Button>
        </Link>
      </div>

      <Card className="mb-8 border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">{project.name}</CardTitle>
              {project.description && (
                <CardDescription className="mt-2 text-gray-600">{project.description}</CardDescription>
              )}
            </div>
            <Badge variant="outline" className="px-3 py-1 text-sm font-mono self-start md:self-auto">
              {project.url_suffix}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700">Base URL:</div>
            <div className="flex-1 flex items-center">
              <code className="bg-white px-3 py-1.5 rounded border text-sm font-mono flex-1 truncate">
                {getMockBaseUrl(project.url_suffix)}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="mocks" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="mocks">Mock APIs</TabsTrigger>
          <TabsTrigger value="logs">Request Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="mocks" className="mt-0">
          <MockList projectId={projectId} projectUrlSuffix={project.url_suffix} />
        </TabsContent>
        <TabsContent value="logs" className="mt-0">
          <LogList projectId={projectId} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
