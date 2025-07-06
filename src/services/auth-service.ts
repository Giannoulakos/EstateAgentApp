// Use CommonJS requires for better Electron compatibility
const { jwtDecode } = require('jwt-decode');
const axios = require('axios');
const { parse: parseUrl } = require('url');
const keytar = require('keytar');
const { userInfo } = require('os');
require('dotenv/config');

// Define types
interface UserProfile {
  name?: string;
  email?: string;
  picture?: string;
  sub?: string;
  [key: string]: any;
}

interface TokenResponse {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
}

interface AuthResult {
  accessToken: string;
  profile: UserProfile | null;
  refreshToken?: string;
}

// Get Auth0 configuration from environment variables
const auth0Domain = process.env.AUTH0_DOMAIN;
const clientId = process.env.AUTH0_CLIENT_ID;

if (!auth0Domain || !clientId) {
  throw new Error('Auth0 configuration missing. Please check your .env file.');
}

const redirectUri = 'real-estate-agent://callback';
const keytarService = 'real-estate-agent-electron';
const keytarAccount = userInfo().username;

let accessToken: string | null = null;
let profile: UserProfile | null = null;
let refreshToken: string | null = null;

export const getAccessToken = (): string | null => accessToken;

export const getProfile = (): UserProfile | null => profile;

export const getAuthenticationURL = (): string => {
  const params = new URLSearchParams({
    scope: 'openid profile offline_access email',
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
  });

  return `https://${auth0Domain}/authorize?${params.toString()}`;
};

export const refreshTokens = async (): Promise<AuthResult> => {
  const storedRefreshToken = await keytar.getPassword(
    keytarService,
    keytarAccount
  );

  if (!storedRefreshToken) {
    throw new Error('No available refresh token.');
  }

  try {
    const response = await axios.post(
      `https://${auth0Domain}/oauth/token`,
      {
        grant_type: 'refresh_token',
        client_id: clientId,
        refresh_token: storedRefreshToken,
      },
      {
        headers: { 'content-type': 'application/json' },
      }
    );

    accessToken = response.data.access_token;

    if (response.data.id_token) {
      profile = jwtDecode(response.data.id_token);
    }

    // Update refresh token if a new one is provided
    if (response.data.refresh_token) {
      refreshToken = response.data.refresh_token;
      await keytar.setPassword(keytarService, keytarAccount, refreshToken);
    }

    console.log('Tokens refreshed successfully');
    return { accessToken, profile };
  } catch (error) {
    console.error(
      'Error refreshing tokens:',
      axios.isAxiosError(error) ? error.response?.data : error
    );
    await logout();
    throw error;
  }
};

export const loadTokens = async (callbackURL: string): Promise<AuthResult> => {
  const urlParts = parseUrl(callbackURL, true);
  const query = urlParts.query;

  if (query.error) {
    throw new Error(
      `Authentication error: ${query.error_description || query.error}`
    );
  }

  if (!query.code || typeof query.code !== 'string') {
    throw new Error('No authorization code received');
  }

  try {
    const response = await axios.post(
      `https://${auth0Domain}/oauth/token`,
      {
        grant_type: 'authorization_code',
        client_id: clientId,
        code: query.code,
        redirect_uri: redirectUri,
      },
      {
        headers: { 'content-type': 'application/json' },
      }
    );

    accessToken = response.data.access_token;

    if (response.data.id_token) {
      profile = jwtDecode(response.data.id_token);
    }

    refreshToken = response.data.refresh_token;

    if (refreshToken) {
      await keytar.setPassword(keytarService, keytarAccount, refreshToken);
    }

    console.log(
      'User authenticated successfully:',
      profile?.name || profile?.email
    );

    return { accessToken, profile, refreshToken };
  } catch (error) {
    console.error(
      'Error exchanging code for tokens:',
      axios.isAxiosError(error) ? error.response?.data : error
    );
    await logout();
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await keytar.deletePassword(keytarService, keytarAccount);
    console.log('Stored credentials cleared');
  } catch (error) {
    console.warn(
      'Error deleting stored credentials:',
      (error as Error).message
    );
  }

  accessToken = null;
  profile = null;
  refreshToken = null;
};

export const getLogOutUrl = (): string => {
  const returnTo = encodeURIComponent('real-estate-agent://logout');
  return `https://${auth0Domain}/v2/logout?returnTo=${returnTo}`;
};

export const isAuthenticated = (): boolean => {
  return !!accessToken && !!profile;
};

// Default export for CommonJS compatibility
export default {
  getAccessToken,
  getAuthenticationURL,
  getLogOutUrl,
  getProfile,
  loadTokens,
  logout,
  refreshTokens,
  isAuthenticated,
};
