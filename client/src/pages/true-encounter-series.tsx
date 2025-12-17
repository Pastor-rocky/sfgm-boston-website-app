import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Play, Eye, X, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState } from "react";
import { Link } from "wouter";
import { getImageUrl } from "@/lib/image-storage";

export default function TrueEncounterSeries() {
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

  // Having a True Encounter Series - 4 episodes
  const trueEncounterEpisodes = [
    {
      id: 1,
      title: "Episode 1: Having a True Encounter",
      date: "Sunday",
      time: "8:30 PM",
      preacher: "Pastor Rocky",
      series: "Having a True Encounter Series",
      description: "Discovering what it means to have a genuine encounter with God that transforms your life.",
      videoUrl: "https://www.instagram.com/p/DQlCKUjjjkF/",
      duration: "45 minutes",
      views: 0,
      categories: ["Encounter", "Relationship", "God"],
      isInstagram: true
    },
    {
      id: 2,
      title: "Episode 2: The Cost of True Discipleship",
      date: "Sunday",
      time: "8:30 PM",
      preacher: "Pastor Rocky",
      series: "Having a True Encounter Series",
      description: "Understanding the commitment and sacrifice required for authentic discipleship in Christ.",
      videoUrl: "https://www.instagram.com/p/DQ3DA95jrQE/",
      duration: "45 minutes",
      views: 0,
      categories: ["Discipleship", "Commitment", "Sacrifice"],
      isInstagram: true
    },
    {
      id: 3,
      title: "Episode 3: Drop The Jar",
      date: "Sunday",
      time: "8:30 PM",
      preacher: "Pastor Rocky",
      series: "Having a True Encounter Series",
      description: "Letting go of what holds you back to fully embrace your encounter with Jesus.",
      videoUrl: "https://www.instagram.com/p/DRJBqwfjt7b/",
      duration: "45 minutes",
      views: 0,
      categories: ["Surrender", "Freedom", "Encounter"],
      isInstagram: true
    },
    {
      id: 4,
      title: "Episode 4: 3 Ways to Encounter Jesus Every Day",
      date: "Sunday",
      time: "8:30 PM",
      preacher: "Pastor Rocky",
      series: "Having a True Encounter Series",
      description: "Practical ways to maintain and deepen your encounter with Jesus in your daily walk.",
      videoUrl: "https://www.instagram.com/p/DRbG1xaDkCX/",
      duration: "45 minutes",
      views: 0,
      categories: ["Daily Walk", "Practical", "Encounter"],
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
            <button className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Past Services
            </button>
          </Link>
        </div>

        {/* Header Section with Cover */}
        <div className="text-center mb-12">
          <div className="max-w-md mx-auto mb-8">
            <img 
              src={getImageUrl('te.jpeg')} 
              alt="Having a True Encounter Series Cover"
              className="w-full rounded-lg shadow-2xl border-4 border-blue-400/30"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <i className="fas fa-dove mr-4 text-blue-400"></i>
            Having a True Encounter Series
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
            A four-week sermon series focused on experiencing genuine encounters with God.
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Discover what it means to have an authentic, life-transforming relationship with the Lord 
            that goes beyond religion to true spiritual connection.
          </p>
        </div>

        {/* Series Info */}
        <div className="text-center mb-8">
          <Card className="bg-blue-900/20 backdrop-blur-sm border-blue-400/30 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                <Badge className="bg-blue-600 text-white border-0 text-sm px-4 py-2">
                  <i className="fas fa-video mr-2"></i>
                  4 Episodes
                </Badge>
                <Badge className="bg-purple-600 text-white border-0 text-sm px-4 py-2">
                  <i className="fas fa-heart mr-2"></i>
                  Encounter & Transformation
                </Badge>
                <Badge className="bg-indigo-600 text-white border-0 text-sm px-4 py-2">
                  <i className="fas fa-clock mr-2"></i>
                  Four-Week Series
                </Badge>
              </div>
              <p className="text-gray-300">
                Each episode explores different aspects of encountering God in a real and meaningful way, 
                helping believers move from religious routine to authentic relationship.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Episodes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {trueEncounterEpisodes.map((episode) => (
            <Card key={episode.id} className="bg-blue-900/20 backdrop-blur-sm border-blue-400/30 hover:bg-blue-900/30 transition-all duration-300 overflow-hidden">
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-slate-800 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 bg-blue-400/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Play className="h-8 w-8 text-blue-400 ml-1" />
                  </div>
                  <p className="text-blue-200 text-sm font-medium">{episode.duration}</p>
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
                      className="bg-blue-600 text-white border-0 text-xs"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
                <div className="text-blue-400 font-medium text-xs">
                  {episode.series}
                </div>
              </CardHeader>

              <CardContent className="space-y-2 pt-0">
                <div className="flex items-center text-gray-300 text-xs">
                  <Calendar className="h-3 w-3 mr-1 text-blue-400" />
                  <span>{episode.date}</span>
                </div>
                
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
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
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
          <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm border-blue-500/30 max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-white text-2xl font-bold mb-4">
                <i className="fas fa-heart mr-2 text-blue-400"></i>
                Join Us This Sunday
              </h3>
              <p className="text-gray-300 text-lg mb-6">
                Experience worship, fellowship, and powerful biblical teaching in person. 
                You're welcome at SFGM Boston regardless of where you are in your faith journey.
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-4">
                <Link href="/contact">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    Get Directions
                  </button>
                </Link>
                <Link href="/bible-school">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    <i className="fas fa-graduation-cap mr-2"></i>
                    Join Bible School
                  </button>
                </Link>
                <Link href="/events">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
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
              Watch {selectedVideo?.title} from Having a True Encounter Series
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
                      <Badge className="bg-blue-600 text-white border-0">
                        {selectedVideo.series}
                      </Badge>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {selectedVideo.date}
                      </span>
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
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded font-medium transition-colors"
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

