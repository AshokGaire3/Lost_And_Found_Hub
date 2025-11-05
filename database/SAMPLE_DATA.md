# Sample Data Guide

This document describes the sample data migration included with the Lost and Found Hub project.

## Migration File

The sample data is stored in: `supabase/migrations/20251103000000_seed_sample_data.sql`

## What's Included

The migration file contains **20 realistic found items** across all 9 categories:

### Electronics (3 items)
- iPhone 14 Pro Max (Black, Library 3rd Floor)
- MacBook Pro 14-inch (Space Gray, Student Union)
- AirPods Pro 2nd Gen (White, Griffin Hall)

### Clothing (3 items)
- Nike Black Hoodie (Size L, Library)
- Red Leather Jacket (Size M, Student Union)
- Blue North Face Winter Coat (Size XL, Parking Area)

### Keys (2 items)
- Car Keys with Toyota Fob (Green lanyard, Landrum Academic Center)
- House Keys on Red Keychain (Griffin Hall)

### Bags (2 items)
- North Face Backpack (Black with Red, Library)
- Coach Leather Purse (Brown, Student Union)

### Documents (3 items)
- Student ID Card (Alex Martinez, Parking Area)
- Driver's License (Jordan, Library)
- Credit Card (M. Williams, Student Union)

### Books (2 items)
- Calculus III Textbook (Stewart, Landrum Academic Center)
- Organic Chemistry Lab Manual (Griffin Hall)

### Accessories (2 items)
- Apple Watch Series 9 (Starlight, Library)
- Ray-Ban Sunglasses (Black/Gold, Student Union)

### Sports (2 items)
- Nike Basketball (Orange/Black, Parking Area)
- Yoga Mat (Purple, Student Union)

### Other (2 items)
- Umbrella - Compact Blue (Library)
- Coffee Thermos (Black, Griffin Hall)

## Features of the Sample Data

Each item includes:
- **Realistic descriptions** with specific details
- **Proper categorization** across all 9 categories
- **Detailed location information** with venue and specific area
- **Identifying details** to test matching algorithms
- **Storage container information** (Box A-12, etc.)
- **Random dates** within the past 30-60 days
- **Variety of colors** and physical characteristics
- **Condition notes** (scratches, wear, etc.)
- **Personal identifiers** (names, engravings, labels)

## Applying the Sample Data

### Option 1: Using Supabase CLI

```bash
# Reset database and apply all migrations
supabase db reset

# Or apply migrations sequentially
supabase migration up
```

### Option 2: Manual SQL Execution

1. Open your Supabase dashboard
2. Navigate to SQL Editor
3. Copy the contents of `20251103000000_seed_sample_data.sql`
4. Execute the SQL

### Option 3: Local Development

If running Supabase locally:

```bash
# Start Supabase
supabase start

# Reset and seed
supabase db reset
```

## Testing with Sample Data

Once the sample data is applied, you can:

1. **Browse Page**: View all 20 found items with filtering
   - Test category filters
   - Test color search
   - Test location search
   - Test date range filters

2. **Search Functionality**: 
   - Try searching for "iPhone" to find the iPhone 14 Pro Max
   - Search for "black" to find multiple items
   - Search for "Library" to filter by location

3. **Item Details**:
   - Click on any item to view full details
   - Test the claim functionality
   - Test storage location display

4. **Admin Features** (if logged in as staff):
   - View all items in the admin dashboard
   - Test storage management
   - Process claims and matches

## Customizing Sample Data

To add your own sample data:

1. Edit `20251103000000_seed_sample_data.sql`
2. Follow the existing INSERT format
3. Use appropriate categories from the enum:
   - electronics
   - clothing
   - accessories
   - books
   - keys
   - bags
   - documents
   - sports
   - other

4. Use appropriate venues:
   - SU (Student Union)
   - Library
   - GF (Griffin Hall)
   - LA (Landrum Academic Center)
   - Parking
   - Other

5. Use the `random_date_in_range()` helper function for dates:
   ```sql
   random_date_in_range(30) -- Random date within last 30 days
   ```

## Removing Sample Data

To remove the sample data:

```sql
-- Delete all sample found items
DELETE FROM public.items 
WHERE user_id IS NULL 
  AND is_anonymous = false 
  AND status = 'found';
```

Or reset the entire database:

```bash
supabase db reset
```

## Notes

- Sample items have `user_id = NULL` (found items without a specific finder)
- All items have `is_anonymous = false` (they're not student reports)
- All items have `is_active = true` (visible in the system)
- All items have `status = 'found'` (available for claiming)
- Dates are randomized to make data appear current

## Contributing

If you add new sample data:
- Keep descriptions realistic and detailed
- Use consistent venue names
- Include identifying details for testing claims/matches
- Maintain a good distribution across categories
- Update this document with your changes

