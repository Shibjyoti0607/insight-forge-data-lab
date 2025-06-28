import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthSectionProps {
  onAuthSuccess: () => void;
}

const AuthSection = ({ onAuthSuccess }: AuthSectionProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const { toast } = useToast();

  console.log("AuthSection rendered");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    console.log("Email login attempted:", email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle specific authentication errors with more detailed logging
        console.log("Authentication error handled:", error.message);
        
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Login Failed",
            description: "The email or password you entered is incorrect. Please check your credentials or create a new account if you haven't signed up yet.",
            variant: "destructive",
          });
          // Suggest switching to sign up mode
          setShowSignUp(true);
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email Not Verified",
            description: "Please check your email and click the verification link before signing in.",
            variant: "destructive",
          });
        } else if (error.message.includes('Too many requests')) {
          toast({
            title: "Too Many Attempts",
            description: "Please wait a moment before trying again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: error.message || "Please check your credentials and try again.",
            variant: "destructive",
          });
        }
        return;
      }

      // Successful login
      console.log("Login successful for user:", data.user?.email);
      toast({
        title: "Login Successful",
        description: "Welcome to AI DataLab!",
      });
      onAuthSuccess();
    } catch (error: any) {
      // This catch block handles unexpected errors
      console.error("Unexpected login error:", error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log("Sign up attempted:", email);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.log("Sign up error handled:", error.message);
        
        if (error.message.includes('User already registered')) {
          toast({
            title: "Account Already Exists",
            description: "An account with this email already exists. Please try signing in instead.",
            variant: "destructive",
          });
          setShowSignUp(false);
        } else if (error.message.includes('Password should be at least')) {
          toast({
            title: "Password Requirements",
            description: "Password must meet the minimum requirements. Please try a stronger password.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign Up Failed",
            description: error.message || "Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      // Successful signup
      console.log("Sign up successful for user:", data.user?.email);
      toast({
        title: "Account Created Successfully",
        description: "Please check your email and click the verification link to complete your registration, then return here to sign in.",
      });
      
      // Switch back to sign in mode after successful signup
      setShowSignUp(false);
    } catch (error: any) {
      // This catch block handles unexpected errors
      console.error("Unexpected sign up error:", error);
      toast({
        title: "Sign Up Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">
            {showSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {showSignUp 
              ? "Sign up to start using AI-powered data analysis tools"
              : "Sign in to access your AI-powered data analysis tools"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                required
              />
              {showSignUp && (
                <p className="text-xs text-gray-400">Password must be at least 6 characters long</p>
              )}
            </div>

            {!showSignUp ? (
              <>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Don't have an account?</p>
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full border-slate-600 text-gray-300 hover:bg-slate-700"
                    onClick={() => setShowSignUp(true)}
                    disabled={isLoading}
                  >
                    Create New Account
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button 
                  type="button"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  onClick={handleSignUp}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Already have an account?</p>
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full border-slate-600 text-gray-300 hover:bg-slate-700"
                    onClick={() => setShowSignUp(false)}
                    disabled={isLoading}
                  >
                    Sign In Instead
                  </Button>
                </div>
              </>
            )}
          </form>

          {/* Help text */}
          <div className="mt-6 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-300">
                <p className="font-medium mb-1">First time here?</p>
                <p>Create an account and check your email for a verification link. You'll need to verify your email before you can sign in.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthSection;