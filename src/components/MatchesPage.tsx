import React from 'react';
import MatchCard from './MatchCard';
import { Match } from '../types/property';

interface MatchesPageProps {
  matches: Array<{
    propertyId: string;
    propertyTitle: string;
    matches: Match[];
  }>;
}

const MatchesPage: React.FC<MatchesPageProps> = ({ matches = [] }) => {
  const totalMatches = matches.reduce(
    (sum, item) => sum + item.matches.length,
    0
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Page Header */}
      <div
        style={{
          padding: '0 0 24px 0',
          borderBottom: '1px solid #e1e8ed',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px',
          }}
        >
          <div>
            <h1
              style={{
                margin: '0 0 8px 0',
                fontSize: '32px',
                fontWeight: '700',
                color: '#2c3e50',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              🎯 Property Matches
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '16px',
                color: '#7f8c8d',
                lineHeight: '1.5',
              }}
            >
              AI-powered customer matches for your properties
            </p>
          </div>

          {/* Stats Summary */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '12px',
                textAlign: 'center',
                minWidth: '120px',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  margin: '0 0 4px 0',
                }}
              >
                {totalMatches}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Total Matches
              </div>
            </div>
            <div
              style={{
                background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '12px',
                textAlign: 'center',
                minWidth: '120px',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  margin: '0 0 4px 0',
                }}
              >
                {matches.length}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Properties Matched
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Matches Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          paddingRight: '8px',
        }}
      >
        {matches.length === 0 ? (
          // Empty State
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              color: '#7f8c8d',
            }}
          >
            <div
              style={{
                fontSize: '80px',
                marginBottom: '20px',
                opacity: 0.5,
              }}
            >
              🔍
            </div>
            <h3
              style={{
                margin: '0 0 12px 0',
                fontSize: '24px',
                color: '#34495e',
              }}
            >
              No Matches Yet
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '16px',
                lineHeight: '1.5',
                maxWidth: '400px',
              }}
            >
              Run "Find Sellers" on properties to discover potential customer
              matches using AI analysis.
            </p>
          </div>
        ) : (
          // Matches List
          <div>
            {matches.map((propertyMatch) => (
              <div
                key={propertyMatch.propertyId}
                style={{ marginBottom: '40px' }}
              >
                {/* Property Section Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '20px',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                    borderRadius: '12px',
                    border: '1px solid #dee2e6',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '16px',
                    }}
                  >
                    <span style={{ color: 'white', fontSize: '18px' }}>🏠</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#2c3e50',
                      }}
                    >
                      {propertyMatch.propertyTitle}
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#7f8c8d',
                      }}
                    >
                      {propertyMatch.matches.length} potential customer
                      {propertyMatch.matches.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  <div
                    style={{
                      background: 'white',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#667eea',
                      border: '2px solid #667eea',
                    }}
                  >
                    {propertyMatch.matches.length} Match
                    {propertyMatch.matches.length !== 1 ? 'es' : ''}
                  </div>
                </div>

                {/* Matches for this Property */}
                <div
                  style={{
                    display: 'grid',
                    gap: '16px',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                  }}
                >
                  {propertyMatch.matches.map((match) => (
                    <MatchCard
                      key={`${propertyMatch.propertyId}-${match.customer_id}`}
                      match={match}
                      propertyTitle={propertyMatch.propertyTitle}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesPage;
