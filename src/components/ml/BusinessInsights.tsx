import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Target, DollarSign, Users, BarChart3, ArrowRight, Star } from "lucide-react";

interface BusinessInsightsProps {
  modelResults: any;
  selectedTarget: string;
  selectedTask: string;
  data: any;
}

const BusinessInsights = ({ modelResults, selectedTarget, selectedTask, data }: BusinessInsightsProps) => {
  if (!modelResults) return null;

  // Generate insights based on feature importance and model performance
  const generateInsights = () => {
    const topFeatures = modelResults.featureImportance.slice(0, 3);
    const modelAccuracy = selectedTask === "classification" ? modelResults.accuracy : modelResults.r2Score;
    
    const insights = [
      {
        type: "critical",
        icon: <AlertTriangle className="h-5 w-5" />,
        title: "Key Performance Drivers",
        description: `${topFeatures[0]?.feature} is your strongest predictor (${(topFeatures[0]?.importance * 100).toFixed(1)}% importance). Focus on optimizing this factor.`,
        impact: "High",
        actionable: true
      },
      {
        type: "opportunity",
        icon: <TrendingUp className="h-5 w-5" />,
        title: "Model Performance Analysis",
        description: `Your model achieves ${(modelAccuracy * 100).toFixed(1)}% accuracy. ${modelAccuracy > 0.9 ? "Excellent performance!" : modelAccuracy > 0.8 ? "Good performance with room for improvement." : "Consider collecting more data or feature engineering."}`,
        impact: modelAccuracy > 0.9 ? "Low" : modelAccuracy > 0.8 ? "Medium" : "High",
        actionable: modelAccuracy < 0.9
      },
      {
        type: "success",
        icon: <CheckCircle className="h-5 w-5" />,
        title: "Data Quality Assessment",
        description: `Your dataset has ${data.statistics.missingValues} missing values out of ${data.statistics.totalRows * data.statistics.totalColumns} total data points (${((data.statistics.missingValues / (data.statistics.totalRows * data.statistics.totalColumns)) * 100).toFixed(1)}% missing).`,
        impact: data.statistics.missingValues / (data.statistics.totalRows * data.statistics.totalColumns) > 0.1 ? "High" : "Low",
        actionable: data.statistics.missingValues > 0
      }
    ];

    return insights;
  };

  const generateBusinessRecommendations = () => {
    const topFeature = modelResults.featureImportance[0];
    const modelAccuracy = selectedTask === "classification" ? modelResults.accuracy : modelResults.r2Score;
    
    const recommendations = [
      {
        category: "Revenue Optimization",
        icon: <DollarSign className="h-6 w-6" />,
        priority: "High",
        recommendations: [
          {
            title: `Focus on ${topFeature?.feature} Optimization`,
            description: `This factor drives ${(topFeature?.importance * 100).toFixed(1)}% of your ${selectedTarget} outcomes. Investing here could yield significant returns.`,
            estimatedImpact: "15-25% improvement",
            timeframe: "3-6 months",
            effort: "Medium"
          },
          {
            title: "Predictive Pricing Strategy",
            description: `Use the model to predict optimal ${selectedTarget} values and adjust pricing dynamically.`,
            estimatedImpact: "10-15% revenue increase",
            timeframe: "1-3 months",
            effort: "Low"
          }
        ]
      },
      {
        category: "Customer Experience",
        icon: <Users className="h-6 w-6" />,
        priority: "Medium",
        recommendations: [
          {
            title: "Personalized Customer Segmentation",
            description: `Segment customers based on the top 3 features: ${modelResults.featureImportance.slice(0, 3).map((f: any) => f.feature).join(", ")}.`,
            estimatedImpact: "20-30% engagement boost",
            timeframe: "2-4 months",
            effort: "Medium"
          },
          {
            title: "Proactive Customer Support",
            description: `Use model predictions to identify customers at risk and provide proactive support.`,
            estimatedImpact: "25% reduction in churn",
            timeframe: "1-2 months",
            effort: "Low"
          }
        ]
      },
      {
        category: "Operational Efficiency",
        icon: <BarChart3 className="h-6 w-6" />,
        priority: modelAccuracy < 0.8 ? "High" : "Low",
        recommendations: [
          {
            title: "Data Collection Enhancement",
            description: `${modelAccuracy < 0.8 ? "Improve model accuracy by collecting more data on key features." : "Maintain current data quality standards."}`,
            estimatedImpact: modelAccuracy < 0.8 ? "10-20% accuracy improvement" : "Maintain performance",
            timeframe: "Ongoing",
            effort: modelAccuracy < 0.8 ? "High" : "Low"
          },
          {
            title: "Automated Decision Making",
            description: `Implement automated decisions for ${selectedTarget} based on model predictions.`,
            estimatedImpact: "30-40% time savings",
            timeframe: "2-3 months",
            effort: "Medium"
          }
        ]
      }
    ];

    return recommendations;
  };

  const generateQuickWins = () => {
    const topFeatures = modelResults.featureImportance.slice(0, 2);
    
    return [
      {
        title: `Monitor ${topFeatures[0]?.feature} Daily`,
        description: "Set up daily tracking and alerts for your most important predictor",
        effort: "1 day",
        impact: "High"
      },
      {
        title: "A/B Test Top Features",
        description: `Run experiments on ${topFeatures[0]?.feature} and ${topFeatures[1]?.feature}`,
        effort: "1 week",
        impact: "Medium"
      },
      {
        title: "Create Executive Dashboard",
        description: "Build a real-time dashboard showing key metrics and predictions",
        effort: "3 days",
        impact: "High"
      },
      {
        title: "Train Your Team",
        description: "Educate stakeholders on interpreting and acting on model insights",
        effort: "2 days",
        impact: "Medium"
      }
    ];
  };

  const insights = generateInsights();
  const businessRecommendations = generateBusinessRecommendations();
  const quickWins = generateQuickWins();

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case "high": return "bg-red-600/20 text-red-400 border-red-600/30";
      case "medium": return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30";
      case "low": return "bg-green-600/20 text-green-400 border-green-600/30";
      default: return "bg-gray-600/20 text-gray-400 border-gray-600/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high": return "bg-red-600";
      case "medium": return "bg-yellow-600";
      case "low": return "bg-green-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <Card className="bg-slate-700/30 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            Key Business Insights
          </CardTitle>
          <CardDescription className="text-gray-400">
            AI-powered analysis of what's driving your {selectedTarget} outcomes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  insight.type === "critical" ? "bg-red-600/20" :
                  insight.type === "opportunity" ? "bg-blue-600/20" :
                  "bg-green-600/20"
                }`}>
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-white font-semibold">{insight.title}</h4>
                    <Badge className={`text-xs ${getImpactColor(insight.impact)}`}>
                      {insight.impact} Impact
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
                  {insight.actionable && (
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Take Action
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Business Recommendations */}
      <Card className="bg-slate-700/30 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-400" />
            Strategic Business Recommendations
          </CardTitle>
          <CardDescription className="text-gray-400">
            Actionable strategies to improve your business outcomes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {businessRecommendations.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-600 rounded-lg">
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{category.category}</h3>
                  <Badge className={`${getPriorityColor(category.priority)} text-white text-xs`}>
                    {category.priority} Priority
                  </Badge>
                </div>
              </div>
              
              <div className="grid gap-4 ml-11">
                {category.recommendations.map((rec, recIndex) => (
                  <div key={recIndex} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium">{rec.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">
                          {rec.effort} Effort
                        </Badge>
                        <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">
                          {rec.timeframe}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{rec.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-yellow-400 font-medium">
                          {rec.estimatedImpact}
                        </span>
                      </div>
                      <Button size="sm" variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                        Learn More
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Wins */}
      <Card className="bg-slate-700/30 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            Quick Wins (Start Today)
          </CardTitle>
          <CardDescription className="text-gray-400">
            Low-effort, high-impact actions you can implement immediately
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickWins.map((win, index) => (
              <div key={index} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{win.title}</h4>
                  <Badge className={`text-xs ${getImpactColor(win.impact)}`}>
                    {win.impact}
                  </Badge>
                </div>
                <p className="text-gray-300 text-sm mb-3">{win.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">⏱️ {win.effort}</span>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Start Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ROI Calculator */}
      <Card className="bg-slate-700/30 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            Estimated ROI Impact
          </CardTitle>
          <CardDescription className="text-gray-400">
            Projected business value from implementing these recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-600/20 rounded-lg p-4 border border-green-600/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">15-30%</div>
                <div className="text-sm text-gray-300">Revenue Increase</div>
                <div className="text-xs text-gray-400 mt-1">From optimization strategies</div>
              </div>
            </div>
            <div className="bg-blue-600/20 rounded-lg p-4 border border-blue-600/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">40-60%</div>
                <div className="text-sm text-gray-300">Time Savings</div>
                <div className="text-xs text-gray-400 mt-1">From automation</div>
              </div>
            </div>
            <div className="bg-purple-600/20 rounded-lg p-4 border border-purple-600/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">25-35%</div>
                <div className="text-sm text-gray-300">Cost Reduction</div>
                <div className="text-xs text-gray-400 mt-1">From efficiency gains</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-slate-600/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-white font-medium">Implementation Roadmap</span>
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              <div>📅 <strong>Week 1-2:</strong> Implement quick wins and set up monitoring</div>
              <div>📅 <strong>Month 1-3:</strong> Deploy automated decision systems</div>
              <div>📅 <strong>Month 3-6:</strong> Execute optimization strategies</div>
              <div>📅 <strong>Month 6+:</strong> Scale successful initiatives</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessInsights;