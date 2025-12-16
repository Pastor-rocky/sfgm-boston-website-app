import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Play, Eye, X, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState } from "react";
import { Link } from "wouter";

export default function PerceptionSeries() {
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

  // Perception Sermon Series - 2 episodes
  const perceptionEpisodes = [
    {
      id: 1,
      title: "Part 1",
      date: "",
      time: "8:30 PM",
      preacher: "Pastor Rocky",
      series: "Perception Sermon Series",
      description: "The first installment in this new featured series. Exploring perception and its impact on our walk with God.",
      videoUrl: "https://www.instagram.com/p/DR_HDDdjsy_/",
      duration: "45 minutes",
      views: 0,
      categories: ["Perception", "Featured", "Series"],
      isInstagram: true
    },
    {
      id: 2,
      title: "Part 2",
      date: "",
      time: "8:30 PM",
      preacher: "Pastor Rocky",
      series: "Perception Sermon Series",
      description: "Continuing the Perception series - the second and final installment.",
      videoUrl: "",
      duration: "45 minutes",
      views: 0,
      categories: ["Perception", "Featured", "Series"],
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
            <button className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Past Services
            </button>
          </Link>
        </div>

        {/* Header Section with Cover */}
        <div className="text-center mb-12">
          <div className="max-w-md mx-auto mb-8">
            <img 
              src="/pss.jpeg" 
              alt="Perception Sermon Series Cover"
              className="w-full rounded-lg shadow-2xl border-4 border-purple-400/30"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <i className="fas fa-eye mr-4 text-purple-400"></i>
            Perception Sermon Series
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
            A two-part featured series exploring perception and its impact on our spiritual journey.
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Join Pastor Rocky as he shares insights on how our perception shapes our relationship with God 
            and our service to Him.
          </p>
        </div>

        {/* Series Info */}
        <div className="text-center mb-8">
          <Card className="bg-purple-900/20 backdrop-blur-sm border-purple-400/30 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                <Badge className="bg-purple-600 text-white border-0 text-sm px-4 py-2">
                  <i className="fas fa-video mr-2"></i>
                  2 Parts
                </Badge>
                <Badge className="bg-indigo-600 text-white border-0 text-sm px-4 py-2">
                  <i className="fas fa-star mr-2"></i>
                  Featured Series
                </Badge>
                <Badge className="bg-violet-600 text-white border-0 text-sm px-4 py-2">
                  <i className="fas fa-clock mr-2"></i>
                  Two-Part Series
                </Badge>
              </div>
              <p className="text-gray-300">
                The first installment in this new featured series. Discover how perception influences 
                our understanding of God's calling and our service to the Kingdom.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Episodes Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
          {perceptionEpisodes.map((episode) => (
            <Card key={episode.id} className="bg-purple-900/20 backdrop-blur-sm border-purple-400/30 hover:bg-purple-900/30 transition-all duration-300 overflow-hidden">
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-slate-800 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20"></div>
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 bg-purple-400/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Play className="h-8 w-8 text-purple-400 ml-1" />
                  </div>
                  <p className="text-purple-200 text-sm font-medium">{episode.duration}</p>
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
                      className="bg-purple-600 text-white border-0 text-xs"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
                <div className="text-purple-400 font-medium text-xs">
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
                      className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
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
          <Card className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-purple-500/30 max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-white text-2xl font-bold mb-4">
                <i className="fas fa-heart mr-2 text-purple-400"></i>
                Join Us This Sunday
              </h3>
              <p className="text-gray-300 text-lg mb-6">
                Experience worship, fellowship, and powerful biblical teaching in person. 
                You're welcome at SFGM Boston regardless of where you are in your faith journey.
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-4">
                <Link href="/contact">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    Get Directions
                  </button>
                </Link>
                <Link href="/bible-school">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    <i className="fas fa-graduation-cap mr-2"></i>
                    Join Bible School
                  </button>
                </Link>
                <Link href="/events">
                  <button className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
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

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="w-[95vw] max-w-5xl max-h-[95vh] p-0 overflow-hidden bg-black">
          <VisuallyHidden>
            <DialogTitle>
              {selectedVideo?.title}
            </DialogTitle>
          </VisuallyHidden>
          <VisuallyHidden>
            <DialogDescription>
              Watch {selectedVideo?.title} from Perception Sermon Series
            </DialogDescription>
          </VisuallyHidden>
          
          {selectedVideo && (
            <div className="relative">
              {/* Video Player */}
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
                      <Badge className="bg-purple-600 text-white border-0">
                        {selectedVideo.series}
                      </Badge>
                      {selectedVideo.preacher && (
                        <span className="flex items-center">
                          <i className="fas fa-user mr-1"></i>
                          {selectedVideo.preacher}
                        </span>
                      )}
                      {selectedVideo.date && (
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {selectedVideo.date}
                        </span>
                      )}
                      {selectedVideo.time && (
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {selectedVideo.time}
                        </span>
                      )}
                      {selectedVideo.duration && (
                        <span>{selectedVideo.duration}</span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-4">{selectedVideo.description}</p>
                    {selectedVideo.categories && selectedVideo.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedVideo.categories.map((category: string) => (
                          <Badge key={category} className="bg-gray-700 text-gray-200 border-0">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    )}
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
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 px-4 rounded font-medium transition-colors"
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

