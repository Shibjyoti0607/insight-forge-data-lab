
import { useState } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Play, Download, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AutoMLSectionProps {
  data: any;
}

const AutoMLSection = ({ data }: AutoMLSectionProps) => {
  const [selectedTarget, setSelectedTarget] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [isTraining, setIsTraining] = useState(false);
  const [modelResults, setModelResults] = useState(null);
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
          { feature: "Age", importance: 0.35 },
          { feature: "Salary", importance: 0.28 },
          { feature: "City", importance: 0.22 },
          { feature: "Email", importance: 0.15 },
        ],
        confusionMatrix: selectedTask === "classification" ? [
          [45, 3],
          [2, 50]
        ] : null,
      };

      setModelResults(mockResults);
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
          <div className="bg-slate-700/30 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Model Results
              </h3>
              <Badge className="bg-green-600">
                Best: {modelResults.bestModel}
              </Badge>
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
        )}
      </CardContent>
    </>
  );
};

export default AutoMLSection;
