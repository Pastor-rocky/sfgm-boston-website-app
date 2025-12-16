import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Play, Eye, X, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState, useEffect } from "react";
import { Link } from "wouter";

export default function PastServices() {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [viewedItems, setViewedItems] = useState<Set<string>>(new Set());

  // Load viewed items from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('pastServices_viewed');
    if (saved) {
      setViewedItems(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save viewed items to localStorage
  const saveViewedItems = (viewed: Set<string>) => {
    localStorage.setItem('pastServices_viewed', JSON.stringify(Array.from(viewed)));
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

  // Handle series link click and mark as viewed
  const handleSeriesClick = (seriesId: string) => {
    markAsViewed(`series_${seriesId}`);
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
  // Services will be added here
  const watchmenSeries: any[] = [];
  const pastServices: any[] = [];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Prayer': 'bg-blue-500',
      'Faith': 'bg-green-500',
      'Trials': 'bg-red-500',
      'Purpose': 'bg-purple-500',
      'Calling': 'bg-indigo-500',
      'Direction': 'bg-yellow-500',
      'Worship': 'bg-pink-500',
      'Spirit': 'bg-teal-500',
      'Truth': 'bg-orange-500',
      'Foundation': 'bg-gray-500',
      'Word': 'bg-blue-600',
      'Love': 'bg-red-400',
      'Action': 'bg-green-600',
      'Service': 'bg-amber-500',
      'Grace': 'bg-purple-600',
      'Transformation': 'bg-indigo-600',
      'Mercy': 'bg-pink-600'
    };
    return colors[category] || 'bg-slate-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <i className="fas fa-church mr-4 text-amber-400"></i>
            Previous Sunday Services
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Catch up on recent Sunday worship services and powerful messages from Pastor Rocky. 
            Each service is filled with biblical truth, inspiration, and practical life application.
          </p>
        </div>

        {/* Contact Information */}
        <div className="text-center mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-white text-lg font-semibold mb-4">
                <i className="fas fa-info-circle mr-2 text-blue-400"></i>
                Service Information
              </h3>
              <p className="text-gray-300 mb-4">
                Join us live every Sunday at 7:30 PM for worship, fellowship, and powerful biblical teaching.
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-4">
                <a 
                  href="tel:617-512-7451"
                  className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
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

        {/* Watchmen Series Featured Link */}
        <div className="mb-8">
          <div className="max-w-3xl mx-auto">
            <Link href="/watchmen-series" onClick={() => handleSeriesClick('watchmen-series')}>
              <Card className="bg-gradient-to-r from-amber-900/40 via-orange-900/40 to-red-900/40 backdrop-blur-sm border-amber-400/30 hover:border-amber-400/60 transition-all duration-300 cursor-pointer group overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-center">
                    {/* Cover Image */}
                    <div className="w-full md:w-40 lg:w-48 relative aspect-video md:aspect-[3/4] md:h-auto">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-orange-600/20"></div>
                      <img 
                        src="/Watchmen Logo.jpeg" 
                        alt="The Watchmen Series Cover"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-4 md:p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-amber-600 text-white border-0 text-xs px-2 py-0.5">
                            <i className="fas fa-eye mr-1"></i>
                            Featured Series
                          </Badge>
                          {viewedItems.has('series_watchmen-series') && (
                            <Badge className="bg-green-600 text-white border-0 text-xs px-2 py-0.5">
                              <i className="fas fa-check mr-1"></i>
                              Viewed
                            </Badge>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-amber-400 group-hover:translate-x-2 transition-transform" />
                      </div>
                      
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                        <i className="fas fa-shield-alt mr-2 text-amber-400"></i>
                        The Watchmen Series
                      </h2>
                      
                      <p className="text-gray-300 text-sm mb-3 leading-relaxed line-clamp-2">
                        An eight-part sermon series exploring the biblical calling of watchmen in these last days. 
                        Join Pastor Rocky as he shares urgent messages about spiritual vigilance and prophecy.
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <Badge className="bg-orange-600/50 text-white border-0 text-xs">Prophecy</Badge>
                        <Badge className="bg-orange-600/50 text-white border-0 text-xs">End Times</Badge>
                        <Badge className="bg-orange-600/50 text-white border-0 text-xs">Vigilance</Badge>
                      </div>
                      
                      <div className="flex items-center text-amber-300 font-semibold text-sm mt-2">
                        <span>View Series</span>
                        <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Having a True Encounter Series Featured Link */}
        <div className="mb-8">
          <div className="max-w-3xl mx-auto">
            <Link href="/true-encounter-series" onClick={() => handleSeriesClick('true-encounter-series')}>
              <Card className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-indigo-900/40 backdrop-blur-sm border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 cursor-pointer group overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-center">
                    {/* Cover Image */}
                    <div className="w-full md:w-40 lg:w-48 relative aspect-video md:aspect-[3/4] md:h-auto">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
                      <img 
                        src="/te.jpeg" 
                        alt="Having a True Encounter Series Cover"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-4 md:p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-600 text-white border-0 text-xs px-2 py-0.5">
                            <i className="fas fa-heart mr-1"></i>
                            Featured Series
                          </Badge>
                          {viewedItems.has('series_true-encounter-series') && (
                            <Badge className="bg-green-600 text-white border-0 text-xs px-2 py-0.5">
                              <i className="fas fa-check mr-1"></i>
                              Viewed
                            </Badge>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-blue-400 group-hover:translate-x-2 transition-transform" />
                      </div>
                      
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                        <i className="fas fa-dove mr-2 text-blue-400"></i>
                        Having a True Encounter Series
                      </h2>
                      
                      <p className="text-gray-300 text-sm mb-3 leading-relaxed line-clamp-2">
                        A four-week sermon series focused on experiencing genuine encounters with God. 
                        Discover what it means to have an authentic, life-transforming relationship with the Lord.
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <Badge className="bg-purple-600/50 text-white border-0 text-xs">Encounter</Badge>
                        <Badge className="bg-purple-600/50 text-white border-0 text-xs">Transformation</Badge>
                        <Badge className="bg-purple-600/50 text-white border-0 text-xs">Spiritual Growth</Badge>
                      </div>
                      
                      <div className="flex items-center text-blue-300 font-semibold text-sm mt-2">
                        <span>View Series</span>
                        <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Perception Sermon Series Featured Link */}
        <div className="mb-8">
          <div className="max-w-3xl mx-auto">
            <Link href="/perception-series" onClick={() => handleSeriesClick('perception-series')}>
              <Card className="bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-violet-900/40 backdrop-blur-sm border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 cursor-pointer group overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-center">
                    {/* Cover Image */}
                    <div className="w-full md:w-40 lg:w-48 relative aspect-video md:aspect-[3/4] md:h-auto">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20"></div>
                      <img 
                        src="/pss.jpeg" 
                        alt="Perception Sermon Series Cover"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-4 md:p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-600 text-white border-0 text-xs px-2 py-0.5">
                            <i className="fas fa-star mr-1"></i>
                            Featured Series
                          </Badge>
                          {viewedItems.has('series_perception-series') && (
                            <Badge className="bg-green-600 text-white border-0 text-xs px-2 py-0.5">
                              <i className="fas fa-check mr-1"></i>
                              Viewed
                            </Badge>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-purple-400 group-hover:translate-x-2 transition-transform" />
                      </div>
                      
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                        <i className="fas fa-eye mr-2 text-purple-400"></i>
                        Perception Sermon Series
                      </h2>
                      
                      <p className="text-gray-300 text-sm mb-3 leading-relaxed line-clamp-2">
                        A two-part featured series exploring perception and its impact on our spiritual journey. 
                        The first installment in this new featured series.
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <Badge className="bg-indigo-600/50 text-white border-0 text-xs">Perception</Badge>
                        <Badge className="bg-indigo-600/50 text-white border-0 text-xs">Featured Series</Badge>
                        <Badge className="bg-indigo-600/50 text-white border-0 text-xs">Two-Part</Badge>
                      </div>
                      
                      <div className="flex items-center text-purple-300 font-semibold text-sm mt-2">
                        <span>View Series</span>
                        <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Single Sermon Links */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            <i className="fas fa-video mr-3 text-blue-400"></i>
            Recent Sermons
          </h2>
          <div className="max-w-2xl mx-auto space-y-4">
            <button
              onClick={() => handleVideoSelect({
                title: "The Wedding",
                preacher: "Pastor Rocky",
                videoUrl: "https://www.instagram.com/p/DO4wkTQERq1/",
                isInstagram: true
              })}
              className="w-full text-left"
            >
              <Card className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-indigo-900/40 backdrop-blur-sm border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 cursor-pointer group overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <i className="fab fa-instagram text-2xl text-pink-400"></i>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                            The Wedding
                          </h3>
                          {viewedItems.has('sermon_The Wedding') && (
                            <Badge className="bg-green-600 text-white border-0 text-xs">
                              <i className="fas fa-check mr-1"></i>
                              Viewed
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Watch this powerful sermon from Pastor Rocky
                      </p>
                    </div>
                    <Play className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </button>
            
            <button
              onClick={() => handleVideoSelect({
                title: "Why the Blood",
                preacher: "Elder Mitch",
                videoUrl: "https://www.instagram.com/p/DPKtWOwEVTu/",
                isInstagram: true
              })}
              className="w-full text-left"
            >
              <Card className="bg-gradient-to-r from-red-900/40 via-orange-900/40 to-amber-900/40 backdrop-blur-sm border-red-400/30 hover:border-red-400/60 transition-all duration-300 cursor-pointer group overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <i className="fab fa-instagram text-2xl text-pink-400"></i>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-red-300 transition-colors">
                            Why the Blood
                          </h3>
                          {viewedItems.has('sermon_Why the Blood') && (
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
                    <Play className="h-5 w-5 text-red-400 group-hover:scale-110 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </button>

            <button
              onClick={() => handleVideoSelect({
                title: "The Fall",
                preacher: "Elder Paul",
                videoUrl: "https://www.instagram.com/p/DRtI4idjiCD/",
                isInstagram: true
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
                            The Fall
                          </h3>
                          {viewedItems.has('sermon_The Fall') && (
                            <Badge className="bg-green-600 text-white border-0 text-xs">
                              <i className="fas fa-check mr-1"></i>
                              Viewed
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">
                        A powerful message from Elder Paul
                      </p>
                    </div>
                    <Play className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </button>

            <button
              onClick={() => handleVideoSelect({
                title: "To be forgiven you have to forgive",
                preacher: "Elder Mitch",
                videoUrl: "https://www.instagram.com/p/DPcwflLjvWb/",
                isInstagram: true
              })}
              className="w-full text-left"
            >
              <Card className="bg-gradient-to-r from-green-900/40 via-teal-900/40 to-cyan-900/40 backdrop-blur-sm border-green-400/30 hover:border-green-400/60 transition-all duration-300 cursor-pointer group overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <i className="fab fa-instagram text-2xl text-pink-400"></i>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-green-300 transition-colors">
                            To be forgiven you have to forgive
                          </h3>
                          {viewedItems.has('sermon_To be forgiven you have to forgive') && (
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
                    <Play className="h-5 w-5 text-green-400 group-hover:scale-110 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </button>

            <button
              onClick={() => handleVideoSelect({
                title: "Are you willing to suffer?",
                preacher: "Pastor Rocky",
                videoUrl: "https://www.instagram.com/p/DQA3yxQDo2b/",
                isInstagram: true
              })}
              className="w-full text-left"
            >
              <Card className="bg-gradient-to-r from-amber-900/40 via-yellow-900/40 to-orange-900/40 backdrop-blur-sm border-amber-400/30 hover:border-amber-400/60 transition-all duration-300 cursor-pointer group overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <i className="fab fa-instagram text-2xl text-pink-400"></i>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                            Are you willing to suffer?
                          </h3>
                          {viewedItems.has('sermon_Are you willing to suffer?') && (
                            <Badge className="bg-green-600 text-white border-0 text-xs">
                              <i className="fas fa-check mr-1"></i>
                              Viewed
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">
                        A powerful message from Pastor Rocky
                      </p>
                    </div>
                    <Play className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </button>

            <button
              onClick={() => handleVideoSelect({
                title: "Psalms 23",
                preacher: "Pursue Conference",
                videoUrl: "https://www.instagram.com/p/DQsEHQ4EoV6/",
                isInstagram: true
              })}
              className="w-full text-left"
            >
              <Card className="bg-gradient-to-r from-pink-900/40 via-rose-900/40 to-fuchsia-900/40 backdrop-blur-sm border-pink-400/30 hover:border-pink-400/60 transition-all duration-300 cursor-pointer group overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <i className="fab fa-instagram text-2xl text-pink-400"></i>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-pink-300 transition-colors">
                            Psalms 23
                          </h3>
                          {viewedItems.has('sermon_Psalms 23') && (
                            <Badge className="bg-green-600 text-white border-0 text-xs">
                              <i className="fas fa-check mr-1"></i>
                              Viewed
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">
                        A powerful message from Pursue Conference
                      </p>
                    </div>
                    <Play className="h-5 w-5 text-pink-400 group-hover:scale-110 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </button>
          </div>
        </div>

        {/* Services sections will be added here */}

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm border-purple-500/30 max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-white text-2xl font-bold mb-4">
                <i className="fas fa-heart mr-2 text-red-400"></i>
                Join Us This Sunday
              </h3>
              <p className="text-gray-300 text-lg mb-6">
                Experience worship, fellowship, and powerful biblical teaching in person. 
                You're welcome at SFGM Boston regardless of where you are in your faith journey.
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-4">
                <a 
                  href="/contact"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  Get Directions
                </a>
                <a 
                  href="/bible-school"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <i className="fas fa-graduation-cap mr-2"></i>
                  Join Bible School
                </a>
                <a 
                  href="/events"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <i className="fas fa-calendar mr-2"></i>
                  View All Events  
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      {/* Video Modal - YouTube or Instagram */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="w-[95vw] max-w-5xl max-h-[95vh] p-0 overflow-hidden bg-black">
          <VisuallyHidden>
            <DialogTitle>
              {selectedVideo?.title}
            </DialogTitle>
          </VisuallyHidden>
          <VisuallyHidden>
            <DialogDescription>
              Watch {selectedVideo?.title}
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
                      {selectedVideo.series && (
                        <Badge className="bg-amber-600 text-white border-0">
                          {selectedVideo.series}
                        </Badge>
                      )}
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
                    {selectedVideo.description && (
                      <p className="text-gray-300 mb-4">{selectedVideo.description}</p>
                    )}
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