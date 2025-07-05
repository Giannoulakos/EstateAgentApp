import React, { useState } from 'react';
import { parseCSVText, detectCsvType } from '../utils/propertyUtils';
import './Properties.css';

interface AddDataPageProps {
  onPropertiesDataUpdate: (data: string[][], fileName: string) => void;
  onCustomersDataUpdate: (data: string[][], fileName: string) => void;
}

const AddDataPage: React.FC<AddDataPageProps> = ({
  onPropertiesDataUpdate,
  onCustomersDataUpdate,
}) => {
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    dataType: 'properties' | 'customers'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadStatus({
        type: 'error',
        message: 'Please upload a CSV file.',
      });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadStatus({
        type: 'error',
        message: 'File size must be less than 10MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const parsedData = parseCSVText(csvText);

        if (parsedData.length === 0) {
          setUploadStatus({
            type: 'error',
            message: 'The CSV file appears to be empty.',
          });
          return;
        }

        // Detect CSV type
        const detectedType = detectCsvType(parsedData);

        // Check if the detected type matches the intended type
        if (
          (dataType === 'properties' && detectedType === 'customers') ||
          (dataType === 'customers' && detectedType === 'properties')
        ) {
          setUploadStatus({
            type: 'error',
            message: `This appears to be a ${detectedType} CSV file, but you're trying to upload it as ${dataType}. Please check your file or use the correct upload section.`,
          });
          return;
        }

        // Update the appropriate data
        if (dataType === 'properties') {
          onPropertiesDataUpdate(parsedData, file.name);
        } else {
          onCustomersDataUpdate(parsedData, file.name);
        }

        setUploadStatus({
          type: 'success',
          message: `Successfully uploaded ${
            parsedData.length - 1
          } ${dataType} records from ${file.name}.`,
        });

        // Clear the file input
        event.target.value = '';
      } catch (error) {
        setUploadStatus({
          type: 'error',
          message: `Error processing file: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        });
      }
    };

    reader.onerror = () => {
      setUploadStatus({
        type: 'error',
        message: 'Error reading the file.',
      });
    };

    reader.readAsText(file);
  };

  const clearStatus = () => {
    setUploadStatus({ type: null, message: '' });
  };

  return (
    <div className='properties-page'>
      <div className='page-header'>
        <h1>Add Data</h1>
        <p>Upload CSV files to add properties and customers to your database</p>
      </div>

      {uploadStatus.type && (
        <div
          style={{
            background:
              uploadStatus.type === 'success'
                ? '#d4edda'
                : uploadStatus.type === 'error'
                ? '#f8d7da'
                : '#d1ecf1',
            color:
              uploadStatus.type === 'success'
                ? '#155724'
                : uploadStatus.type === 'error'
                ? '#721c24'
                : '#0c5460',
            padding: '12px 16px',
            borderRadius: '8px',
            border: `1px solid ${
              uploadStatus.type === 'success'
                ? '#c3e6cb'
                : uploadStatus.type === 'error'
                ? '#f5c6cb'
                : '#b8daff'
            }`,
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{uploadStatus.message}</span>
          <button
            onClick={clearStatus}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0 4px',
            }}
          >
            ×
          </button>
        </div>
      )}

      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}
      >
        {/* Properties Upload Section */}
        <div
          style={{
            background: '#f8f9fa',
            padding: '24px',
            borderRadius: '12px',
            border: '2px dashed #dee2e6',
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏠</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>
              Upload Properties
            </h3>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              CSV file with property listings
            </p>
          </div>

          <input
            type='file'
            accept='.csv'
            onChange={(e) => handleFileUpload(e, 'properties')}
            style={{ display: 'none' }}
            id='properties-upload'
          />
          <label
            htmlFor='properties-upload'
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#007bff',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
            }}
          >
            Choose Properties CSV File
          </label>

          <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
            <p style={{ margin: '4px 0' }}>
              Expected columns: Title, Type, Location, Price, etc.
            </p>
            <p style={{ margin: '4px 0' }}>Maximum file size: 10MB</p>
          </div>
        </div>

        {/* Customers Upload Section */}
        <div
          style={{
            background: '#f8f9fa',
            padding: '24px',
            borderRadius: '12px',
            border: '2px dashed #dee2e6',
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>
              Upload Customers
            </h3>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              CSV file with customer information
            </p>
          </div>

          <input
            type='file'
            accept='.csv'
            onChange={(e) => handleFileUpload(e, 'customers')}
            style={{ display: 'none' }}
            id='customers-upload'
          />
          <label
            htmlFor='customers-upload'
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#28a745',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e7e34';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#28a745';
            }}
          >
            Choose Customers CSV File
          </label>

          <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
            <p style={{ margin: '4px 0' }}>
              Expected columns: Contact ID, First Name, Last Name, Email, etc.
            </p>
            <p style={{ margin: '4px 0' }}>Maximum file size: 10MB</p>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div style={{ marginTop: '40px' }}>
        <h3>CSV Format Guidelines</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e9ecef',
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', color: '#007bff' }}>
              Properties CSV Format
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
              <li>Title or Property Name</li>
              <li>Type (apartment, house, condo, etc.)</li>
              <li>Location or Address</li>
              <li>Price (with or without currency symbols)</li>
              <li>Bedrooms, Bathrooms, Square Feet</li>
              <li>Status (available, pending, sold)</li>
              <li>Agent or Broker information</li>
              <li>Description and Amenities</li>
            </ul>
          </div>

          <div
            style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e9ecef',
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', color: '#28a745' }}>
              Customers CSV Format
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
              <li>Contact ID (unique identifier)</li>
              <li>First Name and Last Name</li>
              <li>Email Address</li>
              <li>Phone Number</li>
              <li>Primary Address</li>
              <li>Type (buyer, seller, investor, etc.)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDataPage;
