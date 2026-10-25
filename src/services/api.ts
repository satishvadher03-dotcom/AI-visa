/**
 * Safe fetch wrapper with content-type checking, Bearer token fallback, and structured error handling
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  user?: any;
  token?: string;
  reply?: string;
  sources?: any[];
  disclaimer?: string;
  provider?: string;
  [key: string]: any;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const headers = new Headers(options.headers || {});
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }

    // Attach stored auth token if present in localStorage for iframe resilience
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('auravisa_auth_token');
        if (token && !headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      } catch {
        // localStorage may be disabled
      }
    }

    // Only set Content-Type to json if body is not FormData
    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || '';
    const requestUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://')
      ? endpoint
      : baseUrl
      ? `${baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`
      : endpoint;

    const response = await fetch(requestUrl, {
      ...options,
      credentials: 'include',
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    let parsedData: any = null;

    if (contentType.includes('application/json')) {
      try {
        parsedData = await response.json();
      } catch (jsonErr) {
        return {
          success: false,
          error: 'Received malformed JSON from server. Please try again.',
        };
      }
    } else {
      const text = await response.text();
      return {
        success: response.ok,
        error: response.ok ? undefined : text || `Server error (${response.status})`,
        data: response.ok ? (text as any) : undefined,
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: parsedData?.error || `Request failed with status ${response.status}`,
        ...parsedData,
      };
    }

    return parsedData;
  } catch (networkError: any) {
    return {
      success: false,
      error: networkError?.message || 'Network connection failed. Please verify your connection.',
    };
  }
}

export default apiRequest;
