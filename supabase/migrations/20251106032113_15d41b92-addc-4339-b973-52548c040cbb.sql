-- Add pickup location and return time to cart_items
ALTER TABLE public.cart_items
ADD COLUMN pickup_location TEXT,
ADD COLUMN return_time TIME;

-- Add pickup location and return time to order_items
ALTER TABLE public.order_items
ADD COLUMN pickup_location TEXT,
ADD COLUMN return_time TIME;

-- Update existing records to have default values
UPDATE public.cart_items SET pickup_location = 'Not specified' WHERE pickup_location IS NULL;
UPDATE public.cart_items SET return_time = '10:00:00' WHERE return_time IS NULL;
UPDATE public.order_items SET pickup_location = 'Not specified' WHERE pickup_location IS NULL;
UPDATE public.order_items SET return_time = '10:00:00' WHERE return_time IS NULL;