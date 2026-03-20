-- Function to calculate streak for a habit
CREATE OR REPLACE FUNCTION public.calculate_streak(p_habit_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_streak INTEGER := 0;
    v_date DATE;
    v_days_per_week INTEGER[];
BEGIN
    -- Get scheduled days for this habit
    SELECT repeat_days INTO v_days_per_week FROM habits WHERE id = p_habit_id;
    
    -- Start from today and go backwards
    v_date := current_date;
    
    LOOP
        -- Check if there's a completion for this date
        IF EXISTS (SELECT 1 FROM completions WHERE habit_id = p_habit_id AND date = v_date) THEN
            v_streak := v_streak + 1;
        -- If not completed, but it WAS scheduled, the streak is broken
        -- OR if it's today and not yet completed, we keep the previous streak but don't break it yet
        ELSIF v_date < current_date AND (extract(dow from v_date) = ANY(v_days_per_week)) THEN
            EXIT;
        END IF;
        
        v_date := v_date - 1;
        
        -- Safety break
        IF v_streak > 1000 THEN EXIT; END IF;
    END LOOP;
    
    RETURN v_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to update habit streak on completion changes
CREATE OR REPLACE FUNCTION public.update_habit_streak_on_completion()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE habits 
    SET streak = calculate_streak(COALESCE(NEW.habit_id, OLD.habit_id))
    WHERE id = COALESCE(NEW.habit_id, OLD.habit_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS tr_completion_streak ON completions;
CREATE TRIGGER tr_completion_streak
AFTER INSERT OR DELETE ON completions
FOR EACH ROW
EXECUTE FUNCTION public.update_habit_streak_on_completion();

-- Also set up storage bucket policies in the migration for consistency
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage (if not exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'objects') THEN
        CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'assets');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Upload' AND tablename = 'objects') THEN
        CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'assets' AND auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owner Delete' AND tablename = 'objects') THEN
        CREATE POLICY "Owner Delete" ON storage.objects FOR DELETE USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;
