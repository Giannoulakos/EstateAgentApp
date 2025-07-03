import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import CustomersPage from './components/CustomersPage';
import PropertiesPage from './components/PropertiesPage';

// Environment variables
const MAX_FILE_SIZE = parseInt(
  import.meta.env.REACT_APP_CSV_MAX_SIZE || '10485760'
); // 10MB default
const SUPPORTED_TYPES = import.meta.env.REACT_APP_SUPPORTED_FILE_TYPES?.split(
  ','
) || ['.csv'];
const DEBUG_MODE = import.meta.env.REACT_APP_DEBUG === 'true';
const APP_NAME = import.meta.env.REACT_APP_APP_NAME || 'Real Estate Agent';
const API_URL = import.meta.env.REACT_APP_API_URL;

function App() {
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<string>('customers');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      alert(
        `File too large. Maximum size is ${(
          MAX_FILE_SIZE /
          1024 /
          1024
        ).toFixed(1)}MB`
      );
      return;
    }

    // File type validation
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_TYPES.includes(fileExtension)) {
      alert(
        `Unsupported file type. Supported types: ${SUPPORTED_TYPES.join(', ')}`
      );
      return;
    }

    if (file && (file.type === 'text/csv' || fileExtension === '.csv')) {
      setFileName(file.name);
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text
          .split('\n')
          .map((row) => row.split(',').map((cell) => cell.trim()));
        setCsvData(rows.filter((row) => row.some((cell) => cell.length > 0)));

        if (DEBUG_MODE) {
          console.log('CSV loaded:', {
            fileName: file.name,
            rows: rows.length,
          });
        }
      };

      reader.readAsText(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const clearData = () => {
    setCsvData([]);
    setFileName('');
    if (DEBUG_MODE) {
      console.log('CSV data cleared');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

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
        {/* File Upload Section */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            flexShrink: 0,
          }}
        >
          <h2 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>
            Data Upload
          </h2>
          {DEBUG_MODE && (
            <div
              style={{
                background: '#fff3cd',
                padding: '10px',
                marginBottom: '20px',
                borderRadius: '4px',
              }}
            >
              <strong>Debug Mode:</strong> Environment:{' '}
              {import.meta.env.REACT_APP_ENV}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              flexWrap: 'wrap',
            }}
          >
            <input
              type='file'
              accept={SUPPORTED_TYPES.join(',')}
              onChange={handleFileUpload}
              style={{
                padding: '10px',
                border: '2px dashed #ddd',
                borderRadius: '6px',
                backgroundColor: '#f8f9fa',
              }}
            />
            {fileName && (
              <button
                onClick={clearData}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Clear Data
              </button>
            )}
          </div>

          {fileName && (
            <p style={{ color: '#666', marginTop: '10px' }}>
              Loaded file: <strong>{fileName}</strong>
              {DEBUG_MODE && ` (${csvData.length} rows)`}
            </p>
          )}
        </div>

        {/* Page Content */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            width: '100%',
            height: '100%',
            flexDirection: 'column',
          }}
        >
          {currentPage === 'customers' && <CustomersPage csvData={csvData} />}
          {currentPage === 'properties' && <PropertiesPage />}
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById('root') || document.body;
const root = createRoot(container);
root.render(<App />);
