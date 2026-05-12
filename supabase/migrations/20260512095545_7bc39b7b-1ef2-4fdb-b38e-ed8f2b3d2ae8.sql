
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  complaint_id uuid,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Trigger: reply posted -> notify the other party (owner or staff)
CREATE OR REPLACE FUNCTION public.notify_on_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c record;
  recipient uuid;
  sender_name text;
BEGIN
  SELECT id, ticket_no, subject, user_id, assigned_to INTO c
    FROM public.complaints WHERE id = NEW.complaint_id;
  IF c.id IS NULL THEN RETURN NEW; END IF;

  SELECT COALESCE(full_name, email, 'Someone') INTO sender_name
    FROM public.profiles WHERE id = NEW.user_id;

  IF NEW.user_id = c.user_id THEN
    -- Reply from owner -> notify assigned staff (or skip if none)
    recipient := c.assigned_to;
  ELSE
    -- Reply from staff/other -> notify the owner
    recipient := c.user_id;
  END IF;

  IF recipient IS NOT NULL AND recipient <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, complaint_id, type, title, message, link)
    VALUES (
      recipient, c.id, 'reply_posted',
      sender_name || ' replied to ' || c.ticket_no,
      left(NEW.message, 140),
      '/complaints/' || c.ticket_no
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_reply
AFTER INSERT ON public.complaint_replies
FOR EACH ROW EXECUTE FUNCTION public.notify_on_reply();

-- Trigger: status changed -> notify owner
CREATE OR REPLACE FUNCTION public.notify_on_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notifications (user_id, complaint_id, type, title, message, link)
    VALUES (
      NEW.user_id, NEW.id, 'status_changed',
      'Status updated on ' || NEW.ticket_no,
      'Status changed from ' || OLD.status || ' to ' || NEW.status,
      '/complaints/' || NEW.ticket_no
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_status_change
AFTER UPDATE OF status ON public.complaints
FOR EACH ROW EXECUTE FUNCTION public.notify_on_status_change();
