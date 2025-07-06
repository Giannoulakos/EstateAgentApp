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

  // Handle navigation events to catch the callback URL
  authWindow.webContents.on(
    'will-navigate',
    async (event: any, navigationUrl: string) => {
      console.log('Navigation to:', navigationUrl);

      // Check if this is our callback URL (without wildcards)
      if (navigationUrl.startsWith('real-estate-agent://callback')) {
        event.preventDefault();

        try {
          console.log('Auth callback received:', navigationUrl);
          await authService.loadTokens(navigationUrl);

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
      }
    }
  );

  // Also handle did-navigate as a fallback
  authWindow.webContents.on(
    'did-navigate',
    async (event: any, navigationUrl: string) => {
      console.log('Did navigate to:', navigationUrl);

      if (navigationUrl.startsWith('real-estate-agent://callback')) {
        try {
          console.log(
            'Auth callback received via did-navigate:',
            navigationUrl
          );
          await authService.loadTokens(navigationUrl);

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
      }
    }
  );

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

  try {
    // Check if window is already destroyed
    if (!authWindow.isDestroyed()) {
      authWindow.destroy();
    }
  } catch (error) {
    console.error('Error destroying auth window:', error);
  } finally {
    authWindow = null;
  }
};

export const createLogoutWindow = (onLogoutComplete?: () => void): any => {
  const logoutWindowOptions: AuthWindowOptions = {
    width: 400,
    height: 300,
    show: false,
    title: 'Logging out...',
    resizable: false,
    minimizable: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  };

  const logoutWindow = new BrowserWindow(logoutWindowOptions);

  // Load the Auth0 logout URL
  logoutWindow.loadURL(authService.getLogOutUrl());

  // Set a timeout to ensure logout doesn't hang indefinitely
  const logoutTimeout = setTimeout(() => {
    console.log('Logout timeout reached, forcing cleanup...');
    authService
      .logout()
      .then(() => {
        if (!logoutWindow.isDestroyed()) {
          logoutWindow.destroy();
        }
        if (onLogoutComplete) {
          onLogoutComplete();
        }
      })
      .catch((err: Error) => {
        console.error('Error during forced logout cleanup:', err);
        if (!logoutWindow.isDestroyed()) {
          logoutWindow.destroy();
        }
        if (onLogoutComplete) {
          onLogoutComplete();
        }
      });
  }, 5000); // 5 second timeout

  logoutWindow.webContents.on('did-finish-load', async () => {
    console.log('Logout window loaded, clearing session...');

    // Clear the timeout since we got a proper response
    clearTimeout(logoutTimeout);

    try {
      await authService.logout();
      console.log('Session cleared successfully');

      // Wait a moment before closing to ensure cleanup is complete
      setTimeout(() => {
        if (!logoutWindow.isDestroyed()) {
          logoutWindow.destroy();
        }

        if (onLogoutComplete) {
          onLogoutComplete();
        }
      }, 1000);
    } catch (error) {
      console.error('Error during logout:', error);
      if (!logoutWindow.isDestroyed()) {
        logoutWindow.destroy();
      }

      if (onLogoutComplete) {
        onLogoutComplete();
      }
    }
  });

  // Handle navigation events that might indicate logout completion
  logoutWindow.webContents.on(
    'did-navigate',
    (event: any, navigationUrl: string) => {
      console.log('Logout navigation to:', navigationUrl);

      // Check if we've been redirected to a logout completion page
      if (
        navigationUrl.includes('logout') ||
        navigationUrl.includes('logged-out')
      ) {
        clearTimeout(logoutTimeout);

        authService
          .logout()
          .then(() => {
            setTimeout(() => {
              if (!logoutWindow.isDestroyed()) {
                logoutWindow.destroy();
              }

              if (onLogoutComplete) {
                onLogoutComplete();
              }
            }, 1000);
          })
          .catch((err: Error) => {
            console.error('Error during logout cleanup:', err);
            if (!logoutWindow.isDestroyed()) {
              logoutWindow.destroy();
            }

            if (onLogoutComplete) {
              onLogoutComplete();
            }
          });
      }
    }
  );

  logoutWindow.on('closed', () => {
    // Clean up timeout if window is closed manually
    clearTimeout(logoutTimeout);

    // Ensure logout is complete even if window is closed manually
    authService
      .logout()
      .then(() => {
        console.log('Logout cleanup completed after window close');
        if (onLogoutComplete) {
          onLogoutComplete();
        }
      })
      .catch((err: Error) => {
        console.error('Error during logout cleanup after window close:', err);
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
