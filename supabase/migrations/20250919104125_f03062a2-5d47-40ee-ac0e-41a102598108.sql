-- Attach missing trigger to auto-issue certificates upon course completion
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_issue_certificate_on_completion'
  ) THEN
    CREATE TRIGGER trg_issue_certificate_on_completion
    AFTER UPDATE OF completed ON public.enrollments
    FOR EACH ROW
    WHEN (NEW.completed = true AND COALESCE(OLD.completed,false) = false)
    EXECUTE FUNCTION public.issue_certificate_on_completion();
  END IF;
END $$;