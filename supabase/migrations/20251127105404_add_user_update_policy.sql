CREATE POLICY "Users can update own lists"
ON lists FOR UPDATE
                        TO authenticated
                        USING (auth.uid() = user_id)
             WITH CHECK (auth.uid() = user_id);