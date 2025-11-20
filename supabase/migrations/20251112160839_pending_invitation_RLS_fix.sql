-- Update the lists SELECT policy to include pending invitations
DROP POLICY IF EXISTS "Users can view accessible lists" ON lists;

CREATE POLICY "Users can view accessible lists"
    ON lists FOR SELECT
                                 USING (
                                 -- Owner
                                 has_list_access(id, auth.uid())
                                 OR
                                 -- Pending invitation (can view to accept)
                                 id IN (
                                 SELECT list_id
                                 FROM list_members
                                 WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
                                 AND status = 'pending'
                                 )
                                 );