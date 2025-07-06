// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// Auth0 API Definition
const authAPI = {
  getProfile: () => ipcRenderer.invoke('auth:get-profile'),
  getAccessToken: () => ipcRenderer.invoke('auth:get-access-token'),
  isAuthenticated: () => ipcRenderer.invoke('auth:is-authenticated'),
  logOut: () => ipcRenderer.send('auth:log-out'),
  login: () => ipcRenderer.send('auth:login'),
};

// Register the API with the contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
  auth: authAPI,
});
