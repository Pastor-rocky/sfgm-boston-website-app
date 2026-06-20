import { useState } from "react";
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

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");
  const [devNote, setDevNote] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      let data: { message?: string; devResetUrl?: string; devNote?: string } = {};
      try {
        data = await response.json();
      } catch {
        throw new Error(
          response.status === 404
            ? "Password reset is not available yet. Please restart the server or try again later."
            : "Unexpected server response. Please try again.",
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to process request");
      }

      setMessage(
        data.message ||
          "If an account exists with that email, you will receive password reset instructions shortly.",
      );
      setDevResetUrl(typeof data.devResetUrl === "string" ? data.devResetUrl : "");
      setDevNote(typeof data.devNote === "string" ? data.devNote : "");
      setSubmitted(true);
    } catch (error: any) {
      toast({
        title: "Request failed",
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
              Forgot Password
            </h1>
            <p className="text-gray-600">
              Enter the email address on your student account and we&apos;ll send reset instructions.
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardHeader className="text-white p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
              <CardTitle className="text-xl text-center font-bold">Reset your password</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {submitted ? (
                <div className="space-y-6">
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">{message}</AlertDescription>
                  </Alert>
                  <p className="text-sm text-gray-600 text-center">
                    Check your inbox and spam folder. The link expires in 1 hour.
                  </p>
                  {devNote ? (
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertDescription className="text-amber-900 space-y-2">
                        <p>{devNote}</p>
                        {devResetUrl ? (
                          <a
                            href={devResetUrl}
                            className="block break-all text-blue-700 underline font-medium"
                          >
                            {devResetUrl}
                          </a>
                        ) : null}
                      </AlertDescription>
                    </Alert>
                  ) : null}
                  <Button asChild className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600">
                    <Link href="/login">Back to Sign In</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-semibold text-sm">
                      Email address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-12"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold"
                  >
                    {isLoading ? "Sending…" : "Send reset link"}
                  </Button>

                  <p className="text-center text-sm text-gray-600">
                    Remember your password?{" "}
                    <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                      Sign in
                    </Link>
                  </p>
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
