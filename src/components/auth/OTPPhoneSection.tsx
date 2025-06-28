
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Smartphone, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OTPPhoneSectionProps {
  onAuthSuccess: () => void;
}

const OTPPhoneSection = ({ onAuthSuccess }: OTPPhoneSectionProps) => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setIsLoading(true);
    console.log("Sending OTP to phone:", phone);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
      });

      if (error) throw error;

      toast({
        title: "OTP Sent",
        description: "Check your phone for the verification code",
      });
      
      setStep("verify");
      startCountdown();
    } catch (error: any) {
      console.error("OTP send error:", error);
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsLoading(true);
    console.log("Verifying OTP:", otp);

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms'
      });

      if (error) throw error;

      toast({
        title: "Phone Verified",
        description: "Welcome to AI DataLab!",
      });
      onAuthSuccess();
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast({
        title: "Invalid OTP",
        description: error.message || "Please check your code and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
      });

      if (error) throw error;

      toast({
        title: "OTP Resent",
        description: "A new code has been sent to your phone",
      });
      startCountdown();
    } catch (error: any) {
      toast({
        title: "Failed to resend OTP",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <Smartphone className="h-8 w-8 mx-auto text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Verify Phone Number</h3>
          <p className="text-sm text-gray-400">
            Enter the 6-digit code sent to {phone}
          </p>
        </div>

        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Verification Code</Label>
            <div className="flex justify-center">
              <InputOTP 
                value={otp} 
                onChange={setOtp}
                maxLength={6}
                className="gap-2"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="bg-slate-700 border-slate-600 text-white" />
                  <InputOTPSlot index={1} className="bg-slate-700 border-slate-600 text-white" />
                  <InputOTPSlot index={2} className="bg-slate-700 border-slate-600 text-white" />
                  <InputOTPSlot index={3} className="bg-slate-700 border-slate-600 text-white" />
                  <InputOTPSlot index={4} className="bg-slate-700 border-slate-600 text-white" />
                  <InputOTPSlot index={5} className="bg-slate-700 border-slate-600 text-white" />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </Button>

          <div className="text-center space-y-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleResendOTP}
              disabled={countdown > 0 || isLoading}
              className="text-gray-400 hover:text-white"
            >
              {countdown > 0 ? (
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Resend in {countdown}s
                </span>
              ) : (
                "Resend Code"
              )}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep("phone")}
              className="text-gray-400 hover:text-white"
            >
              Change Phone Number
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSendOTP} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
          required
        />
        <p className="text-xs text-gray-400">
          Include country code (e.g., +1 for US)
        </p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        disabled={isLoading || !phone.trim()}
      >
        {isLoading ? "Sending..." : "Send OTP"}
      </Button>
    </form>
  );
};

export default OTPPhoneSection;
