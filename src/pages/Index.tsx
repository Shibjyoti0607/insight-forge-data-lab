import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthSection from "@/components/auth/AuthSection";
import DataUpload from "@/components/data/DataUpload";
import DataPreview from "@/components/data/DataPreview";
import DataCleaning from "@/components/data/DataCleaning";
import AutoMLSection from "@/components/ml/AutoMLSection";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Database, Upload, Settings, Brain, BarChart3, Loader2, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DataSelector from "@/components/data/DataSelector";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);
  const [cleanedData, setCleanedData] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [userId, setUserId] = useState<string | null>(null);
  const [currentDatasetId, setCurrentDatasetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mlResults, setMlResults] = useState<any[]>([]);
  const [showDataSelector, setShowDataSelector] = useState(false);
  const { toast } = useToast();
  
  // AutoML state that persists across tab switches
  const [autoMLState, setAutoMLState] = useState({
    selectedTarget: "",
    selectedTask: "",
    isTraining: false,
    modelResults: null,
    showInsights: false
  });

  console.log("Index component rendered");
  console.log("Is authenticated:", isAuthenticated);
  console.log("User ID:", userId);
  console.log("Current Dataset ID:", currentDatasetId);
  console.log("Uploaded data:", uploadedData ? "Present" : "None");
  console.log("AutoML state:", autoMLState);
  console.log("ML Results:", mlResults);

  // Handle data selection from DataSelector
  const handleDataSelected = useCallback((data: any) => {
    console.log("Data selected from DataSelector:", data);
    
    if (data) {
      // Set the uploaded data
      setUploadedData(data);
      
      // If the selected data has cleaned data, set it as well
      if (data.cleanedData) {
        setCleanedData(data.cleanedData);
      } else {
        setCleanedData(null);
      }
      
      // Set the current dataset ID if available
      if (data.id) {
        setCurrentDatasetId(data.id);
      }
      
      // Reset AutoML state for new data
      setAutoMLState({
        selectedTarget: "",
        selectedTask: "",
        isTraining: false,
        modelResults: null,
        showInsights: false
      });

      // Switch to preview tab to show the selected data
      setActiveTab("preview");
      
      toast({
        title: "Dataset Selected",
        description: "Dataset loaded successfully.",
      });
    } else {
      // Clear all data if null is passed
      handleDataCleared();
    }
  }, [toast]);

  // Handle data upload with proper state clearing
  const handleDataUploaded = useCallback(async (data: any) => {
    console.log("New data uploaded, clearing previous states");
    
    // Clear all previous data states
    setUploadedData(data);
    setCleanedData(null);
    
    // Reset AutoML state
    setAutoMLState({
      selectedTarget: "",
      selectedTask: "",
      isTraining: false,
      modelResults: null,
      showInsights: false
    });

    // Save to user_datasets table
    if (userId && data) {
      try {
        const datasetName = data.filename || `Dataset ${new Date().toLocaleDateString()}`;
        const { data: newDataset, error } = await supabase
          .from('user_datasets' as any)
          .insert({
            user_id: userId,
            dataset_name: datasetName,
            filename: data.filename || 'unknown',
            uploaded_data: data,
            cleaned_data: null
          })
          .select()
          .single();

        if (error) {
          console.error("Error saving dataset:", error);
          toast({
            title: "Save Warning",
            description: "Dataset uploaded but couldn't be saved to your account.",
            variant: "destructive",
          });
        } else {
          console.log("Dataset saved successfully:", newDataset);
          setCurrentDatasetId(newDataset.id);
          toast({
            title: "Dataset Saved",
            description: `${datasetName} has been saved to your account.`,
          });
        }
      } catch (error) {
        console.error("Error saving dataset:", error);
      }
    }
    
    // Switch to preview tab to show the new data
    setActiveTab("preview");
  }, [userId, toast]);

  // Handle data clearing
  const handleDataCleared = useCallback(() => {
    console.log("Clearing all data states");
    setUploadedData(null);
    setCleanedData(null);
    setCurrentDatasetId(null);
    setAutoMLState({
      selectedTarget: "",
      selectedTask: "",
      isTraining: false,
      modelResults: null,
      showInsights: false
    });
  }, []);

  // Handle cleaned data update
  const handleDataCleaned = useCallback(async (cleanedDataResult: any) => {
    console.log("Data cleaned, updating state");
    setCleanedData(cleanedDataResult);
    
    // Update the current dataset with cleaned data if we have a dataset ID
    if (currentDatasetId && userId) {
      try {
        const { error } = await supabase
          .from('user_datasets')
          .update({ cleaned_data: cleanedDataResult })
          .eq('id', currentDatasetId)
          .eq('user_id', userId);

        if (error) {
          console.error("Error updating cleaned data:", error);
        } else {
          console.log("Cleaned data saved to dataset");
        }
      } catch (error) {
        console.error("Error saving cleaned data:", error);
      }
    }
  }, [currentDatasetId, userId]);

  // Fetch user data from Supabase
  const fetchUserData = useCallback(async (userIdToFetch: string) => {
    if (!userIdToFetch) return;

    try {
      console.log("Fetching user data for:", userIdToFetch);
      
      // First, get the current dataset ID from user_data
      const { data: userData, error: userError } = await supabase
        .from('user_data')
        .select('current_dataset_id')
        .eq('id', userIdToFetch)
        .maybeSingle();

      if (userError) {
        throw userError;
      }

      if (userData?.current_dataset_id) {
        console.log("Found current dataset ID:", userData.current_dataset_id);
        setCurrentDatasetId(userData.current_dataset_id);
        
        // Fetch the actual dataset data
        const { data: datasetData, error: datasetError } = await supabase
          .from('user_datasets')
          .select('uploaded_data, cleaned_data')
          .eq('id', userData.current_dataset_id)
          .eq('user_id', userIdToFetch)
          .single();

        if (datasetError) {
          console.error("Error fetching dataset data:", datasetError);
          return;
        }

        if (datasetData) {
          console.log("Dataset data fetched successfully");
          if (datasetData.uploaded_data) {
            setUploadedData(datasetData.uploaded_data as any);
            console.log("Restored uploaded data");
          }
          if (datasetData.cleaned_data) {
            setCleanedData(datasetData.cleaned_data as any);
            console.log("Restored cleaned data");
          }
          
          // If we have data, switch to preview tab
          if (datasetData.uploaded_data) {
            setActiveTab("preview");
          }
        }
      } else {
        // No current dataset found - this is normal for new users
        console.log("No current dataset found for user");
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Data Loading Error",
        description: "Failed to load your saved data. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Fetch ML results from Supabase
  const fetchMLResults = useCallback(async (userIdToFetch: string) => {
    if (!userIdToFetch) return;

    try {
      console.log("Fetching ML results for:", userIdToFetch);
      const { data, error } = await supabase
        .from('ml_results')
        .select('*')
        .eq('user_id', userIdToFetch)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        console.log("ML results fetched successfully:", data.length, "results");
        setMlResults(data);
        
        // Restore the most recent model results to autoML state if it matches current target
        const latestResult = data[0];
        if (latestResult && autoMLState.selectedTarget === latestResult.target_column) {
          setAutoMLState(prev => ({
            ...prev,
            selectedTask: latestResult.task_type,
            modelResults: latestResult.model_results,
            showInsights: true
          }));
          console.log("Restored latest ML results to autoML state");
        }
      } else {
        console.log("No ML results found for user");
        setMlResults([]);
      }
    } catch (error: any) {
      console.error("Error fetching ML results:", error);
      toast({
        title: "ML Results Loading Error",
        description: "Failed to load your saved ML results.",
        variant: "destructive",
      });
    }
  }, [toast, autoMLState.selectedTarget]);

  // Save ML results to Supabase
  const saveMLResults = useCallback(async (
    userIdToSave: string, 
    modelName: string,
    targetColumn: string,
    taskType: string,
    modelResults: any,
    trainingConfig: any
  ) => {
    if (!userIdToSave || !modelResults) return;

    try {
      setIsSaving(true);
      console.log("Saving ML results for:", userIdToSave);
      
      const mlResultData = {
        user_id: userIdToSave,
        model_name: modelName,
        target_column: targetColumn,
        task_type: taskType,
        model_results: modelResults,
        feature_importance: modelResults.featureImportance || null,
        model_comparison: modelResults.modelComparison || null,
        training_config: trainingConfig
      };

      const { data, error } = await supabase
        .from('ml_results')
        .insert(mlResultData)
        .select()
        .single();

      if (error) throw error;

      console.log("ML results saved successfully:", data);
      
      // Update local ML results list
      setMlResults(prev => [data, ...prev]);
      
      toast({
        title: "ML Results Saved",
        description: `${modelName} model results saved successfully to your account.`,
      });

      return data;
    } catch (error: any) {
      console.error("Error saving ML results:", error);
      toast({
        title: "Save Error",
        description: "Failed to save ML results. Your model may be lost if you refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Save user data to Supabase (now only saves current dataset reference)
  const saveUserData = useCallback(async (userIdToSave: string, datasetIdToSave: string | null) => {
    if (!userIdToSave) return;

    try {
      setIsSaving(true);
      console.log("Saving user data for:", userIdToSave, "with dataset ID:", datasetIdToSave);
      
      const { error } = await supabase
        .from('user_data')
        .upsert({
          id: userIdToSave,
          current_dataset_id: datasetIdToSave,
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      console.log("User data saved successfully");
    } catch (error: any) {
      console.error("Error saving user data:", error);
      toast({
        title: "Save Error",
        description: "Failed to save your data reference. Your work may be lost if you refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          return;
        }

        if (session?.user) {
          console.log("Existing session found for user:", session.user.email);
          setIsAuthenticated(true);
          setUserId(session.user.id);
          await fetchUserData(session.user.id);
          await fetchMLResults(session.user.id);
        } else {
          console.log("No existing session found");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [fetchUserData, fetchMLResults]);

  // Save current dataset reference whenever currentDatasetId changes
  useEffect(() => {
    if (userId) {
      // Debounce the save operation to avoid too many requests
      const timeoutId = setTimeout(() => {
        saveUserData(userId, currentDatasetId);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [userId, currentDatasetId, saveUserData]);

  // Handle successful authentication
  const handleAuthSuccess = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting session after auth:", error);
        return;
      }

      if (session?.user) {
        console.log("Authentication successful for user:", session.user.email);
        setIsAuthenticated(true);
        setUserId(session.user.id);
        await fetchUserData(session.user.id);
        await fetchMLResults(session.user.id);
      }
    } catch (error) {
      console.error("Error handling auth success:", error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      console.log("Logging out user");
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
      }

      // Clear local state
      setIsAuthenticated(false);
      setUserId(null);
      setUploadedData(null);
      setCleanedData(null);
      setCurrentDatasetId(null);
      setMlResults([]);
      setActiveTab("upload");
      setAutoMLState({
        selectedTarget: "",
        selectedTask: "",
        isTraining: false,
        modelResults: null,
        showInsights: false
      });

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Handle ML model training completion
  const handleMLTrainingComplete = useCallback(async (
    modelName: string,
    targetColumn: string,
    taskType: string,
    modelResults: any,
    trainingConfig: any
  ) => {
    if (userId) {
      await saveMLResults(userId, modelName, targetColumn, taskType, modelResults, trainingConfig);
    }
  }, [userId, saveMLResults]);

  // Load previous ML result
  const loadMLResult = useCallback((mlResult: any) => {
    setAutoMLState({
      selectedTarget: mlResult.target_column,
      selectedTask: mlResult.task_type,
      isTraining: false,
      modelResults: mlResult.model_results,
      showInsights: true
    });
    
    // Switch to ML tab
    setActiveTab("ml");
    
    toast({
      title: "ML Results Loaded",
      description: `Loaded ${mlResult.model_name} model results from ${new Date(mlResult.created_at).toLocaleDateString()}`,
    });
  }, [toast]);

  // Show loading spinner while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              AI DataLab
            </h1>
            <p className="text-xl text-gray-300">
              Your Complete AI-Powered Data Analysis Platform
            </p>
          </div>
          <AuthSection onAuthSuccess={handleAuthSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <DashboardHeader onLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
              <p className="text-gray-300">
                Upload, clean, and analyze your data with AI-powered tools
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowDataSelector(!showDataSelector)}
                variant="outline"
                className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
              >
                <Database className="h-4 w-4 mr-2" />
                {showDataSelector ? 'Hide' : 'Show'} Saved Data
              </Button>
              {isSaving && (
                <div className="flex items-center gap-2 text-purple-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Saving...</span>
                </div>
              )}
              {mlResults.length > 0 && (
                <div className="flex items-center gap-2 text-green-400">
                  <History className="h-4 w-4" />
                  <span className="text-sm">{mlResults.length} saved models</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {showDataSelector && userId && (
          <div className="mb-6">
            <DataSelector
              userId={userId}
              onDataSelected={handleDataSelected}
              currentData={uploadedData}
            />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4 bg-slate-800 border-slate-700">
            <TabsTrigger 
              value="upload" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload Data</span>
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600"
              disabled={!uploadedData}
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
              {uploadedData && (
                <div className="w-2 h-2 bg-green-400 rounded-full ml-1"></div>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="cleaning" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600"
              disabled={!uploadedData}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Clean Data</span>
              {cleanedData && (
                <div className="w-2 h-2 bg-blue-400 rounded-full ml-1"></div>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="ml" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600"
              disabled={!cleanedData && !uploadedData}
            >
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AutoML</span>
              {(autoMLState.modelResults || mlResults.length > 0) && (
                <div className="w-2 h-2 bg-green-400 rounded-full ml-1"></div>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <DataUpload 
                onDataUploaded={handleDataUploaded} 
                onDataCleared={handleDataCleared}
              />
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <DataPreview data={uploadedData} />
            </Card>
          </TabsContent>

          <TabsContent value="cleaning" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <DataCleaning 
                data={uploadedData} 
                onDataCleaned={handleDataCleaned}
              />
            </Card>
          </TabsContent>

          <TabsContent value="ml" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <AutoMLSection 
                data={cleanedData || uploadedData}
                autoMLState={autoMLState}
                setAutoMLState={setAutoMLState}
                onTrainingComplete={handleMLTrainingComplete}
                mlResults={mlResults}
                onLoadMLResult={loadMLResult}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;