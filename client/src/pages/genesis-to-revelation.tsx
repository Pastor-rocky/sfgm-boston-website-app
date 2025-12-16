import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, X, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState } from "react";
import { Link } from "wouter";

export default function GenesisToRevelation() {
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

  // Genesis videos (grouped in sets of 4)
  const genesisVideos = [
    {
      id: 1,
      title: "Genesis - Part 1",
      videoUrl: "https://www.instagram.com/p/DK0yEF3OedM/",
      isInstagram: true
    },
    {
      id: 2,
      title: "Genesis - Part 2",
      videoUrl: "https://www.instagram.com/p/DLGxVJpuNx2/",
      isInstagram: true
    },
    {
      id: 3,
      title: "Genesis - Part 3",
      videoUrl: "https://www.instagram.com/p/DLq0DgMOhLl/",
      isInstagram: true
    },
    {
      id: 4,
      title: "Genesis - Part 4",
      videoUrl: "https://www.instagram.com/p/DL843OBO7Fe/",
      isInstagram: true
    },
    {
      id: 5,
      title: "Genesis - Part 5",
      videoUrl: "https://www.instagram.com/p/DMg4ChfO1XG/",
      isInstagram: true
    },
    {
      id: 6,
      title: "Genesis - Part 6",
      videoUrl: "https://www.instagram.com/p/DONApWsDn9J/",
      isInstagram: true
    },
    {
      id: 7,
      title: "Genesis - Part 7",
      videoUrl: "https://www.instagram.com/p/DPSmcmjjnxJ/",
      isInstagram: true
    },
    {
      id: 8,
      title: "Genesis - Part 8",
      videoUrl: "https://www.instagram.com/p/DPklWfFjoNb/",
      isInstagram: true
    },
    {
      id: 9,
      title: "Genesis - Part 9",
      videoUrl: "https://www.instagram.com/p/DP2mzDnDqrN/",
      isInstagram: true
    },
    {
      id: 10,
      title: "Genesis - Part 10",
      videoUrl: "https://www.instagram.com/p/DQ-y8PujjPd/",
      isInstagram: true
    }
  ];

  // Group Genesis videos into sets of 4
  const groupVideos = (videos: any[], groupSize: number = 4) => {
    const groups = [];
    for (let i = 0; i < videos.length; i += groupSize) {
      groups.push(videos.slice(i, i + groupSize));
    }
    return groups;
  };

  const genesisGroups = groupVideos(genesisVideos, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/midweek-services">
            <button className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Midweek Services
            </button>
          </Link>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="max-w-md mx-auto mb-8">
            <img 
              src="/Whisk_a9d6813ad3e9c37877e4536c55cfd0d3dr.jpeg" 
              alt="From Genesis to Revelation - Finding Jesus in Every Book of the Bible"
              className="w-full rounded-lg shadow-2xl border-4 border-purple-400/30"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <i className="fas fa-book-bible mr-4 text-purple-400"></i>
            From Genesis to Revelation
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
            Finding Jesus in Every Book of the Bible
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Journey through the Word together and discover how Jesus is revealed throughout the entire Bible.
          </p>
        </div>

        {/* Genesis Book Section */}
        <div className="space-y-8 mb-12">
          <div className="text-left">
            <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-4">
              📖 Genesis
            </h2>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 inline-block">
              <p className="text-white text-sm font-medium">
                Finding Jesus in the Book of Genesis
              </p>
            </div>
          </div>
          
          {/* Display Genesis videos in groups of 4 */}
          {genesisGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4">
              <h3 className="text-xl font-semibold text-white">
                Group {groupIndex + 1}
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {group.map((video) => (
                  <Card key={video.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-purple-900/20 backdrop-blur-sm border-purple-400/30">
                    <div className="relative" onClick={() => setSelectedVideo(video)}>
                      <div className="aspect-video bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-50 transition-colors">
                          <div className="bg-red-600 rounded-full p-4 text-white">
                            <Play className="h-8 w-8 ml-1" />
                          </div>
                        </div>
                        <div className="text-center text-white z-10">
                          <i className="fab fa-instagram text-4xl mb-2"></i>
                          <p className="text-sm font-medium">Instagram Video</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg text-white mb-3">{video.title}</h3>
                      <button 
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium transition-colors flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVideo(video);
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Watch Video
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Service Information */}
        <div className="text-center mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-white text-lg font-semibold mb-4">
                <i className="fas fa-info-circle mr-2 text-purple-400"></i>
                Service Information
              </h3>
              <p className="text-gray-300 mb-4">
                Join us live every Wednesday at 8:00 PM for midweek services. 
                This ongoing series is taught by the servants of the church.
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-4">
                <a 
                  href="tel:617-512-7451"
                  className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
                >
                  <i className="fas fa-phone mr-2"></i>
                  617-512-7451
                </a>
                <a 
                  href="mailto:pastor_rocky@sfgmboston.com"
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  <i className="fas fa-envelope mr-2"></i>
                  pastor_rocky@sfgmboston.com
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-purple-500/30 max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-white text-2xl font-bold mb-4">
                <i className="fas fa-heart mr-2 text-purple-400"></i>
                Join Us This Wednesday
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
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
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
              Watch {selectedVideo?.title} from Genesis to Revelation
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
