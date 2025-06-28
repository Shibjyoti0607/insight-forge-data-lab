import { useState, useRef } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Image, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface DataUploadProps {
  onDataUploaded: (data: any) => void;
}

const DataUpload = ({ onDataUploaded }: DataUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  console.log("DataUpload component rendered");

  const detectDataTypes = (rows: any[]): Record<string, string> => {
    if (!rows || rows.length === 0) return {};
    
    const columns = Object.keys(rows[0]);
    const dataTypes: Record<string, string> = {};
    
    columns.forEach(column => {
      const sampleValues = rows.slice(0, 10).map(row => row[column]).filter(val => val !== null && val !== undefined && val !== "");
      
      if (sampleValues.length === 0) {
        dataTypes[column] = "unknown";
        return;
      }
      
      const isAllNumbers = sampleValues.every(val => !isNaN(Number(val)) && val !== "");
      const isAllDates = sampleValues.every(val => !isNaN(Date.parse(val)));
      
      if (isAllNumbers) {
        dataTypes[column] = "number";
      } else if (isAllDates) {
        dataTypes[column] = "date";
      } else {
        dataTypes[column] = "string";
      }
    });
    
    return dataTypes;
  };

  const calculateStatistics = (rows: any[]) => {
    if (!rows || rows.length === 0) {
      return {
        totalRows: 0,
        totalColumns: 0,
        missingValues: 0,
        dataTypes: {}
      };
    }

    const columns = Object.keys(rows[0]);
    let missingValues = 0;
    
    rows.forEach(row => {
      columns.forEach(column => {
        if (row[column] === null || row[column] === undefined || row[column] === "") {
          missingValues++;
        }
      });
    });

    return {
      totalRows: rows.length,
      totalColumns: columns.length,
      missingValues,
      dataTypes: detectDataTypes(rows)
    };
  };

  const parseCSVFile = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error("CSV parsing errors:", results.errors);
          }
          
          const rows = results.data as any[];
          const columns = results.meta.fields || [];
          const statistics = calculateStatistics(rows);
          
          const parsedData = {
            filename: file.name,
            type: file.type,
            size: file.size,
            columns,
            rows,
            statistics
          };
          
          resolve(parsedData);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  const parseExcelFile = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            reject(new Error("Empty Excel file"));
            return;
          }
          
          // Extract headers and rows
          const headers = jsonData[0] as string[];
          const dataRows = jsonData.slice(1).map(row => {
            const rowObj: any = {};
            headers.forEach((header, index) => {
              rowObj[header] = (row as any[])[index] || "";
            });
            return rowObj;
          });
          
          const statistics = calculateStatistics(dataRows);
          
          const parsedData = {
            filename: file.name,
            type: file.type,
            size: file.size,
            columns: headers,
            rows: dataRows,
            statistics
          };
          
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error("Failed to read Excel file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const parseTextFile = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const lines = content.split('\n').filter(line => line.trim() !== '');
          
          if (lines.length === 0) {
            reject(new Error("Empty text file"));
            return;
          }
          
          // Try to detect delimiter
          const firstLine = lines[0];
          let delimiter = ',';
          if (firstLine.includes('\t')) delimiter = '\t';
          else if (firstLine.includes(';')) delimiter = ';';
          else if (firstLine.includes('|')) delimiter = '|';
          
          const headers = firstLine.split(delimiter).map(h => h.trim());
          const dataRows = lines.slice(1).map(line => {
            const values = line.split(delimiter);
            const rowObj: any = {};
            headers.forEach((header, index) => {
              rowObj[header] = values[index]?.trim() || "";
            });
            return rowObj;
          });
          
          const statistics = calculateStatistics(dataRows);
          
          const parsedData = {
            filename: file.name,
            type: file.type,
            size: file.size,
            columns: headers,
            rows: dataRows,
            statistics
          };
          
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error("Failed to read text file"));
      reader.readAsText(file);
    });
  };

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    console.log("Processing file:", file.name, file.type, file.size);
    setIsProcessing(true);

    try {
      let parsedData;
      
      // Determine file type and parse accordingly
      if (file.type === "text/csv" || file.name.toLowerCase().endsWith('.csv')) {
        parsedData = await parseCSVFile(file);
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.name.toLowerCase().endsWith('.xlsx') ||
        file.name.toLowerCase().endsWith('.xls')
      ) {
        parsedData = await parseExcelFile(file);
      } else if (
        file.type === "text/plain" ||
        file.name.toLowerCase().endsWith('.txt') ||
        file.name.toLowerCase().endsWith('.tsv')
      ) {
        parsedData = await parseTextFile(file);
      } else {
        throw new Error(`Unsupported file type: ${file.type || 'unknown'}`);
      }

      onDataUploaded(parsedData);
      toast({
        title: "File Uploaded Successfully",
        description: `Processed ${file.name} with ${parsedData.statistics.totalRows} rows and ${parsedData.statistics.totalColumns} columns`,
      });
    } catch (error: any) {
      console.error("File processing error:", error);
      toast({
        title: "File Processing Failed",
        description: error.message || "Failed to process the uploaded file. Please check the file format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
          Upload CSV, Excel files, or text files with tabular data
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
                  Supports CSV, Excel (XLSX/XLS), and Text files
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
          accept=".csv,.xlsx,.xls,.txt,.tsv"
          onChange={handleFileInput}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">CSV Files</h3>
            <p className="text-sm text-gray-400">Comma-separated values with automatic delimiter detection</p>
          </div>
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Excel Files</h3>
            <p className="text-sm text-gray-400">XLSX and XLS spreadsheet files (first sheet only)</p>
          </div>
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Text Files</h3>
            <p className="text-sm text-gray-400">Tab-separated, pipe-delimited, or other structured text</p>
          </div>
        </div>
      </CardContent>
    </>
  );
};

export default DataUpload;