import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen } from "lucide-react";
import LevelUpRequiredReading from "@/components/level-up-required-reading";

export default function LevelUpLeadershipWeek5() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            onClick={() => setLocation("/course/7")}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Button>
        </div>

        {/* Course Header */}
        <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 border-none shadow-2xl mb-8">
          <CardContent className="p-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-2">
                <span className="text-5xl mr-2">⬆️</span>
                Level Up Leadership
              </h1>
              <h2 className="text-2xl font-semibold text-white/90">
                Week 5: Pinnacle Leadership
              </h2>
              <p className="text-white/80 mt-2">
                Achieving the highest level of leadership through respect and reputation
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Required Reading Card */}
        <Card className="bg-white shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-6 w-6 text-purple-600" />
              <h3 className="text-2xl font-bold text-purple-900">Required Reading</h3>
            </div>
            
            <LevelUpRequiredReading weekNumber={5} />
          </CardContent>
        </Card>

        {/* Key Concepts Card */}
        <Card className="bg-white shadow-lg mb-6">
          <CardContent className="p-6">
            <h3 className="text-2xl font-bold text-purple-900 mb-4">🎯 Key Concepts & Reflection</h3>
            
            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <h4 className="text-lg font-semibold text-green-900 mb-2">
                  ✅ Pinnacle Leadership Principles
                </h4>
                <ul className="text-green-800 space-y-2">
                  <li>• <strong>Respect and Reputation:</strong> People follow because of who you are and what you represent</li>
                  <li>• <strong>Legacy Building:</strong> Pinnacle leaders focus on creating lasting impact beyond their lifetime</li>
                  <li>• <strong>Character Excellence:</strong> The highest level requires the highest character standards</li>
                  <li>• <strong>Servant Leadership:</strong> True pinnacle leaders serve others and develop other pinnacle leaders</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                <h4 className="text-lg font-semibold text-yellow-900 mb-2">
                  💭 Reflection Questions
                </h4>
                <ul className="text-yellow-800 space-y-2">
                  <li>• What kind of reputation do you want to have as a leader?</li>
                  <li>• How are you building a legacy that will outlast your leadership position?</li>
                  <li>• What character qualities do you need to develop to reach pinnacle leadership?</li>
                  <li>• How are you developing other leaders who could reach the pinnacle level?</li>
                </ul>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                <h4 className="text-lg font-semibold text-orange-900 mb-2">
                  🚀 Application Challenge
                </h4>
                <p className="text-orange-800">
                  This week, conduct a personal leadership audit. Evaluate yourself honestly across all five levels of leadership. 
                  Identify your strengths and areas for growth. Create a specific plan to develop the qualities needed 
                  for pinnacle leadership, focusing on character, service, and legacy building.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Week Card */}
        <Card className="bg-white shadow-lg mb-6">
          <CardContent className="p-6">
            <h3 className="text-2xl font-bold text-purple-900 mb-4">🔄 Week 6 Preview: Integration & Application</h3>
            
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
              <h4 className="text-lg font-semibold text-purple-900 mb-2">
                📋 Next Week's Focus
              </h4>
              <p className="text-purple-800 mb-3">
                Week 6 will focus on integrating all five levels of leadership into your daily practice:
              </p>
              <ul className="text-purple-700 space-y-1 ml-4">
                <li>• Combining all five levels for maximum effectiveness</li>
                <li>• Creating your personal leadership development plan</li>
                <li>• Identifying your leadership gaps and growth areas</li>
                <li>• Preparing for the final examination</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 border-none shadow-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Ready for Week 6?</h3>
              <p className="text-white/90 mb-4">
                Next week we'll integrate all five levels and prepare for the final examination
              </p>
              <Button
                onClick={() => setLocation("/course/7")}
                className="bg-white text-purple-600 hover:bg-white/90"
              >
                Return to Course Overview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
