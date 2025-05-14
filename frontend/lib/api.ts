import { getApiUrl } from './utils';

export interface Project {
  id: string;
  name: string;
  description?: string;
  url_suffix: string;
  created_at: string;
}

export interface Mock {
  id: string;
  project_id: string;
  path: string;
  method: string;
  description?: string;
  response_body: unknown;
  created_at: string;
}

export interface Log {
  id: string;
  project_id?: string;
  mock_id?: string;
  method: string;
  path: string;
  matched: boolean;
  status_code?: number;
  request_body?: unknown;
  response_body?: unknown;
  response_summary?: unknown;
  timestamp?: string;
  created_at?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface PaginatedResponse<T> {
  page: number;
  totalPages: number;
  total: number;
  items: T[];
}

export interface ProjectFormData {
  name: string;
  description?: string;
  url_suffix: string;
}

export interface MockFormData {
  path: string;
  method: string;
  description?: string;
  response_body: unknown;
}

// 获取所有项目
export async function getProjects(): Promise<Project[]> {
  const response = await fetch(getApiUrl('/api/projects'));
  if (!response.ok) throw new Error('Failed to fetch projects');
  return response.json();
}

// 获取单个项目
export async function getProject(id: string): Promise<Project> {
  const response = await fetch(getApiUrl(`/api/projects/${id}`));
  if (!response.ok) throw new Error('Failed to fetch project');
  return response.json();
}

// 创建项目
export async function createProject(projectData: ProjectFormData): Promise<Project> {
  const response = await fetch(getApiUrl('/api/projects'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create project');
  }
  
  return response.json();
}

// 更新项目
export async function updateProject(id: string, projectData: ProjectFormData): Promise<Project> {
  const response = await fetch(getApiUrl(`/api/projects/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update project');
  }
  
  return response.json();
}

// 删除项目
export async function deleteProject(id: string): Promise<boolean> {
  const response = await fetch(getApiUrl(`/api/projects/${id}`), {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete project');
  }
  
  return true;
}

// 获取项目的所有Mock
export async function getMocksByProject(projectId: string): Promise<Mock[]> {
  const response = await fetch(getApiUrl(`/api/projects/${projectId}/mocks`));
  if (!response.ok) throw new Error('Failed to fetch mocks');
  return response.json();
}

// 获取单个Mock
export async function getMock(mockId: string): Promise<Mock> {
  const response = await fetch(getApiUrl(`/api/mocks/${mockId}`));
  if (!response.ok) throw new Error('Failed to fetch mock');
  return response.json();
}

// 创建Mock
export async function createMock(projectId: string, mockData: MockFormData): Promise<Mock> {
  const response = await fetch(getApiUrl(`/api/projects/${projectId}/mocks`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mockData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create mock');
  }
  
  return response.json();
}

// 更新Mock
export async function updateMock(mockId: string, mockData: MockFormData): Promise<Mock> {
  const response = await fetch(getApiUrl(`/api/mocks/${mockId}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mockData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update mock');
  }
  
  return response.json();
}

// 删除Mock
export async function deleteMock(mockId: string): Promise<boolean> {
  const response = await fetch(getApiUrl(`/api/mocks/${mockId}`), {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete mock');
  }
  
  return true;
}

// 获取日志
export interface LogParams {
  projectId?: string;
  matched?: boolean;
  page?: number;
  limit?: number;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export async function getLogs(params: LogParams): Promise<PaginatedResponse<Log>> {
  const queryParams = new URLSearchParams();
  
  if (params.projectId) queryParams.append('projectId', params.projectId);
  if (params.matched !== undefined) queryParams.append('matched', String(params.matched));
  if (params.page) queryParams.append('page', String(params.page));
  if (params.limit) queryParams.append('limit', String(params.limit));
  
  // Add support for keyword search
  if (params.keyword) queryParams.append('keyword', params.keyword);
  
  // Add support for date range
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  
  const url = `${getApiUrl('/api/logs')}?${queryParams.toString()}`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch logs');
  
  // 处理后端可能的不同数据结构
  const data = await response.json();
  
  // 如果后端直接返回数组，则构造分页响应对象
  if (Array.isArray(data)) {
    return {
      page: params.page || 1,
      totalPages: 1,
      total: data.length,
      items: data
    };
  }
  
  // 如果后端返回的字段名不是items，而是logs，则进行转换
  if (data.logs && !data.items) {
    return {
      ...data,
      items: data.logs
    };
  }
  
  return data;
}

export async function getLogsExtended(params: LogParams): Promise<any> {
  const queryParams = new URLSearchParams()

  if (params.projectId) queryParams.append("projectId", params.projectId)
  if (params.matched !== undefined) queryParams.append("matched", String(params.matched))
  if (params.page) queryParams.append("page", String(params.page))
  if (params.limit) queryParams.append("limit", String(params.limit))

  // Add support for keyword search
  if (params.keyword) queryParams.append("keyword", params.keyword)

  // Add support for date range
  if (params.startDate) queryParams.append("startDate", params.startDate)
  if (params.endDate) queryParams.append("endDate", params.endDate)

  const url = `${getApiUrl("/api/logs")}?${queryParams.toString()}`

  const response = await fetch(url)
  if (!response.ok) throw new Error("Failed to fetch logs")

  const data = await response.json()

  // If backend directly returns array, construct pagination response
  if (Array.isArray(data)) {
    return {
      page: params.page || 1,
      totalPages: 1,
      total: data.length,
      items: data,
    }
  }

  // If backend returns logs instead of items, normalize the response
  if (data.logs && !data.items) {
    return {
      ...data,
      items: data.logs,
    }
  }

  return data
}