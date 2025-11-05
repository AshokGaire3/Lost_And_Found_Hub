-- Seed sample data for Lost and Found Hub
-- This migration adds realistic sample data for testing and demonstration

-- Note: Since we need actual user_ids, we'll need to handle this differently
-- We'll create a strategy that works with or without real users

-- First, let's create a helper function to get a random date in the past
CREATE OR REPLACE FUNCTION random_date_in_range(days_back INTEGER)
RETURNS DATE AS $$
BEGIN
  RETURN CURRENT_DATE - (random() * days_back)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Insert sample FOUND items (these should be visible to public on Browse page)
-- These items don't have user_id since they're found items that need to be handled by staff
-- For demonstration, we'll insert with NULL user_id and set is_anonymous to false
-- In production, staff users would have proper user_ids

-- Sample FOUND Items with various categories
INSERT INTO public.items (
  id,
  user_id,
  status,
  category,
  title,
  description,
  location,
  date_lost_found,
  color,
  venue,
  container,
  identifying_details,
  is_anonymous,
  is_active,
  created_at
) VALUES 
-- Electronics
(
  gen_random_uuid(),
  NULL,
  'found',
  'electronics',
  'iPhone 14 Pro Max',
  'Black iPhone 14 Pro Max with a clear case. Silver-colored buttons, slightly cracked screen protector on the back. Found in the library on the third floor near the windows.',
  '3rd Floor, North Wing',
  random_date_in_range(30),
  'Black',
  'Library',
  'Box A-12',
  'Small scratch on left side, custom wallpaper with mountains',
  false,
  true,
  NOW() - interval '1 day'
),
(
  gen_random_uuid(),
  NULL,
  'found',
  'electronics',
  'MacBook Pro 14-inch',
  'Space Gray MacBook Pro with stickers on the lid (NASA, Spotify, coding stickers). Charger included. Found in the student union cafeteria.',
  'Cafeteria Area',
  random_date_in_range(20),
  'Space Gray',
  'SU',
  'Box B-3',
  'Stickers: NASA logo, "Hello World" coding sticker, Spotify logo. Minor scratches on lid.',
  false,
  true,
  NOW() - interval '3 days'
),
(
  gen_random_uuid(),
  NULL,
  'found',
  'electronics',
  'AirPods Pro 2nd Gen',
  'White AirPods Pro in original case. Engraving on the case says "Emily 2023". Charging wire included.',
  'Griffin Hall, 2nd Floor',
  random_date_in_range(15),
  'White',
  'GF',
  'Box C-7',
  'Case has "Emily 2023" engraved. Small scratch on right AirPod.',
  false,
  true,
  NOW() - interval '5 days'
),
-- Clothing
(
  gen_random_uuid(),
  NULL,
  'found',
  'clothing',
  'Nike Black Hoodie',
  'Black Nike hoodie, size L. Drawstring hood with zipper front. Nike swoosh logo on front. Small tear on right sleeve.',
  'Library 1st Floor',
  random_date_in_range(25),
  'Black',
  'Library',
  'Box D-21',
  'Tear on right sleeve near cuff. Has "Nike" logo in white.',
  false,
  true,
  NOW() - interval '2 days'
),
(
  gen_random_uuid(),
  NULL,
  'found',
  'clothing',
  'Red Leather Jacket',
  'Red faux leather jacket, size M. Snap closures and pockets. Slightly worn on the collar.',
  'Student Union, Main Floor',
  random_date_in_range(40),
  'Red',
  'SU',
  'Box E-5',
  'Wear on collar, buttons in good condition. Inside tag says "Size M"',
  false,
  true,
  NOW() - interval '7 days'
),
(
  gen_random_uuid(),
  NULL,
  'found',
  'clothing',
  'Blue North Face Winter Coat',
  'Dark blue North Face winter coat, size XL. Waterproof, has a hood. Zipper pocket on chest. Found in the parking area.',
  'Parking Lot Area',
  random_date_in_range(60),
  'Dark Blue',
  'Parking',
  'Box F-12',
  'North Face logo on left chest. Small hole in right pocket. Still has tags inside.',
  false,
  true,
  NOW() - interval '4 days'
),
-- Keys
(
  gen_random_uuid(),
  NULL,
  'found',
  'keys',
  'Car Keys with Toyota Fob',
  'Set of car keys with a Toyota key fob. Attached to a green lanyard with university logo. 4 keys total on ring.',
  'Landrum Academic Center, Lobby',
  random_date_in_range(10),
  'Green Lanyard',
  'LA',
  'Box G-2',
  'Green lanyard with "NKU" logo. Toyota key fob. 4 keys on ring.',
  false,
  true,
  NOW() - interval '1 day'
),
(
  gen_random_uuid(),
  NULL,
  'found',
  'keys',
  'House Keys on Red Keychain',
  'Set of 3 house keys attached to a red braided keychain. One large, one medium, one small key. No labels.',
  'Griffin Hall, Lost & Found',
  random_date_in_range(35),
  'Red Keychain',
  'GF',
  'Box H-8',
  'Red braided keychain. 3 unlabeled keys of varying sizes.',
  false,
  true,
  NOW() - interval '6 days'
),
-- Bags
(
  gen_random_uuid(),
  NULL,
  'found',
  'bags',
  'North Face Backpack',
  'Black North Face backpack with red accents. Multiple compartments, laptop sleeve. Some minor stains. Water bottle pockets on sides.',
  'Library, Study Area',
  random_date_in_range(18),
  'Black with Red',
  'Library',
  'Box I-14',
  'North Face logo. Laptop compartment. Minor water stains. Has "Nike" keychain attached to zipper.',
  false,
  true,
  NOW() - interval '8 hours'
),
(
  gen_random_uuid(),
  NULL,
  'found',
  'bags',
  'Coach Leather Purse',
  'Brown leather Coach purse. Crossbody style with gold chain strap. Interior pockets. Serial number visible on inside tag.',
  'Student Union, Food Court',
  random_date_in_range(22),
  'Brown Leather',
  'SU',
  'Box J-9',
  'Coach logo on front. Gold chain strap. Inside tag: "Coach Serial #F..."',
  false,
  true,
  NOW() - interval '3 days'
),
-- Documents
(
  gen_random_uuid(),
  NULL,
  'found',
  'documents',
  'Student ID Card',
  'University student ID for "Alex Martinez". Expires 2025. Photo ID in good condition.',
  'Parking Area, Near Entrance',
  random_date_in_range(5),
  NULL,
  'Parking',
  'Box K-1',
  'Name: Alex Martinez. Student ID: A789456. Expires 2025.',
  false,
  true,
  NOW() - interval '2 hours'
),
(
  gen_random_uuid(),
  NULL,
  'found',
  'documents',
  'Driver''s License',
  'State driver''s license. Name partially visible as "Jordan..." DOB: 2001. License number partially visible.',
  'Library, Circulation Desk',
  random_date_in_range(12),
  NULL,
  'Library',
  'Box L-6',
  'First name: Jordan. DOB: 2001. License expires 2027.',
  false,
  true,
  NOW() - interval '18 hours'
),
(
  gen_random_uuid(),
  NULL,
  'found',
  'documents',
  'Credit Card',
  'Chase credit card ending in 4532. Found near the ATM in the student union. Card is in good condition.',
  'Near ATM Machine',
  random_date_in_range(3),
  NULL,
  'SU',
  'Box M-11',
  'Chase Bank. Last 4 digits: 4532. Cardholder name: "M. WILLIAMS"',
  false,
  true,
  NOW() - interval '6 hours'
),
-- Books
(
  gen_random_uuid(),
  NULL,
  'found',
  'books',
  'Calculus III Textbook',
  'Stewart Calculus: Early Transcendentals, 8th Edition. Hardcover. Name written inside: "Sarah Chen - Fall 2024"',
  'Landrum Academic Center, Hallway',
  random_date_in_range(45),
  NULL,
  'LA',
  'Box N-4',
  'Name: Sarah Chen. Class: Calculus III. Semester: Fall 2024. Yellow highlighting throughout.',
  false,
  true,
  NOW() - interval '10 days'
),
(
  gen_random_uuid(),
  NULL,
  'found',
  'books',
  'Organic Chemistry Lab Manual',
  'University custom lab manual for Organic Chemistry. Spiral bound, green cover. Well-used with notes and calculations.',
  'Griffin Hall, Chemistry Lab',
  random_date_in_range(30),
  'Green Cover',
  'GF',
  'Box O-13',
  'Organic Chemistry lab manual. Written notes on every page. Last name "Parker" on cover.',
  false,
  true,
  NOW() - interval '5 days'
),
-- Accessories
(
  gen_random_uuid(),
  NULL,
  'found',
  'accessories',
  'Apple Watch Series 9',
  'Starlight aluminum Apple Watch with Sport Band. 45mm size. In good condition, minor scratch on screen.',
  'Library, Computer Lab',
  random_date_in_range(14),
  'Starlight/Silver',
  'Library',
  'Box P-10',
  'Series 9, 45mm. Starlight aluminum. Small scratch on screen. Sport Band attached.',
  false,
  true,
  NOW() - interval '12 hours'
),
(
  gen_random_uuid(),
  NULL,
  'found',
  'accessories',
  'Ray-Ban Sunglasses',
  'Black Ray-Ban aviator sunglasses in case. Gold frame, green lenses. Scratches on right lens.',
  'Student Union, Outside Tables',
  random_date_in_range(20),
  'Black/Gold',
  'SU',
  'Box Q-7',
  'Ray-Ban logo on temples. Original case included. Small scratches on right lens.',
  false,
  true,
  NOW() - interval '2 days'
),
-- Sports
(
  gen_random_uuid(),
  NULL,
  'found',
  'sports',
  'Nike Basketball',
  'Orange and black Nike basketball. Good condition, slightly deflated. University colors. Some wear marks.',
  'Parking Area, Near Courts',
  random_date_in_range(35),
  'Orange/Black',
  'Parking',
  'Box R-15',
  'Nike logo visible. University colors (orange/black). Slightly deflated. Personal name "Tyler" written with marker.',
  false,
  true,
  NOW() - interval '4 days'
),
(
  gen_random_uuid(),
  NULL,
  'found',
  'sports',
  'Yoga Mat',
  'Purple yoga mat in a carrying bag. Mandala pattern on mat. Some scuff marks but in good condition.',
  'Student Union, Fitness Center',
  random_date_in_range(28),
  'Purple',
  'SU',
  'Box S-8',
  'Purple mandala pattern. Carrying bag included. Small scuff marks. Brand: Lululemon.',
  false,
  true,
  NOW() - interval '6 days'
),
-- Other
(
  gen_random_uuid(),
  NULL,
  'found',
  'other',
  'Umbrella - Compact Blue',
  'Small compact blue umbrella with automatic open button. University bookstore brand. Handle has rubber grip.',
  'Library Entrance',
  random_date_in_range(55),
  'Blue',
  'Library',
  'Box T-3',
  'University bookstore brand. Automatic open. Small tear in one panel. "Property of N.K." sticker inside.',
  false,
  true,
  NOW() - interval '7 days'
),
(
  gen_random_uuid(),
  NULL,
  'found',
  'other',
  'Coffee Thermos',
  'Insulated stainless steel coffee thermos. Black with white university logo. Scratches on exterior. Stains on inside.',
  'Griffin Hall, Hallway',
  random_date_in_range(40),
  'Black',
  'GF',
  'Box U-12',
  'University logo printed. Interior stains from coffee. Dents on lid.',
  false,
  true,
  NOW() - interval '5 days'
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Sample data seeded successfully! Added 20 found items across all categories.';
END $$;

