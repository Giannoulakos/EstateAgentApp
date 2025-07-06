import React from 'react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  userProfile?: any;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  userProfile,
  onLogout,
}) => {
  const menuItems = [
    { id: 'customers', label: 'Customers', icon: '👥' },
    { id: 'properties', label: 'Properties', icon: '🏠' },
    { id: 'add-data', label: 'Add Data', icon: '📊' },
  ];

  return (
    <div
      style={{
        width: '250px',
        height: '100vh',
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '20px',
        boxSizing: 'border-box',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          marginBottom: '30px',
          textAlign: 'center',
          borderBottom: '1px solid #34495e',
          paddingBottom: '20px',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '24px', color: '#ecf0f1' }}>
          Real Estate Agent
        </h2>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#bdc3c7' }}>
          Management Dashboard
        </p>
      </div>

      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {menuItems.map((item) => (
            <li key={item.id} style={{ marginBottom: '10px' }}>
              <button
                onClick={() => onPageChange(item.id)}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  backgroundColor:
                    currentPage === item.id ? '#3498db' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.3s ease',
                  boxShadow:
                    currentPage === item.id
                      ? '0 2px 10px rgba(52, 152, 219, 0.3)'
                      : 'none',
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== item.id) {
                    e.currentTarget.style.backgroundColor = '#34495e';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== item.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile Section */}
      {userProfile && (
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '20px',
            right: '20px',
            backgroundColor: '#34495e',
            borderRadius: '8px',
            padding: '15px',
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: '10px' }}>
            {userProfile.picture && (
              <img
                src={userProfile.picture}
                alt='User Avatar'
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  marginBottom: '8px',
                }}
              />
            )}
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: '#ecf0f1',
                fontWeight: 'bold',
              }}
            >
              {userProfile.name || userProfile.nickname || 'User'}
            </p>
            <p
              style={{
                margin: '2px 0 0 0',
                fontSize: '12px',
                color: '#bdc3c7',
              }}
            >
              {userProfile.email}
            </p>
          </div>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#c0392b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#e74c3c';
            }}
          >
            Logout
          </button>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#7f8c8d',
        }}
      >
        <p style={{ margin: 0 }}>© 2025 Real Estate Agent</p>
      </div>
    </div>
  );
};

export default Sidebar;
