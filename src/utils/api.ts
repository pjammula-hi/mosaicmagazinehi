/**
 * API Utility Functions
 * Centralized API calls with error handling and logging
 */

import { projectId, publicAnonKey } from './supabase/info';

// API base URL
export const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e`;

// Logger utility - only logs in development
const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${message}`, data || '');
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[API Error] ${message}`, error || '');
  },
};

export interface ApiOptions extends RequestInit {
  authToken?: string;
  skipAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Make an API call with standardized error handling
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { authToken, skipAuth, ...fetchOptions } = options;

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  // Add authorization header
  if (!skipAuth) {
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    } else {
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
    }
  }

  const url = `${API_BASE}${endpoint}`;
  logger.debug(`${fetchOptions.method || 'GET'} ${endpoint}`);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Try to parse JSON response
    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      // Response is not JSON
      data = null;
    }

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `HTTP ${response.status}`;
      logger.error(`API call failed: ${endpoint}`, {
        status: response.status,
        error: errorMessage,
        details: data?.details,
      });
      
      throw new ApiError(
        errorMessage,
        response.status,
        data?.details
      );
    }

    logger.debug(`✓ ${endpoint}`, data);
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network error or other issue
    logger.error(`Network error: ${endpoint}`, error);
    throw new ApiError(
      'Network error. Please check your connection.',
      undefined,
      error
    );
  }
}

/**
 * GET request
 */
export async function apiGet<T = any>(
  endpoint: string,
  authToken?: string
): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'GET',
    authToken,
  });
}

/**
 * POST request
 */
export async function apiPost<T = any>(
  endpoint: string,
  body?: any,
  authToken?: string
): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    authToken,
  });
}

/**
 * PUT request
 */
export async function apiPut<T = any>(
  endpoint: string,
  body?: any,
  authToken?: string
): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
    authToken,
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T = any>(
  endpoint: string,
  authToken?: string
): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'DELETE',
    authToken,
  });
}

/**
 * Upload file with progress tracking
 */
export async function apiUploadFile(
  endpoint: string,
  file: File,
  authToken?: string,
  onProgress?: (progress: number) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(Math.round(progress));
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch (e) {
          reject(new ApiError('Invalid response format'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new ApiError(error.error || 'Upload failed', xhr.status));
        } catch (e) {
          reject(new ApiError('Upload failed', xhr.status));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new ApiError('Network error during upload'));
    });

    xhr.open('POST', `${API_BASE}${endpoint}`);
    
    // Add auth header
    if (authToken) {
      xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
    } else {
      xhr.setRequestHeader('Authorization', `Bearer ${publicAnonKey}`);
    }

    xhr.send(formData);
  });
}

// Export logger for use in components
export { logger };
