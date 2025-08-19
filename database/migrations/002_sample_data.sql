-- Seed Data: 002_sample_data.sql
-- Description: Insert sample wedding vendor data
-- Created: 2024-08-18

-- Insert sample categories
INSERT INTO vendor_categories (name, budget) VALUES
  ('Floral Arrangements', 5000.00),
  ('Venue & Catering', 15000.00),
  ('Photography', 8000.00),
  ('Music & Entertainment', 3000.00);

-- Insert sample vendors for Floral Arrangements
INSERT INTO vendors (category_id, name, contact_email, phone, price, status, last_contact, notes) 
SELECT id, 'Bloom & Blossom', 'sarah@bloomblossom.com', '(555) 123-4567', 4200.00, 'negotiating', '2024-08-17', 'Waiting for revised quote with premium roses'
FROM vendor_categories WHERE name = 'Floral Arrangements';

INSERT INTO vendors (category_id, name, contact_email, phone, price, status, last_contact, notes) 
SELECT id, 'Garden Dreams', 'mike@gardendreams.com', '(555) 234-5678', 5500.00, 'declined', '2024-08-16', 'Over budget, declined offer'
FROM vendor_categories WHERE name = 'Floral Arrangements';

INSERT INTO vendors (category_id, name, contact_email, phone, price, status, last_contact, notes) 
SELECT id, 'Petals & Co', 'jenny@petalsco.com', '(555) 345-6789', 3800.00, 'interested', '2024-08-18', 'Requested portfolio examples'
FROM vendor_categories WHERE name = 'Floral Arrangements';

-- Insert sample vendors for Venue & Catering
INSERT INTO vendors (category_id, name, contact_email, phone, price, status, last_contact, notes) 
SELECT id, 'Sunset Manor', 'events@sunsetmanor.com', '(555) 456-7890', 14500.00, 'confirmed', '2024-08-17', 'Contract signed, deposit paid'
FROM vendor_categories WHERE name = 'Venue & Catering';

INSERT INTO vendors (category_id, name, contact_email, phone, price, status, last_contact, notes) 
SELECT id, 'Grand Ballroom', 'info@grandballroom.com', '(555) 567-8901', 16000.00, 'declined', '2024-08-15', 'Over budget'
FROM vendor_categories WHERE name = 'Venue & Catering';

-- Insert sample vendors for Photography
INSERT INTO vendors (category_id, name, contact_email, phone, price, status, last_contact, notes) 
SELECT id, 'Capture Moments', 'alex@capturemoments.com', '(555) 678-9012', 7200.00, 'pending', '2024-08-18', 'Reviewing contract terms'
FROM vendor_categories WHERE name = 'Photography';

INSERT INTO vendors (category_id, name, contact_email, phone, price, status, last_contact, notes) 
SELECT id, 'Forever Photos', 'lisa@foreverphotos.com', '(555) 789-0123', 8500.00, 'negotiating', '2024-08-17', 'Discussing package options'
FROM vendor_categories WHERE name = 'Photography';

-- Insert sample vendors for Music & Entertainment
INSERT INTO vendors (category_id, name, contact_email, phone, price, status, last_contact, notes) 
SELECT id, 'DJ Soundwave', 'beats@djsoundwave.com', '(555) 890-1234', 2800.00, 'interested', '2024-08-18', 'Checking availability for date'
FROM vendor_categories WHERE name = 'Music & Entertainment';

INSERT INTO vendors (category_id, name, contact_email, phone, price, status, last_contact, notes) 
SELECT id, 'Live Band Co', 'gigs@livebandco.com', '(555) 901-2345', 4000.00, 'declined', '2024-08-16', 'Over budget for full band'
FROM vendor_categories WHERE name = 'Music & Entertainment';

-- Update venue category to have selected vendor
UPDATE vendor_categories
SET selected_vendor_id = (SELECT id FROM vendors WHERE name = 'Sunset Manor')
WHERE name = 'Venue & Catering';