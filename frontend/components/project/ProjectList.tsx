"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Edit, Trash2, ExternalLink, AlertCircle, FolderOpenDot, Info, Search, X } from "lucide-react"
import { getProjects, deleteProject, type Project } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ProjectForm from "./ProjectForm"
import { formatDate } from "@/lib/utils"
import { Loading } from "@/components/ui/loading"

export default function ProjectList(): React.ReactElement {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [searchKeyword, setSearchKeyword] = useState<string>('')

  const loadProjects = async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await getProjects()
      setProjects(data)
      setError(null)
    } catch (err) {
      setError("Failed to load projects. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteProject(id)
      setProjects(projects.filter((project) => project.id !== id))
    } catch (err) {
      setError("Failed to delete project. Please try again.")
      console.error(err)
    }
  }

  const handleCreateSuccess = (): void => {
    loadProjects()
    setShowCreateForm(false)
  }

  const handleEditSuccess = (): void => {
    loadProjects()
    setEditingProject(null)
  }

  // 过滤项目列表
  const filteredProjects = projects.filter(project => {
    const keyword = searchKeyword.toLowerCase();
    return keyword === '' || 
      project.name.toLowerCase().includes(keyword) || 
      project.url_suffix.toLowerCase().includes(keyword);
  });

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Project List</h1>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" /> Create Project
          </Button>
        </div>
        
        <Loading size="lg" text="Loading projects..." className="min-h-[400px]" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <FolderOpenDot className="h-7 w-7 text-indigo-500" />
          <h1 className="text-3xl font-bold">Project List</h1>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="h-6 w-6" /> New Project
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            placeholder="Search by name or URL suffix..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchKeyword && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute inset-y-0 right-0 flex items-center px-2 h-full"
              onClick={() => setSearchKeyword('')}
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-900" />
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 border rounded-lg bg-amber-50 border-amber-200 text-amber-800 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error === "Failed to load projects. Please try again." ? "Failed to load projects. Please try again." :
            error === "Failed to delete project. Please try again." ? "Failed to delete project. Please try again." :
              error}</span>
        </div>
      )}

      {/* Create Project Modal */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-indigo-700">Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project to organize your mock APIs
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ProjectForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Project Modal */}
      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-indigo-700">Edit Project</DialogTitle>
            <DialogDescription>
              Update project details
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {editingProject && (
              <ProjectForm
                project={editingProject}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditingProject(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {filteredProjects.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-gray-50/60 border-gray-200">
          {projects.length === 0 ? (
            <>
              <Info className="h-12 w-12 mx-auto mb-4 text-indigo-400 opacity-80" />
              <p className="text-gray-600 mb-6">No projects yet. Create your first project to get started!</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Create First Project
              </Button>
            </>
          ) : (
            <>
              <Info className="h-12 w-12 mx-auto mb-4 text-indigo-400 opacity-80" />
              <p className="text-gray-600">No projects match your search criteria</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border-gray-200 flex flex-col">
              <CardHeader className="pb-3 from-gray-50 to-white">
                <CardTitle className="text-xl text-gray-800">{project.name}</CardTitle>
                <CardDescription className="line-clamp-2">{project.description || "No description"}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 flex-grow bg-gradient-to-br ">
                <div className="mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">URL Suffix:</span>
                    <Badge variant="outline" className="font-mono bg-indigo-50 text-indigo-700 border-indigo-200">
                      {project.url_suffix}
                    </Badge>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Created: {formatDate(project.created_at)}</div>
              </CardContent>
              <CardFooter className="flex justify-between pt-3 border-t">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProject(project)}
                    className="h-8 border-gray-300 hover:bg-gray-100"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete project &quot;{project.name}&quot; and all of its mock APIs. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(project.id)}
                          className="bg-gray-800 hover:bg-gray-900"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Link href={`/projects/${project.id}`} passHref>
                    <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                    </Button>
                  </Link>
                </div>

              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}