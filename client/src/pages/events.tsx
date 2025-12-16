import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

export default function Events() {
  const upcomingEvents = [
    {
      id: 0,
      title: "🎉 Special Events for This Month",
      date: "This Month",
      time: "Various Times",
      location: "Multiple locations",
      description: "🏀 Basketball Tournament • 🕯️ Christmas Eve Service at 9:00 PM • 🎊 New Year's Eve Service at 10:00 PM",
      type: "Special Events",
      color: "bg-gradient-to-r from-pink-500 to-purple-500"
    },
    {
      id: 1,
      title: "⛪ Sunday Service",
      date: "Every Sunday",
      time: "7:30 PM",
      location: "SFGM Boston Sanctuary",
      description: "Join us for inspiring worship, powerful preaching, and fellowship with the body of Christ.",
      type: "Weekly Service",
      color: "bg-blue-500"
    },
    {
      id: 4,
      title: "📖 Wednesday Service",
      date: "Every Wednesday",
      time: "8:30 PM",
      location: "SFGM Boston Sanctuary",
      description: "Journey through the Word together and be strengthened midweek with worship, teaching, and prayer.",
      type: "Midweek Service",
      color: "bg-purple-500"
    },
    {
      id: 5,
      title: "👥 Youth Ministry Meeting",
      date: "Fridays",
      time: "8:30 PM",
      location: "SFGM Boston Sanctuary",
      description: "Dynamic ministry focused on developing young people's relationship with Christ.",
      type: "Youth Ministry",
      color: "bg-red-500"
    },
    {
      id: 7,
      title: "👨‍👨‍👦 Men's Bible Study",
      date: "Fridays",
      time: "9:30 PM",
      location: "SFGM Boston Sanctuary",
      description: "Men's ministry focusing on brotherhood, accountability, and spiritual growth through Bible study.",
      type: "Men's Ministry",
      color: "bg-indigo-500"
    },
    {
      id: 9,
      title: "🏠 House Ministry",
      date: "Mondays and Thursdays",
      time: "Contact for Times",
      location: "Alternating locations",
      description: "If you would like us to visit you and your family, please contact us for the location.",
      type: "House Ministry",
      color: "bg-teal-500"
    },
    {
      id: 6,
      title: "🍳 Church Family Breakfast",
      date: "First Monday of the month",
      time: "11:00 AM",
      location: "Alternating locations",
      description: "Join us once a month for fellowship and community building. Contact us for the location.",
      type: "Monthly Event",
      color: "bg-indigo-500"
    },
    // Removed Women's Day and other special cards per site updates
    {
      id: 8,
      title: "👩 Women's Bible Study",
      date: "Sundays",
      time: "Contact for Schedule",
      location: "Alternating locations and Zoom",
      description: "A dedicated time in the Word for women to study, pray, and encourage one another.",
      type: "Coming Soon",
      color: "bg-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <i className="fas fa-calendar-check mr-4 text-pink-400"></i>
            Upcoming Events
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join us for worship, fellowship, and spiritual growth at SFGM Boston. 
            All are welcome to participate in our ministry activities and services.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-white text-lg">
                    {event.title}
                  </CardTitle>
                  <Badge className={`${event.color} text-white border-0`}>
                    {event.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                  <span className="text-sm">{event.date}</span>
                </div>
                
                <div className="flex items-center text-gray-300">
                  <Clock className="h-4 w-4 mr-2 text-green-400" />
                  <span className="text-sm">{event.time}</span>
                </div>
                
                <div className="flex items-center text-gray-300">
                  <MapPin className="h-4 w-4 mr-2 text-red-400" />
                  <span className="text-sm">{event.location}</span>
                </div>
                
                <p className="text-gray-400 text-sm leading-relaxed">
                  {event.description}
                </p>
                
                <div className="pt-2">
                  <a 
                    href="/contact"
                    className="text-amber-400 hover:text-amber-300 transition-colors text-sm font-medium"
                  >
                    <Users className="h-4 w-4 inline mr-1" />
                    Get More Info
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm border-purple-500/30 max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-white text-2xl font-bold mb-4">
                <i className="fas fa-heart mr-2 text-red-400"></i>
                Come As You Are
              </h3>
              <p className="text-gray-300 text-lg mb-6">
                Whether you're new to faith or have been walking with Christ for years, 
                you're welcome at SFGM Boston. Join our community of believers as we grow together in God's love.
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-4">
                <a 
                  href="/contact"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  Visit Us This Sunday
                </a>
                <a 
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <i className="fas fa-graduation-cap mr-2"></i>
                  Join Bible School
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}