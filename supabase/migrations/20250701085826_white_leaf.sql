/*
  # Restructure user_data table to avoid timeouts

  1. Changes
    - Remove large JSON columns (uploaded_data, cleaned_data) from user_data table
    - Add current_dataset_id column to reference active dataset from user_datasets table
    - Add foreign key constraint to maintain data integrity

  2. Benefits
    - Eliminates database timeouts caused by large JSON payloads
    - Reduces storage overhead in user_data table
    - Maintains data relationships through proper foreign keys
*/

-- Drop existing columns that store large data directly
ALTER TABLE public.user_data DROP COLUMN IF EXISTS uploaded_data;
ALTER TABLE public.user_data DROP COLUMN IF EXISTS cleaned_data;

-- Add a new column to reference the currently active dataset from user_datasets
ALTER TABLE public.user_data ADD COLUMN IF NOT EXISTS current_dataset_id UUID;

-- Add a foreign key constraint to link to the user_datasets table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_current_dataset' 
    AND table_name = 'user_data'
  ) THEN
    ALTER TABLE public.user_data ADD CONSTRAINT fk_current_dataset
    FOREIGN KEY (current_dataset_id) REFERENCES public.user_datasets(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_data_current_dataset_id ON public.user_data(current_dataset_id);