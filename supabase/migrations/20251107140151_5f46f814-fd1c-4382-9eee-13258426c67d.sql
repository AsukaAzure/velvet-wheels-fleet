-- Add proper pickup and return fields to cart_items and order_items
-- First add new columns to cart_items
ALTER TABLE public.cart_items 
ADD COLUMN IF NOT EXISTS pickup_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS pickup_time TIME DEFAULT '10:00:00',
ADD COLUMN IF NOT EXISTS return_date DATE DEFAULT CURRENT_DATE + INTERVAL '1 day',
ADD COLUMN IF NOT EXISTS return_location TEXT DEFAULT 'Main Office';

-- Update existing data in cart_items to use start_date/end_date values
UPDATE public.cart_items 
SET pickup_date = start_date,
    return_date = end_date
WHERE pickup_date IS NULL OR return_date IS NULL;

-- Make columns not null after migration
ALTER TABLE public.cart_items
ALTER COLUMN pickup_date SET NOT NULL,
ALTER COLUMN pickup_time SET NOT NULL,
ALTER COLUMN return_date SET NOT NULL;

-- Add new columns to order_items
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS pickup_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS pickup_time TIME DEFAULT '10:00:00',
ADD COLUMN IF NOT EXISTS return_date DATE DEFAULT CURRENT_DATE + INTERVAL '1 day',
ADD COLUMN IF NOT EXISTS return_location TEXT DEFAULT 'Main Office';

-- Update existing data in order_items
UPDATE public.order_items
SET pickup_date = start_date,
    return_date = end_date
WHERE pickup_date IS NULL OR return_date IS NULL;

-- Make columns not null
ALTER TABLE public.order_items
ALTER COLUMN pickup_date SET NOT NULL,
ALTER COLUMN pickup_time SET NOT NULL,
ALTER COLUMN return_date SET NOT NULL;