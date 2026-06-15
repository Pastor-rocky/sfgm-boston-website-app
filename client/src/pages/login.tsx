import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import sfgmLogoBlue from "@/assets/sfgm-logo-new-blue.png";
import { canAccessInstructorPortal, resolvePostLoginRedirect } from "@/lib/auth-redirect";


interface LoginFormData {
  identifier: string; // Can be email, username, phone
  password: string;
}

export default function Login() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: "",
    password: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [location] = useLocation();
  const isInstructorLogin =
    location.startsWith("/instructor-login") ||
    new URLSearchParams(window.location.search).get("instructor") === "1";
  const returnTo = new URLSearchParams(window.location.search).get("returnTo");
  
  // Check for error in URL params
  useEffect(() => {
    const params = new URLSearchParams((typeof location === "string" ? location.split("?")[1] : window.location.search.substring(1)) || "");
    const error = params.get("error");
    if (error) {
      toast({
        title: "Authentication Error",
        description: decodeURIComponent(error),
        variant: "destructive",
      });
      // Clean URL
      window.history.replaceState({}, "", "/login");
    }
  }, [location, toast]);

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    const role = (user as any).role;
    if (isInstructorLogin && !canAccessInstructorPortal(role)) {
      window.location.href = "/dashboard?notice=instructor-only";
      return null;
    }
    const redirectUrl = resolvePostLoginRedirect(role, {
      returnTo,
      instructorFlow: isInstructorLogin,
    });
    window.location.href = redirectUrl;
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loginPayload = {
        identifier: formData.identifier.trim(),
        password: formData.password,
        keepLoggedIn,
      };

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Essential for cross-platform session cookies
        body: JSON.stringify(loginPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      toast({
        title: isInstructorLogin ? "Welcome to the Instructor Portal" : "Login Successful",
        description: isInstructorLogin
          ? "Opening your instructor dashboard…"
          : "Welcome back to SFGM Bible School!",
      });

      const role = data.user?.role;
      if (isInstructorLogin && !canAccessInstructorPortal(role)) {
        window.location.href = "/dashboard?notice=instructor-only";
        return;
      }

      const redirectUrl =
        resolvePostLoginRedirect(role, {
          returnTo,
          instructorFlow: isInstructorLogin,
        }) ||
        data.user?.redirectUrl ||
        "/dashboard";
      
      // Force page reload to update authentication state
      window.location.href = redirectUrl;

    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPlaceholder = () => {
    return 'Email, username, or phone number';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>
      
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Header Section */}
        <div className="text-center mb-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-lg mx-auto border border-white/20">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <img 
                  src={sfgmLogoBlue} 
                  alt="SFGM Logo" 
                  className="h-24 w-24 object-contain drop-shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-30 -z-10"></div>
              </div>
            </div>
            
            <h1 className={`text-4xl font-bold mb-4 ${isInstructorLogin ? "text-[#0b4f6c]" : "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"}`}>
              {isInstructorLogin ? "Instructor Portal" : "Welcome Back! 👋"}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              {isInstructorLogin
                ? "Sign in with your instructor, admin, or dean account to review students and essays."
                : "Continue your spiritual journey and grow in faith"}
            </p>
            
            {/* Scripture Quote */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 rounded-lg p-4 text-left">
              <p className="text-gray-700 italic text-sm leading-relaxed mb-2">
                "Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth."
              </p>
              <p className="text-blue-600 font-semibold text-xs">
                — 2 Timothy 2:15 KJV
              </p>
            </div>
          </div>
        </div>

        {/* Single Login Card */}
        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardHeader className={`text-white p-6 ${isInstructorLogin ? "bg-[#0b4f6c]" : "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"}`}>
              <CardTitle className="flex items-center text-xl justify-center font-bold">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <i className={`fas ${isInstructorLogin ? "fa-chalkboard-teacher" : "fa-sign-in-alt"} text-white`}></i>
                </div>
                {isInstructorLogin ? "Instructor Sign In" : "Sign In to Your Account"}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-4 text-gray-500">or</span>
                </div>
              </div>

              {/* Login Instructions */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 text-center">
                  {isInstructorLogin
                    ? "Use the email or username for your instructor account"
                    : "Use your email, username, or phone number to sign in"}
                </p>
                {isInstructorLogin ? (
                  <p className="text-xs text-center text-slate-500 mt-2">
                    Student account?{" "}
                    <Link href="/login" className="text-[#0b4f6c] hover:underline font-medium">
                      Sign in on the student login page
                    </Link>
                  </p>
                ) : null}
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Login Identifier */}
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="text-gray-700 font-semibold text-sm">
                    Email, Username, or Phone *
                  </Label>
                  <div className="relative">
                    <i className="fas fa-user absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <Input
                      id="identifier"
                      type="text"
                      value={formData.identifier}
                      onChange={(e) => handleInputChange('identifier', e.target.value)}
                      className={`h-12 pl-12 border-2 rounded-xl transition-all duration-300 ${
                        formData.identifier 
                          ? 'border-green-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      }`}
                      placeholder={getPlaceholder()}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-semibold text-sm">
                    Password *
                  </Label>
                  <div className="relative">
                    <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`h-12 pl-12 pr-12 border-2 rounded-xl transition-all duration-300 ${
                        formData.password 
                          ? 'border-green-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      }`}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 z-10 transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      {showPassword ? 'Hide Password' : 'Show Password'}
                    </button>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-700 flex items-start gap-2">
                      <i className="fas fa-exclamation-triangle text-amber-500 mt-0.5"></i>
                      <span><strong>Remember:</strong> Passwords are case sensitive. Check your caps lock and make sure you're using the correct uppercase and lowercase letters.</span>
                    </p>
                  </div>
                </div>

                {/* Keep me logged in checkbox */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center">
                    <input
                      id="keep-logged-in"
                      type="checkbox"
                      checked={keepLoggedIn}
                      onChange={(e) => setKeepLoggedIn(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="keep-logged-in" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                      Keep me logged in
                    </label>
                  </div>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Login Button */}
                <Button 
                  type="submit" 
                  className={`w-full h-14 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl ${
                    isInstructorLogin
                      ? "bg-[#0b4f6c] hover:bg-[#093d54]"
                      : "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700"
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <i className="fas fa-sign-in-alt mr-3 text-xl"></i>
                      {isInstructorLogin ? "Enter Instructor Portal" : "Sign In"}
                    </div>
                  )}
                </Button>

                {/* Register / apply links */}
                <div className="text-center pt-4 space-y-2">
                  {isInstructorLogin ? (
                    <>
                      <p className="text-sm text-gray-600">
                        Want to teach with SFGM?{" "}
                        <Link
                          href="/instructor-application"
                          className="text-[#0b4f6c] hover:text-[#093d54] font-semibold transition-colors"
                        >
                          Apply to become an instructor
                        </Link>
                      </p>
                      <p className="text-xs text-gray-500">
                        Need a student account?{" "}
                        <Link href="/register" className="text-blue-600 hover:underline">
                          Register here
                        </Link>
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Don&apos;t have an account?{" "}
                      <Link
                        href="/register"
                        className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                      >
                        Sign up here
                      </Link>
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}