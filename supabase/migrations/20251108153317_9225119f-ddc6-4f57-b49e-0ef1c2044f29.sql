-- Allow authenticated users to update car availability when checking out
CREATE POLICY "Users can update car availability during checkout"
ON public.cars
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);