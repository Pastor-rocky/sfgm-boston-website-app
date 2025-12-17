import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import sfgmLogoBlue from "@/assets/sfgm-logo-new-blue.png";

interface RegisterFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  // Format phone number
  const formatPhoneNumber = (value: string): string => {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length <= 3) return phoneNumber;
    if (phoneNumber.length <= 6) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  // Real-time validation
  const validateField = (field: keyof RegisterFormData, value: string) => {
    const errors: Record<string, string> = { ...fieldErrors };
    
    switch (field) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
      case 'username':
        if (value && value.length < 3) {
          errors.username = 'Username must be at least 3 characters';
        } else {
          delete errors.username;
        }
        break;
      case 'password':
        if (value && value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        } else {
          delete errors.password;
        }
        setPasswordStrength(calculatePasswordStrength(value));
        break;
      case 'confirmPassword':
        if (value && value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
      case 'phone':
        const phoneDigits = value.replace(/\D/g, '');
        if (value && phoneDigits.length !== 10) {
          errors.phone = 'Please enter a valid 10-digit phone number';
        } else {
          delete errors.phone;
        }
        break;
    }
    
    setFieldErrors(errors);
  };

  // Calculate form completion progress
  const calculateProgress = (): number => {
    const fields = [
      formData.firstName,
      formData.lastName,
      formData.dateOfBirth,
      formData.email,
      formData.username,
      formData.phone,
      formData.password,
      formData.confirmPassword,
    ];
    const filledFields = fields.filter(f => f.trim() !== '').length;
    return Math.round((filledFields / 8) * 100);
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    window.location.href = '/';
    return null;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Debug logging

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter both your first and last name.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.dateOfBirth) {
      toast({
        title: "Date of Birth Required",
        description: "Please enter your date of birth.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Email Required",
        description: "Please provide a valid email address.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a username.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.username.trim().length < 3) {
      toast({
        title: "Username Too Short",
        description: "Username must be at least 3 characters long.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords don't match. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }


    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          dateOfBirth: formData.dateOfBirth,
          email: formData.email.trim(),
          username: formData.username.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      // Debug logging

      if (response.ok && data.user) {
        toast({
          title: "Welcome to SFGM Boston!",
          description: `Account created successfully! Please complete your profile to get started.`,
        });
        
        // Store authentication token if provided
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        
        // Store registration info for welcome message and redirect to welcome video
        sessionStorage.setItem('newRegistration', 'true');
        sessionStorage.setItem('registrationPassword', formData.password);
        window.location.href = '/dashboard';
      } else {
        
        toast({
          title: "Registration Failed",
          description: data.message || `Server error: ${response.status} - ${response.statusText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      
      toast({
        title: "Connection Error",
        description: `Unable to connect to server. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    let processedValue = value;
    
    // Format phone number
    if (field === 'phone') {
      processedValue = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
    
    // Real-time validation
    validateField(field, processedValue);
  };

  const getPasswordStrengthLabel = (strength: number): { label: string; color: string } => {
    if (strength <= 1) return { label: 'Weak', color: 'text-red-500' };
    if (strength <= 2) return { label: 'Fair', color: 'text-orange-500' };
    if (strength <= 3) return { label: 'Good', color: 'text-yellow-500' };
    if (strength <= 4) return { label: 'Strong', color: 'text-green-500' };
    return { label: 'Very Strong', color: 'text-green-600' };
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
        <div className="text-center mb-12">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 max-w-lg mx-auto border border-white/20">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <img 
                  src={sfgmLogoBlue} 
                  alt="SFGM Logo" 
                  className="h-28 w-28 object-contain drop-shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-30 -z-10"></div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Start Your Journey 🚀
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              Grow yourself to grow others to grow the kingdom. Your spiritual journey starts here.
            </p>
            
            {/* Benefits Section */}
            <div className="grid grid-cols-2 gap-3 mt-6 text-sm">
              <div className="flex items-center text-gray-600">
                <i className="fas fa-book-open text-blue-500 mr-2"></i>
                <span>Access All Courses</span>
              </div>
              <div className="flex items-center text-gray-600">
                <i className="fas fa-certificate text-purple-500 mr-2"></i>
                <span>Earn Certificates</span>
              </div>
              <div className="flex items-center text-gray-600">
                <i className="fas fa-comments text-green-500 mr-2"></i>
                <span>Join Study Circle</span>
              </div>
              <div className="flex items-center text-gray-600">
                <i className="fas fa-chart-line text-orange-500 mr-2"></i>
                <span>Track Progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced OAuth Registration - Top Section */}
        <div className="max-w-md mx-auto mb-8">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Registration</h3>
                <p className="text-sm text-gray-600">Sign up with your social account</p>
              </div>
              <div className="space-y-4">
                <Button
                  onClick={() => window.location.href = '/api/auth/google'}
                  variant="outline"
                  className="w-full h-12 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 group"
                >
                  <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="font-medium">Continue with Google</span>
                </Button>
                
              </div>
              
              <div className="mt-6 flex items-center">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-sm text-gray-500 bg-white">or</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Manual Registration Form */}
        <div className="max-w-md mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-8">
              <CardTitle className="flex items-center text-2xl justify-center font-bold">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <i className="fas fa-user-plus text-white"></i>
                </div>
                Create Your Account
              </CardTitle>
              <p className="text-center text-blue-100 mt-2">Let's get you set up! This will only take a minute ⏱️</p>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-blue-100">Progress</span>
                  <span className="text-blue-100 font-semibold">{calculateProgress()}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2.5">
                  <div 
                    className="bg-white rounded-full h-2.5 transition-all duration-500 ease-out"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleRegister} className="space-y-6">

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-700 font-semibold text-sm">
                      First Name *
                    </Label>
                    <div className="relative">
                      <i className="fas fa-user absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Jane"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className={`h-12 pl-12 border-2 rounded-xl transition-all duration-300 ${
                          fieldErrors.firstName 
                            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                            : formData.firstName 
                            ? 'border-green-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                        }`}
                        required
                      />
                    </div>
                    {fieldErrors.firstName && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-700 font-semibold text-sm">
                      Last Name *
                    </Label>
                    <div className="relative">
                      <i className="fas fa-user absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className={`h-12 pl-12 border-2 rounded-xl transition-all duration-300 ${
                          fieldErrors.lastName 
                            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                            : formData.lastName 
                            ? 'border-green-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                        }`}
                        required
                      />
                    </div>
                    {fieldErrors.lastName && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-gray-700 font-semibold text-sm">
                    Date of Birth *
                  </Label>
                  <div className="relative">
                    <i className="fas fa-calendar absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      className={`h-12 pl-12 border-2 rounded-xl transition-all duration-300 ${
                        formData.dateOfBirth 
                          ? 'border-green-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      }`}
                      required
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  {formData.dateOfBirth && (
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <i className="fas fa-check-circle mr-1"></i>
                      Date selected
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-semibold text-sm">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <i className="fas fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`h-12 pl-12 border-2 rounded-xl transition-all duration-300 ${
                        fieldErrors.email 
                          ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                          : formData.email && !fieldErrors.email
                          ? 'border-green-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                  )}
                  {formData.email && !fieldErrors.email && (
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <i className="fas fa-check-circle mr-1"></i>
                      Looks good!
                    </p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700 font-semibold text-sm">
                    Username *
                  </Label>
                  <div className="relative">
                    <i className="fas fa-at absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className={`h-12 pl-12 border-2 rounded-xl transition-all duration-300 ${
                        fieldErrors.username 
                          ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                          : formData.username && !fieldErrors.username
                          ? 'border-green-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      }`}
                      required
                      minLength={3}
                    />
                    {fieldErrors.username ? (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.username}</p>
                    ) : formData.username && !fieldErrors.username ? (
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <i className="fas fa-check-circle mr-1"></i>
                        Great username!
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Must be at least 3 characters</p>
                    )}
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 font-semibold text-sm">
                    Phone Number *
                  </Label>
                  <div className="relative">
                    <i className="fas fa-phone absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(617) 555-1234"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      maxLength={14}
                      className={`h-12 pl-12 border-2 rounded-xl transition-all duration-300 ${
                        fieldErrors.phone 
                          ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                          : formData.phone && !fieldErrors.phone
                          ? 'border-green-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
                  )}
                  {formData.phone && !fieldErrors.phone && (
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <i className="fas fa-check-circle mr-1"></i>
                      Valid phone number
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-semibold text-sm">
                    Password *
                  </Label>
                  <div className="relative">
                    <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`h-12 pl-12 pr-12 border-2 rounded-xl transition-all duration-300 ${
                        fieldErrors.password 
                          ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                          : formData.password && !fieldErrors.password
                          ? 'border-green-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      }`}
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
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Password strength:</span>
                        <span className={`text-xs font-semibold ${getPasswordStrengthLabel(passwordStrength).color}`}>
                          {getPasswordStrengthLabel(passwordStrength).label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength <= 1 ? 'bg-red-500' :
                            passwordStrength <= 2 ? 'bg-orange-500' :
                            passwordStrength <= 3 ? 'bg-yellow-500' :
                            passwordStrength <= 4 ? 'bg-green-500' : 'bg-green-600'
                          }`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600 space-y-1">
                        <div className={`flex items-center gap-1 ${formData.password.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                          <i className={`fas ${formData.password.length >= 6 ? 'fa-check-circle' : 'fa-circle'}`}></i>
                          At least 6 characters
                        </div>
                        <div className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                          <i className={`fas ${formData.password.length >= 8 ? 'fa-check-circle' : 'fa-circle'}`}></i>
                          At least 8 characters (recommended)
                        </div>
                        <div className={`flex items-center gap-1 ${/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                          <i className={`fas ${/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) ? 'fa-check-circle' : 'fa-circle'}`}></i>
                          Mix of uppercase & lowercase
                        </div>
                        <div className={`flex items-center gap-1 ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                          <i className={`fas ${/\d/.test(formData.password) ? 'fa-check-circle' : 'fa-circle'}`}></i>
                          Include a number
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      {showPassword ? 'Hide Password' : 'Show Password'}
                    </button>
                    {!formData.password && (
                      <span className="text-xs text-gray-500">Min. 6 characters</span>
                    )}
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold text-sm">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`h-12 pl-12 pr-12 border-2 rounded-xl transition-all duration-300 ${
                        fieldErrors.confirmPassword 
                          ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                          : formData.confirmPassword && !fieldErrors.confirmPassword && formData.password === formData.confirmPassword
                          ? 'border-green-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 z-10 transition-colors"
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      {showConfirmPassword ? 'Hide Password' : 'Show Password'}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
                  )}
                  {formData.confirmPassword && !fieldErrors.confirmPassword && formData.password === formData.confirmPassword && (
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <i className="fas fa-check-circle mr-1"></i>
                      Passwords match!
                    </p>
                  )}
                </div>



                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <i className="fas fa-user-plus mr-3 text-xl"></i>
                      Create My Account
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200">
                {/* Additional Options */}
                <div className="text-center space-y-6">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                      Sign in here
                    </Link>
                  </p>
                  
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <i className="fas fa-shield-alt text-green-500"></i>
                      <span>Your information is secure and encrypted</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <i className="fas fa-lock text-blue-500"></i>
                      <span>Never shared with third parties</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      By creating an account, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}