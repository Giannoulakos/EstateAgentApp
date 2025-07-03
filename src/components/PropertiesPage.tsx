import React, { useState } from 'react';
import { findMatchesSimple } from '../actions/findMatch';
import {
  Property,
  Match,
  PropertyFilters,
  MatchState,
} from '../types/property';
import {
  filterProperties,
  sortProperties,
  formatPrice,
} from '../utils/propertyUtils';
import PropertyFiltersComponent from './PropertyFilters';
import PropertyStats from './PropertyStats';
import './Properties.css';
import PropertyCard from './PropertyCard';

interface PropertiesPageProps {
  // For now, we'll use mock data. In a real app, this would come from props or API
}

const PropertiesPage: React.FC<PropertiesPageProps> = () => {
  const [filters, setFilters] = useState<PropertyFilters>({
    searchTerm: '',
    filterType: 'all',
    filterStatus: 'all',
    sortBy: 'date-new',
  });

  const [matchState, setMatchState] = useState<MatchState>({
    matches: {},
    loadingMatches: {},
    matchErrors: {},
  });

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
      status: 'pending',
      amenities: ['High ceilings', 'Exposed brick', 'Modern kitchen'],
      description:
        'Beautiful loft with industrial charm and modern amenities in the heart of SoHo.',
      images: ['https://via.placeholder.com/300x200'],
      agent: 'Sarah Johnson',
      listingDate: '2024-01-10',
    },
    {
      id: 'prop_003',
      title: 'Brooklyn Heights Townhouse',
      type: 'house',
      location: 'Brooklyn Heights, Brooklyn',
      price: 2200000,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 2400,
      status: 'available',
      amenities: ['Garden', 'Parking', 'Historic details', 'Roof deck'],
      description:
        'Historic townhouse with beautiful garden and stunning Manhattan views.',
      images: ['https://via.placeholder.com/300x200'],
      agent: 'Mike Davis',
      listingDate: '2024-01-12',
    },
    {
      id: 'prop_004',
      title: 'Upper West Side Apartment',
      type: 'apartment',
      location: 'Upper West Side, Manhattan',
      price: 1200000,
      bedrooms: 2,
      bathrooms: 1,
      sqft: 1200,
      status: 'sold',
      amenities: ['Doorman', 'Laundry', 'Near subway'],
      description:
        'Charming pre-war apartment with original details and modern updates.',
      images: ['https://via.placeholder.com/300x200'],
      agent: 'Emily Wilson',
      listingDate: '2024-01-08',
    },
    {
      id: 'prop_005',
      title: 'Queens Studio',
      type: 'studio',
      location: 'Long Island City, Queens',
      price: 650000,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 650,
      status: 'available',
      amenities: ['New building', 'Gym', 'Rooftop terrace'],
      description:
        'Modern studio in new building with excellent amenities and Manhattan views.',
      images: ['https://via.placeholder.com/300x200'],
      agent: 'David Brown',
      listingDate: '2024-01-14',
    },
  ];

  // Apply filters and sorting
  const filteredProperties = sortProperties(
    filterProperties(mockProperties, filters),
    filters.sortBy
  );

  const handleFiltersChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
  };

  const handleFindSellers = async (propertyId: string) => {
    const property = mockProperties.find((p) => p.id === propertyId);
    if (!property) return;

    // Set loading state
    setMatchState((prev) => ({
      ...prev,
      loadingMatches: { ...prev.loadingMatches, [propertyId]: true },
      matchErrors: { ...prev.matchErrors, [propertyId]: '' },
    }));

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

      setMatchState((prev) => ({
        ...prev,
        matches: { ...prev.matches, [propertyId]: response.data },
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to find matches';
      setMatchState((prev) => ({
        ...prev,
        matchErrors: { ...prev.matchErrors, [propertyId]: errorMessage },
      }));
    } finally {
      setMatchState((prev) => ({
        ...prev,
        loadingMatches: { ...prev.loadingMatches, [propertyId]: false },
      }));
    }
  };

  const handleClearMatches = (propertyId: string) => {
    setMatchState((prev) => {
      const newMatches = { ...prev.matches };
      const newErrors = { ...prev.matchErrors };
      delete newMatches[propertyId];
      delete newErrors[propertyId];

      return {
        ...prev,
        matches: newMatches,
        matchErrors: newErrors,
      };
    });
  };

  return (
    <div className='properties-page'>
      <div className='page-header'>
        <h1>Properties</h1>
        <p>Browse and manage property listings</p>
      </div>

      <PropertyFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <PropertyStats
        properties={mockProperties}
        filteredProperties={filteredProperties}
      />

      {filteredProperties.length > 0 ? (
        <div className='properties-grid'>
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              matches={matchState.matches[property.id] || []}
              isLoadingMatches={matchState.loadingMatches[property.id] || false}
              matchError={matchState.matchErrors[property.id] || null}
              onFindSellers={handleFindSellers}
              onClearMatches={handleClearMatches}
            />
          ))}
        </div>
      ) : (
        <div className='no-properties'>
          <h3>No properties found</h3>
          <p>Adjust your search criteria or add new property listings</p>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
