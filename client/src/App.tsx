import React, { Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  marketingRoutes,
  studentRoutes,
  authRoutes,
  ebookRoutes,
  audioAndCourseContentRoutes,
  catchAllRoute,
} from "@/routes/route-config";

function Router() {
  const groupedRoutes = [
    marketingRoutes,
    studentRoutes,
    authRoutes,
    ebookRoutes,
    audioAndCourseContentRoutes,
  ];

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
          <div className="text-white text-lg font-semibold">Loading page…</div>
        </div>
      }
    >
      <Switch>
        {groupedRoutes.flat().map((route) => (
          <Route key={route.path} path={route.path} component={route.component} />
        ))}
        <Route component={catchAllRoute} />
      </Switch>
    </Suspense>
  );
}

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
          <div className="max-w-md mx-auto text-center p-8 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <h1 className="text-2xl font-bold text-white mb-4">SFGM Boston Bible School</h1>
            <p className="text-gray-300 mb-6">We're experiencing a temporary issue. Please refresh the page to continue.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Refresh Page
            </button>
            <div className="mt-4">
              <a href="/" className="text-blue-300 hover:text-blue-200 underline">
                Return to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
