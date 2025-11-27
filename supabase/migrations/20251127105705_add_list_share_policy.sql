-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view own lists" ON lists;
DROP POLICY IF EXISTS "Users can view own and shared lists" ON lists;

-- Create combined policy with correct table name
CREATE POLICY "Users can view own and shared lists"
ON lists FOR SELECT
                                  TO authenticated
                                  USING (
                                  auth.uid() = user_id
                                  OR
                                  EXISTS (
                                  SELECT 1 FROM list_members
                                  WHERE list_members.list_id = lists.id
                                  AND list_members.user_id = auth.uid()
                                  )
                                  );