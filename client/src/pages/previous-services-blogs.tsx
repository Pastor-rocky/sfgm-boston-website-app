import { Link } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PreviousServicesBlogs() {
  const contentSections = [
    {
      id: "sunday-service",
      title: "Sunday Worship Services",
      subtitle: "Powerful Messages & Worship",
      description: "Catch up on recent Sunday worship services and powerful messages from Pastor Rocky and guest speakers",
      icon: "fas fa-church",
      gradient: "from-amber-500 via-orange-500 to-red-500",
      bgGradient: "from-amber-900/30 via-orange-900/30 to-red-900/30",
      link: "/past-services",
      features: ["Weekly Sermons", "The Watchmen Series", "Worship Services", "Biblical Teaching"],
      color: "amber"
    },
    {
      id: "midweek-service",
      title: "Family Night",
      subtitle: "Midweek Teachings & Quizzes",
      description: "Watch Wednesday Midweek Family Night teachings, take weekly quizzes, and compete on the speed leaderboard. Three teachings plus a monthly final exam — prizes for overall, men's, and women's champions.",
      icon: "fas fa-users",
      gradient: "from-purple-500 via-indigo-500 to-blue-500",
      bgGradient: "from-purple-900/30 via-indigo-900/30 to-blue-900/30",
      link: "/family-night",
      features: ["Weekly Quizzes", "Speed Leaderboard", "Monthly Prizes", "Family Night"],
      color: "purple"
    },
    {
      id: "daily-sharpening",
      title: "Daily Sharpening",
      subtitle: "Daily Encouragement & Insights",
      description: "Daily words of encouragement, biblical insights, and spiritual growth from servants to the congregation. This platform is open to anyone who wants to share a word of encouragement—young and older alike. Each episode is designed to sharpen your faith and strengthen your walk with God.",
      icon: "fas fa-sun",
      gradient: "from-yellow-400 via-pink-500 to-purple-600",
      bgGradient: "from-yellow-900/30 via-pink-900/30 to-purple-900/30",
      link: "/daily-sharpening",
      features: ["Daily Episodes", "Open to All", "Servants & Congregation", "Spiritual Growth"],
      color: "yellow"
    },
    {
      id: "cross-carriers",
      title: "Cross Carriers Blog",
      subtitle: "Tough Questions, Biblical Answers",
      description: "A video blog dedicated to answering tough questions that believers face in their daily walk with Christ. Deacon Robert and our youth ministry staff address challenging topics with biblical wisdom.",
      icon: "fas fa-blog",
      gradient: "from-red-500 via-amber-500 to-purple-500",
      bgGradient: "from-red-900/30 via-amber-900/30 to-purple-900/30",
      link: "/cross-carriers-blog",
      features: ["Video Blog", "Tough Questions", "Biblical Answers", "YouTube Channel"],
      color: "red"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="relative mb-8">
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-600/20 via-amber-600/20 to-orange-600/20 blur-3xl rounded-full"></div>
            <h1 className="relative text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text drop-shadow-2xl mb-6 tracking-wide">
              <i className="fas fa-video mr-6 text-yellow-400 drop-shadow-lg"></i>
              PREVIOUS SERVICES & BLOGS
            </h1>
            <p className="relative text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Access all our content in one place. Explore Sunday Services, Midweek Services, Daily Sharpening, and Cross Carriers Blog.
            </p>
          </div>
        </div>

        {/* Content Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {contentSections.map((section, index) => (
            <Card 
              key={section.id}
              className={`group relative overflow-hidden border-0 bg-gradient-to-br ${section.bgGradient} backdrop-blur-sm hover:scale-105 transition-all duration-500 shadow-2xl`}
            >
              {/* Animated Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
              
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-700"></div>
              
              <CardContent className="relative z-10 p-5 md:p-6">
                {/* Icon & Title */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${section.gradient} mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <i className={`${section.icon} text-xl text-white`}></i>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-1 group-hover:text-yellow-300 transition-colors duration-300">
                      {section.title}
                    </h2>
                    <p className={`text-base font-semibold mb-3 ${
                      section.color === 'amber' ? 'text-amber-200' :
                      section.color === 'purple' ? 'text-purple-200' :
                      section.color === 'yellow' ? 'text-yellow-200' :
                      'text-red-200'
                    }`}>
                      {section.subtitle}
                    </p>
                  </div>
                  <div className="text-4xl md:text-5xl text-white/10 font-black">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>

                {/* Description */}
                <p className="text-white text-sm md:text-base leading-relaxed mb-4">
                  {section.description}
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {section.features.map((feature, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2 text-xs text-white bg-white/10 rounded-lg px-2 py-1.5 backdrop-blur-sm border border-white/20"
                    >
                      <i className={`fas fa-check-circle ${
                        section.color === 'amber' ? 'text-amber-300' :
                        section.color === 'purple' ? 'text-purple-300' :
                        section.color === 'yellow' ? 'text-yellow-300' :
                        'text-red-300'
                      }`}></i>
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Link href={section.link}>
                  <Button 
                    className={`w-full bg-gradient-to-r ${section.gradient} hover:opacity-90 text-white font-bold py-4 text-base shadow-xl group-hover:shadow-2xl transition-all duration-300`}
                    size="lg"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <i className={`${section.icon} text-lg`}></i>
                      <span>Explore {section.title}</span>
                      <i className="fas fa-arrow-right group-hover:translate-x-2 transition-transform duration-300"></i>
                    </span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="mt-20 mb-12">
          <Card className="bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-pink-900/50 backdrop-blur-sm border-white/20 overflow-hidden">
            <CardContent className="p-12 text-center">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-4xl md:text-5xl font-black text-white mb-6">
                  <i className="fas fa-heart text-red-400 mr-4"></i>
                  Stay Connected
                </h3>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Don't miss out on our latest content. Follow us on social media and subscribe to our channels for daily encouragement and biblical teaching.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a 
                    href="https://instagram.com/sfgm_boston" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    <i className="fab fa-instagram text-2xl mr-3"></i>
                    Follow on Instagram
                  </a>
                  <a 
                    href="https://youtube.com/@sfgmboston" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    <i className="fab fa-youtube text-2xl mr-3"></i>
                    Subscribe on YouTube
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
          <div className="text-center p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="text-4xl font-black text-yellow-400 mb-2">
              <i className="fas fa-church"></i>
            </div>
            <div className="text-2xl font-bold text-white mb-1">Weekly</div>
            <div className="text-gray-400 text-sm">Sunday Services</div>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="text-4xl font-black text-purple-400 mb-2">
              <i className="fas fa-book-open"></i>
            </div>
            <div className="text-2xl font-bold text-white mb-1">Midweek</div>
            <div className="text-gray-400 text-sm">Bible Study</div>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="text-4xl font-black text-yellow-300 mb-2">
              <i className="fas fa-sun"></i>
            </div>
            <div className="text-2xl font-bold text-white mb-1">Daily</div>
            <div className="text-gray-400 text-sm">Encouragement</div>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="text-4xl font-black text-red-400 mb-2">
              <i className="fas fa-video"></i>
            </div>
            <div className="text-2xl font-bold text-white mb-1">Video</div>
            <div className="text-gray-400 text-sm">Blog Content</div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
