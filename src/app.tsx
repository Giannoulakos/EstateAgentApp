import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import CustomersPage from './components/CustomersPage';
import PropertiesPage from './components/PropertiesPage';
import { detectCsvType, parseCSVText } from './utils/propertyUtils';

// Environment variables
const MAX_FILE_SIZE = parseInt(
  import.meta.env.REACT_APP_CSV_MAX_SIZE || '10485760'
); // 10MB default
const SUPPORTED_TYPES = import.meta.env.REACT_APP_SUPPORTED_FILE_TYPES?.split(
  ','
) || ['.csv'];
const DEBUG_MODE = import.meta.env.REACT_APP_DEBUG === 'true';

function App() {
  const [customersCsvData, setCustomersCsvData] = useState<string[][]>([]);
  const [propertiesCsvData, setPropertiesCsvData] = useState<string[][]>([]);
  const [customersFileName, setCustomersFileName] = useState<string>('');
  const [propertiesFileName, setPropertiesFileName] = useState<string>('');
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
      // Set filename based on current page
      if (currentPage === 'customers') {
        setCustomersFileName(file.name);
      } else if (currentPage === 'properties') {
        setPropertiesFileName(file.name);
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target?.result as string;
        const filteredRows = parseCSVText(text);

        // Detect CSV type
        const detectedType = detectCsvType(filteredRows);

        // Warn if CSV type doesn't match current page
        if (detectedType !== 'unknown' && detectedType !== currentPage) {
          const shouldContinue = confirm(
            `This appears to be a ${detectedType} CSV file, but you're on the ${currentPage} page. ` +
              `Would you like to continue anyway? (Consider switching to the ${detectedType} page for better results)`
          );
          if (!shouldContinue) return;
        }

        // Set CSV data based on current page
        if (currentPage === 'customers') {
          setCustomersCsvData(filteredRows);
        } else if (currentPage === 'properties') {
          setPropertiesCsvData(filteredRows);
        }

        if (DEBUG_MODE) {
          console.log(`${currentPage} CSV loaded:`, {
            fileName: file.name,
            rows: filteredRows.length,
            detectedType,
          });
        }
      };

      reader.readAsText(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const clearData = () => {
    if (currentPage === 'customers') {
      setCustomersCsvData([]);
      setCustomersFileName('');
    } else if (currentPage === 'properties') {
      setPropertiesCsvData([]);
      setPropertiesFileName('');
    }

    if (DEBUG_MODE) {
      console.log(`${currentPage} CSV data cleared`);
    }
  };

  // Get current page data
  const getCurrentPageData = () => {
    if (currentPage === 'customers') {
      return {
        csvData: customersCsvData,
        fileName: customersFileName,
      };
    } else if (currentPage === 'properties') {
      return {
        csvData: propertiesCsvData,
        fileName: propertiesFileName,
      };
    }
    return { csvData: [], fileName: '' };
  };

  const { csvData, fileName } = getCurrentPageData();

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
            {currentPage === 'customers'
              ? 'Customer Data Upload'
              : 'Property Data Upload'}
          </h2>
          <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
            {currentPage === 'customers'
              ? 'Upload a CSV file with customer information (name, email, phone, etc.)'
              : 'Upload a CSV file with property listings (title, type, location, price, etc.)'}
          </p>
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
          {currentPage === 'customers' && (
            <CustomersPage csvData={customersCsvData} />
          )}
          {currentPage === 'properties' && (
            <PropertiesPage csvData={propertiesCsvData} />
          )}
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById('root') || document.body;
const root = createRoot(container);
root.render(<App />);
