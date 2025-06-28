import { useState } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, BarChart3, Search, Filter, X } from "lucide-react";

interface DataPreviewProps {
  data: any;
}

const DataPreview = ({ data }: DataPreviewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("all");
  const [selectedDataType, setSelectedDataType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  console.log("DataPreview component rendered with data:", data);

  if (!data) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Preview
          </CardTitle>
          <CardDescription className="text-gray-400">
            No data uploaded yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Upload a file to see the preview here.</p>
        </CardContent>
      </>
    );
  }

  // Filter data based on search term and selected filters
  const filteredRows = data.rows.filter((row: any) => {
    // Data type filter - check if row has columns of the selected type
    if (selectedDataType !== "all") {
      const hasColumnOfType = data.columns.some((column: string) => 
        data.statistics.dataTypes[column] === selectedDataType && 
        row[column] !== null && 
        row[column] !== undefined && 
        row[column] !== ""
      );
      if (!hasColumnOfType) return false;
    }

    // Column filter - if a specific column is selected
    if (selectedColumn !== "all") {
      // If there's a search term, search only in the selected column
      if (searchTerm) {
        const columnValue = String(row[selectedColumn] || "").toLowerCase();
        return columnValue.includes(searchTerm.toLowerCase());
      } else {
        // If no search term, just show rows where the selected column has a value
        const columnValue = row[selectedColumn];
        return columnValue !== null && columnValue !== undefined && columnValue !== "";
      }
    }

    // Search filter - if no specific column is selected, search across all columns
    if (searchTerm) {
      return Object.values(row).some((value: any) =>
        String(value || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // If no filters are applied, show all rows
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + rowsPerPage);

  // Get unique data types
  const uniqueDataTypes = [...new Set(Object.values(data.statistics.dataTypes))];

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedColumn("all");
    setSelectedDataType("all");
    setCurrentPage(1);
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Preview
        </CardTitle>
        <CardDescription className="text-gray-400">
          {data.filename} • {filteredRows.length} of {data.statistics.totalRows} rows × {data.statistics.totalColumns} columns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-700/50 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Total Rows</p>
            <p className="text-xl font-bold text-white">{data.statistics.totalRows}</p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Columns</p>
            <p className="text-xl font-bold text-white">{data.statistics.totalColumns}</p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Missing Values</p>
            <p className="text-xl font-bold text-white">{data.statistics.missingValues}</p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-lg">
            <p className="text-sm text-gray-400">File Size</p>
            <p className="text-xl font-bold text-white">{Math.round(data.size / 1024)} KB</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-gray-400" />
            <h3 className="text-white font-semibold">Filters</h3>
            {(searchTerm || selectedColumn !== "all" || selectedDataType !== "all") && (
              <Button
                onClick={clearFilters}
                size="sm"
                variant="outline"
                className="ml-auto border-slate-600 text-gray-300 hover:bg-slate-700"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Filter */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Search Data</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={selectedColumn !== "all" ? `Search in ${selectedColumn}...` : "Search in all columns..."}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Column Filter */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Filter by Column</label>
              <Select value={selectedColumn} onValueChange={(value) => {
                setSelectedColumn(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Columns</SelectItem>
                  {data.columns.map((column: string) => (
                    <SelectItem key={column} value={column} className="text-white">
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data Type Filter */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Filter by Data Type</label>
              <Select value={selectedDataType} onValueChange={(value) => {
                setSelectedDataType(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Types</SelectItem>
                  {uniqueDataTypes.map((type: string) => (
                    <SelectItem key={type} value={type} className="text-white">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Column Types Display */}
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Column Types
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.statistics.dataTypes).map(([column, type]) => (
              <Badge 
                key={column} 
                variant="secondary" 
                className={`cursor-pointer transition-colors ${
                  selectedColumn === column 
                    ? "bg-purple-600 text-white" 
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
                onClick={() => {
                  setSelectedColumn(selectedColumn === column ? "all" : column);
                  setCurrentPage(1);
                }}
              >
                {column}: {type as string}
              </Badge>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Data Sample</h3>
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredRows.length)} of {filteredRows.length} rows
            </div>
          </div>
          
          <div className="bg-slate-700/30 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-800">
                  <tr className="border-b border-slate-600">
                    {data.columns.map((column: string, index: number) => (
                      <th 
                        key={index} 
                        className={`text-left p-3 font-medium cursor-pointer hover:bg-slate-700 transition-colors ${
                          selectedColumn === column ? "text-purple-400 bg-slate-700" : "text-gray-300"
                        }`}
                        onClick={() => {
                          setSelectedColumn(selectedColumn === column ? "all" : column);
                          setCurrentPage(1);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {column}
                          <Badge 
                            variant="outline" 
                            className="text-xs border-slate-500 text-slate-400"
                          >
                            {data.statistics.dataTypes[column]}
                          </Badge>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.length > 0 ? (
                    paginatedRows.map((row: any, rowIndex: number) => (
                      <tr key={rowIndex} className="border-b border-slate-600/50 hover:bg-slate-700/30">
                        {data.columns.map((column: string, cellIndex: number) => (
                          <td key={cellIndex} className="p-3 text-gray-400 max-w-xs truncate">
                            {row[column] !== null && row[column] !== undefined ? String(row[column]) : (
                              <span className="text-slate-500 italic">null</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={data.columns.length} className="p-8 text-center text-gray-500">
                        No data matches the current filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-gray-300 hover:bg-slate-700 disabled:opacity-50"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-gray-300 hover:bg-slate-700 disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </>
  );
};

export default DataPreview;