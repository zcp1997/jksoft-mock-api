import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化日期
export function formatDate(dateString: string, showTime: boolean = false): string {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  if (showTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.second = '2-digit';
  }

  return date.toLocaleDateString('en-US', options);
}

// 获取Mock API基础URL
export function getMockBaseUrl(urlSuffix: string): string {
  // 确保urlSuffix以/开头但不以/结尾
  const normalizedSuffix = urlSuffix.startsWith('/') ? urlSuffix : `/${urlSuffix}`;
  
  // 返回API服务器的URL，而不是前端服务器的URL
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/mock${normalizedSuffix}`;
}

// 获取完整的Mock URL
export function getMockUrl(projectUrlSuffix: string, mockPath: string): string {
  // 确保projectUrlSuffix以/开头但不以/结尾
  const normalizedSuffix = projectUrlSuffix.startsWith('/') ? projectUrlSuffix : `/${projectUrlSuffix}`;
  
  // 确保mockPath以/开头
  const normalizedPath = mockPath.startsWith('/') ? mockPath : `/${mockPath}`;
  
  // 返回API服务器的URL，而不是前端服务器的URL
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/mock${normalizedSuffix}${normalizedPath}`;
}

// 判断字符串是否为有效的JSON
export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

// 格式化JSON
export function formatJson(str: string): string {
  try {
    const obj = JSON.parse(str);
    return JSON.stringify(obj, null, 2);
  } catch {
    return str;
  }
}

// 帮助构建API URL
export function getApiUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${path}`;
}
