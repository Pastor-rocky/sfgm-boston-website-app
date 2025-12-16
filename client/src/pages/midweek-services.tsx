import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function MidweekServices() {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [viewedItems, setViewedItems] = useState<Set<string>>(new Set());

  // Load viewed items from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('midweekServices_viewed');
    if (saved) {
      setViewedItems(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save viewed items to localStorage
  const saveViewedItems = (viewed: Set<string>) => {
    localStorage.setItem('midweekServices_viewed', JSON.stringify(Array.from(viewed)));
  };

  // Mark item as viewed
  const markAsViewed = (itemId: string) => {
    const newViewed = new Set(viewedItems);
    newViewed.add(itemId);
    setViewedItems(newViewed);
    saveViewedItems(newViewed);
  };

  // Handle video selection and mark as viewed
  const handleVideoSelect = (videoData: any) => {
    setSelectedVideo(videoData);
    if (videoData.title) {
      markAsViewed(`sermon_${videoData.title}`);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/previous-services-blogs">
            <button className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Previous Services & Blogs
            </button>
          </Link>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <i className="fas fa-book-open mr-4 text-purple-400"></i>
            Midweek Services
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
            Join us for midweek services every Wednesday at 8:00 PM. This is an ongoing sermon series 
            done by the servants of the church titled 'From Genesis to Revelation: Finding Jesus in Every Book of the Bible'.
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Journey through the Word together and be strengthened with worship, teaching, and prayer.
          </p>
        </div>

        {/* Genesis to Revelation Link */}
        <div className="max-w-3xl mx-auto mb-8">
          <Link href="/genesis-to-revelation">
            <Card className="bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-blue-900/40 backdrop-blur-sm border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 cursor-pointer group overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center">
                  {/* Cover Image */}
                  <div className="w-full md:w-48 lg:w-56 relative aspect-video md:aspect-[3/4] md:h-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20"></div>
                    <img 
                      src="/Whisk_a9d6813ad3e9c37877e4536c55cfd0d3dr.jpeg" 
                      alt="From Genesis to Revelation"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-6 md:p-8">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-2xl md:text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">
                        <i className="fas fa-book-bible mr-3 text-purple-400"></i>
                        From Genesis to Revelation
                      </h2>
                      <i className="fas fa-arrow-right text-2xl text-purple-400 group-hover:translate-x-2 transition-transform ml-4 hidden md:block"></i>
                    </div>
                    <p className="text-gray-300 text-lg mb-4 font-semibold">
                      Finding Jesus in Every Book of the Bible
                    </p>
                    <p className="text-gray-400 mb-4">
                      Explore the ongoing sermon series that takes you through every book of the Bible, 
                      discovering how Jesus is revealed throughout the entire Word of God.
                    </p>
                    <i className="fas fa-arrow-right text-xl text-purple-400 group-hover:translate-x-2 transition-transform md:hidden"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Midweek Sermons */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            <i className="fas fa-video mr-3 text-purple-400"></i>
            Recent Midweek Sermons
          </h2>
          <div className="max-w-2xl mx-auto space-y-4">
            <button
              onClick={() => handleVideoSelect({
                title: "The Two Worshipers",
                preacher: "Elder Mitch",
                videoUrl: "https://www.instagram.com/p/DRQ5ntwDkYP/",
                isInstagram: true,
                description: "A powerful message from Elder Mitch"
              })}
              className="w-full text-left"
            >
              <Card className="bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-blue-900/40 backdrop-blur-sm border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 cursor-pointer group overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <i className="fab fa-instagram text-2xl text-pink-400"></i>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                            The Two Worshipers
                          </h3>
                          {viewedItems.has('sermon_The Two Worshipers') && (
                            <Badge className="bg-green-600 text-white border-0 text-xs">
                              <i className="fas fa-check mr-1"></i>
                              Viewed
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">
                        A powerful message from Elder Mitch
                      </p>
                    </div>
                    <Play className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </button>

            <button
              onClick={() => handleVideoSelect({
                title: "Pastor Mario from Germany",
                preacher: "Pastor Mario",
                videoUrl: "https://www.instagram.com/p/DQarn3ljmtn/",
                isInstagram: true,
                description: "A message from Pastor Mario from Germany"
              })}
              className="w-full text-left"
            >
              <Card className="bg-gradient-to-r from-blue-900/40 via-cyan-900/40 to-teal-900/40 backdrop-blur-sm border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 cursor-pointer group overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <i className="fab fa-instagram text-2xl text-pink-400"></i>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                            Pastor Mario from Germany
                          </h3>
                          {viewedItems.has('sermon_Pastor Mario from Germany') && (
                            <Badge className="bg-green-600 text-white border-0 text-xs">
                              <i className="fas fa-check mr-1"></i>
                              Viewed
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">
                        A message from Pastor Mario
                      </p>
                    </div>
                    <Play className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </button>

            <button
              onClick={() => handleVideoSelect({
                title: "If You Want to Grow, You Have to Let Go",
                preacher: "Choir Director Joseph",
                videoUrl: "https://www.instagram.com/p/DQtCSg6jpMc/",
                isInstagram: true,
                description: "A powerful message from Choir Director Joseph"
              })}
              className="w-full text-left"
            >
              <Card className="bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-sm border-indigo-400/30 hover:border-indigo-400/60 transition-all duration-300 cursor-pointer group overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <i className="fab fa-instagram text-2xl text-pink-400"></i>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                            If You Want to Grow, You Have to Let Go
                          </h3>
                          {viewedItems.has('sermon_If You Want to Grow, You Have to Let Go') && (
                            <Badge className="bg-green-600 text-white border-0 text-xs">
                              <i className="fas fa-check mr-1"></i>
                              Viewed
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">
                        A powerful message from Choir Director Joseph
                      </p>
                    </div>
                    <Play className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </button>

            <button
              onClick={() => handleVideoSelect({
                title: "The Armor",
                preacher: "Deacon Derek",
                videoUrl: "https://www.instagram.com/p/DOufNLFjti8/",
                isInstagram: true,
                description: "A powerful message from Deacon Derek"
              })}
              className="w-full text-left"
            >
              <Card className="bg-gradient-to-r from-amber-900/40 via-orange-900/40 to-red-900/40 backdrop-blur-sm border-amber-400/30 hover:border-amber-400/60 transition-all duration-300 cursor-pointer group overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <i className="fab fa-instagram text-2xl text-pink-400"></i>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                            The Armor
                          </h3>
                          {viewedItems.has('sermon_The Armor') && (
                            <Badge className="bg-green-600 text-white border-0 text-xs">
                              <i className="fas fa-check mr-1"></i>
                              Viewed
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">
                        A powerful message from Deacon Derek
                      </p>
                    </div>
                    <Play className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </button>

            <button
              onClick={() => handleVideoSelect({
                title: "Have Faith",
                preacher: "Deacon Derek",
                videoUrl: "https://www.instagram.com/p/DR01Zzf",
                isInstagram: true,
                description: "A powerful message from Deacon Derek"
              })}
              className="w-full text-left"
            >
              <Card className="bg-gradient-to-r from-green-900/40 via-emerald-900/40 to-teal-900/40 backdrop-blur-sm border-green-400/30 hover:border-green-400/60 transition-all duration-300 cursor-pointer group overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <i className="fab fa-instagram text-2xl text-pink-400"></i>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-green-300 transition-colors">
                            Have Faith
                          </h3>
                          {viewedItems.has('sermon_Have Faith') && (
                            <Badge className="bg-green-600 text-white border-0 text-xs">
                              <i className="fas fa-check mr-1"></i>
                              Viewed
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">
                        A powerful message from Deacon Derek
                      </p>
                    </div>
                    <Play className="h-5 w-5 text-green-400 group-hover:scale-110 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </button>
          </div>
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
              Watch {selectedVideo?.title} from Midweek Services
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
                      {selectedVideo.preacher && (
                        <span className="flex items-center">
                          <i className="fas fa-user mr-1"></i>
                          {selectedVideo.preacher}
                        </span>
                      )}
                    </div>
                    {selectedVideo.description && (
                      <p className="text-gray-300 mb-4">{selectedVideo.description}</p>
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

