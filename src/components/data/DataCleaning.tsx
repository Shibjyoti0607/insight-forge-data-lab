
import { useState, useEffect } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Download, Trash2, Undo, Eye, EyeOff, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataChange {
  row: number;
  column: string;
  oldValue: any;
  newValue: any;
  operation: string;
}

interface DataCleaningProps {
  data: any;
  onDataCleaned: (cleanedData: any) => void;
}

const DataCleaning = ({ data, onDataCleaned }: DataCleaningProps) => {
  const [workingData, setWorkingData] = useState(data);
  const [originalData, setOriginalData] = useState(data);
  const [selectedOperation, setSelectedOperation] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<"original" | "cleaned">("cleaned");
  const [changes, setChanges] = useState<DataChange[]>([]);
  const [operationHistory, setOperationHistory] = useState<string[]>([]);
  const { toast } = useToast();

  console.log("DataCleaning component rendered with data:", data);

  useEffect(() => {
    if (data) {
      setWorkingData(data);
      setOriginalData(data.originalRows ? { ...data, rows: data.originalRows } : data);
      setChanges([]);
      setOperationHistory([]);
    }
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

  const applyChangesToData = (operation: string, operationChanges: DataChange[]) => {
    let updatedData = { ...workingData };
    let newRows = [...workingData.rows];
    
    switch (operation) {
      case "remove-empty":
        // Remove rows with missing values
        const originalRowCount = newRows.length;
        newRows = newRows.filter((row, index) => {
          const hasEmptyValues = Object.values(row).some(value => 
            value === null || value === undefined || value === ""
          );
          if (hasEmptyValues) {
            operationChanges.push({
              row: index,
              column: "all",
              oldValue: "row with empty values",
              newValue: "removed",
              operation: "remove-empty"
            });
          }
          return !hasEmptyValues;
        });
        updatedData.statistics.totalRows = newRows.length;
        updatedData.statistics.missingValues = 0;
        
        toast({
          title: "Removed Empty Rows",
          description: `${originalRowCount - newRows.length} rows with missing values removed`,
        });
        break;
        
      case "fill-mean":
      case "fill-median":
      case "fill-mode":
        // Fill missing values with statistical measures
        const columns = workingData.columns;
        
        columns.forEach(column => {
          const columnType = workingData.statistics.dataTypes[column];
          
          if (columnType === "number") {
            const values = newRows.map(row => parseFloat(row[column]))
              .filter(val => !isNaN(val));
              
            if (values.length > 0) {
              let fillValue;
              if (operation === "fill-mean") {
                fillValue = values.reduce((a, b) => a + b, 0) / values.length;
              } else if (operation === "fill-median") {
                const sorted = values.sort((a, b) => a - b);
                fillValue = sorted.length % 2 === 0 
                  ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
                  : sorted[Math.floor(sorted.length / 2)];
              } else { // mode
                const frequency: Record<number, number> = {};
                values.forEach(val => frequency[val] = (frequency[val] || 0) + 1);
                fillValue = Object.keys(frequency).reduce((a, b) => 
                  frequency[Number(a)] > frequency[Number(b)] ? a : b
                );
                fillValue = parseFloat(fillValue);
              }
              
              // Apply fill value to missing cells
              newRows.forEach((row, rowIndex) => {
                if (row[column] === null || row[column] === undefined || row[column] === "") {
                  operationChanges.push({
                    row: rowIndex,
                    column,
                    oldValue: row[column],
                    newValue: fillValue,
                    operation
                  });
                  row[column] = fillValue;
                }
              });
            }
          } else if (columnType === "string" && operation === "fill-mode") {
            // For categorical data, find mode
            const values = newRows.map(row => row[column])
              .filter(val => val !== null && val !== undefined && val !== "");
              
            if (values.length > 0) {
              const frequency: Record<string, number> = {};
              values.forEach(val => frequency[val] = (frequency[val] || 0) + 1);
              const modeValue = Object.keys(frequency).reduce((a, b) => 
                frequency[a] > frequency[b] ? a : b
              );
              
              // Apply mode value to missing cells
              newRows.forEach((row, rowIndex) => {
                if (row[column] === null || row[column] === undefined || row[column] === "") {
                  operationChanges.push({
                    row: rowIndex,
                    column,
                    oldValue: row[column],
                    newValue: modeValue,
                    operation
                  });
                  row[column] = modeValue;
                }
              });
            }
          }
        });
        
        // Recalculate missing values
        let missingCount = 0;
        newRows.forEach(row => {
          columns.forEach(column => {
            if (row[column] === null || row[column] === undefined || row[column] === "") {
              missingCount++;
            }
          });
        });
        updatedData.statistics.missingValues = missingCount;
        
        const operationType = operation === "fill-mean" ? "mean" : 
                             operation === "fill-median" ? "median" : "mode";
        toast({
          title: "Filled Missing Values",
          description: `${operationChanges.length} values filled with ${operationType}`,
        });
        break;
        
      case "encode-categorical":
        // Simple label encoding for categorical columns
        columns.forEach(column => {
          const columnType = workingData.statistics.dataTypes[column];
          if (columnType === "string") {
            const uniqueValues = [...new Set(newRows.map(row => row[column])
              .filter(val => val !== null && val !== undefined && val !== ""))];
            
            if (uniqueValues.length > 1 && uniqueValues.length < 20) { // Only encode if reasonable number of categories
              const encoding: Record<string, number> = {};
              uniqueValues.forEach((value, index) => {
                encoding[value] = index;
              });
              
              newRows.forEach((row, rowIndex) => {
                if (row[column] && encoding[row[column]] !== undefined) {
                  operationChanges.push({
                    row: rowIndex,
                    column,
                    oldValue: row[column],
                    newValue: encoding[row[column]],
                    operation: "encode-categorical"
                  });
                  row[column] = encoding[row[column]];
                }
              });
              
              // Update data type
              updatedData.statistics.dataTypes[column] = "number";
            }
          }
        });
        
        toast({
          title: "Encoded Categorical Data",
          description: `${operationChanges.length} categorical values encoded`,
        });
        break;
    }
    
    updatedData.rows = newRows;
    updatedData.isOriginal = false;
    return updatedData;
  };

  const handleCleaningOperation = async (operation: string) => {
    setIsProcessing(true);
    console.log("Applying cleaning operation:", operation);

    // Simulate processing time
    setTimeout(() => {
      const operationChanges: DataChange[] = [];
      const updatedData = applyChangesToData(operation, operationChanges);
      
      setWorkingData(updatedData);
      setChanges(prev => [...prev, ...operationChanges]);
      setOperationHistory(prev => [...prev, operation]);
      onDataCleaned(updatedData);
      setIsProcessing(false);
    }, 1500);
  };

  const revertToOriginal = () => {
    setWorkingData(originalData);
    setChanges([]);
    setOperationHistory([]);
    onDataCleaned(originalData);
    toast({
      title: "Data Reverted",
      description: "All changes have been undone. Original data restored.",
    });
  };

  const exportData = (format: string) => {
    console.log("Exporting data in format:", format);
    toast({
      title: "Export Started",
      description: `Downloading ${viewMode} data as ${format.toUpperCase()}`,
    });
  };

  const displayData = viewMode === "original" ? originalData : workingData;
  const hasChanges = changes.length > 0;

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
        {/* View Toggle and Revert Controls */}
        {hasChanges && (
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">View:</span>
                <Button
                  onClick={() => setViewMode("original")}
                  size="sm"
                  variant={viewMode === "original" ? "default" : "outline"}
                  className="h-8 px-3"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Original
                </Button>
                <Button
                  onClick={() => setViewMode("cleaned")}
                  size="sm"
                  variant={viewMode === "cleaned" ? "default" : "outline"}
                  className="h-8 px-3"
                >
                  <EyeOff className="h-3 w-3 mr-1" />
                  Cleaned
                </Button>
              </div>
              <Badge variant="secondary" className="text-xs">
                {changes.length} changes made
              </Badge>
            </div>
            <Button
              onClick={revertToOriginal}
              size="sm"
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600/20"
            >
              <Undo className="h-3 w-3 mr-1" />
              Revert All
            </Button>
          </div>
        )}

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
                <span className="text-white font-medium">{displayData.statistics.totalRows}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Columns:</span>
                <span className="text-white font-medium">{displayData.statistics.totalColumns}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Missing Values:</span>
                <span className="text-white font-medium">{displayData.statistics.missingValues}</span>
              </div>
              {hasChanges && (
                <div className="flex justify-between border-t border-slate-600 pt-2">
                  <span className="text-gray-400">Changes Made:</span>
                  <span className="text-purple-400 font-medium">{changes.length}</span>
                </div>
              )}
            </div>
            
            {/* Operation History */}
            {operationHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Operations Applied
                </h4>
                <div className="space-y-1">
                  {operationHistory.map((op, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {op.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <h4 className="text-white font-medium">Export Data</h4>
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
