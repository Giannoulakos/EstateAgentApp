import React from 'react';
import { Property } from '../types/property';

interface PropertyStatsProps {
  properties: Property[];
  filteredProperties: Property[];
}

const PropertyStats: React.FC<PropertyStatsProps> = ({
  properties,
  filteredProperties,
}) => {
  const totalProperties = properties.length;
  const filteredCount = filteredProperties.length;
  const availableCount = filteredProperties.filter(
    (p) => p.status === 'available'
  ).length;
  const pendingCount = filteredProperties.filter(
    (p) => p.status === 'pending'
  ).length;
  const soldCount = filteredProperties.filter(
    (p) => p.status === 'sold'
  ).length;

  const averagePrice =
    filteredProperties.length > 0
      ? filteredProperties.reduce((sum, p) => sum + p.price, 0) /
        filteredProperties.length
      : 0;

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className='property-stats'>
      <div className='stats-grid'>
        <div className='stat-card'>
          <h3>Total Properties</h3>
          <p className='stat-number'>{totalProperties}</p>
        </div>

        <div className='stat-card'>
          <h3>Showing</h3>
          <p className='stat-number'>{filteredCount}</p>
        </div>

        <div className='stat-card'>
          <h3>Available</h3>
          <p className='stat-number available'>{availableCount}</p>
        </div>

        <div className='stat-card'>
          <h3>Pending</h3>
          <p className='stat-number pending'>{pendingCount}</p>
        </div>

        <div className='stat-card'>
          <h3>Sold</h3>
          <p className='stat-number sold'>{soldCount}</p>
        </div>

        <div className='stat-card'>
          <h3>Avg. Price</h3>
          <p className='stat-number'>{formatPrice(averagePrice)}</p>
        </div>
      </div>
    </div>
  );
};

export default PropertyStats;
