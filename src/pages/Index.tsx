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
import { Database, Upload, Settings, Brain, BarChart3, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);
  const [cleanedData, setCleanedData] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
  console.log("Uploaded data:", uploadedData ? "Present" : "None");
  console.log("AutoML state:", autoMLState);

  // Fetch user data from Supabase
  const fetchUserData = useCallback(async (userIdToFetch: string) => {
    if (!userIdToFetch) return;

    try {
      console.log("Fetching user data for:", userIdToFetch);
      const { data, error } = await supabase
        .from('user_data')
        .select('uploaded_data, cleaned_data')
        .eq('id', userIdToFetch)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found - this is normal for new users
          console.log("No existing data found for user");
          return;
        }
        throw error;
      }

      if (data) {
        console.log("User data fetched successfully");
        if (data.uploaded_data) {
          setUploadedData(data.uploaded_data as any);
          console.log("Restored uploaded data");
        }
        if (data.cleaned_data) {
          setCleanedData(data.cleaned_data as any);
          console.log("Restored cleaned data");
        }
        
        // If we have data, switch to preview tab
        if (data.uploaded_data) {
          setActiveTab("preview");
        }
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

  // Save user data to Supabase
  const saveUserData = useCallback(async (userIdToSave: string, uploadedDataToSave: any, cleanedDataToSave: any) => {
    if (!userIdToSave) return;

    try {
      setIsSaving(true);
      console.log("Saving user data for:", userIdToSave);
      
      const { error } = await supabase
        .from('user_data')
        .upsert({
          id: userIdToSave,
          uploaded_data: uploadedDataToSave,
          cleaned_data: cleanedDataToSave,
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      console.log("User data saved successfully");
    } catch (error: any) {
      console.error("Error saving user data:", error);
      toast({
        title: "Save Error",
        description: "Failed to save your data. Your work may be lost if you refresh the page.",
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
  }, [fetchUserData]);

  // Save data whenever uploadedData or cleanedData changes
  useEffect(() => {
    if (userId && (uploadedData || cleanedData)) {
      // Debounce the save operation to avoid too many requests
      const timeoutId = setTimeout(() => {
        saveUserData(userId, uploadedData, cleanedData);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [userId, uploadedData, cleanedData, saveUserData]);

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
            {isSaving && (
              <div className="flex items-center gap-2 text-purple-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Saving...</span>
              </div>
            )}
          </div>
        </div>

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
              {autoMLState.modelResults && (
                <div className="w-2 h-2 bg-green-400 rounded-full ml-1"></div>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <DataUpload onDataUploaded={setUploadedData} />
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
                onDataCleaned={setCleanedData}
              />
            </Card>
          </TabsContent>

          <TabsContent value="ml" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <AutoMLSection 
                data={cleanedData || uploadedData}
                autoMLState={autoMLState}
                setAutoMLState={setAutoMLState}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;