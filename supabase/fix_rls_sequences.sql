-- Fix RLS policies for sequences table
-- This allows authenticated users to update sequences

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view sequences in their projects" ON sequences;
DROP POLICY IF EXISTS "Users can insert sequences in their projects" ON sequences;
DROP POLICY IF EXISTS "Users can update sequences in their projects" ON sequences;
DROP POLICY IF EXISTS "Users can delete sequences in their projects" ON sequences;

-- Enable RLS on sequences table
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for sequences
CREATE POLICY "Users can view sequences in their projects"
ON sequences FOR SELECT
TO authenticated
USING (
  shooting_day_id IN (
    SELECT id FROM shooting_days 
    WHERE project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can insert sequences in their projects"
ON sequences FOR INSERT
TO authenticated
WITH CHECK (
  shooting_day_id IN (
    SELECT id FROM shooting_days 
    WHERE project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update sequences in their projects"
ON sequences FOR UPDATE
TO authenticated
USING (
  shooting_day_id IN (
    SELECT id FROM shooting_days 
    WHERE project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  )
)
WITH CHECK (
  shooting_day_id IN (
    SELECT id FROM shooting_days 
    WHERE project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete sequences in their projects"
ON sequences FOR DELETE
TO authenticated
USING (
  shooting_day_id IN (
    SELECT id FROM shooting_days 
    WHERE project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  )
);
