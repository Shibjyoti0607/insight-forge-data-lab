
-- Create a table to store multiple datasets per user
CREATE TABLE public.user_datasets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dataset_name TEXT NOT NULL,
  filename TEXT NOT NULL,
  uploaded_data JSONB,
  cleaned_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.user_datasets ENABLE ROW LEVEL SECURITY;

-- Create policies for user_datasets
CREATE POLICY "Users can view their own datasets" 
  ON public.user_datasets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own datasets" 
  ON public.user_datasets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own datasets" 
  ON public.user_datasets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own datasets" 
  ON public.user_datasets 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to update the updated_at column
CREATE TRIGGER update_user_datasets_updated_at
  BEFORE UPDATE ON public.user_datasets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for better performance
CREATE INDEX idx_user_datasets_user_id ON public.user_datasets(user_id);
CREATE INDEX idx_user_datasets_updated_at ON public.user_datasets(updated_at DESC);
