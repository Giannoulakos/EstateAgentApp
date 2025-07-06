import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { URL } from 'node:url';
import started from 'electron-squirrel-startup';
import 'dotenv/config';

// Import Auth0 modules
import authService from './services/auth-service';
import {
  createAuthWindow,
  createLogoutWindow,
  destroyAuthWindow,
} from './main/auth-process';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// Register the custom protocol scheme
app.setAsDefaultProtocolClient('real-estate-agent');

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
    title: 'Real Estate Agent',
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Open the DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

async function showWindow() {
  try {
    // Try to refresh tokens silently
    await authService.refreshTokens();
    console.log('User already authenticated, showing main window');
    createWindow();
  } catch (err) {
    console.log('No valid session found, showing login window');
    createAuthWindow(() => {
      console.log('Authentication successful, creating main window');
      createWindow();
    });
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // Handle IPC messages from the renderer process
  ipcMain.handle('auth:get-profile', async () => {
    try {
      return authService.getProfile();
    } catch (error) {
      console.error('IPC auth:get-profile error:', error);
      throw error;
    }
  });

  ipcMain.handle('auth:get-access-token', async () => {
    try {
      return authService.getAccessToken();
    } catch (error) {
      console.error('IPC auth:get-access-token error:', error);
      return null;
    }
  });

  ipcMain.handle('auth:is-authenticated', async () => {
    try {
      return authService.isAuthenticated();
    } catch (error) {
      console.error('IPC auth:is-authenticated error:', error);
      return false;
    }
  });

  ipcMain.handle('auth:log-out', async () => {
    console.log('Logout requested');

    try {
      // Clear the stored credentials
      await authService.logout();
      console.log('User logged out successfully');

      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  ipcMain.handle('auth:login', () => {
    console.log('Manual login requested');

    return new Promise((resolve, reject) => {
      createAuthWindow(() => {
        console.log('Authentication successful');
        resolve({ success: true });
      });
    });
  });

  // Show appropriate window based on auth state
  showWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Clean up any remaining auth windows before quitting
    destroyAuthWindow();
    app.quit();
  }
});

app.on('before-quit', (event) => {
  console.log('App is about to quit, cleaning up...');
  // Clean up any auth windows gracefully
  destroyAuthWindow();
});

app.on('will-quit', (event) => {
  console.log('App will quit, final cleanup...');
  // Final cleanup before the app actually quits
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    showWindow();
  }
});

// Handle protocol for authentication callback
app.on('open-url', (event, url) => {
  console.log('Protocol URL received:', url);

  if (url.startsWith('real-estate-agent://callback')) {
    const urlParts = new URL(url);
    const code = urlParts.searchParams.get('code');

    if (code) {
      authService
        .loadTokens(url)
        .then(() => {
          destroyAuthWindow();
          createWindow();
        })
        .catch((error: Error) => {
          console.error('Error exchanging code for tokens:', error);
          destroyAuthWindow();
        });
    }
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
