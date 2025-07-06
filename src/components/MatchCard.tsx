import React from 'react';
import { Match } from '../types/property';
import { getEmailDetails, createMailtoUrl } from '../utils/getEmailDetails';

interface MatchCardProps {
  match: Match;
  propertyTitle?: string;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, propertyTitle }) => {
  // Generate mailto URL using the personalized pitch
  const handleContactCustomer = () => {
    if (match.customer_email) {
      const emailDetails = getEmailDetails(match.personalized_pitch);
      const mailtoUrl = createMailtoUrl(
        match.customer_email,
        emailDetails.subject,
        emailDetails.body
      );
      window.open(mailtoUrl, '_blank');
    } else {
      // Fallback: copy the pitch to clipboard if no email
      navigator.clipboard.writeText(match.personalized_pitch);
      alert(
        'No email available. Personalized pitch has been copied to clipboard.'
      );
    }
  };

  // Handle copying the pitch to clipboard
  const handleCopyPitch = () => {
    navigator.clipboard.writeText(match.personalized_pitch);
    // You could add a toast notification here
    alert('Personalized pitch copied to clipboard!');
  };

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e1e8ed',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* Match Score Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '600',
              color: '#2c3e50',
            }}
          >
            {match.customer_name}
          </h3>
          {propertyTitle && (
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                color: '#7f8c8d',
              }}
            >
              Match for: {propertyTitle}
            </p>
          )}
        </div>
        <div
          style={{
            background: `linear-gradient(135deg, ${
              match.similarity_score >= 0.8
                ? '#27ae60, #2ecc71'
                : match.similarity_score >= 0.6
                ? '#f39c12, #e67e22'
                : '#e74c3c, #c0392b'
            })`,
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          {Math.round(match.similarity_score * 100)}% Match
        </div>
      </div>

      {/* Customer Contact Info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '16px',
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '16px',
            marginRight: '12px',
          }}
        >
          {match.customer_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '500',
              color: '#2c3e50',
            }}
          >
            {match.customer_name}
          </p>
          <p
            style={{
              margin: '2px 0 0 0',
              fontSize: '14px',
              color: '#7f8c8d',
            }}
          >
            📞 {match.customer_phone}
          </p>
          {match.customer_email && (
            <p
              style={{
                margin: '2px 0 0 0',
                fontSize: '14px',
                color: '#7f8c8d',
              }}
            >
              📧 {match.customer_email}
            </p>
          )}
        </div>
      </div>

      {/* Customer Profile */}
      <div style={{ marginBottom: '16px' }}>
        <h4
          style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#2c3e50',
          }}
        >
          Customer Profile
        </h4>
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#34495e',
            background: '#f8f9fa',
            padding: '12px',
            borderRadius: '8px',
            borderLeft: '4px solid #3498db',
          }}
        >
          {match.customer_profile}
        </p>
      </div>

      {/* Match Analysis */}
      <div style={{ marginBottom: '16px' }}>
        <h4
          style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#2c3e50',
          }}
        >
          Match Analysis
        </h4>
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#34495e',
            background: '#f8f9fa',
            padding: '12px',
            borderRadius: '8px',
            borderLeft: '4px solid #27ae60',
          }}
        >
          {match.match_analysis}
        </p>
      </div>

      {/* Personalized Pitch */}
      <div>
        <h4
          style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#2c3e50',
          }}
        >
          Personalized Pitch
        </h4>
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#34495e',
            background: '#f8f9fa',
            padding: '12px',
            borderRadius: '8px',
            borderLeft: '4px solid #e67e22',
          }}
        >
          {match.personalized_pitch}
        </p>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #ecf0f1',
        }}
      >
        <button
          onClick={handleContactCustomer}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow =
              '0 4px 12px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {match.customer_email ? '📧 Contact Customer' : '📞 Contact Customer'}
        </button>
        <button
          onClick={handleCopyPitch}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: 'white',
            color: '#667eea',
            border: '2px solid #667eea',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#667eea';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#667eea';
          }}
        >
          📋 Copy Pitch
        </button>
      </div>
    </div>
  );
};

export default MatchCard;
