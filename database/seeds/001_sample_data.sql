-- Seed Data: 001_sample_data.sql
-- Description: Insert sample wedding vendor data
-- Created: 2024-08-18

-- Insert sample categories
INSERT INTO vendor_categories (id, name, budget) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Floral Arrangements', 5000.00),
('550e8400-e29b-41d4-a716-446655440002', 'Venue & Catering', 15000.00),
('550e8400-e29b-41d4-a716-446655440003', 'Photography', 8000.00),
('550e8400-e29b-41d4-a716-446655440004', 'Music & Entertainment', 3000.00);

-- Insert sample vendors
INSERT INTO vendors (id, category_id, name, contact_email, phone, price, status, last_contact, notes) VALUES
-- Floral vendors
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Bloom & Blossom', 'sarah@bloomblossom.com', '(555) 123-4567', 4200.00, 'negotiating', '2024-08-17', 'Waiting for revised quote with premium roses'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Garden Dreams', 'mike@gardendreams.com', '(555) 234-5678', 5500.00, 'declined', '2024-08-16', 'Over budget, declined offer'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Petals & Co', 'jenny@petalsco.com', '(555) 345-6789', 3800.00, 'interested', '2024-08-18', 'Requested portfolio examples'),

-- Venue vendors
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Sunset Manor', 'events@sunsetmanor.com', '(555) 456-7890', 14500.00, 'confirmed', '2024-08-17', 'Contract signed, deposit paid'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Grand Ballroom', 'info@grandballroom.com', '(555) 567-8901', 16000.00, 'declined', '2024-08-15', 'Over budget'),

-- Photography vendors
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 'Capture Moments', 'alex@capturemoments.com', '(555) 678-9012', 7200.00, 'pending', '2024-08-18', 'Reviewing contract terms'),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'Forever Photos', 'lisa@foreverphotos.com', '(555) 789-0123', 8500.00, 'negotiating', '2024-08-17', 'Discussing package options'),

-- Music vendors
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440004', 'DJ Soundwave', 'beats@djsoundwave.com', '(555) 890-1234', 2800.00, 'interested', '2024-08-18', 'Checking availability for date'),
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004', 'Live Band Co', 'gigs@livebandco.com', '(555) 901-2345', 4000.00, 'declined', '2024-08-16', 'Over budget for full band');

-- Update venue category to have selected vendor
UPDATE vendor_categories 
SET selected_vendor_id = '660e8400-e29b-41d4-a716-446655440004'
WHERE id = '550e8400-e29b-41d4-a716-446655440002';

-- Insert sample AI conversations
INSERT INTO ai_conversations (vendor_id, message_type, subject, body, sent_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'outbound', 'Wedding Floral Services Inquiry', 
'Dear Bloom & Blossom Team,

I hope this email finds you well. I am currently planning a wedding for September 15, 2024, and am reaching out to inquire about your floral arrangement services.

Event Details:
- Date: September 15, 2024
- Guest Count: 150
- Budget Range: $4,000 - $5,000
- Style: Elegant garden-themed wedding with soft pastels

Could you please provide:
1. Your availability for this date
2. Package options and pricing
3. Portfolio examples of recent work

Looking forward to hearing from you.

Best regards,
Wedding Planning AI Assistant', '2024-08-16 10:00:00'),

('660e8400-e29b-41d4-a716-446655440001', 'inbound', 'Re: Wedding Floral Services Inquiry',
'Thank you for your inquiry! We would love to work with you on your September wedding.

We have availability for your date and can work within your budget. Our garden package starts at $4,200 and includes:
- Bridal bouquet
- 6 bridesmaids bouquets  
- Ceremony arch arrangements
- 15 centerpieces
- Boutonnieres for groomsmen

I''ve attached our portfolio. Would you like to schedule a consultation?

Best,
Sarah Johnson
Bloom & Blossom', '2024-08-16 14:30:00');

-- Insert sample AI actions
INSERT INTO ai_actions (vendor_id, action_type, description, requires_human_input, input_needed, completed) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'price_negotiation', 'Vendor quoted $4,200, within budget range', true, 'Review portfolio and approve final arrangements', false),
('660e8400-e29b-41d4-a716-446655440006', 'follow_up_needed', 'No response to initial outreach after 3 days', false, null, false),
('660e8400-e29b-41d4-a716-446655440008', 'availability_check', 'Vendor checking date availability', false, null, false);