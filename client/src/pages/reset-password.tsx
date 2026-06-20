import { useEffect, useState } from "react";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import sfgmLogoBlue from "@/assets/sfgm-logo-new-blue.png";

export default function ResetPassword() {
  const { toast } = useToast();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get("token") || "";
    setToken(resetToken);

    if (!resetToken) {
      setIsValidating(false);
      setIsValid(false);
      setValidationMessage("Missing reset link. Request a new password reset from the login page.");
      return;
    }

    fetch(`/api/auth/reset-password/validate?token=${encodeURIComponent(resetToken)}`, {
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.valid) {
          setIsValid(false);
          setValidationMessage(data.message || "This reset link is invalid or has expired.");
          return;
        }
        setIsValid(true);
      })
      .catch(() => {
        setIsValid(false);
        setValidationMessage("Unable to validate reset link. Please try again.");
      })
      .finally(() => setIsValidating(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure both password fields match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to reset password");
      }

      setCompleted(true);
      toast({
        title: "Password updated",
        description: data.message || "You can sign in with your new password.",
      });
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 relative overflow-hidden">
      <Navigation />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-lg mx-auto border border-white/20">
            <img src={sfgmLogoBlue} alt="SFGM Logo" className="h-20 w-20 object-contain mx-auto mb-4" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Choose a New Password
            </h1>
            <p className="text-gray-600">Create a new password for your SFGM Boston Bible School account.</p>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardHeader className="text-white p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
              <CardTitle className="text-xl text-center font-bold">Set new password</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {isValidating ? (
                <p className="text-center text-gray-600">Checking your reset link…</p>
              ) : completed ? (
                <div className="space-y-6">
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                      Your password has been updated. You can sign in now.
                    </AlertDescription>
                  </Alert>
                  <Button asChild className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600">
                    <Link href="/login">Go to Sign In</Link>
                  </Button>
                </div>
              ) : !isValid ? (
                <div className="space-y-6">
                  <Alert variant="destructive">
                    <AlertDescription>{validationMessage}</AlertDescription>
                  </Alert>
                  <Button asChild className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600">
                    <Link href="/forgot-password">Request a new reset link</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-semibold text-sm">
                      New password *
                    </Label>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold text-sm">
                      Confirm new password *
                    </Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showPassword ? "Hide passwords" : "Show passwords"}
                  </button>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold"
                  >
                    {isLoading ? "Saving…" : "Update password"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
