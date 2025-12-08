/**
 * API Client for communicating with the FastAPI backend
 */

// Ensure API URL has protocol to avoid relative URL fetches like :5173/127.0.0.1:8000/parse
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl && envUrl.length > 0) {
    return envUrl.startsWith('http') ? envUrl : `http://${envUrl}`;
  }
  return 'http://localhost:7861';
};

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface Document {
  id: number;
  filename: string;
  file_type: string;
  task_type: string;
  content?: string;
  metadata?: Record<string, any>;
  output_path?: string;
  status: string;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProcessingJob {
  id: number;
  job_id: string;
  user_id?: number;
  job_type: string;
  input_file: string;
  output_files?: string[];
  status: string;
  progress: number;
  result_data?: Record<string, any>;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ParseResponse {
  success: boolean;
  message: string;
  output_dir?: string;
  files?: string[];
  download_url?: string;
  content?: string;
  extract?: Record<string, any>;
  dataframe?: any[][];
}

export interface TaskResponse {
  success: boolean;
  task_type: string;
  content: string;
  message?: string;
}

export interface PrescriptionRequest {
  patient: {
    lastName: string;
    firstName: string;
    ssn: string;
    ipp: string;
  };
  prescriber_initials: string;
  amy_code: string;
  finess: string;
  fse_number: string;
  edm_base_path: string;
  template_path?: string;
}

export interface PrescriptionResponse {
  success: boolean;
  message: string;
  pdf_path?: string;
  thumbnail_path?: string;
  edm_path?: string;
  error?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.detail || error.message || 'API request failed');
    }

    return response.json();
  }

  // Health check
  async healthCheck(): Promise<{ message: string; success: boolean }> {
    return this.request('/api/health');
  }

  // Document endpoints
  async getDocuments(params?: {
    skip?: number;
    limit?: number;
    status?: string;
  }): Promise<Document[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.set('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.set('limit', params.limit.toString());
    if (params?.status) queryParams.set('status', params.status);

    return this.request(`/api/documents?${queryParams}`);
  }

  async getDocument(id: number): Promise<Document> {
    return this.request(`/api/documents/${id}`);
  }

  async createDocument(data: Partial<Document>): Promise<Document> {
    return this.request('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async updateDocument(
    id: number,
    data: Partial<Document>
  ): Promise<Document> {
    return this.request(`/api/documents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async deleteDocument(id: number): Promise<{ message: string; success: boolean }> {
    return this.request(`/api/documents/${id}`, {
      method: 'DELETE',
    });
  }

  // Processing Job endpoints
  async getJobs(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    user_id?: number;
  }): Promise<ProcessingJob[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.set('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.set('limit', params.limit.toString());
    if (params?.status) queryParams.set('status', params.status);
    if (params?.user_id !== undefined) queryParams.set('user_id', params.user_id.toString());

    return this.request(`/api/jobs?${queryParams}`);
  }

  async getJob(jobId: string): Promise<ProcessingJob> {
    return this.request(`/api/jobs/${jobId}`);
  }

  async createJob(data: {
    job_type: string;
    input_file: string;
    user_id?: number;
  }): Promise<ProcessingJob> {
    return this.request('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async updateJob(
    jobId: string,
    data: Partial<ProcessingJob>
  ): Promise<ProcessingJob> {
    return this.request(`/api/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async deleteJob(jobId: string): Promise<{ message: string; success: boolean }> {
    return this.request(`/api/jobs/${jobId}`, {
      method: 'DELETE',
    });
  }

  // File upload endpoints
  async parseDocument(file: File): Promise<ParseResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/parse?quick=1`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.detail || 'Failed to parse document');
    }

    return response.json();
  }

  async performOCRTask(file: File, taskType: string): Promise<TaskResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/${taskType}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.detail || `Failed to perform ${taskType} task`);
    }

    return response.json();
  }

  // Prescription generation endpoint
  async generatePrescription(request: PrescriptionRequest): Promise<PrescriptionResponse> {
    return this.request('/generate-prescription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  // Utility method to get download URL
  getDownloadUrl(path: string): string {
    return `${this.baseURL}${path}`;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export default ApiClient;

