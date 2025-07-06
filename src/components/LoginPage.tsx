import React, { useState, useEffect } from 'react';

interface LoginPageProps {
  onAuthSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onAuthSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already authenticated on component mount
    const checkAuth = async () => {
      try {
        const isAuth = await window.electronAPI.auth.isAuthenticated();
        if (isAuth) {
          onAuthSuccess();
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      }
    };

    checkAuth();
  }, [onAuthSuccess]);

  const handleLogin = () => {
    setIsLoading(true);
    try {
      window.electronAPI.auth.login();
      // Note: The actual authentication success will be handled by the main process
      // and will trigger the onAuthSuccess callback through the app's auth state management
    } catch (error) {
      console.error('Error initiating login:', error);
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        margin: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '60px 40px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <div style={{ marginBottom: '30px' }}>
          <h1
            style={{
              color: '#2c3e50',
              fontSize: '28px',
              fontWeight: '600',
              margin: '0 0 10px 0',
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            🏠 Real Estate Agent
          </h1>
          <p
            style={{
              color: '#7f8c8d',
              fontSize: '16px',
              margin: 0,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Secure Property Management Platform
          </p>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <div
            style={{
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px',
            }}
          >
            <p
              style={{
                color: '#495057',
                fontSize: '14px',
                margin: 0,
                lineHeight: '1.5',
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              Welcome to your Real Estate Management Dashboard. Sign in securely
              with Auth0 to access your properties, customers, and data
              management tools.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '15px',
              margin: '20px 0',
            }}
          >
            <div
              style={{
                padding: '8px 12px',
                background: '#e8f5e8',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#2d5a27',
                fontWeight: '500',
              }}
            >
              🔒 Secure Login
            </div>
            <div
              style={{
                padding: '8px 12px',
                background: '#e3f2fd',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#1565c0',
                fontWeight: '500',
              }}
            >
              🚀 OAuth 2.0
            </div>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: isLoading
              ? '#95a5a6'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow =
                '0 8px 20px rgba(102, 126, 234, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          {isLoading ? (
            <>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              ></div>
              Opening Auth0...
            </>
          ) : (
            <>🔐 Sign In with Auth0</>
          )}
        </button>

        <div
          style={{
            marginTop: '30px',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#6c757d',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <strong>🛡️ Security Notice:</strong> This application uses Auth0 for
          secure authentication. Your credentials are never stored locally and
          all data is encrypted in transit.
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoginPage;
