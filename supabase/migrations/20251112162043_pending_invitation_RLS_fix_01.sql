-- Drop and recreate the policy
DROP POLICY IF EXISTS "Users can view list members" ON list_members;

CREATE POLICY "Users can view list members"
    ON list_members FOR SELECT
                                        USING (
                                        -- Can view if it's your invitation
                                        email = (SELECT email FROM auth.users WHERE id = auth.uid())
                                        OR
                                        -- Can view if you're the member
                                        user_id = auth.uid()
                                        OR
                                        -- Can view if you invited them
                                        invited_by_user_id = auth.uid()
                                        OR
                                        -- Can view if you own the list
                                        is_list_owner(list_id, auth.uid())
                                        );