"use client"

import React, { useState, useEffect } from "react"
import { getLogs, type Log, type LogParams } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Loading } from "@/components/ui/loading"

interface LogListProps {
  projectId?: string | null
}

interface PaginationState {
  page: number
  limit: number
  totalPages: number
}

export default function LogList({ projectId = null }: LogListProps): React.ReactElement {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    totalPages: 1,
  })

  const loadLogs = async (page = 1, limit = 10): Promise<void> => {
    try {
      setLoading(true)
      const params: LogParams = {
        page,
        limit,
      }

      if (projectId) {
        params.projectId = projectId
      }

      const response = await getLogs(params)

      // Handle different return formats
      if (Array.isArray(response)) {
        setLogs(response)
        setPagination({
          ...pagination,
          page: page,
          totalPages: 1,
        })
      } else {
        setLogs(response.items || [])
        setPagination({
          ...pagination,
          page: response.page || page,
          totalPages: response.totalPages || 1,
        })
      }

      setError(null)
    } catch (err) {
      setError("Failed to load logs. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs(1, pagination.limit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const handlePageChange = (newPage: number): void => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      loadLogs(newPage, pagination.limit)
    }
  }

  const getMethodBadgeStyles = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "POST":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "PUT":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "DELETE":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getStatusBadgeStyles = (status?: number) => {
    if (!status) return "bg-gray-100 text-gray-800 hover:bg-gray-100"

    if (status >= 200 && status < 300) {
      return "bg-green-100 text-green-800 hover:bg-green-100"
    } else if (status >= 400 && status < 500) {
      return "bg-orange-100 text-orange-800 hover:bg-orange-100"
    } else if (status >= 500) {
      return "bg-orange-100 text-orange-800 hover:bg-orange-100"
    }

    return "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Request Logs</h2>
        </div>
        <Loading text="Loading request logs..." className="min-h-[300px]" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Request Logs</h2>
      </div>

      {error && (
        <div className="mb-4 p-4 border rounded-lg bg-orange-50 border-orange-200 text-orange-800 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No logs available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={getMethodBadgeStyles(log.method)}>
                      {log.method}
                    </Badge>
                    <code className="font-mono text-sm bg-white px-2 py-1 rounded border flex-1 truncate">
                      {log.path}
                    </code>
                    <Badge
                      variant="outline"
                      className={
                        log.matched
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-orange-100 text-orange-800 hover:bg-orange-100"
                      }
                    >
                      {log.matched ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Matched
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Unmatched
                        </span>
                      )}
                    </Badge>
                    {log.status_code && (
                      <Badge variant="outline" className={getStatusBadgeStyles(log.status_code)}>
                        {log.status_code}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-500">
                  Time: {formatDate(log.timestamp || log.created_at || "", true)}
                </div>
              </CardContent>
            </Card>
          ))}

          {pagination.totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className={pagination.page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current page
                    return page === 1 || page === pagination.totalPages || Math.abs(page - pagination.page) <= 1
                  })
                  .map((page, index, array) => {
                    // Add ellipsis
                    if (index > 0 && page - array[index - 1] > 1) {
                      return (
                        <React.Fragment key={`ellipsis-${page}`}>
                          <PaginationItem>
                            <span className="px-4 py-2">...</span>
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink onClick={() => handlePageChange(page)} isActive={page === pagination.page}>
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      )
                    }

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink onClick={() => handlePageChange(page)} isActive={page === pagination.page}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className={
                      pagination.page === pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  )
}
