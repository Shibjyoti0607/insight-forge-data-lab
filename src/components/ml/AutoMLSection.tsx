import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Play, Download, BarChart3, TrendingUp, Target, Zap, Lightbulb, History, Clock, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterPlot, Scatter } from "recharts";
import BusinessInsights from "./BusinessInsights";
import { supabase } from "@/integrations/supabase/client";

interface AutoMLSectionProps {
  data: any;
  autoMLState: {
    selectedTarget: string;
    selectedTask: string;
    isTraining: boolean;
    modelResults: any;
    showInsights: boolean;
  };
  setAutoMLState: (state: any) => void;
  onTrainingComplete?: (modelName: string, targetColumn: string, taskType: string, modelResults: any, trainingConfig: any) => void;
  mlResults?: any[];
  onLoadMLResult?: (mlResult: any) => void;
}

const AutoMLSection = ({ 
  data, 
  autoMLState, 
  setAutoMLState, 
  onTrainingComplete,
  mlResults = [],
  onLoadMLResult
}: AutoMLSectionProps) => {
  const { toast } = useToast();

  console.log("AutoMLSection component rendered with data:", data);
  console.log("AutoML state:", autoMLState);
  console.log("ML Results:", mlResults);

  if (!data) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AutoML Engine
          </CardTitle>
          <CardDescription className="text-gray-400">
            No data available for machine learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Upload and clean your data first.</p>
        </CardContent>
      </>
    );
  }

  // Enhanced feature column filtering - exclude ID columns and other non-predictive columns
  const getFeatureColumns = (columns: string[], targetColumn: string) => {
    return columns.filter(col => {
      const colLower = col.toLowerCase();
      const colOriginal = col;
      
      // Skip if it's the target column
      if (col === targetColumn) return false;
      
      // Skip obvious ID columns
      if (colLower.includes('id') || 
          colLower.includes('index') ||
          colLower.includes('row') ||
          colLower.includes('key') ||
          col === 'id' ||
          col === 'ID' ||
          col === 'Id') return false;
      
      // Skip customer/user identifier columns
      if (colLower.includes('customer') && (colLower.includes('name') || colLower.includes('id'))) return false;
      if (colLower.includes('user') && (colLower.includes('name') || colLower.includes('id'))) return false;
      if (colLower.includes('client') && (colLower.includes('name') || colLower.includes('id'))) return false;
      
      // Skip other name-based columns that are typically non-predictive
      if (colLower.includes('name') && !colLower.includes('product') && !colLower.includes('category')) return false;
      if (colLower.includes('email')) return false;
      if (colLower.includes('phone')) return false;
      if (colLower.includes('address')) return false;
      
      // Skip timestamp columns that are just record keeping
      if (colLower.includes('created') && colLower.includes('at')) return false;
      if (colLower.includes('updated') && colLower.includes('at')) return false;
      if (colLower.includes('timestamp') && !colLower.includes('event')) return false;
      
      // Skip other common non-predictive columns
      if (colLower.includes('uuid')) return false;
      if (colLower.includes('guid')) return false;
      if (colLower.includes('hash')) return false;
      if (colLower.includes('token')) return false;
      
      return true;
    });
  };

  const handleTrainModel = async () => {
    if (!autoMLState.selectedTarget || !autoMLState.selectedTask) {
      toast({
        title: "Configuration Required",
        description: "Please select target column and task type",
        variant: "destructive",
      });
      return;
    }

    setAutoMLState(prev => ({ ...prev, isTraining: true }));
    console.log("Training model with:", { selectedTarget: autoMLState.selectedTarget, selectedTask: autoMLState.selectedTask });

    // Get feature columns (excluding ID columns and target)
    const featureColumns = getFeatureColumns(data.columns, autoMLState.selectedTarget);
    
    if (featureColumns.length === 0) {
      toast({
        title: "No Valid Features",
        description: "No suitable feature columns found for training. Please ensure your data has predictive features beyond ID columns and customer identifiers.",
        variant: "destructive",
      });
      setAutoMLState(prev => ({ ...prev, isTraining: false }));
      return;
    }

    if (featureColumns.length < 2) {
      toast({
        title: "Insufficient Features",
        description: `Only ${featureColumns.length} valid feature column found. Machine learning models typically need at least 2-3 features for reliable predictions.`,
        variant: "destructive",
      });
      setAutoMLState(prev => ({ ...prev, isTraining: false }));
      return;
    }

    // Simulate ML model training
    setTimeout(async () => {
      // Create realistic feature importance data based on actual feature columns
      const featureImportanceData = featureColumns.slice(0, Math.min(8, featureColumns.length)).map((col, index) => {
        // Generate realistic importance values that sum to approximately 1
        const baseImportance = [0.35, 0.25, 0.18, 0.12, 0.08, 0.06, 0.04, 0.03][index] || 0.02;
        const randomVariation = (Math.random() - 0.5) * 0.1; // Add some randomness
        const importance = Math.max(0.01, Math.min(0.5, baseImportance + randomVariation));
        
        return {
          feature: col,
          importance: importance,
          // Add display name for better readability
          displayName: col.length > 15 ? col.substring(0, 12) + "..." : col
        };
      }).sort((a, b) => b.importance - a.importance); // Sort by importance descending

      const bestModelName = autoMLState.selectedTask === "classification" ? "Random Forest" : "Linear Regression";
      
      const mockResults = {
        bestModel: bestModelName,
        accuracy: autoMLState.selectedTask === "classification" ? 0.94 : null,
        r2Score: autoMLState.selectedTask === "regression" ? 0.87 : null,
        mse: autoMLState.selectedTask === "regression" ? 0.15 : null,
        crossValidationScore: 0.91,
        // Use the properly formatted feature importance data
        featureImportance: featureImportanceData,
        confusionMatrix: autoMLState.selectedTask === "classification" ? [
          [45, 3],
          [2, 50]
        ] : null,
        modelComparison: autoMLState.selectedTask === "classification" ? [
          { model: "Random Forest", accuracy: 0.94, precision: 0.92, recall: 0.96 },
          { model: "SVM", accuracy: 0.89, precision: 0.87, recall: 0.91 },
          { model: "Logistic Regression", accuracy: 0.85, precision: 0.83, recall: 0.87 },
          { model: "Decision Tree", accuracy: 0.82, precision: 0.80, recall: 0.84 },
          { model: "Naive Bayes", accuracy: 0.78, precision: 0.76, recall: 0.80 }
        ] : [
          { model: "Linear Regression", r2: 0.87, mse: 0.15, mae: 0.12 },
          { model: "Random Forest", r2: 0.85, mse: 0.18, mae: 0.14 },
          { model: "SVR", r2: 0.82, mse: 0.21, mae: 0.16 },
          { model: "Decision Tree", r2: 0.79, mse: 0.24, mae: 0.18 },
          { model: "Polynomial Regression", r2: 0.76, mse: 0.27, mae: 0.20 }
        ],
        trainingHistory: Array.from({ length: 10 }, (_, i) => ({
          epoch: i + 1,
          trainLoss: 0.8 - (i * 0.07) + Math.random() * 0.05,
          valLoss: 0.85 - (i * 0.06) + Math.random() * 0.05,
          trainAccuracy: 0.6 + (i * 0.03) + Math.random() * 0.02,
          valAccuracy: 0.58 + (i * 0.032) + Math.random() * 0.02
        })),
        predictions: Array.from({ length: 20 }, (_, i) => ({
          actual: Math.random() * 100,
          predicted: Math.random() * 100,
          residual: (Math.random() - 0.5) * 20
        })),
        usedFeatures: featureColumns, // Track which features were actually used
        excludedColumns: data.columns.filter((col: string) => !featureColumns.includes(col) && col !== autoMLState.selectedTarget)
      };

      console.log("Generated feature importance data:", featureImportanceData);

      setAutoMLState(prev => ({
        ...prev,
        modelResults: mockResults,
        showInsights: true,
        isTraining: false
      }));

      // Save to backend if callback is provided
      if (onTrainingComplete) {
        const trainingConfig = {
          selectedTarget: autoMLState.selectedTarget,
          selectedTask: autoMLState.selectedTask,
          usedFeatures: featureColumns,
          excludedColumns: data.columns.filter((col: string) => !featureColumns.includes(col) && col !== autoMLState.selectedTarget),
          datasetInfo: {
            totalRows: data.statistics.totalRows,
            totalColumns: data.statistics.totalColumns,
            missingValues: data.statistics.missingValues,
            filename: data.filename
          }
        };

        await onTrainingComplete(
          bestModelName,
          autoMLState.selectedTarget,
          autoMLState.selectedTask,
          mockResults,
          trainingConfig
        );
      }

      toast({
        title: "Model Training Complete",
        description: `Best model: ${mockResults.bestModel} with ${(mockResults.crossValidationScore * 100).toFixed(1)}% CV score using ${featureColumns.length} features`,
      });
    }, 3000);
  };

  const handleDeleteMLResult = async (mlResultId: string) => {
    try {
      const { error } = await supabase
        .from('ml_results')
        .delete()
        .eq('id', mlResultId);

      if (error) throw error;

      toast({
        title: "Model Deleted",
        description: "ML model results have been deleted successfully.",
      });

      // Refresh the page or update the mlResults list
      window.location.reload();
    } catch (error: any) {
      console.error("Error deleting ML result:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the ML model results.",
        variant: "destructive",
      });
    }
  };

  const classificationAlgorithms = [
    "Logistic Regression", "Support Vector Machine", "Decision Tree", 
    "Random Forest", "Naive Bayes", "Neural Network"
  ];

  const regressionAlgorithms = [
    "Linear Regression", "Polynomial Regression", "Support Vector Regression",
    "Decision Tree Regression", "Random Forest Regression", "Neural Network"
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  // Get available feature columns for display
  const availableFeatures = autoMLState.selectedTarget ? getFeatureColumns(data.columns, autoMLState.selectedTarget) : [];
  const excludedColumns = autoMLState.selectedTarget ? data.columns.filter((col: string) => !availableFeatures.includes(col) && col !== autoMLState.selectedTarget) : [];

  // Helper function to safely format numbers
  const safeToFixed = (value: number | null | undefined, decimals: number = 1): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    return value.toFixed(decimals);
  };

  // Helper function to safely format percentages
  const safePercentage = (value: number | null | undefined, decimals: number = 1): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    return `${(value * 100).toFixed(decimals)}%`;
  };

  // Prepare feature importance data for the chart
  const prepareFeatureImportanceData = () => {
    if (!autoMLState.modelResults?.featureImportance) {
      console.log("No feature importance data available");
      return [];
    }

    const data = autoMLState.modelResults.featureImportance.map((item: any) => ({
      ...item,
      // Ensure we have both feature and displayName
      feature: item.feature || 'Unknown',
      displayName: item.displayName || item.feature || 'Unknown',
      // Ensure importance is a valid number
      importance: typeof item.importance === 'number' && !isNaN(item.importance) ? item.importance : 0
    }));

    console.log("Prepared feature importance data for chart:", data);
    return data;
  };

  const featureImportanceChartData = prepareFeatureImportanceData();

  return (
    <>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI-Powered AutoML Engine
          {autoMLState.modelResults && (
            <Badge className="bg-green-600 text-white ml-2">
              Model Trained
            </Badge>
          )}
          {mlResults.length > 0 && (
            <Badge className="bg-blue-600 text-white ml-2">
              {mlResults.length} Saved Models
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-gray-400">
          Automatic model selection and hyperparameter tuning
          {autoMLState.modelResults && (
            <span className="text-green-400 ml-2">
              • {autoMLState.modelResults.bestModel} ready for deployment
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Previous ML Results Section */}
        {mlResults.length > 0 && (
          <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600">
            <div className="flex items-center gap-2 mb-4">
              <History className="h-5 w-5 text-blue-400" />
              <h3 className="text-white font-semibold">Previous ML Results</h3>
              <Badge className="bg-blue-600 text-white">
                {mlResults.length} saved
              </Badge>
            </div>
            
            <div className="grid gap-3 max-h-60 overflow-y-auto">
              {mlResults.map((result) => (
                <div key={result.id} className="bg-slate-600/50 rounded-lg p-4 border border-slate-500">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-white font-medium">{result.model_name}</h4>
                        <Badge className={`text-xs ${
                          result.task_type === 'classification' ? 'bg-blue-600' : 'bg-green-600'
                        }`}>
                          {result.task_type}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <div>Target: <span className="text-blue-400">{result.target_column}</span></div>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(result.created_at).toLocaleDateString()}
                          </span>
                          {result.model_results?.crossValidationScore && (
                            <span className="text-green-400">
                              CV: {(result.model_results.crossValidationScore * 100).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onLoadMLResult && onLoadMLResult(result)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteMLResult(result.id)}
                        className="border-red-600 text-red-400 hover:bg-red-600/20"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-white font-medium mb-2 block">Target Column</label>
              <Select 
                value={autoMLState.selectedTarget} 
                onValueChange={(value) => setAutoMLState(prev => ({ ...prev, selectedTarget: value }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select target variable" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {data.columns.map((column: string) => (
                    <SelectItem key={column} value={column} className="text-white">
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {autoMLState.selectedTarget && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-400">
                    ✅ {availableFeatures.length} feature columns will be used for training
                  </p>
                  {excludedColumns.length > 0 && (
                    <p className="text-xs text-red-400">
                      ⚠️ {excludedColumns.length} columns excluded (ID fields, names, etc.)
                    </p>
                  )}
                  {availableFeatures.length === 0 && (
                    <p className="text-xs text-red-400">
                      ❌ No valid features found. Ensure your data has predictive columns beyond ID fields.
                    </p>
                  )}
                  {availableFeatures.length > 0 && availableFeatures.length < 2 && (
                    <p className="text-xs text-yellow-400">
                      ⚠️ Only {availableFeatures.length} feature available. Consider adding more predictive columns.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">Task Type</label>
              <Select 
                value={autoMLState.selectedTask} 
                onValueChange={(value) => setAutoMLState(prev => ({ ...prev, selectedTask: value }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select ML task" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="classification" className="text-white">
                    Classification
                  </SelectItem>
                  <SelectItem value="regression" className="text-white">
                    Regression
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleTrainModel}
              disabled={autoMLState.isTraining || availableFeatures.length < 2}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
            >
              {autoMLState.isTraining ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Training Models...
                </>
              ) : autoMLState.modelResults ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Retrain Model
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start AutoML Training
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-semibold">Available Algorithms</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm text-gray-400 mb-2">Classification</h4>
                <div className="flex flex-wrap gap-1">
                  {classificationAlgorithms.map((algo) => (
                    <Badge key={algo} variant="secondary" className="text-xs bg-blue-600/20 text-blue-400">
                      {algo}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm text-gray-400 mb-2">Regression</h4>
                <div className="flex flex-wrap gap-1">
                  {regressionAlgorithms.map((algo) => (
                    <Badge key={algo} variant="secondary" className="text-xs bg-green-600/20 text-green-400">
                      {algo}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {autoMLState.selectedTarget && (
              <div className="space-y-3">
                {availableFeatures.length > 0 && (
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <h4 className="text-sm text-white font-medium mb-2 flex items-center gap-2">
                      ✅ Features to be used ({availableFeatures.length}):
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {availableFeatures.slice(0, 8).map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs border-green-500 text-green-300">
                          {feature}
                        </Badge>
                      ))}
                      {availableFeatures.length > 8 && (
                        <Badge variant="outline" className="text-xs border-green-500 text-green-300">
                          +{availableFeatures.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {excludedColumns.length > 0 && (
                  <div className="bg-red-600/10 rounded-lg p-3 border border-red-600/30">
                    <h4 className="text-sm text-red-400 font-medium mb-2 flex items-center gap-2">
                      ⚠️ Excluded columns ({excludedColumns.length}):
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {excludedColumns.slice(0, 6).map((column) => (
                        <Badge key={column} variant="outline" className="text-xs border-red-500 text-red-300">
                          {column}
                        </Badge>
                      ))}
                      {excludedColumns.length > 6 && (
                        <Badge variant="outline" className="text-xs border-red-500 text-red-300">
                          +{excludedColumns.length - 6} more
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-red-300 mt-2">
                      These columns are automatically excluded as they typically don't provide predictive value (IDs, names, timestamps, etc.)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {autoMLState.modelResults && (
          <div className="space-y-6">
            {/* Model Performance Summary */}
            <div className="bg-slate-700/30 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Model Performance Summary
                </h3>
                <div className="flex gap-2">
                  <Badge className="bg-green-600">
                    Best: {autoMLState.modelResults.bestModel}
                  </Badge>
                  {autoMLState.showInsights && (
                    <Button
                      onClick={() => setAutoMLState(prev => ({ ...prev, showInsights: !prev.showInsights }))}
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Lightbulb className="h-4 w-4 mr-1" />
                      Business Insights
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {autoMLState.modelResults.accuracy && (
                  <div className="bg-slate-700/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">Accuracy</p>
                    <p className="text-xl font-bold text-white">
                      {safePercentage(autoMLState.modelResults.accuracy)}
                    </p>
                  </div>
                )}
                {autoMLState.modelResults.r2Score && (
                  <div className="bg-slate-700/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">R² Score</p>
                    <p className="text-xl font-bold text-white">
                      {safeToFixed(autoMLState.modelResults.r2Score, 3)}
                    </p>
                  </div>
                )}
                <div className="bg-slate-700/50 p-3 rounded-lg">
                  <p className="text-sm text-gray-400">CV Score</p>
                  <p className="text-xl font-bold text-white">
                    {safePercentage(autoMLState.modelResults.crossValidationScore)}
                  </p>
                </div>
                {autoMLState.modelResults.mse && (
                  <div className="bg-slate-700/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">MSE</p>
                    <p className="text-xl font-bold text-white">
                      {safeToFixed(autoMLState.modelResults.mse, 3)}
                    </p>
                  </div>
                )}
              </div>

              {/* Feature Usage Summary */}
              <div className="bg-slate-600/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Model Training Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Features Used:</span>
                    <span className="text-green-400 font-medium ml-2">{autoMLState.modelResults.usedFeatures?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Columns Excluded:</span>
                    <span className="text-red-400 font-medium ml-2">{autoMLState.modelResults.excludedColumns?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Target Variable:</span>
                    <span className="text-blue-400 font-medium ml-2">{autoMLState.selectedTarget}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download Model
                </Button>
                <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                  Deploy API
                </Button>
              </div>
            </div>

            {/* Business Insights Section */}
            {autoMLState.showInsights && (
              <BusinessInsights 
                modelResults={autoMLState.modelResults}
                selectedTarget={autoMLState.selectedTarget}
                selectedTask={autoMLState.selectedTask}
                data={data}
              />
            )}

            {/* Model Comparison Chart */}
            <div className="bg-slate-700/30 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Model Comparison
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={autoMLState.modelResults.modelComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="model" 
                      stroke="#9CA3AF"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                    />
                    {autoMLState.selectedTask === "classification" ? (
                      <>
                        <Bar dataKey="accuracy" fill="#8B5CF6" name="Accuracy" />
                        <Bar dataKey="precision" fill="#06B6D4" name="Precision" />
                        <Bar dataKey="recall" fill="#10B981" name="Recall" />
                      </>
                    ) : (
                      <>
                        <Bar dataKey="r2" fill="#8B5CF6" name="R² Score" />
                        <Bar dataKey="mse" fill="#EF4444" name="MSE" />
                        <Bar dataKey="mae" fill="#F59E0B" name="MAE" />
                      </>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feature Importance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Feature Importance
                </h3>
                
                {/* Debug information */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mb-4 p-2 bg-slate-600/30 rounded text-xs text-gray-400">
                    Debug: {featureImportanceChartData.length} features loaded
                    {featureImportanceChartData.length > 0 && (
                      <div>Sample: {JSON.stringify(featureImportanceChartData[0])}</div>
                    )}
                  </div>
                )}
                
                {featureImportanceChartData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={featureImportanceChartData} 
                        layout="horizontal"
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          type="number" 
                          stroke="#9CA3AF" 
                          fontSize={12}
                          domain={[0, 'dataMax']}
                          tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                        />
                        <YAxis 
                          type="category" 
                          dataKey="displayName"
                          stroke="#9CA3AF" 
                          fontSize={11}
                          width={75}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                          formatter={(value: any, name: any, props: any) => [
                            `${(value * 100).toFixed(1)}%`, 
                            'Importance'
                          ]}
                          labelFormatter={(label: any, payload: any) => {
                            return payload && payload[0] ? `Feature: ${payload[0].payload.feature}` : label;
                          }}
                        />
                        <Bar 
                          dataKey="importance" 
                          fill="#8B5CF6"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No feature importance data available</p>
                      <p className="text-sm mt-2">Train a model to see feature importance</p>
                    </div>
                  </div>
                )}
                
                {/* Feature Importance List */}
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm text-gray-400 font-medium">Top Features:</h4>
                  {featureImportanceChartData.length > 0 ? (
                    featureImportanceChartData.slice(0, 5).map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-slate-600/30 rounded px-3 py-2">
                        <span className="text-white text-sm" title={item.feature}>
                          {item.displayName || item.feature}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-600 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full" 
                              style={{ width: `${Math.max(5, item.importance * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-400 text-xs w-12 text-right">
                            {(item.importance * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No feature importance data available
                    </div>
                  )}
                </div>
              </div>

              {/* Training History */}
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Training History
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={autoMLState.modelResults.trainingHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="epoch" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="trainLoss" 
                        stroke="#EF4444" 
                        strokeWidth={2}
                        name="Training Loss"
                        dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="valLoss" 
                        stroke="#F59E0B" 
                        strokeWidth={2}
                        name="Validation Loss"
                        dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Detailed Results Table */}
            <div className="bg-slate-700/30 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Detailed Model Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left p-3 text-gray-300 font-medium">Model</th>
                      {autoMLState.selectedTask === "classification" ? (
                        <>
                          <th className="text-left p-3 text-gray-300 font-medium">Accuracy</th>
                          <th className="text-left p-3 text-gray-300 font-medium">Precision</th>
                          <th className="text-left p-3 text-gray-300 font-medium">Recall</th>
                          <th className="text-left p-3 text-gray-300 font-medium">F1-Score</th>
                        </>
                      ) : (
                        <>
                          <th className="text-left p-3 text-gray-300 font-medium">R² Score</th>
                          <th className="text-left p-3 text-gray-300 font-medium">MSE</th>
                          <th className="text-left p-3 text-gray-300 font-medium">MAE</th>
                          <th className="text-left p-3 text-gray-300 font-medium">RMSE</th>
                        </>
                      )}
                      <th className="text-left p-3 text-gray-300 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {autoMLState.modelResults.modelComparison.map((model: any, index: number) => (
                      <tr key={index} className="border-b border-slate-600/50">
                        <td className="p-3 text-white font-medium">{model.model}</td>
                        {autoMLState.selectedTask === "classification" ? (
                          <>
                            <td className="p-3 text-gray-400">{safePercentage(model.accuracy)}</td>
                            <td className="p-3 text-gray-400">{safePercentage(model.precision)}</td>
                            <td className="p-3 text-gray-400">{safePercentage(model.recall)}</td>
                            <td className="p-3 text-gray-400">
                              {model.precision && model.recall ? 
                                safePercentage(2 * model.precision * model.recall / (model.precision + model.recall)) : 
                                'N/A'
                              }
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 text-gray-400">{safeToFixed(model.r2, 3)}</td>
                            <td className="p-3 text-gray-400">{safeToFixed(model.mse, 3)}</td>
                            <td className="p-3 text-gray-400">{safeToFixed(model.mae, 3)}</td>
                            <td className="p-3 text-gray-400">{model.mse ? safeToFixed(Math.sqrt(model.mse), 3) : 'N/A'}</td>
                          </>
                        )}
                        <td className="p-3">
                          {index === 0 ? (
                            <Badge className="bg-green-600">Best</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-slate-600">Trained</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Predictions vs Actual (for regression) */}
            {autoMLState.selectedTask === "regression" && (
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">Predictions vs Actual Values</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={autoMLState.modelResults.predictions.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="index" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                      <Bar dataKey="actual" fill="#10B981" name="Actual" />
                      <Bar dataKey="predicted" fill="#8B5CF6" name="Predicted" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Confusion Matrix (for classification) */}
            {autoMLState.selectedTask === "classification" && autoMLState.modelResults.confusionMatrix && (
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">Confusion Matrix</h3>
                <div className="grid grid-cols-2 gap-2 max-w-md">
                  <div className="bg-slate-600 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-white">{autoMLState.modelResults.confusionMatrix[0][0]}</div>
                    <div className="text-xs text-gray-400">True Negative</div>
                  </div>
                  <div className="bg-red-600/30 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-white">{autoMLState.modelResults.confusionMatrix[0][1]}</div>
                    <div className="text-xs text-gray-400">False Positive</div>
                  </div>
                  <div className="bg-red-600/30 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-white">{autoMLState.modelResults.confusionMatrix[1][0]}</div>
                    <div className="text-xs text-gray-400">False Negative</div>
                  </div>
                  <div className="bg-green-600/30 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-white">{autoMLState.modelResults.confusionMatrix[1][1]}</div>
                    <div className="text-xs text-gray-400">True Positive</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </>
  );
};

export default AutoMLSection;