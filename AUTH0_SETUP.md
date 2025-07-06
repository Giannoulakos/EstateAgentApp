# Auth0 Integration Documentation

## Overview

This Electron application now includes Auth0 authentication with secure token storage using the keytar library. The authentication system provides OAuth 2.0 / OpenID Connect authentication for your Real Estate Agent application.

## Features

- **Secure Authentication**: Uses Auth0's hosted login page for authentication
- **Token Security**: Refresh tokens are stored securely using keytar (system keychain)
- **Session Management**: Automatic token refresh and session validation
- **User Profile**: Access to user profile information from Auth0
- **Logout**: Proper logout with token cleanup

## Configuration

The application uses the following environment variables from `.env`:

- `AUTH0_DOMAIN`: Your Auth0 domain (e.g., `dev-iu5zvaecxrbgyue2.us.auth0.com`)
- `AUTH0_CLIENT_ID`: Your Auth0 application client ID
- `AUTH0_CLIENT_SECRET`: Your Auth0 application client secret

## Auth0 Application Setup

1. **Create Auth0 Application**:

   - Go to Auth0 Dashboard → Applications
   - Create a new "Native" application
   - Note the Domain, Client ID, and Client Secret

2. **Configure Callback URLs**:

   - Add `real-estate-agent://callback` to Allowed Callback URLs
   - Add `real-estate-agent://callback` to Allowed Web Origins

3. **Configure Logout URLs**:

   - Add your logout URL to Allowed Logout URLs
   - For development, you can use `real-estate-agent://logout` or leave it empty

4. **Application Type**:
   - Ensure the application type is set to "Native"
   - This allows for the custom protocol scheme authentication flow

## Authentication Flow

1. **Initial Load**: App checks for valid refresh token
2. **No Token**: Shows Auth0 login window
3. **Login**: User authenticates via Auth0
4. **Token Exchange**: Authorization code is exchanged for tokens
5. **Token Storage**: Refresh token is stored securely via keytar
6. **Main App**: User is redirected to main application

## Usage in Renderer Process

The authentication API is exposed to the renderer process via `window.electronAPI.auth`:

```typescript
// Check authentication status
const isAuth = await window.electronAPI.auth.isAuthenticated();

// Get user profile
const profile = await window.electronAPI.auth.getProfile();

// Get access token for API calls
const accessToken = await window.electronAPI.auth.getAccessToken();

// Logout
window.electronAPI.auth.logOut();

// Manual login (if needed)
window.electronAPI.auth.login();
```

## Security Features

- **Refresh Token Storage**: Stored securely in system keychain via keytar
- **Context Isolation**: Renderer process has no direct access to Node.js APIs
- **Token Validation**: Automatic token refresh and validation
- **Secure Communication**: IPC communication between main and renderer processes

## Components

- **LoginPage**: React component for handling authentication UI
- **Sidebar**: Updated to show user profile and logout functionality
- **App**: Main app component with authentication state management

## Dependencies

- `keytar`: For secure token storage
- `axios`: For HTTP requests to Auth0
- `jwt-decode`: For decoding JWT tokens
- `dotenv`: For environment variable management

## Development Notes

- The Auth0 login window opens automatically when no valid session exists
- User profile information is displayed in the sidebar
- Logout clears stored tokens and shows login window again
- All authentication logic is contained within the main process for security
- **Custom Protocol**: The app uses `real-estate-agent://callback` for Auth0 callbacks
- **Protocol Registration**: The app registers itself as a handler for the `real-estate-agent://` protocol

## Troubleshooting

1. **Environment Variables**: Ensure all Auth0 environment variables are set in `.env`
2. **Callback URLs**: Verify callback URLs are configured correctly in Auth0 as `real-estate-agent://callback`
3. **Keytar**: Ensure keytar is properly installed and working on your system
4. **Network**: Check network connectivity for Auth0 API calls
5. **Protocol Registration**: If callbacks aren't working, try restarting the app or rebuilding it
6. **Auth0 Application Type**: Ensure your Auth0 application is set to "Native" type
