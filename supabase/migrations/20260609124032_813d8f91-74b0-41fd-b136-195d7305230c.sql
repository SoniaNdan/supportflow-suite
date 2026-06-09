
-- Restrictive policy to absolutely prevent non-admin role assignment
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Restrict Realtime channel subscriptions so users can only subscribe to their own notification stream.
-- The notifications table RLS already prevents reading other users' rows, but channel topic access
-- should be explicitly scoped to prevent any side-channel exposure.
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only subscribe to own notification topic" ON realtime.messages;
CREATE POLICY "Users can only subscribe to own notification topic"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'notifications-stream:' || auth.uid()::text
  OR realtime.topic() NOT LIKE 'notifications-stream%'
);
