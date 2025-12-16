import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen, ExternalLink, CheckCircle2 } from "lucide-react";

export default function LevelUpLeadershipWeek5() {
  const [, setLocation] = useLocation();
  
  // Track which Bible passages have been read
  const [readPassages, setReadPassages] = useState<Set<string>>(new Set());
  
  // Load read passages from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('level-up-week5-read-passages');
    if (saved) {
      try {
        setReadPassages(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Error loading read passages:', e);
      }
    }
  }, []);
  
  // Save read passages to localStorage whenever it changes
  useEffect(() => {
    if (readPassages.size > 0) {
      localStorage.setItem('level-up-week5-read-passages', JSON.stringify(Array.from(readPassages)));
    }
  }, [readPassages]);
  
  const handlePassageClick = (passageId: string, url: string) => {
    // Mark passage as read
    setReadPassages(prev => new Set([...prev, passageId]));
    // Open the Bible passage
    window.open(url, '_blank');
  };

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
            
            <div className="space-y-6">
              {/* Textbook Reading */}
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                <h4 className="text-lg font-semibold text-purple-900 mb-2">
                  📖 Five Levels of Leadership Textbook
                </h4>
                <p className="text-purple-800 mb-3">
                  <strong>Read pages 229-286:</strong> Level 5 - Pinnacle Leadership
                </p>
                <div className="bg-white p-3 rounded border border-purple-200">
                  <p className="text-sm text-purple-700 mb-2">
                    <strong>Key Topics to Focus On:</strong>
                  </p>
                  <ul className="text-sm text-purple-700 space-y-1 ml-4">
                    <li>• The highest level of leadership influence</li>
                    <li>• Building a reputation that precedes you</li>
                    <li>• Creating a lasting legacy</li>
                    <li>• The responsibility of pinnacle leadership</li>
                  </ul>
                </div>
              </div>

              {/* Bible Reading */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <h4 className="text-lg font-semibold text-blue-900 mb-2">
                  📖 Bible Reading Assignment
                </h4>
                <p className="text-blue-800 mb-3">
                  Study these passages to understand biblical principles of pinnacle leadership:
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => handlePassageClick('matt11-1-30', 'https://www.biblegateway.com/passage/?search=Matthew+11%3A1-30&version=NLT')}
                    variant="outline"
                    className={`w-full justify-start text-blue-700 border-blue-300 hover:bg-blue-100 ${
                      readPassages.has('matt11-1-30') ? 'bg-green-50 border-green-400' : ''
                    }`}
                  >
                    {readPassages.has('matt11-1-30') ? (
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    ) : (
                      <ExternalLink className="mr-2 h-4 w-4" />
                    )}
                    Matthew 11:1-30 - Jesus' Authority and Rest
                  </Button>
                  <Button
                    onClick={() => handlePassageClick('matt14-1-12', 'https://www.biblegateway.com/passage/?search=Matthew+14%3A1-12&version=NLT')}
                    variant="outline"
                    className={`w-full justify-start text-blue-700 border-blue-300 hover:bg-blue-100 ${
                      readPassages.has('matt14-1-12') ? 'bg-green-50 border-green-400' : ''
                    }`}
                  >
                    {readPassages.has('matt14-1-12') ? (
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    ) : (
                      <ExternalLink className="mr-2 h-4 w-4" />
                    )}
                    Matthew 14:1-12 - John the Baptist's Legacy
                  </Button>
                  <Button
                    onClick={() => handlePassageClick('acts6-1-15', 'https://www.biblegateway.com/passage/?search=Acts+6%3A1-15&version=NLT')}
                    variant="outline"
                    className={`w-full justify-start text-blue-700 border-blue-300 hover:bg-blue-100 ${
                      readPassages.has('acts6-1-15') ? 'bg-green-50 border-green-400' : ''
                    }`}
                  >
                    {readPassages.has('acts6-1-15') ? (
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    ) : (
                      <ExternalLink className="mr-2 h-4 w-4" />
                    )}
                    Acts 6:1-15 - Choosing Leaders of Good Reputation
                  </Button>
                  <Button
                    onClick={() => handlePassageClick('acts7-1-60', 'https://www.biblegateway.com/passage/?search=Acts+7%3A1-60&version=NLT')}
                    variant="outline"
                    className={`w-full justify-start text-blue-700 border-blue-300 hover:bg-blue-100 ${
                      readPassages.has('acts7-1-60') ? 'bg-green-50 border-green-400' : ''
                    }`}
                  >
                    {readPassages.has('acts7-1-60') ? (
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    ) : (
                      <ExternalLink className="mr-2 h-4 w-4" />
                    )}
                    Acts 7:1-60 - Stephen's Powerful Testimony
                  </Button>
                  <Button
                    onClick={() => handlePassageClick('acts12-1-25', 'https://www.biblegateway.com/passage/?search=Acts+12%3A1-25&version=NLT')}
                    variant="outline"
                    className={`w-full justify-start text-blue-700 border-blue-300 hover:bg-blue-100 ${
                      readPassages.has('acts12-1-25') ? 'bg-green-50 border-green-400' : ''
                    }`}
                  >
                    {readPassages.has('acts12-1-25') ? (
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    ) : (
                      <ExternalLink className="mr-2 h-4 w-4" />
                    )}
                    Acts 12:1-25 - Peter's Miraculous Deliverance
                  </Button>
                  <Button
                    onClick={() => handlePassageClick('2tim4-1-22', 'https://www.biblegateway.com/passage/?search=2+Timothy+4%3A1-22&version=NLT')}
                    variant="outline"
                    className={`w-full justify-start text-blue-700 border-blue-300 hover:bg-blue-100 ${
                      readPassages.has('2tim4-1-22') ? 'bg-green-50 border-green-400' : ''
                    }`}
                  >
                    {readPassages.has('2tim4-1-22') ? (
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    ) : (
                      <ExternalLink className="mr-2 h-4 w-4" />
                    )}
                    2 Timothy 4:1-22 - Paul's Final Charge and Legacy
                  </Button>
                </div>
              </div>
            </div>
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
