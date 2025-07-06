// src/types/electron.d.ts

export interface ElectronAPI {
  auth: {
    getProfile: () => Promise<any>;
    getAccessToken: () => Promise<string | null>;
    isAuthenticated: () => Promise<boolean>;
    logOut: () => void;
    login: () => void;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
