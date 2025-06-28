/*
  # Add ML Results Storage

  1. New Tables
    - `ml_results`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `model_name` (text)
      - `target_column` (text)
      - `task_type` (text)
      - `model_results` (jsonb)
      - `feature_importance` (jsonb)
      - `model_comparison` (jsonb)
      - `training_config` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `ml_results` table
    - Add policies for authenticated users to manage their own ML results

  3. Changes
    - Add trigger for automatic updated_at timestamp
*/

CREATE TABLE IF NOT EXISTS ml_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  model_name text NOT NULL,
  target_column text NOT NULL,
  task_type text NOT NULL CHECK (task_type IN ('classification', 'regression')),
  model_results jsonb NOT NULL,
  feature_importance jsonb,
  model_comparison jsonb,
  training_config jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE ml_results ENABLE ROW LEVEL SECURITY;

-- Create policies for ML results access
CREATE POLICY "Users can view own ML results"
  ON ml_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ML results"
  ON ml_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ML results"
  ON ml_results
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ML results"
  ON ml_results
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at for ml_results
CREATE TRIGGER update_ml_results_updated_at
  BEFORE UPDATE ON ml_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_ml_results_user_id ON ml_results(user_id);
CREATE INDEX IF NOT EXISTS idx_ml_results_created_at ON ml_results(created_at DESC);