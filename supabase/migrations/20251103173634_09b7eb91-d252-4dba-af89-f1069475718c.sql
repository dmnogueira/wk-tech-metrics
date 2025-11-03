-- Fix PUBLIC_DATA_EXPOSURE: Restrict profile access to authenticated users only
-- Remove the overly permissive "Profiles are viewable by everyone" policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a new policy that requires authentication to view profiles
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Note: Keep existing policies for users to update their own profiles and admins to manage all profiles