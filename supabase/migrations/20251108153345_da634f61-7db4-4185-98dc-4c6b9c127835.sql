-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can update car availability during checkout" ON public.cars;

-- Create a function to update car availability when order items are created
CREATE OR REPLACE FUNCTION public.update_car_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set the car as unavailable when an order item is created
  UPDATE public.cars
  SET available = false
  WHERE id = NEW.car_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger on order_items to automatically update car availability
CREATE TRIGGER trigger_update_car_availability
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.update_car_availability();