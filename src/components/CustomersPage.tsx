import React, { useState } from 'react';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  primaryAddress: string;
  type: string;
  fullName?: string; // computed field
}

interface CustomersPageProps {
  csvData: string[][];
}

const CustomersPage: React.FC<CustomersPageProps> = ({ csvData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Convert CSV data to customer objects
  const parseCsvToCustomers = (csvData: string[][]): Customer[] => {
    if (csvData.length === 0) return [];

    const headers = csvData[0].map((h) => h.toLowerCase().trim());
    const rows = csvData
      .slice(1)
      .filter((row) => row.some((cell) => cell && cell.trim().length > 0));

    return rows
      .map((row, index) => {
        const getField = (fieldNames: string[]): string => {
          for (const fieldName of fieldNames) {
            const headerIndex = headers.findIndex(
              (h) => h.includes(fieldName) || fieldName.includes(h)
            );
            if (headerIndex !== -1 && row[headerIndex]) {
              return row[headerIndex].trim();
            }
          }
          return '';
        };

        const contactId = getField(['contact id', 'id', 'contact_id']);
        const firstName = getField(['first name', 'firstname', 'first_name']);
        const lastName = getField(['last name', 'lastname', 'last_name']);
        const email = getField(['email', 'email_address']);
        const phone = getField(['phone', 'phone_number', 'telephone']);
        const primaryAddress = getField([
          'primary address',
          'address',
          'primary_address',
        ]);
        const type = getField(['type', 'contact_type', 'category']);

        return {
          id: contactId || `customer_${index + 1}`,
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
          primaryAddress: primaryAddress,
          type: type || 'Buyer',
          fullName: `${firstName} ${lastName}`.trim(),
        };
      })
      .filter(
        (customer) => customer.firstName || customer.lastName || customer.email
      );
  };

  const customers: Customer[] = parseCsvToCustomers(csvData);

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(
      (customer) =>
        !searchTerm ||
        customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.primaryAddress.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name')
        return (a.fullName || '').localeCompare(b.fullName || '');
      if (sortBy === 'email') return a.email.localeCompare(b.email);
      if (sortBy === 'type') return a.type.localeCompare(b.type);
      return 0;
    });

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ marginBottom: '20px', flexShrink: 0 }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Customers</h1>
        <p style={{ margin: 0, color: '#7f8c8d' }}>
          Manage your real estate clients and their preferences
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div
        style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        <input
          type='text'
          placeholder='Search customers...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '10px 15px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '10px 15px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white',
          }}
        >
          <option value='name'>Sort by Name</option>
          <option value='email'>Sort by Email</option>
          <option value='type'>Sort by Type</option>
        </select>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '20px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: '20px',
            backgroundColor: '#3498db',
            color: 'white',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>
            {customers.length}
          </h3>
          <p style={{ margin: 0, fontSize: '14px' }}>Total Customers</p>
        </div>
        <div
          style={{
            padding: '20px',
            backgroundColor: '#27ae60',
            color: 'white',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>
            {customers.filter((c) => c.type.toLowerCase() === 'buyer').length}
          </h3>
          <p style={{ margin: 0, fontSize: '14px' }}>Buyers</p>
        </div>
        <div
          style={{
            padding: '20px',
            backgroundColor: '#e74c3c',
            color: 'white',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>
            {customers.filter((c) => c.type.toLowerCase() === 'seller').length}
          </h3>
          <p style={{ margin: 0, fontSize: '14px' }}>Sellers</p>
        </div>
      </div>

      {/* Customer Cards */}
      {filteredCustomers.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '20px',
            flex: 1,
            overflowY: 'auto',
            paddingBottom: '20px',
          }}
        >
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                padding: '20px',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
                  {customer.fullName}
                </h3>
                <div
                  style={{
                    backgroundColor:
                      customer.type.toLowerCase() === 'buyer'
                        ? '#e8f5e8'
                        : '#fff4e6',
                    color:
                      customer.type.toLowerCase() === 'buyer'
                        ? '#27ae60'
                        : '#f39c12',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'inline-block',
                    marginBottom: '10px',
                  }}
                >
                  {customer.type}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '15px',
                    fontSize: '14px',
                    color: '#555',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>📧 {customer.email}</span>
                  <span>📱 {customer.phone}</span>
                </div>
                {customer.primaryAddress && (
                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: '14px',
                      color: '#555',
                    }}
                  >
                    📍 {customer.primaryAddress}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h4
                  style={{
                    margin: '0 0 10px 0',
                    color: '#34495e',
                    fontSize: '16px',
                  }}
                >
                  Preferences
                </h4>
                <div
                  style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}
                >
                  <p style={{ margin: '5px 0' }}>
                    <strong>ID:</strong> {customer.id}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Type:</strong> {customer.type}
                  </p>
                </div>
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: '#95a5a6',
                  textAlign: 'right',
                  borderTop: '1px solid #ecf0f1',
                  paddingTop: '10px',
                }}
              >
                Contact ID: {customer.id}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#7f8c8d',
          }}
        >
          <h3>No customers found</h3>
          <p>Upload a CSV file with customer data to get started</p>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
