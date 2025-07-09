// Use CommonJS requires for better Electron compatibility
const { jwtDecode } = require('jwt-decode');
const axios = require('axios');
const { parse: parseUrl } = require('url');
const { app, safeStorage } = require('electron');
const { userInfo } = require('os');
const fs = require('fs');
const path = require('path');
require('dotenv/config');

// Define types
interface UserProfile {
  name?: string;
  email?: string;
  picture?: string;
  sub?: string;
  [key: string]: any;
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

// Helper functions for secure storage using Electron's safeStorage
const getStorageFilePath = () => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'secure-storage.dat');
};

const storeSecureData = async (key: string, data: string): Promise<void> => {
  try {
    const filePath = getStorageFilePath();
    let storage: Record<string, string> = {};

    // Read existing data if file exists
    if (fs.existsSync(filePath)) {
      try {
        const encryptedData = fs.readFileSync(filePath);
        if (encryptedData.length > 0 && safeStorage.isEncryptionAvailable()) {
          const decryptedData = safeStorage.decryptString(encryptedData);
          storage = JSON.parse(decryptedData);
        }
      } catch (error) {
        console.warn('Error reading existing storage, creating new:', error);
        storage = {};
      }
    }

    // Update storage with new data
    storage[key] = data;

    // Encrypt and save
    const dataToStore = JSON.stringify(storage);
    if (safeStorage.isEncryptionAvailable()) {
      const encryptedData = safeStorage.encryptString(dataToStore);
      fs.writeFileSync(filePath, encryptedData);
    } else {
      // Fallback to plain text if encryption not available
      console.warn('Encryption not available, storing in plain text');
      fs.writeFileSync(filePath, dataToStore);
    }
  } catch (error) {
    console.error('Error storing secure data:', error);
    throw error;
  }
};

const getSecureData = async (key: string): Promise<string | null> => {
  try {
    const filePath = getStorageFilePath();

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileData = fs.readFileSync(filePath);
    if (fileData.length === 0) {
      return null;
    }

    let storage: Record<string, string> = {};

    if (safeStorage.isEncryptionAvailable()) {
      const decryptedData = safeStorage.decryptString(fileData);
      storage = JSON.parse(decryptedData);
    } else {
      // Fallback for plain text
      storage = JSON.parse(fileData.toString());
    }

    return storage[key] || null;
  } catch (error) {
    console.error('Error retrieving secure data:', error);
    return null;
  }
};

const deleteSecureData = async (key: string): Promise<void> => {
  try {
    const filePath = getStorageFilePath();

    if (!fs.existsSync(filePath)) {
      console.warn('Secure storage file does not exist, nothing to delete');
      return;
    }

    const fileData = fs.readFileSync(filePath);
    if (fileData.length === 0) {
      return;
    }

    let storage: Record<string, string> = {};

    if (safeStorage.isEncryptionAvailable()) {
      const decryptedData = safeStorage.decryptString(fileData);
      storage = JSON.parse(decryptedData);
    } else {
      storage = JSON.parse(fileData.toString());
    }

    delete storage[key];

    // Save updated storage
    const dataToStore = JSON.stringify(storage);
    if (safeStorage.isEncryptionAvailable()) {
      const encryptedData = safeStorage.encryptString(dataToStore);
      fs.writeFileSync(filePath, encryptedData);
    } else {
      fs.writeFileSync(filePath, dataToStore);
    }
  } catch (error) {
    console.error('Error deleting secure data:', error);
    throw error;
  }
};

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
  const storedRefreshToken = await getSecureData('refreshToken');

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
      await storeSecureData('refreshToken', refreshToken);
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
      await storeSecureData('refreshToken', refreshToken);
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
    await deleteSecureData('refreshToken');
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
