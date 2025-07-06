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
  openExternal: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
