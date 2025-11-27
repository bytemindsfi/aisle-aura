-- Drop problematic policies
DROP POLICY "Users can view accessible lists" ON lists;
DROP POLICY "Users can update accessible lists" ON lists;
DROP POLICY "Only owners can delete lists" ON lists;
DROP POLICY "Users can delete own lists" ON lists;
DROP POLICY "Users can update own lists" ON lists;

-- Keep only INSERT and basic SELECT
CREATE POLICY "Users can view own lists"
ON lists FOR SELECT
                                                 TO authenticated
                                                 USING (auth.uid() = user_id);