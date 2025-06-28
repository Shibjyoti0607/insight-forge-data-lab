
import { useState, useEffect } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataCleaningProps {
  data: any;
  onDataCleaned: (cleanedData: any) => void;
}

const DataCleaning = ({ data, onDataCleaned }: DataCleaningProps) => {
  const [workingData, setWorkingData] = useState(data);
  const [selectedOperation, setSelectedOperation] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  console.log("DataCleaning component rendered with data:", data);

  useEffect(() => {
    setWorkingData(data);
  }, [data]);

  if (!data) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Data Cleaning
          </CardTitle>
          <CardDescription className="text-gray-400">
            No data available for cleaning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Upload and preview data first.</p>
        </CardContent>
      </>
    );
  }

  const handleCleaningOperation = async (operation: string) => {
    setIsProcessing(true);
    console.log("Applying cleaning operation:", operation);

    // Simulate data cleaning operations
    setTimeout(() => {
      let updatedData = { ...workingData };
      
      switch (operation) {
        case "remove-empty":
          updatedData.statistics.totalRows -= 1;
          toast({
            title: "Removed Empty Rows",
            description: "1 row with missing values removed",
          });
          break;
        case "fill-mean":
          toast({
            title: "Filled Missing Values",
            description: "Numeric columns filled with mean values",
          });
          break;
        case "fill-median":
          toast({
            title: "Filled Missing Values", 
            description: "Numeric columns filled with median values",
          });
          break;
        case "fill-mode":
          toast({
            title: "Filled Missing Values",
            description: "Categorical columns filled with mode values",
          });
          break;
        case "encode-categorical":
          toast({
            title: "Encoded Categorical Data",
            description: "Applied one-hot encoding to categorical columns",
          });
          break;
      }

      setWorkingData(updatedData);
      onDataCleaned(updatedData);
      setIsProcessing(false);
    }, 1500);
  };

  const exportData = (format: string) => {
    console.log("Exporting data in format:", format);
    toast({
      title: "Export Started",
      description: `Downloading cleaned data as ${format.toUpperCase()}`,
    });
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Data Cleaning & Preprocessing
        </CardTitle>
        <CardDescription className="text-gray-400">
          Clean and prepare your data for analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Quick Operations</h3>
            <div className="space-y-3">
              <Button
                onClick={() => handleCleaningOperation("remove-empty")}
                disabled={isProcessing}
                className="w-full justify-start bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Empty Rows
              </Button>
              <Button
                onClick={() => handleCleaningOperation("fill-mean")}
                disabled={isProcessing}
                className="w-full justify-start bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30"
              >
                Fill Missing (Mean)
              </Button>
              <Button
                onClick={() => handleCleaningOperation("fill-median")}
                disabled={isProcessing}
                className="w-full justify-start bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30"
              >
                Fill Missing (Median)
              </Button>
              <Button
                onClick={() => handleCleaningOperation("fill-mode")}
                disabled={isProcessing}
                className="w-full justify-start bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-600/30"
              >
                Fill Missing (Mode)
              </Button>
              <Button
                onClick={() => handleCleaningOperation("encode-categorical")}
                disabled={isProcessing}
                className="w-full justify-start bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-600/30"
              >
                Encode Categorical Data
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-semibold">Data Summary</h3>
            <div className="bg-slate-700/30 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Rows:</span>
                <span className="text-white font-medium">{workingData.statistics.totalRows}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Columns:</span>
                <span className="text-white font-medium">{workingData.statistics.totalColumns}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Missing Values:</span>
                <span className="text-white font-medium">{workingData.statistics.missingValues}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-white font-medium">Export Cleaned Data</h4>
              <div className="flex gap-2">
                <Button
                  onClick={() => exportData("csv")}
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button
                  onClick={() => exportData("json")}
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  JSON
                </Button>
              </div>
            </div>
          </div>
        </div>

        {isProcessing && (
          <div className="text-center py-4">
            <div className="animate-spin mx-auto w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mb-2"></div>
            <p className="text-gray-400">Processing data...</p>
          </div>
        )}
      </CardContent>
    </>
  );
};

export default DataCleaning;
