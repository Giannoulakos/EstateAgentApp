# CSV Upload Documentation

## Overview

The Real Estate Agent app supports independent CSV uploads for both Customers and Properties pages. Each page maintains its own data state.

## Customer CSV Format

### Required/Recommended Headers:

- `Contact ID` - Unique customer identifier
- `First Name` - Customer's first name
- `Last Name` - Customer's last name
- `Email` - Contact email address
- `Phone` - Contact phone number
- `Primary Address` - Customer's primary address
- `Type` - Customer type (Buyer, Seller, etc.)

### Example:

```csv
Contact ID,First Name,Last Name,Email,Phone,Primary Address,Type
CID001,John,Smith,john.smith@email.com,555-0101,"123 Pine St, Downtown Seattle, WA 98101",Buyer
```

## Property CSV Format

### Required/Recommended Headers:

- `title` - Property name/title
- `type` - Property type (apartment, house, condo, etc.)
- `location` - Property location/address
- `price` - Listing price (numeric)
- `bedrooms` - Number of bedrooms (numeric)
- `bathrooms` - Number of bathrooms (numeric)
- `sqft` - Square footage (numeric)
- `status` - Listing status (available, pending, sold)
- `amenities` - Features (semicolon separated)
- `description` - Property description
- `agent` - Listing agent name
- `listing_date` - Date listed

### Example:

```csv
title,type,location,price,bedrooms,bathrooms,sqft,status,amenities,description,agent,listing_date
Luxury Downtown Condo,condo,"Downtown, Seattle",850000,2,2,1200,available,"Pool;Gym;Concierge","Modern condo with city views",John Smith,2024-01-20
```

## Features

### Auto-Detection

The app automatically detects CSV type and warns if you're uploading the wrong type for the current page.

### Independent Data

- Customer CSV data only affects the Customers page
- Property CSV data only affects the Properties page
- Each page maintains its own upload state

### Data Validation

- Empty rows are automatically filtered out
- Numeric fields are properly parsed
- Status fields are normalized to valid values

## Usage Tips

1. **Column Names**: The app is flexible with column names - it will match variations like "price/cost/value" or "name/customer_name"
2. **Data Types**: Ensure numeric fields (price, bedrooms, etc.) contain valid numbers
3. **Separators**: Use semicolons (;) to separate multiple amenities
4. **Quotes**: Use quotes around values containing commas
5. **Page Context**: Upload customer data while on the Customers page, property data while on the Properties page
