"use client"

import React, { useState, useEffect } from "react"
import { getLogs, getProjects, type Log, type LogParams, type Project } from "@/lib/api"
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
import {
  AlertCircle,
  CheckCircle2,
  Search,
  Calendar,
  Server,
  Globe,
  User,
  Code,
  Filter,
  X,
  ChevronDown,
} from "lucide-react"
import { Loading } from "@/components/ui/loading"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { format, subDays } from "date-fns"
import { DateRange } from "react-day-picker"

interface LogListProps {
  projectId?: string | null
}

interface PaginationState {
  page: number
  limit: number
  totalPages: number
  total: number
}

interface FilterState {
  projectId: string | null
  keyword: string
  startDate: Date
  endDate: Date | undefined
  matched: boolean | null
}

export default function LogList({ projectId = null }: LogListProps): React.ReactElement {
  const [logs, setLogs] = useState<Log[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  })

  // Default date range: last 7 days to today
  const today = new Date()
  const sevenDaysAgo = subDays(today, 7)

  const [filters, setFilters] = useState<FilterState>({
    projectId: projectId,
    keyword: "",
    startDate: sevenDaysAgo,
    endDate: today,
    matched: null,
  })

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true)
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to?: Date | undefined
  }>({
    from: sevenDaysAgo,
    to: today,
  })

  // Load projects for the filter dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await getProjects()
        setProjects(projectsData)
      } catch (err) {
        console.error("Failed to load projects:", err)
      }
    }

    fetchProjects()
  }, [])

  // Update filters when projectId prop changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      projectId,
    }))
  }, [projectId])

  const loadLogs = async (page = 1, limit = 10): Promise<void> => {
    try {
      setLoading(true)
      const params: LogParams = {
        page,
        limit,
      }

      if (filters.projectId) {
        params.projectId = filters.projectId
      }

      if (filters.matched !== null) {
        params.matched = filters.matched
      }

      // Add date range parameters
      // Note: Backend needs to be updated to support these parameters
      if (filters.startDate) {
        params.startDate = filters.startDate.toISOString()
      }

      if (filters.endDate) {
        params.endDate = filters.endDate.toISOString()
      }

      // Add keyword search parameter
      // Note: Backend needs to be updated to support this parameter
      if (filters.keyword) {
        params.keyword = filters.keyword
      }

      const response = await getLogs(params)

      // Handle different return formats
      if (Array.isArray(response)) {
        setLogs(response)
        setPagination({
          ...pagination,
          page: page,
          totalPages: 1,
          total: response.length,
        })
      } else {
        setLogs(response.items || [])
        setPagination({
          ...pagination,
          page: response.page || page,
          totalPages: response.totalPages || 1,
          total: response.total || 0,
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
  }, [filters])

  const handlePageChange = (newPage: number): void => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      loadLogs(newPage, pagination.limit)
    }
  }

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    if (key === "projectId") {
      const projectIdValue = value === "all" ? null : value;
      // 当选择了具体项目时，强制将matched设为null
      if (projectIdValue) {
        setFilters((prev) => ({
          ...prev,
          projectId: projectIdValue,
          matched: null, // 强制设为null (All)
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          projectId: projectIdValue,
        }));
      }
    } else {
      // 如果已经选择了具体项目，不允许修改matched
      if (key === "matched" && filters.projectId) {
        return;
      }
      
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    }

    // Reset to page 1 when filters change
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range)
      if (range.from) {
        setFilters((prev) => ({
          ...prev,
          startDate: range.from as Date,
          endDate: range.to || today,
        }))
      }
    }
  }

  const handleResetFilters = () => {
    setFilters({
      projectId: projectId,
      keyword: "",
      startDate: sevenDaysAgo,
      endDate: today,
      matched: null,
    })
    setDateRange({
      from: sevenDaysAgo,
      to: today,
    })
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
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "PATCH":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
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
      return "bg-red-100 text-red-800 hover:bg-red-100"
    }

    return "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Request Logs</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <Collapsible open={isFilterOpen} className="mb-6">
        <CollapsibleContent>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Project Filter */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Project</label>
                  <Select
                    value={filters.projectId || "all"}
                    onValueChange={(value) => handleFilterChange("projectId", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Keyword Search */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Keyword</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search in path or response..."
                      className="pl-8"
                      value={filters.keyword}
                      onChange={(e) => handleFilterChange("keyword", e.target.value)}
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Date Range</label>
                  <div className="grid gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                              </>
                            ) : (
                              format(dateRange.from, "MMM dd, yyyy")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-3 border-b">
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium">Select Range</h4>
                            <p className="text-xs text-muted-foreground">
                              Select a start date and an end date
                            </p>
                          </div>
                        </div>
                        <CalendarComponent
                          mode="range"
                          selected={dateRange}
                          onSelect={(range) => handleDateRangeChange(range)}
                          numberOfMonths={2}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Matched Filter */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Status</label>
                  <Tabs
                    value={filters.projectId ? "all" : (filters.matched === null ? "all" : filters.matched ? "matched" : "unmatched")}
                    className={`w-full ${filters.projectId ? "opacity-70 pointer-events-none" : ""}`}
                    onValueChange={(value) => {
                      if (value === "all") handleFilterChange("matched", null)
                      else if (value === "matched") handleFilterChange("matched", true)
                      else handleFilterChange("matched", false)
                    }}
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="matched">Matched</TabsTrigger>
                      <TabsTrigger value="unmatched">Unmatched</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  {filters.projectId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Status selection is disabled when a specific project is selected.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Results Summary */}
      <div className="text-sm text-gray-500 mb-4">
        Showing {logs.length} of {pagination.total} logs
      </div>

      {error && (
        <div className="mb-4 p-4 border rounded-lg bg-red-50 border-red-200 text-red-800 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <Loading text="Loading request logs..." className="min-h-[300px]" />
      ) : logs.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No logs available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                {/* Header Section */}
                <div className="p-4 border-b bg-gray-50 flex flex-wrap items-center gap-2">
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

                {/* Details Section */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* Left Column */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Globe className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium">IP Address</div>
                        <div className="font-mono">{log.ip_address || "N/A"}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium">Timestamp</div>
                        <div>{formatDate(log.timestamp || log.created_at || "", true)}</div>
                      </div>
                    </div>

                    {log.mock_id && (
                      <div className="flex items-start gap-2">
                        <Code className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <div className="font-medium">Mock ID</div>
                          <div className="font-mono text-xs truncate">{log.mock_id}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium">User Agent</div>
                        <div className="text-xs truncate max-w-full">{log.user_agent || "N/A"}</div>
                      </div>
                    </div>

                    {log.project_id && (
                      <div className="flex items-start gap-2">
                        <Server className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <div className="font-medium">Project ID</div>
                          <div className="font-mono text-xs truncate">{log.project_id}</div>
                        </div>
                      </div>
                    )}

                    {typeof log.response_summary !== 'undefined' && (
                      <div className="flex items-start gap-2">
                        <Code className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <div className="font-medium">Response Summary</div>
                          <div className="font-mono text-xs truncate max-w-full">
                            {typeof log.response_summary === "object" && log.response_summary !== null
                              ? JSON.stringify(log.response_summary).substring(0, 100) + "..."
                              : String(log.response_summary || "").substring(0, 100) + "..."}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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
