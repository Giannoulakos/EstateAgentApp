import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import CustomersPage from './components/CustomersPage';
import PropertiesPage from './components/PropertiesPage';
import AddDataPage from './components/AddDataPage';

function App() {
  const [customersCsvData, setCustomersCsvData] = useState<string[][]>([]);
  const [propertiesCsvData, setPropertiesCsvData] = useState<string[][]>([]);
  const [customersFileName, setCustomersFileName] = useState<string>('');
  const [propertiesFileName, setPropertiesFileName] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<string>('customers');

  // Callback functions for AddDataPage
  const handlePropertiesDataUpdate = (data: string[][], fileName: string) => {
    setPropertiesCsvData(data);
    setPropertiesFileName(fileName);
  };

  const handleCustomersDataUpdate = (data: string[][], fileName: string) => {
    setCustomersCsvData(data);
    setCustomersFileName(fileName);
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
            <PropertiesPage csvData={propertiesCsvData} />
          )}
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
