-- Drop the wrong one
DROP POLICY "Users can insert own lists" ON lists;

-- Create correct one for authenticated users
CREATE POLICY "Users can insert own lists"
ON lists
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Verify
SELECT * FROM pg_policies WHERE tablename = 'lists' AND cmd = 'INSERT';