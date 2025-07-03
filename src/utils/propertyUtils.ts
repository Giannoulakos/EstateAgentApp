import { Property, PropertyFilters } from '../types/property';

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatSquareFeet = (sqft: number): string => {
  return new Intl.NumberFormat('en-US').format(sqft);
};

export const filterProperties = (
  properties: Property[],
  filters: PropertyFilters
): Property[] => {
  return properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      property.location
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase());
    const matchesType =
      filters.filterType === 'all' || property.type === filters.filterType;
    const matchesStatus =
      filters.filterStatus === 'all' ||
      property.status === filters.filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });
};

export const sortProperties = (
  properties: Property[],
  sortBy: string
): Property[] => {
  const sorted = [...properties];

  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'date-new':
      return sorted.sort(
        (a, b) =>
          new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime()
      );
    case 'date-old':
      return sorted.sort(
        (a, b) =>
          new Date(a.listingDate).getTime() - new Date(b.listingDate).getTime()
      );
    default:
      return sorted;
  }
};
