/*
  # Create user data storage table

  1. New Tables
    - `user_data`
      - `id` (uuid, primary key, references auth.users)
      - `uploaded_data` (jsonb, nullable) - stores raw uploaded data
      - `cleaned_data` (jsonb, nullable) - stores processed/cleaned data
      - `created_at` (timestampz, default now())
      - `updated_at` (timestampz, default now())

  2. Security
    - Enable RLS on `user_data` table
    - Add policies for users to manage their own data only
    - Users can SELECT, INSERT, UPDATE, DELETE their own records

  3. Functions
    - Add trigger to automatically update `updated_at` timestamp
*/

-- Create the user_data table
CREATE TABLE IF NOT EXISTS user_data (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_data jsonb,
  cleaned_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Create policies for user data access
CREATE POLICY "Users can view own data"
  ON user_data
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON user_data
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON user_data
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own data"
  ON user_data
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();