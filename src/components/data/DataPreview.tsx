
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, BarChart3 } from "lucide-react";

interface DataPreviewProps {
  data: any;
}

const DataPreview = ({ data }: DataPreviewProps) => {
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

  return (
    <>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Preview
        </CardTitle>
        <CardDescription className="text-gray-400">
          {data.filename} • {data.statistics.totalRows} rows × {data.statistics.totalColumns} columns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
                className="bg-slate-700 text-gray-300"
              >
                {column}: {type as string}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Data Sample</h3>
          <div className="bg-slate-700/30 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    {data.columns.map((column: string, index: number) => (
                      <th key={index} className="text-left p-3 text-gray-300 font-medium">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.slice(0, 5).map((row: any[], rowIndex: number) => (
                    <tr key={rowIndex} className="border-b border-slate-600/50">
                      {row.map((cell: any, cellIndex: number) => (
                        <td key={cellIndex} className="p-3 text-gray-400">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
};

export default DataPreview;
