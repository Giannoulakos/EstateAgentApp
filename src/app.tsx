import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CustomersPage from './components/CustomersPage';
import PropertiesPage from './components/PropertiesPage';
import MatchesPage from './components/MatchesPage';
import AddDataPage from './components/AddDataPage';
import LoginPage from './components/LoginPage';
import { Match } from './types/property';

function App() {
  const [customersCsvData, setCustomersCsvData] = useState<string[][]>([]);
  const [propertiesCsvData, setPropertiesCsvData] = useState<string[][]>([]);
  const [customersFileName, setCustomersFileName] = useState<string>('');
  const [propertiesFileName, setPropertiesFileName] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<string>('customers');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Matches state to store results from find sellers
  const [matches, setMatches] = useState<
    Array<{
      propertyId: string;
      propertyTitle: string;
      matches: Match[];
    }>
  >([]);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authenticated = await window.electronAPI.auth.isAuthenticated();

        if (authenticated) {
          // Only try to get profile if authenticated
          try {
            const profile = await window.electronAPI.auth.getProfile();
            setUserProfile(profile);
            setIsAuthenticated(true);
          } catch (profileError) {
            console.error('Error getting user profile:', profileError);
            // If profile fails, user might need to re-authenticate
            setIsAuthenticated(false);
            setUserProfile(null);
          }
        } else {
          setIsAuthenticated(false);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setIsAuthenticated(false);
        setUserProfile(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleAuthSuccess = async () => {
    try {
      const profile = await window.electronAPI.auth.getProfile();
      setUserProfile(profile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error getting user profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      const result = await window.electronAPI.auth.logOut();

      if (result.success) {
        console.log('Logout successful, updating UI state');
        setIsAuthenticated(false);
        setUserProfile(null);
        setCurrentPage('customers'); // Reset to default page
      } else {
        console.error('Logout failed:', result.error);
        // Still update UI state even if logout had issues
        setIsAuthenticated(false);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Still update UI state even if logout had issues
      setIsAuthenticated(false);
      setUserProfile(null);
    }
  };

  // Show loading state while checking authentication
  if (isAuthLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontSize: '18px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        Loading...
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Callback functions for AddDataPage
  const handlePropertiesDataUpdate = (data: string[][], fileName: string) => {
    setPropertiesCsvData(data);
    setPropertiesFileName(fileName);
  };

  const handleCustomersDataUpdate = (data: string[][], fileName: string) => {
    setCustomersCsvData(data);
    setCustomersFileName(fileName);
  };

  // Handler for when matches are found in PropertiesPage
  const handleMatchesFound = (
    propertyId: string,
    propertyTitle: string,
    newMatches: Match[]
  ) => {
    setMatches((prevMatches) => {
      // Remove any existing matches for this property
      const filteredMatches = prevMatches.filter(
        (match) => match.propertyId !== propertyId
      );

      // Add the new matches
      return [
        { propertyId, propertyTitle, matches: newMatches },
        ...filteredMatches,
      ];
    });

    // Navigate to matches page
    setCurrentPage('matches');
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        userProfile={userProfile}
        onLogout={handleLogout}
      />

      <div
        style={{
          marginLeft: '250px',
          flex: 1,
          width: 'calc(100vw - 250px)',
          height: '100vh',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Page Content */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            padding: '20px',
          }}
        >
          {currentPage === 'customers' && (
            <CustomersPage csvData={customersCsvData} />
          )}
          {currentPage === 'properties' && (
            <PropertiesPage
              csvData={propertiesCsvData}
              onMatchesFound={handleMatchesFound}
            />
          )}
          {currentPage === 'matches' && <MatchesPage matches={matches} />}
          {currentPage === 'add-data' && (
            <AddDataPage
              onPropertiesDataUpdate={handlePropertiesDataUpdate}
              onCustomersDataUpdate={handleCustomersDataUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById('root') || document.body;
const root = createRoot(container);
root.render(<App />);
