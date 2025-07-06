// src/types/electron.d.ts

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface ElectronAPI {
  auth: {
    getProfile: () => Promise<any>;
    getAccessToken: () => Promise<string | null>;
    isAuthenticated: () => Promise<boolean>;
    logOut: () => Promise<AuthResult>;
    login: () => Promise<AuthResult>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
