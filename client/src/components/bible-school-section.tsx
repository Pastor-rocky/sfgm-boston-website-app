import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { useState } from "react";
import { MAN_OF_GOD_DESCRIPTION, MAN_OF_GOD_OVERVIEW } from "@/lib/man-of-god-config";
import { DEFAULT_PASSING_SCORE } from "@shared/course-constants";

export default function BibleSchoolSection() {
  const { isAuthenticated } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const features = [
    {
      icon: "fas fa-video",
      title: "Video Learning",
      description: "Weekly instructional videos and interactive content tailored to each course.",
      color: "primary"
    },
    {
      icon: "fas fa-certificate",
      title: "Certificates",
      description: "Receive certificates of completion for all finished courses and programs.",
      color: "secondary"
    },
    {
      icon: "fas fa-users-class",
      title: "Expert Instructors",
      description: "Learn from experienced ministry leaders and biblical scholars.",
      color: "accent"
    }
  ];

  const sampleCourses = [
    {
      id: 4,
      name: "G.R.O.W",
      duration: "4 Weeks",
      points: 180,
      description: "Welcome orientation and practice course for new Bible school students. Learn how the platform works while exploring G.R.O.W ministry principles: Give, Read, Obey, Win Souls.",
      color: "green",
      category: "Foundation",
      difficulty: "Beginner",
      overview: "Platform orientation introducing SFGM Boston's ministry philosophy before academic coursework.",
      assignments: "Weekly spiritual growth exercises and discipleship practices",
      grading: "Practice quizzes — orientation course",
      forum: "Share growth testimonies and encourage spiritual development"
    },
    {
      id: 1,
      name: "Acts in Action",
      duration: "10 Weeks",
      points: 300,
      description: "Study the first century church in Acts — signs, wonders, miracles, and Holy Spirit empowerment for Gospel proclamation.",
      color: "primary",
      category: "Biblical Studies",
      difficulty: "Intermediate",
      overview: "The power and practices of the early church as recorded in Acts.",
      assignments: "Weekly readings, videos, and quizzes",
      grading: `10 weekly quizzes + final exam (${DEFAULT_PASSING_SCORE}% passing)`,
      forum: "Discuss Acts passages and ministry application"
    },
    {
      id: 2,
      name: "Becoming a Fire Starter",
      duration: "10 Weeks",
      points: 300,
      description: "Seven powerful principles to stay filled with the fire of the Holy Spirit and passion for the Gospel.",
      color: "accent",
      category: "Ministry",
      difficulty: "Intermediate",
      overview: "Spiritual fire and passion with Luke Gospel study (chapters 1-24).",
      assignments: "Personal testimony development and ministry projects",
      grading: `10 weekly quizzes + final exam (${DEFAULT_PASSING_SCORE}% passing)`,
      forum: "Share testimonies and encourage spiritual growth"
    },
    {
      id: 3,
      name: "Don't Be a Jonah",
      duration: "11 Weeks",
      points: 320,
      description: "An urgent study on obedience to God's calling using the prophet Jonah as a case study.",
      color: "primary",
      category: "Biblical Studies",
      difficulty: "Intermediate",
      overview: "Consequences of running from divine purpose and practical obedience.",
      assignments: "Reflection papers and obedience action plans",
      grading: `11 weekly quizzes + final exam (${DEFAULT_PASSING_SCORE}% passing)`,
      forum: "Share calling testimonies and support fellow students"
    },
    {
      id: 7,
      name: "Level Up Leadership",
      duration: "7 Weeks",
      points: 240,
      description: "Lead better by serving more — John Maxwell's 5 Levels of Leadership with biblical foundation.",
      color: "purple",
      category: "Leadership",
      difficulty: "Advanced",
      overview: "Leadership development combining proven principles with biblical truth.",
      assignments: "Leadership assessments and practical exercises",
      grading: `5 weekly quizzes + final exam (${DEFAULT_PASSING_SCORE}% passing)`,
      forum: "Discuss leadership challenges and mentor emerging leaders"
    },
    {
      id: 16,
      name: "SFGM Man of God Course",
      duration: "10 Weeks",
      points: 300,
      description: MAN_OF_GOD_DESCRIPTION,
      color: "emerald",
      category: "Character Development",
      difficulty: "Intermediate",
      overview: MAN_OF_GOD_OVERVIEW,
      assignments: "Character assessments and practical ministry applications",
      grading: `10 weekly quizzes + final exam (${DEFAULT_PASSING_SCORE}% passing)`,
      forum: "Discuss character development and Christian brotherhood",
    },
    {
      id: 9,
      name: "Theology 101",
      duration: "10 Weeks",
      points: 300,
      description: "Foundational theological education covering essential Christian doctrines.",
      color: "orange",
      category: "Theology",
      difficulty: "Beginner",
      overview: "Why we believe what we believe, as outlined by the Word of God.",
      assignments: "Doctrinal essays and theological position papers",
      grading: "Coming soon",
      forum: "Theological discussions and doctrinal study",
      comingSoon: true
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      primary: "bg-primary/10 text-primary",
      secondary: "bg-secondary/10 text-secondary",
      accent: "bg-accent/10 text-accent",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      indigo: "bg-indigo-100 text-indigo-600",
      blue: "bg-blue-100 text-blue-600",
      red: "bg-red-100 text-red-600",
      orange: "bg-orange-100 text-orange-600",
      emerald: "bg-emerald-100 text-emerald-600"
    };
    return colorMap[color] || "bg-slate-100 text-slate-600";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalPoints = sampleCourses.reduce((sum, course) => sum + course.points, 0);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 drop-shadow-lg">SFGM Boston Bible School</h2>
          <div className="mt-4">
            <p className="text-lg text-slate-600 italic">
              "Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth." 
              <span className="text-blue-600 font-semibold ml-2">— 2 Timothy 2:15 KJV</span>
            </p>
          </div>
        </div>

        {/* Course Catalog Preview */}
        <div className="bg-slate-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Course Catalog</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleCourses.map((course) => (
              <Card key={course.id} className="bg-white border hover:shadow-md transition-shadow card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={getColorClasses(course.color)}>
                      {course.duration}
                    </Badge>
                    {(course as any).comingSoon ? (
                      <Badge className="bg-amber-100 text-amber-800 text-xs font-bold">
                        COMING SOON
                      </Badge>
                    ) : (
                      <i className="fas fa-bookmark text-slate-400"></i>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{course.name}</h4>
                  <p className="text-slate-600 text-sm mb-4">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(course.difficulty)} variant="secondary">
                        {course.difficulty}
                      </Badge>
                      <span className="text-xs text-slate-500">{course.points} pts</span>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-0">
                          Learn More <i className="fas fa-arrow-right ml-1"></i>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-center mb-4">
                            {course.name}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          {/* Course Overview */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{course.duration}</div>
                                <div className="text-sm text-gray-600">Duration</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{course.points}</div>
                                <div className="text-sm text-gray-600">Total Points</div>
                              </div>
                              <div className="text-center">
                                <Badge className={getDifficultyColor(course.difficulty)} variant="secondary">
                                  {course.difficulty}
                                </Badge>
                                <div className="text-sm text-gray-600 mt-1">Level</div>
                              </div>
                            </div>
                            <div className="text-center">
                              <Badge className={getColorClasses(course.color)} variant="secondary">
                                {course.category}
                              </Badge>
                            </div>
                          </div>

                          <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="overview">Overview</TabsTrigger>
                              <TabsTrigger value="grading">Grading</TabsTrigger>
                              <TabsTrigger value="assignments">Assignments</TabsTrigger>
                              <TabsTrigger value="forum">Forum</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="overview" className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-lg mb-2">Course Overview</h4>
                                <p className="text-gray-700 leading-relaxed">{course.overview}</p>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="grading" className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-lg mb-2">Grading Structure</h4>
                                <p className="text-gray-700 leading-relaxed">{course.grading}</p>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="assignments" className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-lg mb-2">Course Assignments</h4>
                                <p className="text-gray-700 leading-relaxed">{course.assignments}</p>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="forum" className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-lg mb-2">Discussion Forum</h4>
                                <p className="text-gray-700 leading-relaxed">{course.forum}</p>
                              </div>
                            </TabsContent>
                          </Tabs>

                          <Separator />
                          
                          <div className="text-center">
                            {isAuthenticated ? (
                              <Link href="/bible-school">
                                <Button className="btn-primary px-8 py-3">
                                  <i className="fas fa-graduation-cap mr-2"></i>
                                  Enroll in This Course
                                </Button>
                              </Link>
                            ) : (
                              <Button 
                                onClick={() => window.location.href = '/login'}
                                className="btn-primary px-8 py-3"
                              >
                                <i className="fas fa-sign-in-alt mr-2"></i>
                                Login to Enroll
                              </Button>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Course Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mt-8 mb-8">
            <div className="text-center">
              <h4 className="text-xl font-bold text-gray-800 mb-4">Complete Course Catalog</h4>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{sampleCourses.length}</div>
                  <div className="text-sm text-gray-600">Total Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{totalPoints}</div>
                  <div className="text-sm text-gray-600">Total Points Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">6</div>
                  <div className="text-sm text-gray-600">Study Categories</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm">
                Foundation • Biblical Studies • Ministry • Leadership • Prophecy • Theology • Character Development
              </p>
            </div>
          </div>

          <div className="text-center">
            {isAuthenticated ? (
              <Link href="/bible-school">
                <Button className="btn-primary px-8 py-4 text-lg shadow-lg">
                  <i className="fas fa-graduation-cap mr-3"></i>Browse All Courses
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={() => window.location.href = '/login'}
                className="btn-primary px-8 py-4 text-lg shadow-lg"
              >
                <i className="fas fa-graduation-cap mr-3"></i>Enroll in Bible School
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}