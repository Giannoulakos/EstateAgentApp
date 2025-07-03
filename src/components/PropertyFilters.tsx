import React from 'react';
import { PropertyFilters } from '../types/property';

interface PropertyFiltersComponentProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
}

const PropertyFiltersComponent: React.FC<PropertyFiltersComponentProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleFilterChange = (field: keyof PropertyFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div className='property-filters'>
      <div className='filter-row'>
        <input
          type='text'
          placeholder='Search properties...'
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          className='search-input'
        />

        <select
          value={filters.filterType}
          onChange={(e) => handleFilterChange('filterType', e.target.value)}
          className='filter-select'
        >
          <option value='all'>All Types</option>
          <option value='house'>House</option>
          <option value='apartment'>Apartment</option>
          <option value='condo'>Condo</option>
          <option value='townhouse'>Townhouse</option>
        </select>

        <select
          value={filters.filterStatus}
          onChange={(e) => handleFilterChange('filterStatus', e.target.value)}
          className='filter-select'
        >
          <option value='all'>All Status</option>
          <option value='available'>Available</option>
          <option value='pending'>Pending</option>
          <option value='sold'>Sold</option>
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className='filter-select'
        >
          <option value='date-new'>Newest First</option>
          <option value='date-old'>Oldest First</option>
          <option value='price-low'>Price: Low to High</option>
          <option value='price-high'>Price: High to Low</option>
        </select>
      </div>
    </div>
  );
};

export default PropertyFiltersComponent;
