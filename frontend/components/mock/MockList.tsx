import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Copy, X, Search } from 'lucide-react';
import { getMocksByProject, deleteMock, Mock } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MockForm from './MockForm';
import { formatDate, getMockUrl } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Loading } from '@/components/ui/loading';

interface MockListProps {
  projectId: string;
  projectUrlSuffix: string;
}

export default function MockList({ projectId, projectUrlSuffix }: MockListProps): React.ReactElement {
  const [mocks, setMocks] = useState<Mock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [editingMock, setEditingMock] = useState<Mock | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [responseCopySuccess, setResponseCopySuccess] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadMocks = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await getMocksByProject(projectId);
      setMocks(data);
      setError(null);
    } catch (err) {
      setError('Failed to load mock APIs. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadMocks();
    }
  }, [projectId]);

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this mock API?')) {
      return;
    }

    try {
      await deleteMock(id);
      setMocks(mocks.filter(mock => mock.id !== id));
    } catch (err) {
      setError('Failed to delete mock API. Please try again.');
      console.error(err);
    }
  };

  const handleCreateSuccess = (): void => {
    loadMocks();
    setShowCreateForm(false);
  };

  const handleEditSuccess = (): void => {
    loadMocks();
    setEditingMock(null);
  };

  const copyToClipboard = (text: string, isResponseBody: boolean = false): void => {
    if (!isClient) {
      console.warn('Cannot copy in server environment');
      return;
    }

    // Try using the clipboard API if available
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => {
          if (isResponseBody) {
            setResponseCopySuccess(text);
            setTimeout(() => setResponseCopySuccess(null), 2000);
          } else {
            setCopySuccess(text);
            setTimeout(() => setCopySuccess(null), 2000);
          }
        })
        .catch(err => {
          console.error('Failed to copy with Clipboard API: ', err);
          fallbackCopyTextToClipboard(text, isResponseBody);
        });
    } else {
      console.warn('Clipboard API not available, fallback to document.execCommand');
      fallbackCopyTextToClipboard(text, isResponseBody);
    }
  };

  const fallbackCopyTextToClipboard = (text: string, isResponseBody: boolean): void => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        if (isResponseBody) {
          setResponseCopySuccess(text);
          setTimeout(() => setResponseCopySuccess(null), 2000);
        } else {
          setCopySuccess(text);
          setTimeout(() => setCopySuccess(null), 2000);
        }
      } else {
        console.error('fallback: unable to copy');
      }
    } catch (err) {
      console.error('fallback: oops, unable to copy', err);
    }
  };

  const getStatusCodeFromResponse = (responseBody: unknown): number | null => {
    if (typeof responseBody === 'object' && responseBody !== null && 'statusCode' in responseBody) {
      return (responseBody as { statusCode: number }).statusCode;
    }
    return null;
  };

  const filteredMocks = mocks.filter(mock => {
    const fullUrl = getMockUrl(projectUrlSuffix, mock.path).toLowerCase();
    const description = mock.description?.toLowerCase() || '';
    return searchKeyword === '' || fullUrl.includes(searchKeyword.toLowerCase()) || description.includes(searchKeyword.toLowerCase());
  });

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mock APIs</h2>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" /> New Mock API
          </Button>
        </div>
        <Loading text="Loading Mock APIs..." className="min-h-[300px]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mock APIs</h2>
        <Button onClick={() => setShowCreateForm(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> New Mock API
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            placeholder="Search by URL or description..."
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Create New Mock API</CardTitle>
            </CardHeader>
            <CardContent>
              <MockForm
                projectId={projectId}
                onSuccess={handleCreateSuccess}
                onCancel={() => setShowCreateForm(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {filteredMocks.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-gray-500">
            {mocks.length === 0 ?
              "No mock APIs yet. Create your first mock API to get started!" :
              "No mock APIs match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredMocks.map(mock => {
            const statusCode = getStatusCodeFromResponse(mock.response_body);
            const isEditing = editingMock && editingMock.id === mock.id;

            return (
              <Card key={mock.id}>
                {!isEditing ? (
                  <>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="font-mono text-xl">
                          <span className={`px-2 py-1 rounded text-sm mr-2 ${mock.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                            mock.method === 'POST' ? 'bg-green-100 text-green-800' :
                              mock.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                                mock.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                            }`}>
                            {mock.method}
                          </span>
                          {mock.path}
                        </CardTitle>

                        {statusCode && (
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${statusCode >= 200 && statusCode < 300 ? 'bg-green-100 text-green-800' :
                            statusCode >= 400 ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                            {statusCode}
                          </span>
                        )}
                      </div>
                      {mock.description && (
                        <p className="text-sm text-gray-500 mt-1">{mock.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-semibold">Full URL:</span>
                          <code className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                            {getMockUrl(projectUrlSuffix, mock.path)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2"
                            onClick={() => copyToClipboard(getMockUrl(projectUrlSuffix, mock.path))}
                            disabled={!isClient}
                          >
                            {copySuccess === getMockUrl(projectUrlSuffix, mock.path) ?
                              <span className="text-green-600">Copied!</span> :
                              <Copy className="h-4 w-4" />
                            }
                          </Button>
                        </div>

                        <div className="mt-4 relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold">Response Body:</span>
                            <button
                              type="button"
                              className={`
                                flex items-center gap-1 px-3 py-1 text-sm font-medium
                                rounded-full transition-all duration-200
                                ${responseCopySuccess === JSON.stringify(mock.response_body, null, 2) ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                                disabled:opacity-50 disabled:cursor-not-allowed
                              `}
                              onClick={() => {
                                try {
                                  const text = JSON.stringify(mock.response_body, null, 2);
                                  copyToClipboard(text, true);
                                } catch (err) {
                                  console.error('Failed to stringify response_body:', err);
                                }
                              }}
                              disabled={!isClient}
                            >
                              {responseCopySuccess === JSON.stringify(mock.response_body, null, 2) ? (
                                <span className="animate-pulse">Copied!</span>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-auto max-h-40">
                            {typeof mock.response_body === 'string'
                              ? mock.response_body
                              : JSON.stringify(mock.response_body, null, 2)}
                          </pre>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Created: {formatDate(mock.created_at)}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-3">
                      <Button variant="outline" size="sm" onClick={() => setEditingMock(mock)}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(mock.id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </CardFooter>
                  </>
                ) : (
                  <>
                    <CardHeader>
                      <CardTitle>Edit Mock API</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MockForm
                        projectId={projectId}
                        mock={mock}
                        onSuccess={handleEditSuccess}
                        onCancel={() => setEditingMock(null)}
                      />
                    </CardContent>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}