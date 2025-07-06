interface FindMatchesRequest {
  property_description: string;
  url: string;
  user_id: string;
  k?: number; // Number of matches to return, default is 3
}

interface FindMatchesResponse {
  data: Array<{
    customer_id: string;
    customer_name: string;
    customer_phone: string;
    customer_profile: string;
    match_analysis: string;
    personalized_pitch: string;
    similarity_score: number;
  }>;
}

/**
 * Helper function to get the API base URL from environment
 * @returns The configured API URL
 */
export function getApiUrl(): string {
  const apiUrl = import.meta.env.REACT_APP_API_URL;

  if (!apiUrl) {
    throw new Error(
      'API URL not configured. Please set REACT_APP_API_URL environment variable.'
    );
  }

  return apiUrl;
}

/**
 * Generic API request helper with error handling
 * @param endpoint - API endpoint (without base URL)
 * @param options - Fetch options
 * @returns Promise with the response data
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP ${response.status}: ${errorText || response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network request failed');
  }
}

/**
 * Simplified version using the generic API helper
 * @param propertyDescription - Description of the property to find matches for
 * @param url - URL or path to customer data
 * @param k - Number of matches to return
 * @returns Promise with matching customers and their scores
 */
export async function findMatchesSimple(
  propertyDescription: string,
  url: string,
  k = 3
): Promise<FindMatchesResponse> {
  try {
    // First, try sending with the url in the request body
    const requestBody: FindMatchesRequest = {
      property_description: propertyDescription,
      url: url,
      user_id: 'default_user',
      k: k,
    };

    const response = await apiRequest<FindMatchesResponse>('/matches/find', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    console.log('findMatchesSimple response:', response);
    return response;
  } catch (error) {
    // If that fails, try sending url as a query parameter
    if (
      error instanceof Error &&
      error.message.includes('missing 1 required positional argument')
    ) {
      console.log('Retrying with url as query parameter...');

      const encodedUrl = encodeURIComponent(url);
      const requestBody = {
        property_description: propertyDescription,
        k: k,
      };

      const response = await apiRequest<FindMatchesResponse>(
        `/find-matches?url=${encodedUrl}`,
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      console.log('findMatchesSimple response (retry):', response);
      return response;
    }

    // If it's a different error, re-throw it
    throw error;
  }
}

/**
 * Alternative version that passes url as a separate parameter
 * @param propertyDescription - Description of the property to find matches for
 * @param customerDataUrl - URL or path to customer data
 * @param k - Number of matches to return
 * @returns Promise with matching customers and their scores
 */
export async function findMatchesWithUrl(
  propertyDescription: string,
  customerDataUrl: string,
  k = 3
): Promise<FindMatchesResponse> {
  try {
    // Try sending url as a query parameter
    const encodedUrl = encodeURIComponent(customerDataUrl);
    const requestBody = {
      property_description: propertyDescription,
      k: k,
    };

    const response = await apiRequest<FindMatchesResponse>(
      `/find-matches?url=${encodedUrl}`,
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }
    );

    console.log('findMatchesWithUrl response:', response);
    return response;
  } catch (error) {
    console.error('Error in findMatchesWithUrl:', error);
    throw error;
  }
}
