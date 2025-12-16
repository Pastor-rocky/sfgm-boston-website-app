import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Play, Eye, X, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState } from "react";
import { Link } from "wouter";

export default function WatchmenSeries() {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const getEmbedUrl = (url: string, isInstagram: boolean = false) => {
    if (isInstagram && url.includes('instagram.com/p/')) {
      const postId = url.split('/p/')[1].split('/')[0];
      return `https://www.instagram.com/p/${postId}/embed/`;
    }
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      const videoId = url.includes('youtu.be/') 
        ? url.split('youtu.be/')[1].split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  // Watchmen Series - 8 episodes
  const watchmenEpisodes = [
    {
      id: 1,
      title: "Episode 1: Sound the Alarm",
      date: "",
      time: "8:30 PM",
      preacher: "Pastor Rocky",
      series: "The Watchmen Series",
      description: "Sound the alarm! Understanding the biblical calling of watchmen in these last days and the urgency of our spiritual watch.",
      videoUrl: "https://www.youtube.com/watch?v=VpO9OuCTakU&t=4s",
      duration: "45 minutes",
      views: 456,
      categories: ["Prophecy", "End Times", "Vigilance"],
      isInstagram: false
    },
    {
      id: 2,
      title: "Episode 2: The Response",
      date: "",
      time: "8:30 PM",
      preacher: "Pastor Rocky",
      series: "The Watchmen Series",
      description: "The Response - How the church must respond to the alarm. Preparing God's people for what lies ahead through biblical prophecy.",
      videoUrl: "https://www.youtube.com/watch?v=iddYmHu1uF8",
      duration: "42 minutes",
      views: 523,
      categories: ["Prophecy", "Current Events", "Discernment"],
      isInstagram: false
    },
    {
      id: 3,
      title: "Episode 3: Prepare the Way",
      date: "",
      time: "8:30 PM",
      preacher: "Pastor Rocky",
      series: "The Watchmen Series",
      description: "Prepare the Way - Removing obstacles and preparing the way for the Lord's return. Making straight paths in the wilderness.",
      videoUrl: "https://www.youtube.com/watch?v=cDs6LwaAr1g",
      duration: "48 minutes",
      views: 389,
      categories: ["Preparation", "Church", "Return of Christ"],
      isInstagram: false
    },
    {
      id: 4,
      title: "Episode 4: When Time Stands Still",
      date: "",
      time: "8:30 PM",
      preacher: "Pastor Rocky",
      series: "The Watchmen Series",
      description: "When Time Stands Still - The urgency of the final hour and end-times preparation.",
      videoUrl: "https://www.youtube.com/watch?v=c9A6Y30yb4w",
      duration: "50 minutes",
      views: 612,
      categories: ["End Times", "Urgency", "Final Hour"],
      isInstagram: false
    },
    {
      id: 5,
      title: "Episode 5: I Wanna See What They Saw",
      date: "",
      time: "8:30 PM",
      preacher: "Pastor Rocky",
      series: "The Watchmen Series",
      description: "I Wanna See What They Saw - A powerful message about seeking God's perspective and vision.",
      videoUrl: "https://www.youtube.com/watch?v=rq3QK2QrNGM",
      duration: "45 minutes",
      views: 0,
      categories: ["Watchmen", "Prophecy", "Vision"],
      isInstagram: false
    },
    {
      id: 6,
      title: "Episode 6: God's Perfect Timing",
      date: "",
      time: "8:30 PM",
      preacher: "Pastor Rocky",
      series: "The Watchmen Series",
      description: "God's Perfect Timing - Understanding divine timing and trusting in God's sovereign plan.",
      videoUrl: "https://www.instagram.com/p/DOmrbG6kWtm",
      duration: "45 minutes",
      views: 0,
      categories: ["Watchmen", "Prophecy", "Timing"],
      isInstagram: true
    },
    {
      id: 7,
      title: "Episode 7: It Will Happen",
      date: "",
      time: "8:30 PM",
      preacher: "Pastor Rocky",
      series: "The Watchmen Series",
      description: "It Will Happen - Standing firm on God's promises and prophetic fulfillment.",
      videoUrl: "https://www.instagram.com/p/DOUpaIkkT4_/",
      duration: "45 minutes",
      views: 0,
      categories: ["Watchmen", "Prophecy", "Faith"],
      isInstagram: true
    },
    {
      id: 8,
      title: "Episode 8: What Happens Next?",
      date: "",
      time: "8:30 PM",
      preacher: "Pastor Rocky",
      series: "The Watchmen Series",
      description: "What Happens Next? - The final message in the series, looking ahead to what's coming.",
      videoUrl: "https://www.instagram.com/p/DOmrbG6kWtm/",
      duration: "45 minutes",
      views: 0,
      categories: ["Watchmen", "Prophecy", "Future"],
      isInstagram: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/past-services">
            <button className="flex items-center text-amber-400 hover:text-amber-300 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Past Services
            </button>
          </Link>
        </div>

        {/* Header Section with Cover */}
        <div className="text-center mb-12">
          <div className="max-w-md mx-auto mb-8">
            <img 
              src="/Watchmen Logo.jpeg" 
              alt="The Watchmen Series Cover"
              className="w-full rounded-lg shadow-2xl border-4 border-amber-400/30"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <i className="fas fa-shield-alt mr-4 text-amber-400"></i>
            The Watchmen Series
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
            An eight-part sermon series exploring the biblical calling of watchmen in these last days.
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Join Pastor Rocky as he shares urgent messages about spiritual vigilance, prophecy, 
            and preparing God's people for what lies ahead.
          </p>
        </div>

        {/* Series Info */}
        <div className="text-center mb-8">
          <Card className="bg-amber-900/20 backdrop-blur-sm border-amber-400/30 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                <Badge className="bg-amber-600 text-white border-0 text-sm px-4 py-2">
                  <i className="fas fa-video mr-2"></i>
                  8 Episodes
                </Badge>
                <Badge className="bg-orange-600 text-white border-0 text-sm px-4 py-2">
                  <i className="fas fa-book mr-2"></i>
                  Prophecy & End Times
                </Badge>
                <Badge className="bg-red-600 text-white border-0 text-sm px-4 py-2">
                  <i className="fas fa-clock mr-2"></i>
                  Series
                </Badge>
              </div>
              <p className="text-gray-300">
                Each episode builds upon biblical foundations to equip believers for spiritual warfare 
                and end-times preparation through the lens of prophetic understanding.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Episodes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {watchmenEpisodes.map((episode) => (
            <Card key={episode.id} className="bg-amber-900/20 backdrop-blur-sm border-amber-400/30 hover:bg-amber-900/30 transition-all duration-300 overflow-hidden">
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-slate-800 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-orange-600/20"></div>
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Play className="h-8 w-8 text-amber-400 ml-1" />
                  </div>
                  <p className="text-amber-200 text-sm font-medium">{episode.duration}</p>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-white text-sm leading-tight">
                    {episode.title}
                  </CardTitle>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {episode.categories.map((category) => (
                    <Badge 
                      key={category}
                      className="bg-amber-600 text-white border-0 text-xs"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
                <div className="text-amber-400 font-medium text-xs">
                  {episode.series}
                </div>
              </CardHeader>

              <CardContent className="space-y-2 pt-0">
                {episode.date && (
                  <div className="flex items-center text-gray-300 text-xs">
                    <Calendar className="h-3 w-3 mr-1 text-blue-400" />
                    <span>{episode.date}</span>
                  </div>
                )}
                
                <div className="flex items-center text-gray-300 text-xs">
                  <Clock className="h-3 w-3 mr-1 text-green-400" />
                  <span>{episode.time}</span>
                </div>

                <p className="text-gray-400 text-xs line-clamp-2">
                  {episode.description}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center text-gray-400 text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    <span>{episode.views} views</span>
                  </div>
                  
                  {episode.videoUrl ? (
                    <button
                      onClick={() => setSelectedVideo(episode)}
                      className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                    >
                      <Play className="h-3 w-3 inline mr-1" />
                      Watch
                    </button>
                  ) : (
                    <span className="text-gray-500 text-xs">
                      Coming Soon
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 backdrop-blur-sm border-amber-500/30 max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-white text-2xl font-bold mb-4">
                <i className="fas fa-heart mr-2 text-amber-400"></i>
                Join Us This Sunday
              </h3>
              <p className="text-gray-300 text-lg mb-6">
                Experience worship, fellowship, and powerful biblical teaching in person. 
                You're welcome at SFGM Boston regardless of where you are in your faith journey.
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-4">
                <Link href="/contact">
                  <button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    Get Directions
                  </button>
                </Link>
                <Link href="/bible-school">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    <i className="fas fa-graduation-cap mr-2"></i>
                    Join Bible School
                  </button>
                </Link>
                <Link href="/events">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    <i className="fas fa-calendar mr-2"></i>
                    View All Events  
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      {/* YouTube Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="w-[95vw] max-w-5xl max-h-[95vh] p-0 overflow-hidden bg-black">
          <VisuallyHidden>
            <DialogTitle>
              {selectedVideo?.title}
            </DialogTitle>
          </VisuallyHidden>
          <VisuallyHidden>
            <DialogDescription>
              Watch {selectedVideo?.title} from The Watchmen Series
            </DialogDescription>
          </VisuallyHidden>
          
          {selectedVideo && (
            <div className="relative">
              {/* Video Player - YouTube or Instagram */}
              <div className={`${selectedVideo.isInstagram ? 'aspect-[9/16] max-h-[80vh]' : 'aspect-video'} w-full mx-auto`}>
                <iframe
                  src={getEmbedUrl(selectedVideo.videoUrl, selectedVideo.isInstagram)}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title={selectedVideo.title}
                />
              </div>
              
              {/* Video Information Panel */}
              <div className="p-6 bg-slate-900 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{selectedVideo.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
                      <Badge className="bg-amber-600 text-white border-0">
                        {selectedVideo.series}
                      </Badge>
                      {selectedVideo.date && (
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {selectedVideo.date}
                        </span>
                      )}
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {selectedVideo.time}
                      </span>
                      <span>{selectedVideo.duration}</span>
                    </div>
                    <p className="text-gray-300 mb-4">{selectedVideo.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedVideo.categories?.map((category: string) => (
                        <Badge key={category} className="bg-gray-700 text-gray-200 border-0">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="ml-4 p-2 hover:bg-slate-800 rounded-full transition-colors"
                    aria-label="Close video"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 px-4 rounded font-medium transition-colors"
                >
                  Close Video
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

