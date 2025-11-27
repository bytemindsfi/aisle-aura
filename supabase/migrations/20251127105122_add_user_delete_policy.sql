-- Simple DELETE policy for owners
CREATE POLICY "Users can delete own lists"
ON lists FOR DELETE
TO authenticated
USING (auth.uid() = user_id);