import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Video, FileText, CheckCircle2, ArrowRight, Play, Users, Clock } from "lucide-react";
import {
  MAN_OF_GOD_DESCRIPTION,
  MAN_OF_GOD_WEEKS,
} from "@/lib/man-of-god-config";
import { DEFAULT_PASSING_SCORE, MAN_OF_GOD_WEEK1_PASSING_SCORE } from "@shared/course-constants";

export default function CourseInstructions() {
  const { courseId } = useParams();
  const isManOfGod = courseId === "16";
  
  const { data: course, isLoading } = useQuery<any>({
    queryKey: [`/api/courses/${courseId}`],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Course Not Found</h1>
          <p className="text-gray-600 mt-2">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Course Header */}
      <div className="text-center mb-8">
        {/* Course Cover Image */}
        <div className="flex justify-center mb-6">
          <img 
            src={courseId === "1" ? "/acts-in-action-cover.png" : 
                  courseId === "2" ? "/becoming-a-fire-starter-cover.jpeg" :
                  courseId === "3" ? "/dont-be-a-jonah-cover.jpg" :
                  courseId === "4" ? "/grow-cover.png" :
                  courseId === "5" ? "/studying-for-service-cover.jpg" :
                  courseId === "16" ? "/man-of-god-course-cover.webp" :
                  "/course-cover-placeholder.png"} 
            alt={`${course?.name || 'Course'} Cover`}
            className="w-32 h-40 object-cover rounded-lg shadow-xl border-2 border-gray-200"
          />
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <BookOpen className="h-12 w-12 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course?.name || 'Course'}</h1>
            <p className="text-gray-600 mt-2">
              {isManOfGod ? MAN_OF_GOD_DESCRIPTION : (course?.description || "Course description")}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-4 mt-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {isManOfGod ? MAN_OF_GOD_WEEKS : (course?.duration || "10")} weeks
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {course?.difficulty || 'Intermediate'}
          </Badge>
        </div>
      </div>

      {/* Welcome Message */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-600" />
            Welcome to Your Course!
          </CardTitle>
          <CardDescription>
            Before you begin, please read these important instructions to get the most out of your learning experience.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Week-Based System Explanation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl text-blue-600">How This Course Works</CardTitle>
          <CardDescription>
            This course follows a structured <strong>week-based progression system</strong> designed to maximize your learning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-blue-800 mb-2">📚 Week-Based Learning</h4>
            <p className="text-blue-700">
              You must complete each week's requirements before moving to the next week.
              This ensures you build a solid foundation as you progress through the course.
            </p>
            {isManOfGod && (
              <p className="text-blue-700 mt-3 text-sm">
                <strong>Weeks 1–5</strong> are taught by Pastor Kevin (SFGM Columbus).{" "}
                <strong>Weeks 6–10</strong> are taught by Bishop Anthony Lee (SFGM Orlando).
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Instructions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl text-green-600">Required Completion Order</CardTitle>
          <CardDescription>
            Follow this exact order for each week to unlock the next week's content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold">Watch the Video</h4>
                </div>
                <p className="text-gray-600 text-sm">
                  Start by watching the weekly video lesson. Click the video card and watch the entire content.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold">Complete Reading Assignments</h4>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  {isManOfGod
                    ? "Read the weekly e-book chapter using the E-book button on the course page:"
                    : "Complete both reading requirements using the blue and green buttons:"}
                </p>
                {isManOfGod ? (
                  <div className="bg-emerald-100 p-3 rounded border-l-4 border-emerald-500">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">📖</span>
                      <span className="font-medium text-emerald-700">E-book Button</span>
                    </div>
                    <p className="text-emerald-600 text-sm">
                      Weekly Man of God chapter with optional audio — one reading per week (no separate Bible assignment)
                    </p>
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-blue-100 p-3 rounded border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">📚</span>
                      <span className="font-medium text-blue-700">Blue Button</span>
                    </div>
                    <p className="text-blue-600 text-sm">Textbook chapters with progress saving</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded border-l-4 border-green-500">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">✝️</span>
                      <span className="font-medium text-green-700">Green Button</span>
                    </div>
                    <p className="text-green-600 text-sm">Bible reading assignments</p>
                  </div>
                </div>
                )}
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold">Pass the Quiz</h4>
                </div>
                <p className="text-gray-600 text-sm">
                  {isManOfGod ? (
                    <>
                      <strong>Week 1</strong> is a reflection essay (submit to pass).{" "}
                      <strong>Weeks 2–10</strong> require <strong>{DEFAULT_PASSING_SCORE}% or higher</strong> to pass.
                      Each quiz is one attempt only. Contact your instructor if you need a retake.
                    </>
                  ) : (
                    <>
                      Take the weekly quiz and score {DEFAULT_PASSING_SCORE}% or higher to pass.
                      Each quiz is one attempt only. Contact your instructor if you need a retake.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Structure and Grading System */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl text-purple-600">📊 Quiz Structure & Grading System</CardTitle>
          <CardDescription>
            Understanding how assessments work and how your grades are calculated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Quiz Structure */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-3">📝 Weekly Quiz Structure</h4>
              {courseId === "1" ? (
                // Special structure for Acts in Action: 20 questions total (10 textbook + 10 Bible)
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded border border-purple-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">10</div>
                        <div className="text-sm text-blue-700">Textbook Questions</div>
                        <div className="text-xs text-gray-600 mt-1">Assigned textbook chapters</div>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">10</div>
                        <div className="text-sm text-green-700">Bible Questions</div>
                        <div className="text-xs text-gray-600 mt-1">Book of Jonah chapters</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-lg text-center">
                    <div className="text-lg font-bold">Total: 20 Questions per Weekly Quiz</div>
                    <div className="text-sm text-purple-100">Textbook + Bible only</div>
                  </div>
                </div>
              ) : isManOfGod ? (
                <div className="space-y-3">
                  <p className="text-purple-700">Each week includes a quiz based on the video and e-book chapter:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded border border-purple-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">Week 1</div>
                        <div className="text-sm text-emerald-700">Reflection Essay</div>
                        <div className="text-xs text-gray-600 mt-1">30 minutes • submit essay to pass</div>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">Weeks 2–10</div>
                        <div className="text-sm text-purple-700">MC + Character Essay</div>
                        <div className="text-xs text-gray-600 mt-1">30 minutes • {DEFAULT_PASSING_SCORE}% to pass</div>
                      </div>
                    </div>
                  </div>
                  <ul className="text-purple-700 space-y-1 ml-4 text-sm">
                    <li>• 🎥 Weekly video lesson (Pastor Kevin, Weeks 1–5; Bishop Anthony, Weeks 6–10)</li>
                    <li>• 📖 E-book chapter reading with optional audio</li>
                    <li>• 📝 Multiple-choice questions plus short character essays (Weeks 2–10)</li>
                  </ul>
                </div>
              ) : (
                // Standard structure for other courses
                <div className="space-y-3">
                  <p className="text-purple-700">Each weekly quiz contains questions based on:</p>
                  <ul className="text-purple-700 space-y-1 ml-4">
                    <li>• 📚 Textbook reading assignments</li>
                    <li>• ✝️ Bible reading assignments</li>
                    <li>• 🎥 Video lesson content</li>
                  </ul>
                  <div className="bg-white p-3 rounded border border-purple-200 text-center">
                    <div className="text-lg font-bold text-purple-600">15-25 Questions per Quiz</div>
                    <div className="text-sm text-gray-600">Varies by course content</div>
                  </div>
                </div>
              )}
            </div>

            {/* Grading System */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3">🎯 Grading & GPA System</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-green-700 mb-2">Passing Requirements:</h5>
                  <ul className="text-green-700 space-y-1 text-sm">
                    {isManOfGod && (
                      <li>• <strong>Week 1:</strong> reflection essay (submit to pass)</li>
                    )}
                    <li>• <strong>{DEFAULT_PASSING_SCORE}% minimum</strong> to pass weekly quizzes</li>
                    <li>• <strong>{DEFAULT_PASSING_SCORE}% minimum</strong> to pass final exams</li>
                    <li>• Must pass to unlock next week</li>
                    <li>• <strong>ONE ATTEMPT ONLY</strong> per quiz</li>
                    <li>• Contact instructor for retake permission</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-green-700 mb-2">GPA Conversion Scale:</h5>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between"><span>90-100%</span><span className="font-bold">A (4.0)</span></div>
                    <div className="flex justify-between"><span>80-89%</span><span className="font-bold">B (3.0)</span></div>
                    <div className="flex justify-between"><span>70-79%</span><span className="font-bold">C (2.0)</span></div>
                    <div className="flex justify-between"><span>60-69%</span><span className="font-bold">D (1.0)</span></div>
                    <div className="flex justify-between"><span>Below 60%</span><span className="font-bold">F (0.0)</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Final Exam Info */}
            {courseId === "1" && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-3">🎓 Final Examination</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-red-700 mb-2">Exam Structure:</h5>
                    <ul className="text-red-700 space-y-1 text-sm">
                      <li>• <strong>50 multiple choice questions</strong></li>
                      <li>• 25 Textbook + 25 Bible</li>
                      <li>• <strong>200-word essay requirement</strong></li>
                      <li>• Covers entire course material</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-red-700 mb-2">Requirements:</h5>
                    <ul className="text-red-700 space-y-1 text-sm">
                      <li>• Complete all 5 weekly quizzes first</li>
                      <li>• <strong>{DEFAULT_PASSING_SCORE}% minimum passing score</strong></li>
                      <li>• Essay must be approved by instructor</li>
                      <li>• 1 hour time limit on final exam</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {isManOfGod && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-3">🎓 Final Examination</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-red-700 mb-2">Exam Structure:</h5>
                    <ul className="text-red-700 space-y-1 text-sm">
                      <li>• <strong>50 multiple-choice questions</strong> drawn from Weeks 2–10</li>
                      <li>• <strong>200-word minimum final essay</strong></li>
                      <li>• Covers the full 10-week course</li>
                      <li>• <strong>60-minute</strong> time limit</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-red-700 mb-2">Requirements:</h5>
                    <ul className="text-red-700 space-y-1 text-sm">
                      <li>• Complete all 10 weekly quizzes first</li>
                      <li>• <strong>{DEFAULT_PASSING_SCORE}% minimum passing score</strong></li>
                      <li>• Essay reviewed by instructor</li>
                      <li>• Course certificate after final review</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* One Attempt Policy */}
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <h4 className="font-semibold text-red-800 mb-3">⚠️ CRITICAL: One Attempt Quiz Policy</h4>
              <div className="space-y-3">
                <p className="text-red-700 font-medium">
                  Each quiz allows <strong>ONE ATTEMPT ONLY</strong>. Choose your answers carefully!
                </p>
                <div className="bg-white p-3 rounded border border-red-200">
                  <h5 className="font-medium text-red-800 mb-2">If you need a retake:</h5>
                  <ul className="text-red-700 space-y-1 text-sm">
                    <li>1. Contact your course instructor immediately</li>
                    <li>2. Explain the reason for the retake request (technical issues, misunderstanding, etc.)</li>
                    <li>3. Only instructors can grant retake permission in the system</li>
                    <li>4. Wait for instructor approval before attempting again</li>
                  </ul>
                </div>
                <div className="bg-yellow-100 p-3 rounded border border-yellow-300">
                  <p className="text-yellow-800 text-sm font-medium">
                    💡 <strong>Study Tip:</strong> Review all reading materials, videos, and take notes before attempting any quiz. 
                    Once you start, you cannot go back!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Assessment Info for Becoming a Fire Starter */}
      {courseId === "3" && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-xl text-orange-700 flex items-center gap-2">
              🔥 Comprehensive Assessment System
            </CardTitle>
            <CardDescription className="text-orange-600">
              This course features the most comprehensive assessment system in our Bible school!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-orange-800">Weekly Quizzes</h4>
                  <CheckCircle2 className="h-5 w-5 text-orange-600" />
                </div>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• 10 weekly quizzes (20 questions each)</li>
                  <li>• 10 textbook + 10 Bible questions per quiz</li>
                  <li>• Covers both "Fire Starter" book + Luke Gospel</li>
                  <li>• {DEFAULT_PASSING_SCORE}% required to advance to next week</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-orange-800">Final Examination</h4>
                  <Badge className="bg-purple-600">Final</Badge>
                </div>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• 50 comprehensive questions</li>
                  <li>• 25 textbook + 25 Luke Bible questions</li>
                  <li>• 60-minute time limit</li>
                  <li>• {DEFAULT_PASSING_SCORE}% passing score required</li>
                </ul>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-lg">Total Assessment Challenge</h4>
                  <p className="text-orange-100 text-sm">250 Questions • Progressive Luke Study • Complete Fire Starter Mastery</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">250</div>
                  <div className="text-xs text-orange-100">QUESTIONS</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reading Progress Feature */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl text-purple-600">📖 Save Your Reading Progress</CardTitle>
          <CardDescription>
            Don't lose your place in the textbook! Use our progress saving feature.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <BookOpen className="h-6 w-6 text-purple-600 mt-1" />
              <div>
                <h4 className="font-semibold text-purple-800 mb-2">How to Save Progress</h4>
                <ol className="list-decimal list-inside space-y-1 text-purple-700 text-sm">
                  {isManOfGod ? (
                    <>
                      <li>Open each week&apos;s e-book chapter from the course page</li>
                      <li>Completion is tracked when you finish the reading assignment</li>
                      <li>Each chapter also includes optional audio you can listen to while you read</li>
                      <li>Each course maintains separate progress tracking</li>
                    </>
                  ) : (
                    <>
                      <li>When reading textbook chapters, use the <strong>"Save Progress"</strong> button</li>
                      <li>Your current page and chapter location will be remembered</li>
                      <li>Return anytime and pick up exactly where you left off</li>
                      <li>Each course maintains separate progress tracking</li>
                    </>
                  )}
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tips */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl text-orange-600">💡 Navigation Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-orange-50 p-3 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-2">Button Tooltips</h4>
              <p className="text-orange-700 text-sm">
                {isManOfGod
                  ? "Use the E-book button on each week card to open that week's chapter"
                  : "Hover over blue and green buttons to see specific chapter assignments"}
              </p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-2">Week Locking</h4>
              <p className="text-orange-700 text-sm">
                Future weeks appear locked until you complete prerequisites
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ready to Start */}
      <div className="text-center">
        <Button 
          size="lg" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          onClick={async () => {
            try {
              // Mark instructions as viewed
              await fetch(`/api/courses/${courseId}/instructions-viewed`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
            } catch (error) {
              console.error('Error marking instructions as viewed:', error);
            }
            
            // Navigate to course content
            window.location.href = `/course/${courseId}`;
          }}
        >
          <ArrowRight className="h-5 w-5 mr-2" />
          I Understand - Start Course
        </Button>
        
        <p className="text-gray-500 text-sm mt-3">
          You can return to these instructions anytime from the course page
        </p>
      </div>
    </div>
  );
}