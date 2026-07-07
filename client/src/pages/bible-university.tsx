import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { GraduationCap, BookOpen, Users, Award, Clock, Globe } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { getImageUrl } from "@/lib/image-storage";
import { useState } from "react";
import CoursePasswordPrompt from "@/components/course-password-prompt";
import { resolvePostEnrollmentPath } from "@/lib/enrollment-navigation";
import { getPrerequisiteEligibility } from "@shared/course-prerequisites";

export default function BibleUniversity() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordCourseId, setPasswordCourseId] = useState<number | null>(null);
  const [passwordCourseName, setPasswordCourseName] = useState<string>("");

  // Fetch enrollments to check if user is enrolled in Deacon Course
  const { data: enrollments = [] } = useQuery({
    queryKey: ['/api/enrollments/student'],
    enabled: isAuthenticated,
  });

  const userEnrollments = (enrollments as any[]).map((e: any) => e.courseId);
  const isEnrolledInDeaconCourse = userEnrollments.includes(6);
  const isEnrolledInYouthMinistryCourse = userEnrollments.includes(8);

  // Enroll in Deacon Course mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/enrollments', {
        courseId: 6,
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully enrolled in the Deacon Course!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments/student'] });
      const priorCount = (enrollments as any[]).length;
      window.location.href = resolvePostEnrollmentPath(priorCount, 6);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to enroll in course",
        variant: "destructive",
      });
    },
  });

  // Enroll in Youth Ministry Course mutation
  const enrollYouthMinistryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/enrollments', {
        courseId: 8,
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully enrolled in the Youth Ministry Course!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments/student'] });
      const priorCount = (enrollments as any[]).length;
      window.location.href = resolvePostEnrollmentPath(priorCount, 8);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to enroll in course",
        variant: "destructive",
      });
    },
  });

  const handleEnroll = () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    // Check if already enrolled
    if (isEnrolledInDeaconCourse) {
      // If enrolled, go to course content
      window.location.href = '/course/6';
      return;
    }

    const prerequisite = getPrerequisiteEligibility(6, enrollments as any[]);
    if (!prerequisite.eligible) {
      toast({
        title: "Prerequisite required",
        description: prerequisite.message,
        variant: "destructive",
      });
      return;
    }

    // Show password prompt for locked course
    setPasswordCourseId(6);
    setPasswordCourseName("Deacon Course");
    setShowPasswordPrompt(true);
  };

  const handleYouthMinistryEnroll = () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    // Check if already enrolled
    if (isEnrolledInYouthMinistryCourse) {
      // If enrolled, go to course content
      window.location.href = '/course/8';
      return;
    }

    const prerequisite = getPrerequisiteEligibility(8, enrollments as any[]);
    if (!prerequisite.eligible) {
      toast({
        title: "Prerequisite required",
        description: prerequisite.message,
        variant: "destructive",
      });
      return;
    }

    // Show password prompt for locked course
    setPasswordCourseId(8);
    setPasswordCourseName("Youth Ministry Course");
    setShowPasswordPrompt(true);
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-indigo-900/80 to-slate-800/85"></div>
      <div className="relative z-10">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-8 px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-8 flex justify-center">
            <img 
              src={getImageUrl('BBU1.001.jpeg')} 
              alt="Boston Bible University"
              className="rounded-lg shadow-2xl border-4 border-blue-400/30"
              style={{ width: '600px', height: 'auto', maxWidth: '100%' }}
            />
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            SFGM Boston Curriculum<br />
            <span className="text-4xl font-bold">BBU Boston Bible University</span>
          </h1>
          <p className="text-xl text-blue-200 mb-8 max-w-3xl mx-auto">
            Transform your spiritual journey with our comprehensive Bible university program. 
            Deepen your understanding of Scripture and prepare for effective ministry.
          </p>
        </div>

        {/* University Information */}
        <div className="mb-16">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-2">
                <GraduationCap className="h-6 w-6" />
                Curriculum Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-blue-400 mt-1" />
                    <div>
                      <p className="text-white font-semibold">Program Format</p>
                      <p className="text-blue-200">Online and In-Person Bible Study</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-blue-400 mt-1" />
                    <div>
                      <p className="text-white font-semibold">Community</p>
                      <p className="text-blue-200">Study alongside fellow believers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-blue-400 mt-1" />
                    <div>
                      <p className="text-white font-semibold">Certification</p>
                      <p className="text-blue-200">Earn certificates upon completion</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-400 mt-1" />
                    <div>
                      <p className="text-white font-semibold">Schedule</p>
                      <p className="text-blue-200">Study at your own pace</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-blue-400 mt-1" />
                    <div>
                      <p className="text-white font-semibold">Impact</p>
                      <p className="text-blue-200">Prepare for ministry and service</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Course - Deacon Course */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Available Courses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-xl">Deacon Course</CardTitle>
                  <Badge variant="outline" className={`border-blue-400 ${isEnrolledInDeaconCourse ? 'text-green-400 border-green-400' : 'text-blue-400'}`}>
                    {isEnrolledInDeaconCourse ? 'Enrolled' : 'Available'}
                  </Badge>
                </div>
                <p className="text-blue-200 text-sm">A comprehensive Spirit-led training program for aspiring deacons. Learn the biblical foundation, practical ministry, and spiritual warfare principles needed for faithful service in the local church.</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Duration:</span>
                    <span>6 weeks</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Format:</span>
                    <span>Online & In-Person</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Schedule:</span>
                    <span>Self-Paced</span>
                  </div>
                </div>
                <Button 
                  onClick={handleEnroll}
                  disabled={enrollMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  {enrollMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Enrolling...
                    </>
                  ) : isAuthenticated && isEnrolledInDeaconCourse ? (
                    <>
                      <i className="fas fa-play mr-2"></i>
                      Continue Course
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus mr-2"></i>
                      Enroll in Deacon Course
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Youth Ministry Course Card */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-xl">Youth Ministry Course</CardTitle>
                  <Badge variant="outline" className={`border-blue-400 ${isEnrolledInYouthMinistryCourse ? 'text-green-400 border-green-400' : 'text-blue-400'}`}>
                    {isEnrolledInYouthMinistryCourse ? 'Enrolled' : 'Available'}
                  </Badge>
                </div>
                <p className="text-blue-200 text-sm">A comprehensive 5-chapter foundational course for youth ministry development and discipleship. Learn the calling, requirements, responsibilities, accountability, and disciple-making strategies needed for effective youth ministry.</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Duration:</span>
                    <span>5 weeks</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Format:</span>
                    <span>Online & In-Person</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Schedule:</span>
                    <span>Self-Paced</span>
                  </div>
                </div>
                <Button 
                  onClick={handleYouthMinistryEnroll}
                  disabled={enrollYouthMinistryMutation.isPending}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                >
                  {enrollYouthMinistryMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Enrolling...
                    </>
                  ) : isAuthenticated && isEnrolledInYouthMinistryCourse ? (
                    <>
                      <i className="fas fa-play mr-2"></i>
                      Continue Course
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus mr-2"></i>
                      Enroll in Youth Ministry Course
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

      </main>

      <Footer />
      
      {/* Password Prompt Modal */}
      {passwordCourseId && (
        <CoursePasswordPrompt
          courseId={passwordCourseId}
          courseName={passwordCourseName}
          isOpen={showPasswordPrompt}
          onClose={() => {
            setShowPasswordPrompt(false);
            setPasswordCourseId(null);
            setPasswordCourseName("");
          }}
          onSuccess={() => {
            if (passwordCourseId === 6) {
              enrollMutation.mutate();
            } else if (passwordCourseId === 8) {
              enrollYouthMinistryMutation.mutate();
            }
          }}
        />
      )}
      </div>
    </div>
  );
}
