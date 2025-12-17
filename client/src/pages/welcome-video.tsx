import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import sfgmLogoBlue from "@/assets/sfgm-logo-new-blue.png";
import { getVideoUrl } from "@/lib/video-storage";

// Use R2 cloud storage - the actual file is named Intro.mp4 in R2
const welcomeVideo = getVideoUrl('Intro.mp4');

export default function WelcomeVideo() {
  const { toast } = useToast();
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);


  const handleVideoEnd = () => {
    setVideoEnded(true);
    
    // Show welcome message
    toast({
      title: "Welcome to SFGM Boston!",
      description: "Thank you for joining our Bible School community. We're excited to have you! Welcome to your dashboard.",
      duration: 5000,
    });

    // Redirect to dashboard after 3 seconds
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 3000);
  };

  const handleVideoLoad = () => {
    setVideoLoading(false);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Premium Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Navigation />
      
      <div className="container mx-auto px-4 py-8 relative z-10">

        {/* Video Container - Auto-Scaling Experience */}
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
          <div className="bg-white/98 backdrop-blur-md rounded-3xl shadow-2xl p-1 sm:p-3 border border-white/30 overflow-hidden">
            <div 
              className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-inner"
              style={{ 
                aspectRatio: '16/9',
                height: 'clamp(50vh, 70vh, 80vh)',
                maxHeight: '80vh',
                minHeight: '50vh'
              }}
            >
              {/* Premium Loading State */}
              {videoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600">
                  <div className="text-center text-white px-6">
                    <div className="relative mb-6">
                      <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-white/30 mx-auto"></div>
                      <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-transparent border-t-white absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                    <p className="text-base sm:text-xl font-medium">Preparing your welcome experience...</p>
                    <div className="mt-4 w-32 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
                      <div className="h-full bg-white/60 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Auto-Scaling Video Player */}
              {welcomeVideo ? (
                <video
                  className="w-full h-full object-contain"
                  autoPlay
                  muted
                  playsInline
                  onEnded={handleVideoEnd}
                  onLoadedData={handleVideoLoad}
                  onError={() => {
                    // If video fails to load, skip to end
                    setVideoLoading(false);
                    handleVideoEnd();
                  }}
                  controls
                  preload="metadata"
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center'
                  }}
                  poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23000'/%3E%3C/svg%3E"
                >
                  <source src={welcomeVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600">
                  <div className="text-center text-white px-6">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-check text-3xl"></i>
                    </div>
                    <p className="text-xl font-medium mb-2">Welcome to SFGM Boston!</p>
                    <p className="text-sm opacity-90">Redirecting to your dashboard...</p>
                    <button
                      onClick={handleVideoEnd}
                      className="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                      Continue to Dashboard
                    </button>
                  </div>
                </div>
              )}
              
              {/* Subtle Video Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 right-4 h-20 bg-gradient-to-b from-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 h-20 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>

            {/* Premium Instructions */}
            <div className="mt-6 sm:mt-8 text-center">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-4 sm:p-6 shadow-lg">
                <div className="flex items-center justify-center gap-3 text-blue-700 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-info-circle text-white text-sm"></i>
                  </div>
                  <span className="font-bold text-base sm:text-lg">What's Next?</span>
                </div>
                <p className="text-sm sm:text-base text-blue-600 leading-relaxed">
                  After the video, you'll be redirected to your student dashboard to get started.
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Premium Redirect Message */}
        {videoEnded && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 max-w-md mx-auto shadow-2xl text-center border border-white/20">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <i className="fas fa-check text-white text-3xl"></i>
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">
                Welcome to Your Dashboard
              </h3>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                You're all set! Let's explore your student dashboard.
              </p>
              <div className="flex items-center justify-center gap-3 text-blue-600">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600/30 border-t-blue-600"></div>
                <span className="text-base font-medium">Redirecting to dashboard...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
