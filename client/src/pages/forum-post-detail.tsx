import { useState } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart, MessageCircle, Clock, BookOpen, Hand } from "lucide-react";
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

interface ForumReply {
  id: number;
  postId: number;
  authorId: string;
  content: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
  } | null;
}

export default function ForumPostDetail() {
  const [, params] = useRoute<{ postId: string }>("/forum/post/:postId");
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState("");

  const postId = params?.postId ? parseInt(params.postId) : null;

  // Fetch post
  const { data: post, isLoading: postLoading } = useQuery<ForumPost>({
    queryKey: ["forum-post", postId],
    queryFn: () => apiRequest(`/api/forum/posts/${postId}`),
    enabled: !!postId,
  });

  // Fetch replies
  const { data: replies = [], isLoading: repliesLoading } = useQuery<ForumReply[]>({
    queryKey: ["forum-replies", postId],
    queryFn: () => apiRequest(`/api/forum/posts/${postId}/replies`),
    enabled: !!postId,
  });

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("/api/forum/replies", {
        method: "POST",
        body: JSON.stringify({ postId, content }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-replies", postId] });
      queryClient.invalidateQueries({ queryKey: ["forum-post", postId] });
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      setReplyContent("");
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/forum/posts/${postId}/like`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-post", postId] });
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
    },
  });

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    createReplyMutation.mutate(replyContent);
  };

  const handleLikePost = () => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    likePostMutation.mutate();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Prayer Request": return <Hand className="w-4 h-4" />;
      case "Testimony": return <Heart className="w-4 h-4" />;
      case "Study Note": return <BookOpen className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
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

  const formatAuthorName = (author: ForumPost["author"] | ForumReply["author"]) => {
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

  if (postLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-8 text-center text-slate-500">
              Loading post...
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-slate-500 mb-4">Post not found</p>
              <Button onClick={() => setLocation("/discussion-forum")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Forum
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          onClick={() => setLocation("/discussion-forum")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Forum
        </Button>

        {/* Main Post */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
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
            <CardTitle className="text-2xl text-slate-900">{post.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
              <span className="font-medium">{formatAuthorName(post.author)}</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimestamp(post.createdAt)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
            <div className="flex gap-4 pt-3 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-primary"
                onClick={handleLikePost}
              >
                <Heart className="w-4 h-4 mr-1" />
                {post.likesCount || 0}
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-primary">
                <MessageCircle className="w-4 h-4 mr-1" />
                {post.repliesCount || 0} replies
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reply Form */}
        {isAuthenticated && (
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Add a Reply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Share your thoughts..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={4}
              />
              <Button
                onClick={handleSubmitReply}
                disabled={createReplyMutation.isPending || !replyContent.trim()}
                className="w-full"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {createReplyMutation.isPending ? "Posting..." : "Post Reply"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Replies */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
          </h2>
          
          {repliesLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-slate-500">
                Loading replies...
              </CardContent>
            </Card>
          ) : replies.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-slate-500">
                No replies yet. Be the first to respond!
              </CardContent>
            </Card>
          ) : (
            replies.map((reply) => (
              <Card key={reply.id} className="shadow-md border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                    <span className="font-medium text-slate-900">{formatAuthorName(reply.author)}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(reply.createdAt)}
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {reply.content}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

