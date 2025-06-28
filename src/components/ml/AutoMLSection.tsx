import { useState } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Play, Download, BarChart3, TrendingUp, Target, Zap, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterPlot, Scatter } from "recharts";
import BusinessInsights from "./BusinessInsights";

interface AutoMLSectionProps {
  data: any;
}

const AutoMLSection = ({ data }: AutoMLSectionProps) => {
  const [selectedTarget, setSelectedTarget] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [isTraining, setIsTraining] = useState(false);
  const [modelResults, setModelResults] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const { toast } = useToast();

  console.log("AutoMLSection component rendered with data:", data);

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

  const handleTrainModel = async () => {
    if (!selectedTarget || !selectedTask) {
      toast({
        title: "Configuration Required",
        description: "Please select target column and task type",
        variant: "destructive",
      });
      return;
    }

    setIsTraining(true);
    console.log("Training model with:", { selectedTarget, selectedTask });

    // Simulate ML model training
    setTimeout(() => {
      const mockResults = {
        bestModel: selectedTask === "classification" ? "Random Forest" : "Linear Regression",
        accuracy: selectedTask === "classification" ? 0.94 : null,
        r2Score: selectedTask === "regression" ? 0.87 : null,
        mse: selectedTask === "regression" ? 0.15 : null,
        crossValidationScore: 0.91,
        featureImportance: [
          { feature: data.columns.filter((col: string) => col !== selectedTarget)[0] || "Feature1", importance: 0.35 },
          { feature: data.columns.filter((col: string) => col !== selectedTarget)[1] || "Feature2", importance: 0.28 },
          { feature: data.columns.filter((col: string) => col !== selectedTarget)[2] || "Feature3", importance: 0.22 },
          { feature: data.columns.filter((col: string) => col !== selectedTarget)[3] || "Feature4", importance: 0.15 },
        ].filter(item => item.feature !== selectedTarget),
        confusionMatrix: selectedTask === "classification" ? [
          [45, 3],
          [2, 50]
        ] : null,
        modelComparison: selectedTask === "classification" ? [
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
        }))
      };

      setModelResults(mockResults);
      setShowInsights(true);
      toast({
        title: "Model Training Complete",
        description: `Best model: ${mockResults.bestModel} with ${(mockResults.crossValidationScore * 100).toFixed(1)}% CV score`,
      });
      setIsTraining(false);
    }, 3000);
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

  return (
    <>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI-Powered AutoML Engine
        </CardTitle>
        <CardDescription className="text-gray-400">
          Automatic model selection and hyperparameter tuning
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-white font-medium mb-2 block">Target Column</label>
              <Select value={selectedTarget} onValueChange={setSelectedTarget}>
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
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">Task Type</label>
              <Select value={selectedTask} onValueChange={setSelectedTask}>
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
              disabled={isTraining}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isTraining ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Training Models...
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
          </div>
        </div>

        {modelResults && (
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
                    Best: {modelResults.bestModel}
                  </Badge>
                  {showInsights && (
                    <Button
                      onClick={() => setShowInsights(!showInsights)}
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
                {modelResults.accuracy && (
                  <div className="bg-slate-700/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">Accuracy</p>
                    <p className="text-xl font-bold text-white">
                      {(modelResults.accuracy * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
                {modelResults.r2Score && (
                  <div className="bg-slate-700/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">R² Score</p>
                    <p className="text-xl font-bold text-white">
                      {modelResults.r2Score.toFixed(3)}
                    </p>
                  </div>
                )}
                <div className="bg-slate-700/50 p-3 rounded-lg">
                  <p className="text-sm text-gray-400">CV Score</p>
                  <p className="text-xl font-bold text-white">
                    {(modelResults.crossValidationScore * 100).toFixed(1)}%
                  </p>
                </div>
                {modelResults.mse && (
                  <div className="bg-slate-700/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">MSE</p>
                    <p className="text-xl font-bold text-white">
                      {modelResults.mse.toFixed(3)}
                    </p>
                  </div>
                )}
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
            {showInsights && (
              <BusinessInsights 
                modelResults={modelResults}
                selectedTarget={selectedTarget}
                selectedTask={selectedTask}
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
                  <BarChart data={modelResults.modelComparison}>
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
                    {selectedTask === "classification" ? (
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
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={modelResults.featureImportance} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                      <YAxis 
                        type="category" 
                        dataKey="feature" 
                        stroke="#9CA3AF" 
                        fontSize={12}
                        width={80}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                      <Bar dataKey="importance" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
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
                    <LineChart data={modelResults.trainingHistory}>
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
                      />
                      <Line 
                        type="monotone" 
                        dataKey="valLoss" 
                        stroke="#F59E0B" 
                        strokeWidth={2}
                        name="Validation Loss"
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
                      {selectedTask === "classification" ? (
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
                    {modelResults.modelComparison.map((model: any, index: number) => (
                      <tr key={index} className="border-b border-slate-600/50">
                        <td className="p-3 text-white font-medium">{model.model}</td>
                        {selectedTask === "classification" ? (
                          <>
                            <td className="p-3 text-gray-400">{(model.accuracy * 100).toFixed(1)}%</td>
                            <td className="p-3 text-gray-400">{(model.precision * 100).toFixed(1)}%</td>
                            <td className="p-3 text-gray-400">{(model.recall * 100).toFixed(1)}%</td>
                            <td className="p-3 text-gray-400">
                              {(2 * model.precision * model.recall / (model.precision + model.recall) * 100).toFixed(1)}%
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 text-gray-400">{model.r2.toFixed(3)}</td>
                            <td className="p-3 text-gray-400">{model.mse.toFixed(3)}</td>
                            <td className="p-3 text-gray-400">{model.mae.toFixed(3)}</td>
                            <td className="p-3 text-gray-400">{Math.sqrt(model.mse).toFixed(3)}</td>
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
            {selectedTask === "regression" && (
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">Predictions vs Actual Values</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={modelResults.predictions.slice(0, 10)}>
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
            {selectedTask === "classification" && modelResults.confusionMatrix && (
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">Confusion Matrix</h3>
                <div className="grid grid-cols-2 gap-2 max-w-md">
                  <div className="bg-slate-600 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-white">{modelResults.confusionMatrix[0][0]}</div>
                    <div className="text-xs text-gray-400">True Negative</div>
                  </div>
                  <div className="bg-red-600/30 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-white">{modelResults.confusionMatrix[0][1]}</div>
                    <div className="text-xs text-gray-400">False Positive</div>
                  </div>
                  <div className="bg-red-600/30 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-white">{modelResults.confusionMatrix[1][0]}</div>
                    <div className="text-xs text-gray-400">False Negative</div>
                  </div>
                  <div className="bg-green-600/30 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-white">{modelResults.confusionMatrix[1][1]}</div>
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