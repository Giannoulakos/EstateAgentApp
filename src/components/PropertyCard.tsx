import React from 'react';
import { Property, Match } from '../types/property';
import { formatPrice, formatSquareFeet } from '../utils/propertyUtils';
import MatchList from './MatchList';

interface PropertyCardProps {
  property: Property;
  matches: Match[];
  isLoadingMatches: boolean;
  matchError: string | null;
  onFindSellers: (propertyId: string) => void;
  onClearMatches: (propertyId: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  matches,
  isLoadingMatches,
  matchError,
  onFindSellers,
  onClearMatches,
}) => {
  return (
    <div className='property-card'>
      <div className='property-header'>
        <h3>{property.title}</h3>
        <span className={`status-badge ${property.status}`}>
          {property.status}
        </span>
      </div>

      <div className='property-details'>
        <p>
          <strong>Type:</strong> {property.type}
        </p>
        <p>
          <strong>Location:</strong> {property.location}
        </p>
        <p>
          <strong>Price:</strong> {formatPrice(property.price)}
        </p>
        <p>
          <strong>Bedrooms:</strong> {property.bedrooms}
        </p>
        <p>
          <strong>Bathrooms:</strong> {property.bathrooms}
        </p>
        <p>
          <strong>Square Feet:</strong> {formatSquareFeet(property.sqft)}
        </p>
        <p>
          <strong>Agent:</strong> {property.agent}
        </p>
        <p>
          <strong>Listed:</strong>{' '}
          {new Date(property.listingDate).toLocaleDateString()}
        </p>
      </div>

      {property.amenities.length > 0 && (
        <div className='amenities'>
          <strong>Amenities:</strong>
          <div className='amenities-tags'>
            {property.amenities.map((amenity, index) => (
              <span key={index} className='amenity-tag'>
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className='property-description'>
        <strong>Description:</strong>
        <p>{property.description}</p>
      </div>

      <div className='property-actions'>
        <button
          onClick={() => onFindSellers(property.id)}
          disabled={isLoadingMatches}
          className={`find-sellers-btn ${isLoadingMatches ? 'loading' : ''}`}
        >
          {isLoadingMatches ? 'Finding Sellers...' : 'Find Sellers'}
        </button>
      </div>

      {matchError && <div className='error-message'>Error: {matchError}</div>}

      <MatchList
        matches={matches}
        onClear={() => onClearMatches(property.id)}
      />
    </div>
  );
};

export default PropertyCard;
