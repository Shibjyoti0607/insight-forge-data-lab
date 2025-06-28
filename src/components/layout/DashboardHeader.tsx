
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BarChart3, User } from "lucide-react";

interface DashboardHeaderProps {
  onLogout: () => void;
}

const DashboardHeader = ({ onLogout }: DashboardHeaderProps) => {
  return (
    <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI DataLab</h1>
              <p className="text-sm text-gray-400">Data Analysis Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Avatar className="bg-purple-600">
              <AvatarFallback className="bg-purple-600 text-white">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="outline" 
              onClick={onLogout}
              className="border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
