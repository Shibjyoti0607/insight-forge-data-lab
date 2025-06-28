
import { useState, useRef } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Image, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataUploadProps {
  onDataUploaded: (data: any) => void;
}

const DataUpload = ({ onDataUploaded }: DataUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  console.log("DataUpload component rendered");

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    console.log("Processing file:", file.name, file.type);
    setIsProcessing(true);

    // Simulate file processing
    setTimeout(() => {
      const mockData = {
        filename: file.name,
        type: file.type,
        size: file.size,
        columns: ["Name", "Age", "Email", "City", "Salary"],
        rows: [
          ["John Doe", 28, "john@example.com", "New York", 50000],
          ["Jane Smith", 32, "jane@example.com", "Los Angeles", 65000],
          ["Bob Johnson", 45, "bob@example.com", "Chicago", 75000],
          ["Alice Brown", 29, "alice@example.com", "Houston", 55000],
          ["Charlie Wilson", 38, "charlie@example.com", "Phoenix", 68000],
        ],
        statistics: {
          totalRows: 5,
          totalColumns: 5,
          missingValues: 0,
          dataTypes: {
            "Name": "string",
            "Age": "number",
            "Email": "string", 
            "City": "string",
            "Salary": "number"
          }
        }
      };

      onDataUploaded(mockData);
      toast({
        title: "File Uploaded Successfully",
        description: `Processed ${file.name} with ${mockData.statistics.totalRows} rows`,
      });
      setIsProcessing(false);
    }, 2000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Data Import Module
        </CardTitle>
        <CardDescription className="text-gray-400">
          Upload CSV, Excel files, images with OCR, or PDF documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? "border-purple-500 bg-purple-500/10" 
              : "border-slate-600 hover:border-slate-500"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <div className="space-y-4">
              <div className="animate-spin mx-auto w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
              <p className="text-gray-300">Processing your file...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center gap-4">
                <Database className="h-8 w-8 text-blue-400" />
                <FileText className="h-8 w-8 text-green-400" />
                <Image className="h-8 w-8 text-yellow-400" />
              </div>
              <div>
                <p className="text-lg text-white mb-2">
                  Drag and drop your files here
                </p>
                <p className="text-sm text-gray-400">
                  Supports CSV, Excel, PDF, and Images (JPG, PNG)
                </p>
              </div>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Choose Files
              </Button>
            </div>
          )}
        </div>

        <Input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv,.xlsx,.xls,.pdf,.jpg,.jpeg,.png"
          onChange={handleFileInput}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Structured Data</h3>
            <p className="text-sm text-gray-400">CSV, Excel files with automatic column detection</p>
          </div>
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">OCR Processing</h3>
            <p className="text-sm text-gray-400">Extract tables from images using AI vision</p>
          </div>
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">PDF Parsing</h3>
            <p className="text-sm text-gray-400">Smart extraction of tabular data from PDFs</p>
          </div>
        </div>
      </CardContent>
    </>
  );
};

export default DataUpload;
