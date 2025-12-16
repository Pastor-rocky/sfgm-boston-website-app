import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MessageCircle, Users, Clock, Star, BookOpen, Heart, Hand } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface ForumPost {
  id: number;
  title: string;
  content: string;
  category: "Testimony" | "Study Note" | "Prayer Request";
  courseId: number | null;
  isPinned: boolean;
  likesCount: number;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
  } | null;
  course: {
    id: number;
    name: string;
  } | null;
}

interface ForumStats {
  activeStudents: number;
  questionsAnswered: number;
  prayerRequests: number;
  testimoniesShared: number;
}

export default function DiscussionForum() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "Prayer Request" as const });
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Fetch forum posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<ForumPost[]>({
    queryKey: ["forum-posts", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory === "All" 
        ? "/api/forum/posts" 
        : `/api/forum/posts?category=${selectedCategory}`;
      return apiRequest(url);
    },
  });

  // Fetch forum stats
  const { data: stats } = useQuery<ForumStats>({
    queryKey: ["forum-stats"],
    queryFn: () => apiRequest("/api/forum/stats"),
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: { title: string; content: string; category: string; courseId?: number }) => {
      return apiRequest("/api/forum/posts", {
        method: "POST",
        body: JSON.stringify(postData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      queryClient.invalidateQueries({ queryKey: ["forum-stats"] });
      setNewPost({ title: "", content: "", category: "Prayer Request" });
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest(`/api/forum/posts/${postId}/like`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
    },
  });

  const categories = ["All", "Prayer Request", "Testimony", "Study Note"];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Prayer Request": return <Hand className="w-4 h-4" />;
      case "Testimony": return <Heart className="w-4 h-4" />;
      case "Study Note": return <BookOpen className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Prayer Request": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Testimony": return "bg-green-100 text-green-700 border-green-200";
      case "Study Note": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const handleSubmitPost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    
    createPostMutation.mutate({
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
    });
  };

  const handleLikePost = (postId: number) => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    likePostMutation.mutate(postId);
  };

  const handleJoinDiscussion = (postId: number) => {
    setLocation(`/forum/post/${postId}`);
  };

  const formatAuthorName = (author: ForumPost["author"]) => {
    if (!author) return "Anonymous";
    if (author.firstName && author.lastName) {
      return `${author.firstName} ${author.lastName}`;
    }
    return author.username || "Anonymous";
  };

  const formatTimestamp = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "recently";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold">
                SFGM Study Circle
              </h1>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Connect, Learn, and Grow Together in God's Word
            </p>
            <div className="mt-6 flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Hand className="w-5 h-5" />
                <span>Prayer Requests</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span>Share Testimonies</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>Study Notes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-900">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full justify-start gap-2 ${
                      selectedCategory === category 
                        ? "bg-primary text-white" 
                        : "hover:bg-slate-100"
                    }`}
                  >
                    {getCategoryIcon(category)}
                    {category}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="mt-6 shadow-lg border-0 bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Community Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Active Students</span>
                  <span className="font-bold">{stats?.activeStudents || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Questions Answered</span>
                  <span className="font-bold">{stats?.questionsAnswered || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prayer Requests</span>
                  <span className="font-bold">{stats?.prayerRequests || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Testimonies Shared</span>
                  <span className="font-bold">{stats?.testimoniesShared || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Create New Post */}
            {isAuthenticated && (
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    Share with the Community
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter your post title..."
                      value={newPost.title}
                      onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                      className="flex-1"
                    />
                    <select
                      value={newPost.category}
                      onChange={(e) => setNewPost({...newPost, category: e.target.value as any})}
                      className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                    >
                      <option value="Prayer Request">Prayer Request</option>
                      <option value="Testimony">Testimony</option>
                      <option value="Study Note">Study Note</option>
                    </select>
                  </div>
                  <Textarea
                    placeholder="Share your thoughts, questions, or prayer requests..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    rows={4}
                  />
                  <Button 
                    onClick={handleSubmitPost} 
                    disabled={createPostMutation.isPending}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {createPostMutation.isPending ? "Sharing..." : "Share with Community"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Discussion Posts */}
            <div className="space-y-4">
              {postsLoading ? (
                <Card>
                  <CardContent className="py-8 text-center text-slate-500">
                    Loading posts...
                  </CardContent>
                </Card>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-slate-500">
                    No posts yet. Be the first to share!
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className={`shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow ${post.isPinned ? 'ring-2 ring-yellow-400' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {post.isPinned && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            <Badge className={`${getCategoryColor(post.category)} font-medium`}>
                              {getCategoryIcon(post.category)}
                              <span className="ml-1">{post.category}</span>
                            </Badge>
                            {post.course && (
                              <Badge variant="outline" className="text-xs">
                                {post.course.name}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg text-slate-900 hover:text-primary cursor-pointer">
                            {post.title}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                            <span className="font-medium">{formatAuthorName(post.author)}</span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(post.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-4 leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>
                      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                        <div className="flex gap-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-slate-500 hover:text-primary"
                            onClick={() => handleLikePost(post.id)}
                          >
                            <Heart className="w-4 h-4 mr-1" />
                            {post.likesCount || 0}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-primary">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {post.repliesCount || 0} replies
                          </Button>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleJoinDiscussion(post.id)}
                        >
                          Join Discussion
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
