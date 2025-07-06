import { BrowserWindow, dialog } from 'electron';
import authService from '../services/auth-service';

let authWindow: any = null;

interface AuthWindowOptions {
  width?: number;
  height?: number;
  show?: boolean;
  title?: string;
  autoHideMenuBar?: boolean;
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  webPreferences?: {
    nodeIntegration?: boolean;
    contextIsolation?: boolean;
    webSecurity?: boolean;
  };
}

export const createAuthWindow = (onAuthSuccess?: () => void): any => {
  destroyAuthWindow();

  const windowOptions: AuthWindowOptions = {
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    show: false,
    title: 'Log In - Real Estate Agent',
    autoHideMenuBar: true,
    resizable: true,
    minimizable: true,
    maximizable: true,
    closable: true,
  };

  authWindow = new BrowserWindow(windowOptions);

  authWindow.loadURL(authService.getAuthenticationURL());

  // Show window once ready to prevent visual flash
  authWindow.once('ready-to-show', () => {
    authWindow?.show();
    authWindow?.focus();
  });

  const session: any = authWindow.webContents.session;
  const webRequest: any = session.webRequest;

  // Handle both HTTP localhost and custom protocol callbacks
  const filter = {
    urls: ['http://localhost/callback*', 'real-estate-agent://callback*'],
  };

  webRequest.onBeforeRequest(filter, async ({ url }: { url: string }) => {
    try {
      console.log('Auth callback received:', url);
      await authService.loadTokens(url);

      destroyAuthWindow();

      if (onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (error) {
      console.error('Authentication error:', error);
      destroyAuthWindow();

      // Show error to user
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to authenticate with Auth0';
      dialog.showErrorBox('Authentication Error', errorMessage);
    }
  });

  authWindow.on('closed', () => {
    authWindow = null;
  });

  // Handle window close by user
  authWindow.on('close', () => {
    destroyAuthWindow();
  });

  return authWindow;
};

export const destroyAuthWindow = (): void => {
  if (!authWindow) return;
  authWindow.close();
  authWindow = null;
};

export const createLogoutWindow = (onLogoutComplete?: () => void): any => {
  const logoutWindowOptions: AuthWindowOptions = {
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  };

  const logoutWindow = new BrowserWindow(logoutWindowOptions);

  logoutWindow.loadURL(authService.getLogOutUrl());

  logoutWindow.webContents.on('did-finish-load', async () => {
    console.log('Logout window loaded, clearing session...');
    await authService.logout();
    logoutWindow.close();

    if (onLogoutComplete) {
      onLogoutComplete();
    }
  });

  logoutWindow.on('closed', () => {
    // Ensure logout is complete even if window is closed manually
    authService
      .logout()
      .then(() => {
        if (onLogoutComplete) {
          onLogoutComplete();
        }
      })
      .catch((err: Error) => {
        console.error('Error during logout cleanup:', err);
        if (onLogoutComplete) {
          onLogoutComplete();
        }
      });
  });

  return logoutWindow;
};

// Default export for CommonJS compatibility
export default {
  createAuthWindow,
  createLogoutWindow,
  destroyAuthWindow,
};
