import React, { useState } from 'react';
import { findMatchesSimple } from '../actions/findMatch';
import {
  Property,
  PropertyFilters,
  MatchState,
  Match,
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
  csvData?: string[][];
  onMatchesFound?: (
    propertyId: string,
    propertyTitle: string,
    matches: Match[]
  ) => void;
}

const PropertiesPage: React.FC<PropertiesPageProps> = ({
  csvData = [],
  onMatchesFound,
}) => {
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
  // Removed mock properties - only use CSV data

  // Function to parse CSV data into Property objects
  const parseCsvToProperties = (csvData: string[][]): Property[] => {
    if (csvData.length === 0) return [];

    const headers = csvData[0].map((h) => h.toLowerCase().trim());
    const rows = csvData
      .slice(1)
      .filter((row) => row.some((cell) => cell && cell.trim().length > 0));

    if (rows.length === 0) return [];

    return rows
      .map((row, index) => {
        const getField = (fieldNames: string[]): string => {
          for (const fieldName of fieldNames) {
            const headerIndex = headers.findIndex(
              (h) => h.includes(fieldName) || fieldName.includes(h)
            );
            if (headerIndex !== -1 && row[headerIndex]) {
              const value = row[headerIndex].trim();

              // Debug logging for price field
              if (
                fieldNames.includes('price') &&
                import.meta.env.REACT_APP_DEBUG === 'true'
              ) {
                console.log('Field match found:', {
                  fieldName,
                  headerIndex,
                  header: headers[headerIndex],
                  value,
                });
              }

              return value;
            }
          }
          return '';
        };

        const getNumberField = (fieldNames: string[]): number => {
          const value = getField(fieldNames);
          const parsed = parseFloat(value.replace(/[$,]/g, ''));

          // Debug logging for price field
          if (
            fieldNames.includes('price') &&
            import.meta.env.REACT_APP_DEBUG === 'true'
          ) {
            console.log('Price parsing:', { value, parsed, fieldNames });
          }

          return isNaN(parsed) ? 0 : parsed;
        };

        const getArrayField = (fieldNames: string[]): string[] => {
          const value = getField(fieldNames);
          if (!value) return [];
          return value
            .split(/[,;|]/)
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
        };
        const getStatusField = (): 'available' | 'pending' | 'sold' => {
          const status = getField([
            'status',
            'availability',
            'state',
          ]).toLowerCase();
          if (
            status.includes('pending') ||
            status.includes('contract') ||
            status.includes('under contract')
          )
            return 'pending';
          if (
            status.includes('sold') ||
            status.includes('closed') ||
            status.includes('sale')
          )
            return 'sold';
          return 'available';
        };

        const getPropertyType = (): string => {
          const type = getField([
            'type',
            'property_type',
            'category',
          ]).toLowerCase();
          const validTypes = [
            'apartment',
            'house',
            'condo',
            'townhouse',
            'studio',
            'loft',
            'penthouse',
          ];
          const foundType = validTypes.find((validType) =>
            type.includes(validType)
          );
          return foundType || 'apartment';
        };

        return {
          id: `csv_prop_${index + 1}`,
          title:
            getField(['title', 'name', 'property_name', 'address']) ||
            `Property ${index + 1}`,
          type: getPropertyType(),
          location:
            getField(['location', 'address', 'city', 'area']) ||
            'Unknown Location',
          price: getNumberField(['price', 'cost', 'value', 'amount']),
          bedrooms: getNumberField(['bedrooms', 'beds', 'bed', 'br']),
          bathrooms: getNumberField(['bathrooms', 'baths', 'bath', 'ba']),
          sqft: getNumberField(['sqft', 'square_feet', 'area', 'size']),
          status: getStatusField(),
          amenities: getArrayField(['amenities', 'features', 'extras']),
          description:
            getField(['description', 'details', 'notes']) ||
            'No description available',
          images: [] as string[], // CSV won't have images
          agent:
            getField(['agent', 'listing_agent', 'realtor', 'broker']) ||
            'Unknown Agent',
          listingDate:
            getField(['listing_date', 'date_listed', 'date']) ||
            new Date().toISOString().split('T')[0],
        };
      })
      .filter((property) => property.title && property.location);
  };

  // Combine CSV data with mock data
  const csvProperties = parseCsvToProperties(csvData);
  const allProperties = csvProperties;

  // Apply filters and sorting
  const filteredProperties = sortProperties(
    filterProperties(allProperties, filters),
    filters.sortBy
  );

  const handleFiltersChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
  };

  const handleFindSellers = async (propertyId: string) => {
    const property = allProperties.find((p) => p.id === propertyId);
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

      let response;
      try {
        // Use the debug version to determine which approach works
        response = await findMatchesSimple(
          propertyDescription,
          'sample_customers.csv',
          3
        );
      } catch (error) {
        console.error('All API approaches failed:', error);
        throw error;
      }

      // If onMatchesFound callback is provided, use it to navigate to matches page
      if (onMatchesFound) {
        onMatchesFound(propertyId, property.title, response.data);
      } else {
        // Fallback to local state if no callback provided
        setMatchState((prev) => ({
          ...prev,
          matches: { ...prev.matches, [propertyId]: response.data },
        }));
      }
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
        {allProperties.length > 0 && (
          <div
            style={{
              background: '#e8f5e8',
              color: '#2d5a27',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              marginTop: '10px',
              border: '1px solid #c3e6c3',
            }}
          >
            📊 Showing {allProperties.length} properties from uploaded CSV data
          </div>
        )}
      </div>

      {allProperties.length > 0 && (
        <>
          <PropertyFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />

          <PropertyStats
            properties={allProperties}
            filteredProperties={filteredProperties}
          />
        </>
      )}

      {allProperties.length === 0 ? (
        <div className='no-properties'>
          <h3>No properties found</h3>
          <p>Upload a CSV file with property data to get started</p>
        </div>
      ) : filteredProperties.length > 0 ? (
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
