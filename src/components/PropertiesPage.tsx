import React, { useState } from 'react';
import { findMatchesSimple } from '../actions/findMatch';

interface Property {
  id: string;
  title: string;
  type: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  status: string;
  amenities: string[];
  description: string;
  images: string[];
  agent: string;
  listingDate: string;
}

interface Match {
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_profile: string;
  match_analysis: string;
  personalized_pitch: string;
  similarity_score: number;
}

interface PropertiesPageProps {
  // For now, we'll use mock data. In a real app, this would come from props or API
}

const PropertiesPage: React.FC<PropertiesPageProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('price');
  const [matches, setMatches] = useState<Record<string, Match[]>>({});
  const [loadingMatches, setLoadingMatches] = useState<Record<string, boolean>>(
    {}
  );
  const [matchErrors, setMatchErrors] = useState<Record<string, string>>({});

  // Mock property data (in a real app, this would come from an API or props)
  const mockProperties: Property[] = [
    {
      id: 'prop_001',
      title: 'Luxury Manhattan Penthouse',
      type: 'penthouse',
      location: 'Upper East Side, Manhattan',
      price: 4500000,
      bedrooms: 4,
      bathrooms: 4,
      sqft: 3200,
      status: 'available',
      amenities: ['Private elevator', 'Terrace', 'Doorman', 'Gym'],
      description:
        'Stunning penthouse with panoramic city views, private terrace, and luxury finishes throughout.',
      images: ['https://via.placeholder.com/300x200'],
      agent: 'John Smith',
      listingDate: '2024-01-15',
    },
    {
      id: 'prop_002',
      title: 'Modern SoHo Loft',
      type: 'loft',
      location: 'SoHo, Manhattan',
      price: 1800000,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1800,
      status: 'available',
      amenities: [
        'High ceilings',
        'Exposed brick',
        'Large windows',
        'Industrial design',
      ],
      description:
        'Industrial loft with soaring ceilings, exposed brick walls, and abundant natural light.',
      images: ['https://via.placeholder.com/300x200'],
      agent: 'Sarah Johnson',
      listingDate: '2024-01-18',
    },
    {
      id: 'prop_003',
      title: 'Brooklyn Family Home',
      type: 'house',
      location: 'Park Slope, Brooklyn',
      price: 1200000,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 2100,
      status: 'sold',
      amenities: ['Garden', 'Garage', 'Updated kitchen', 'Quiet street'],
      description:
        'Charming brownstone in family-friendly neighborhood with private garden and modern updates.',
      images: ['https://via.placeholder.com/300x200'],
      agent: 'Michael Chen',
      listingDate: '2024-01-10',
    },
    {
      id: 'prop_004',
      title: 'Downtown Studio',
      type: 'studio',
      location: 'Financial District, Manhattan',
      price: 550000,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 650,
      status: 'available',
      amenities: ['Concierge', 'Roof deck', 'Laundry', 'Near subway'],
      description:
        'Efficient studio in full-service building with excellent transportation access.',
      images: ['https://via.placeholder.com/300x200'],
      agent: 'Emily Davis',
      listingDate: '2024-01-20',
    },
    {
      id: 'prop_005',
      title: 'Tribeca Luxury Condo',
      type: 'condo',
      location: 'Tribeca, Manhattan',
      price: 3200000,
      bedrooms: 3,
      bathrooms: 3,
      sqft: 2400,
      status: 'pending',
      amenities: ['Wine cellar', 'Smart home', 'Spa', 'Valet'],
      description:
        'Sophisticated condo with smart home technology and premium building amenities.',
      images: ['https://via.placeholder.com/300x200'],
      agent: 'Robert Wilson',
      listingDate: '2024-01-12',
    },
  ];

  // Filter and sort properties
  const filteredProperties = mockProperties
    .filter((property) => {
      const matchesSearch =
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || property.type === filterType;
      const matchesStatus =
        filterStatus === 'all' || property.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'price') return b.price - a.price;
      if (sortBy === 'sqft') return b.sqft - a.sqft;
      if (sortBy === 'listingDate')
        return (
          new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime()
        );
      return a.title.localeCompare(b.title);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#27ae60';
      case 'pending':
        return '#f39c12';
      case 'sold':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const getStatusBadge = (status: string) => (
    <span
      style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: getStatusColor(status),
        textTransform: 'uppercase',
      }}
    >
      {status}
    </span>
  );

  const handleFindMatches = async (property: Property) => {
    const propertyId = property.id;

    // Set loading state
    setLoadingMatches((prev) => ({ ...prev, [propertyId]: true }));
    setMatchErrors((prev) => ({ ...prev, [propertyId]: '' }));

    try {
      // Create property description for matching
      const propertyDescription = `${property.type} in ${property.location}, ${
        property.bedrooms
      } bedrooms, ${property.bathrooms} bathrooms, ${
        property.sqft
      } sqft, priced at ${formatPrice(property.price)}. ${
        property.description
      }`;

      const response = await findMatchesSimple(propertyDescription, 3);

      setMatches((prev) => ({ ...prev, [propertyId]: response.data }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to find matches';
      setMatchErrors((prev) => ({ ...prev, propertyId: errorMessage }));
    } finally {
      setLoadingMatches((prev) => ({ ...prev, [propertyId]: false }));
    }
  };

  const clearMatches = (propertyId: string) => {
    setMatches((prev) => {
      const newMatches = { ...prev };
      delete newMatches[propertyId];
      return newMatches;
    });
    setMatchErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[propertyId];
      return newErrors;
    });
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
        <h1 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Properties</h1>
        <p style={{ margin: 0, color: '#7f8c8d' }}>
          Browse and manage property listings
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
          placeholder='Search properties...'
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
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: '10px 15px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white',
          }}
        >
          <option value='all'>All Types</option>
          <option value='apartment'>Apartment</option>
          <option value='house'>House</option>
          <option value='condo'>Condo</option>
          <option value='loft'>Loft</option>
          <option value='studio'>Studio</option>
          <option value='penthouse'>Penthouse</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '10px 15px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white',
          }}
        >
          <option value='all'>All Status</option>
          <option value='available'>Available</option>
          <option value='pending'>Pending</option>
          <option value='sold'>Sold</option>
        </select>

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
          <option value='price'>Sort by Price</option>
          <option value='sqft'>Sort by Size</option>
          <option value='listingDate'>Sort by Date</option>
          <option value='title'>Sort by Title</option>
        </select>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          marginBottom: '20px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: '15px',
            backgroundColor: '#3498db',
            color: 'white',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>
            {mockProperties.length}
          </h3>
          <p style={{ margin: 0, fontSize: '12px' }}>Total Properties</p>
        </div>
        <div
          style={{
            padding: '15px',
            backgroundColor: '#27ae60',
            color: 'white',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>
            {mockProperties.filter((p) => p.status === 'available').length}
          </h3>
          <p style={{ margin: 0, fontSize: '12px' }}>Available</p>
        </div>
        <div
          style={{
            padding: '15px',
            backgroundColor: '#f39c12',
            color: 'white',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>
            {mockProperties.filter((p) => p.status === 'pending').length}
          </h3>
          <p style={{ margin: 0, fontSize: '12px' }}>Pending</p>
        </div>
        <div
          style={{
            padding: '15px',
            backgroundColor: '#e74c3c',
            color: 'white',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>
            {mockProperties.filter((p) => p.status === 'sold').length}
          </h3>
          <p style={{ margin: 0, fontSize: '12px' }}>Sold</p>
        </div>
      </div>

      {/* Property Cards */}
      {filteredProperties.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px',
            flex: 1,
            overflowY: 'auto',
            paddingBottom: '20px',
            alignItems: 'start',
          }}
        >
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                overflow: 'visible',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              {/* Property Image */}
              <div
                style={{
                  height: '200px',
                  backgroundColor: '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  color: '#dee2e6',
                }}
              >
                🏠
              </div>

              <div
                style={{
                  padding: '20px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '15px',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: '0 0 5px 0',
                        color: '#2c3e50',
                        fontSize: '18px',
                      }}
                    >
                      {property.title}
                    </h3>
                    <p
                      style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}
                    >
                      📍 {property.location}
                    </p>
                  </div>
                  {getStatusBadge(property.status)}
                </div>

                {/* Price and Details */}
                <div style={{ marginBottom: '15px' }}>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#27ae60',
                      marginBottom: '10px',
                    }}
                  >
                    {formatPrice(property.price)}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '15px',
                      fontSize: '14px',
                      color: '#555',
                    }}
                  >
                    <span>🛏️ {property.bedrooms} bed</span>
                    <span>🚿 {property.bathrooms} bath</span>
                    <span>📐 {property.sqft.toLocaleString()} sqft</span>
                  </div>
                </div>

                {/* Description */}
                <p
                  style={{
                    fontSize: '14px',
                    color: '#555',
                    lineHeight: '1.5',
                    marginBottom: '15px',
                  }}
                >
                  {property.description}
                </p>

                {/* Amenities */}
                {property.amenities.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '5px',
                      }}
                    >
                      {property.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          style={{
                            padding: '3px 8px',
                            backgroundColor: '#ecf0f1',
                            borderRadius: '12px',
                            fontSize: '12px',
                            color: '#2c3e50',
                          }}
                        >
                          {amenity}
                        </span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span style={{ fontSize: '12px', color: '#7f8c8d' }}>
                          +{property.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Find Buyers Button */}
                <div style={{ marginBottom: '15px' }}>
                  <button
                    onClick={() => handleFindMatches(property)}
                    disabled={loadingMatches[property.id]}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: matches[property.id]
                        ? '#27ae60'
                        : '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: loadingMatches[property.id]
                        ? 'not-allowed'
                        : 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      opacity: loadingMatches[property.id] ? 0.7 : 1,
                      marginRight: matches[property.id] ? '10px' : '0',
                    }}
                  >
                    {loadingMatches[property.id]
                      ? '🔍 Finding...'
                      : matches[property.id]
                      ? `✅ ${matches[property.id].length} Matches Found`
                      : '🔍 Find Sellers'}
                  </button>

                  {matches[property.id] && (
                    <button
                      onClick={() => clearMatches(property.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Error Display */}
                {matchErrors[property.id] && (
                  <div
                    style={{
                      backgroundColor: '#fee',
                      color: '#c33',
                      padding: '10px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      marginBottom: '15px',
                    }}
                  >
                    Error: {matchErrors[property.id]}
                  </div>
                )}

                {/* Matches Display */}
                {matches[property.id] && matches[property.id].length > 0 && (
                  <div
                    style={{
                      backgroundColor: '#f8f9fa',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '15px',
                    }}
                  >
                    <h4
                      style={{
                        margin: '0 0 10px 0',
                        color: '#2c3e50',
                        fontSize: '16px',
                      }}
                    >
                      Potential Sellers ({matches[property.id].length})
                    </h4>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      {matches[property.id].map((match, index) => (
                        <div
                          key={match.customer_id}
                          style={{
                            backgroundColor: 'white',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #e0e0e0',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '5px',
                            }}
                          >
                            <strong style={{ color: '#2c3e50' }}>
                              {match.customer_name}
                            </strong>
                            <span
                              style={{
                                backgroundColor: '#27ae60',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                              }}
                            >
                              {Math.round(match.similarity_score * 100)}% match
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', color: '#666' }}>
                            <strong>Analysis:</strong> {match.match_analysis}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spacer to push agent section to bottom */}
                <div style={{ flex: 1 }}></div>

                {/* Agent and Date */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: '#95a5a6',
                    borderTop: '1px solid #ecf0f1',
                    paddingTop: '15px',
                  }}
                >
                  <span>Agent: {property.agent}</span>
                  <span>Listed: {formatDate(property.listingDate)}</span>
                </div>
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
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h3>No properties found</h3>
          <p>Adjust your search criteria or add new property listings</p>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
