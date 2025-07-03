interface FindMatchesRequest {
  property_description: string;
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
 * @returns Promise with matching customers and their scores
 */
export async function findMatchesSimple(
  propertyDescription: string,
  k: number = 3
): Promise<FindMatchesResponse> {
  const requestBody: FindMatchesRequest = {
    property_description: propertyDescription,
    k: k,
  };

  const response = await apiRequest<FindMatchesResponse>('/find-matches', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  console.log('findMatchesSimple response:', response);
  return response;
}
