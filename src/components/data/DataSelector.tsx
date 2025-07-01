
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Database, Trash2, Calendar, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DataSelectorProps {
  userId: string;
  onDataSelected: (data: any) => void;
  currentData: any;
}

interface SavedDataset {
  id: string;
  name: string;
  filename: string;
  uploadedData: any;
  cleanedData: any;
  createdAt: string;
  updatedAt: string;
}

const DataSelector = ({ userId, onDataSelected, currentData }: DataSelectorProps) => {
  const [savedDatasets, setSavedDatasets] = useState<SavedDataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch all saved datasets for the user
  const fetchSavedDatasets = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_datasets')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setSavedDatasets(data.map(dataset => ({
          id: dataset.id,
          name: dataset.dataset_name,
          filename: dataset.filename,
          uploadedData: dataset.uploaded_data,
          cleanedData: dataset.cleaned_data,
          createdAt: dataset.created_at,
          updatedAt: dataset.updated_at
        })));
      }
    } catch (error: any) {
      console.error("Error fetching saved datasets:", error);
      toast({
        title: "Error",
        description: "Failed to load your saved datasets.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load selected dataset
  const handleDatasetSelect = (datasetId: string) => {
    const dataset = savedDatasets.find(d => d.id === datasetId);
    if (dataset) {
      setSelectedDatasetId(datasetId);
      onDataSelected({
        ...dataset.uploadedData,
        cleanedData: dataset.cleanedData
      });
      
      toast({
        title: "Dataset Loaded",
        description: `Loaded ${dataset.name} successfully.`,
      });
    }
  };

  // Delete a dataset
  const handleDeleteDataset = async (datasetId: string) => {
    try {
      const { error } = await supabase
        .from('user_datasets')
        .delete()
        .eq('id', datasetId)
        .eq('user_id', userId);

      if (error) throw error;

      setSavedDatasets(prev => prev.filter(d => d.id !== datasetId));
      
      if (selectedDatasetId === datasetId) {
        setSelectedDatasetId("");
        onDataSelected(null);
      }

      toast({
        title: "Dataset Deleted",
        description: "Dataset deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting dataset:", error);
      toast({
        title: "Error",
        description: "Failed to delete dataset.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSavedDatasets();
  }, [userId]);

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Database className="h-5 w-5" />
          Select Dataset
        </CardTitle>
        <CardDescription className="text-gray-400">
          Choose from your saved datasets or upload a new one
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {savedDatasets.length > 0 ? (
          <>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Available Datasets</label>
              <Select value={selectedDatasetId} onValueChange={handleDatasetSelect}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select a dataset" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {savedDatasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id} className="text-white">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{dataset.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs border-slate-500 text-slate-400">
                          {new Date(dataset.updatedAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDatasetId && (
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">Dataset Details</h4>
                  <Button
                    onClick={() => handleDeleteDataset(selectedDatasetId)}
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
                {(() => {
                  const dataset = savedDatasets.find(d => d.id === selectedDatasetId);
                  if (!dataset) return null;
                  
                  return (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Filename</p>
                        <p className="text-white">{dataset.filename}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Last Updated</p>
                        <div className="flex items-center gap-1 text-white">
                          <Calendar className="h-3 w-3" />
                          {new Date(dataset.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No saved datasets found</p>
            <p className="text-sm text-gray-500">Upload your first dataset to get started</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-4">
            <p className="text-gray-400">Loading datasets...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataSelector;
