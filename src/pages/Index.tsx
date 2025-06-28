
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthSection from "@/components/auth/AuthSection";
import DataUpload from "@/components/data/DataUpload";
import DataPreview from "@/components/data/DataPreview";
import DataCleaning from "@/components/data/DataCleaning";
import AutoMLSection from "@/components/ml/AutoMLSection";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Database, Upload, Settings, Brain, BarChart3 } from "lucide-react";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);
  const [cleanedData, setCleanedData] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");

  console.log("Index component rendered");
  console.log("Is authenticated:", isAuthenticated);
  console.log("Uploaded data:", uploadedData ? "Present" : "None");

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
          <AuthSection onAuthSuccess={() => setIsAuthenticated(true)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <DashboardHeader onLogout={() => setIsAuthenticated(false)} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
          <p className="text-gray-300">
            Upload, clean, and analyze your data with AI-powered tools
          </p>
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
            </TabsTrigger>
            <TabsTrigger 
              value="cleaning" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600"
              disabled={!uploadedData}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Clean Data</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ml" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600"
              disabled={!cleanedData && !uploadedData}
            >
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AutoML</span>
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
              <AutoMLSection data={cleanedData || uploadedData} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
