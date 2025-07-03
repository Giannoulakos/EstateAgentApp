import React, { useState } from 'react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  property_type: string;
  location: string;
  price_min: number;
  price_max: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string;
  description: string;
  profile: string;
  created_at: string;
  updated_at: string;
}

interface CustomersPageProps {
  csvData: string[][];
}

const CustomersPage: React.FC<CustomersPageProps> = ({ csvData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Convert CSV data to customer objects
  const customers: Customer[] =
    csvData.length > 1
      ? csvData.slice(1).map((row) => ({
          id: row[0] || '',
          name: row[1] || '',
          email: row[2] || '',
          phone: row[3] || '',
          property_type: row[4] || '',
          location: row[5] || '',
          price_min: parseInt(row[6]) || 0,
          price_max: parseInt(row[7]) || 0,
          bedrooms: parseInt(row[8]) || 0,
          bathrooms: parseInt(row[9]) || 0,
          amenities: row[10] || '',
          description: row[11] || '',
          profile: row[12] || '',
          created_at: row[13] || '',
          updated_at: row[14] || '',
        }))
      : [];

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price_max') return b.price_max - a.price_max;
      if (sortBy === 'created_at')
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      return 0;
    });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

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
          <option value='price_max'>Sort by Max Budget</option>
          <option value='created_at'>Sort by Date Added</option>
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
            {filteredCustomers.length}
          </h3>
          <p style={{ margin: 0, fontSize: '14px' }}>Filtered Results</p>
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
                  {customer.name}
                </h3>
                <p
                  style={{
                    margin: '0 0 10px 0',
                    color: '#7f8c8d',
                    fontSize: '14px',
                  }}
                >
                  {customer.profile}
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: '15px',
                    fontSize: '14px',
                    color: '#555',
                  }}
                >
                  <span>📧 {customer.email}</span>
                  <span>📱 {customer.phone}</span>
                </div>
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
                    <strong>Property:</strong> {customer.property_type} in{' '}
                    {customer.location}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Budget:</strong> {formatPrice(customer.price_min)} -{' '}
                    {formatPrice(customer.price_max)}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Specs:</strong> {customer.bedrooms} bed,{' '}
                    {customer.bathrooms} bath
                  </p>
                  {customer.amenities && (
                    <p style={{ margin: '5px 0' }}>
                      <strong>Amenities:</strong> {customer.amenities}
                    </p>
                  )}
                </div>
              </div>

              {customer.description && (
                <div
                  style={{
                    backgroundColor: '#f8f9fa',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#555',
                    fontStyle: 'italic',
                    marginBottom: '10px',
                  }}
                >
                  "{customer.description}"
                </div>
              )}

              <div
                style={{
                  fontSize: '12px',
                  color: '#95a5a6',
                  textAlign: 'right',
                  borderTop: '1px solid #ecf0f1',
                  paddingTop: '10px',
                }}
              >
                Added: {formatDate(customer.created_at)}
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
