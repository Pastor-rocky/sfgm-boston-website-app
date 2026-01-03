import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocation } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { FaBook, FaEye, FaUser, FaCalendar, FaGraduationCap, FaTimes, FaBookmark, FaCheck, FaPlus, FaBookOpen } from "react-icons/fa";
import CoursePasswordPrompt, { COURSE_PASSWORDS } from "@/components/course-password-prompt";
// import growCover from "@assets/image_1753296696582.png";
// import studyingForServiceCover from "@assets/Image 2_1753137106145.jpg";
// import dontBeAJonahCover from "@assets/Image_1753137060328.jpg";
// import levelUpLeadershipCover from "@assets/IMG_71A7B1E06669-1_1753328914119.jpeg";
// import fireStarterCover from "@assets/IMG_3701_1753137083261.jpeg";
// import powerOfPreachingCover from "@assets/81bGwIcnEHL_1753329077040.jpg";
// import newWatchmenProjectCover from "@assets/image_1753329726336.png";
// import newProphecyCover from "@assets/image_1753330427185.png";
// import newTheologyCover from "@assets/image_1753330614352.png";
// import newManOfGodCover from "@assets/image_1753330714244.png";
// import manOfGodCourseCover from "/man-of-god-course-cover.webp";
// import watchmenProjectCover from "/watchmen-project-cover.webp";
// import theology101Cover from "/theology-101-cover.webp";
// import introProphecyCover from "/introduction-to-prophecy-cover.jpg";

interface Textbook {
  id: number;
  title: string;
  author: string;
  description: string;
  bookCoverUrl?: string;
  category: string;
  difficulty: string;
  chapterCount: number;
  estimatedReadingTime: string;
  isComplete: boolean;
  courseId: number;
  courseName: string;
  isUpdated?: boolean;
}

export default function TextbookCatalog() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [selectedTextbook, setSelectedTextbook] = useState<Textbook | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("course");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [passwordCourseId, setPasswordCourseId] = useState<number | null>(null);
  const [passwordCourseName, setPasswordCourseName] = useState<string>("");

  // Get user's personal library to check which books are already added
  const { data: personalLibraryResponse } = useQuery<{ books: any[] }>({
    queryKey: ['/api/personal-library'],
    enabled: isAuthenticated,
  });

  const personalLibrary = personalLibraryResponse?.books || [];

  // Fetch enrollments to check if student is enrolled in courses
  const { data: enrollments = [] } = useQuery({
    queryKey: ['/api/enrollments/student'],
    enabled: isAuthenticated,
  });

  // Helper function to check if student is enrolled in a course
  const isEnrolledInCourse = (courseId: number) => {
    if (!isAuthenticated || !enrollments || !Array.isArray(enrollments)) return false;
    return (enrollments as any[]).some((e: any) => e.courseId === courseId && e.status === 'active');
  };

  // Add book to personal library mutation
  const addToLibraryMutation = useMutation({
    mutationFn: async (bookData: any) => {
      const response = await apiRequest('POST', '/api/personal-library', {
        bookData: {
          title: bookData.title,
          author: bookData.author,
          category: bookData.category,
          description: bookData.description,
          difficulty: bookData.difficulty,
          estimatedReadingTime: bookData.estimatedReadingTime,
          rating: bookData.rating,
          coverColor: bookData.coverColor,
          readingStatus: bookData.readingStatus,
          priority: bookData.priority,
          coverUrl: bookData.bookCoverUrl
        }
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/personal-library'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add book to library",
        variant: "destructive",
      });
    },
  });

  // Fetch all available textbooks
  const { data: textbooks, isLoading, error } = useQuery({
    queryKey: ['/api/textbooks'],
    queryFn: async () => {
      // Fetch courses from database - they now use IDs 1-8 directly
      const response = await fetch('/api/courses');
      const courses = await response.json();
      
      // Create ordered textbooks array - display in course ID order 1-8
      const completeTextbooks: Textbook[] = [];
      
      // Course 1: "Acts In Action Course" (database ID 1)
      const actsCourse = courses.find((c: any) => c.id === 1);
      if (actsCourse) {
        completeTextbooks.push({
          id: 1, // Display order 1
          title: "Acts in Action",
          author: "SFGM Boston",
          description: "A comprehensive study of the Book of Acts focusing on how the early church received power and acted on faith. Learn how to receive the same power that transformed the disciples and discover how to put your faith into action for the Kingdom of God.",
          bookCoverUrl: "/acts-in-action-cover.png",
          category: "Bible Study",
          difficulty: "Intermediate",
          chapterCount: actsCourse.duration || 8,
          estimatedReadingTime: "3-4 hours",
          isComplete: true, // Content available
          courseId: 1, // Maps to courseId = 1 for complete-book-reader
          courseName: "Acts in Action",
          isUpdated: actsCourse.isUpdated || false
        });
      }

      // Course 2: "Becoming a Fire Starter" textbook (database ID 2)
      const fireStarterCourse = courses.find((c: any) => c.id === 2);
      if (fireStarterCourse) {
        completeTextbooks.push({
          id: 2, // Display order 2
          title: "Becoming a Fire Starter",
          author: "Bishop Anthony Lee",
          description: "If you are tired of burning low and burning out, this is the book for you. Becoming a Fire Starter will instill in your walk of discipleship seven powerful principles that will enable you to not only be filled with the fire of the Holy Spirit, but to remain burning with passion for the Gospel of Jesus Christ and lost people. You should only read this book if you want your life changed by the fire of God!",
          bookCoverUrl: "/fire-starter-cover.jpg",
          category: "Ministry",
          difficulty: "Intermediate",
          chapterCount: fireStarterCourse.duration || 11,
          estimatedReadingTime: "2-3 hours",
          isComplete: true, // All 11 chapters complete and functional
          courseId: 2, // Maps to courseId = 2 for complete-book-reader
          courseName: "Becoming a Fire Starter",
          isUpdated: fireStarterCourse.isUpdated || false
        });
      }
      
      // Course 3: "Don't Be A Jonah" textbook (database ID 3)
      const jonahCourse = courses.find((c: any) => c.id === 3);
      if (jonahCourse) {
        completeTextbooks.push({
          id: 3, // Display order 3
          title: "Don't Be A Jonah",
          author: "Bishop Anthony Lee",
          description: "Bishop Anthony Lee's sixth book is filled with compassion and urgency to encourage all those who are running from the call that God has for their life, so they would submit to the plans God has for them and no longer deal with the unnecessary storms that plague us when we rebel against the will of God. He uses the story of the famous character of Jonah to bring about practical life applications for God's people so they won't be swallowed up by the deception of this world. He also incorporates real life events that have been happening in modern-day times regarding the terrorist group Isis blowing up the tomb of Jonah and what some people called the Jonah eclipse.",
          bookCoverUrl: "/dont-be-a-jonah-cover.jpg",
          category: "Biblical Studies",
          difficulty: "Intermediate",
          chapterCount: jonahCourse.duration || 11,
          estimatedReadingTime: "3-4 hours",
          isComplete: false, // Content to be added manually
          courseId: 3, // Maps to courseId = 3 for complete-book-reader
          courseName: "Don't Be A Jonah",
          isUpdated: jonahCourse.isUpdated || false
        });
      }

      // Course 4: G.R.O.W Beginner Course textbook (database ID 4)
      const growCourse = courses.find((c: any) => c.id === 4);
      if (growCourse) {
        completeTextbooks.push({
          id: 4, // Display order 4
          title: "GROW",
          author: "SFGM Orlando",
          description: "GROWing ourselves, to READ the Word, to obey God's calling, to win souls for the Kingdom. 4-week conference materials covering GIVE (Time, Talents, Treasure), READ (Daily Devotions), OBEY (Biblical Obedience), and WIN SOULS (Evangelism). Essential foundation for ministry leadership and spiritual growth.",
          bookCoverUrl: "/grow-cover.png",
          category: "Ministry Leadership",
          difficulty: "Beginner",
          chapterCount: 4,
          estimatedReadingTime: "1-2 hours",
          isComplete: true, // All 4 weeks complete and functional
          courseId: 4, // Maps to courseId = 4 for complete-book-reader
          courseName: "GROW",
          isUpdated: true
        });
      }

      // Course 5: "Studying for Service" textbook (database ID 5)
      const studyingCourse = courses.find((c: any) => c.id === 5);
      if (studyingCourse) {
        completeTextbooks.push({
          id: 5, // Display order 5
          title: "Studying for Service",
          author: "Bishop Anthony Lee",
          description: "The More You Know Your Text, The More People Will Know Their God. Master effective Bible study methods and develop skills for lifelong spiritual growth and ministry preparation.",
          bookCoverUrl: "/studying-for-service-cover.jpg",
          category: "Biblical Studies",
          difficulty: "Intermediate",
          chapterCount: 14, // 14 complete chapters: Dedication + Introduction + Chapters 1-11 + Conclusion
          estimatedReadingTime: "4-5 hours",
          isComplete: true, // All 14 chapters restored and complete
          courseId: 5, // Maps to courseId = 5 for complete-book-reader
          courseName: "Studying for Service",
          isUpdated: studyingCourse.isUpdated || false
        });
      }

      // Course 6: "Deaconship Course" textbook (database ID 6)
      const deaconCourse = courses.find((c: any) => c.id === 6);
      if (deaconCourse) {
        completeTextbooks.push({
          id: 6, // Display order 6
          title: "Deacon Course",
          author: "SFGM Boston Ministry",
          description: "A Spirit-appointed, servant-hearted leadership training course. This comprehensive 5-week course equips you to execute the practical ministry of the church, acting as a conduit of God's love and provision to His people. Learn to discern your calling, build a biblical foundation, serve in power, stand firm in spiritual warfare, and step into lifelong commissioned impact.",
          bookCoverUrl: "/deacon-course-cover.png",
          category: "Ministry Leadership",
          difficulty: "Intermediate",
          chapterCount: 5,
          estimatedReadingTime: "3-4 hours",
          isComplete: true, // All 5 chapters complete with audio and complete e-book
          courseId: 6, // Maps to courseId = 6 for complete-book-reader
          courseName: "Deacon Course",
          isUpdated: deaconCourse.isUpdated || false
        });
      }

      // Course 7: "Level Up Leadership" textbook (database ID 7)
      const levelUpCourse = courses.find((c: any) => c.id === 7);
      if (levelUpCourse) {
        completeTextbooks.push({
          id: 7,
          title: "Level Up Leadership",
          author: "John Maxwell & Bishop Anthony Lee",
          description: "The SFGM Level Up leadership class is an in depth 7 week course that will teach you how to lead better by serving more. This course will be taught by Bishop Anthony Lee as he breaks down each level of leadership with all its biblical principles, application and truths.",
          bookCoverUrl: "/level-up-leadership-cover.png",
          category: "Leadership Development",
          difficulty: "Advanced",
          chapterCount: levelUpCourse.duration || 7,
          estimatedReadingTime: "6-8 hours",
          isComplete: false,
          courseId: 7,
          courseName: "Level Up Leadership",
          isUpdated: levelUpCourse.isUpdated || false
        });
      }

      // Course 8: "Youth Ministry Course" textbook (database ID 8)
      const youthCourse = courses.find((c: any) => c.id === 8);
      if (youthCourse) {
        completeTextbooks.push({
          id: 8,
          title: "Youth Ministry Course",
          author: "SFGM Boston University",
          description: "A 5-chapter foundational course for youth ministry development and discipleship. Learn the calling, requirements, responsibilities, accountability, and disciple-making strategies needed for effective youth ministry.",
          bookCoverUrl: "/sfgm-youth-ministry-cover.png",
          category: "Ministry Leadership",
          difficulty: "Beginner",
          chapterCount: youthCourse.duration || 5,
          estimatedReadingTime: "2-3 hours",
          isComplete: true,
          courseId: 8,
          courseName: "Youth Ministry Course",
          isUpdated: youthCourse.isUpdated || false
        });
      }

      // Course 9: "Theology 101" textbook (not in database yet - coming soon)
      const theologyCourse = courses.find((c: any) => c.id === 9);
      if (theologyCourse) {
        completeTextbooks.push({
          id: 9, // Display order 9
          title: "Theology 101",
          author: "Anthony Lee",
          description: "Welcome to our 10-week theology semester! Within this course we'll dive into various aspects of theology, each teaching will explore multiple topics and subjects, which will bring us to the conclusions of Why we believe What we believe, as outlined by the Word of God.",
          bookCoverUrl: undefined,
          category: "Theology",
          difficulty: "Beginner",
          chapterCount: theologyCourse.duration || 10,
          estimatedReadingTime: "5-6 hours",
          isComplete: false, // Content coming soon
          courseId: 9, // Now courseId 9
          courseName: "Theology 101",
          isUpdated: theologyCourse.isUpdated || false
        });
      }

      // Add "SFGM Man of God Course" textbook (content coming soon)
      const manOfGodCourse = courses.find((c: any) => c.id === 16);
      if (manOfGodCourse) {
        completeTextbooks.push({
          id: 16,
          title: "SFGM Man of God Course",
          author: "Pastor Kevin & Bishop Anthony Lee",
          description: "The Man of God course is an 8-week Bible study designed to challenge, equip, and empower men to walk boldly in their God-given purpose. This course is taught by two pastors from different SFGM locations, each bringing unique insights to help you grow spiritually and practically. Weeks 1–4: Led by Pastor Kevin from SFGM Columbus. Weeks 5–8: Led by Bishop Anthony Lee from SFGM Orlando. Each week focuses on key biblical principles that build your identity, character, and leadership as a man of God. Lessons cover vital topics such as God's glory, honoring relationships, faithful stewardship, and using your spiritual gifts with humility.",
          bookCoverUrl: undefined,
          category: "Character Development",
          difficulty: "Intermediate",
          chapterCount: manOfGodCourse.duration || 8,
          estimatedReadingTime: "5-6 hours",
          isComplete: false, // Content coming soon
          courseId: 16,
          courseName: "SFGM Man of God Course",
          isUpdated: manOfGodCourse.isUpdated || false
        });
      }


      
      // Add "Coming Soon" textbooks that don't exist in the database yet
      const comingSoonTextbooks = [
        {
          id: 102, // Display order 102
          title: "The Watchmen Series",
          author: "Pastor Rocky",
          description: "A comprehensive study on spiritual warfare and watchfulness. Learn to stand guard over your family, community, and faith through biblical principles of spiritual watchfulness and discernment.",
          bookCoverUrl: "/the-watchmen-project-cover.png",
          category: "Spiritual Warfare",
          difficulty: "Advanced",
          chapterCount: 8,
          estimatedReadingTime: "10-12 hours",
          isComplete: false,
          courseId: 102,
          courseName: "The Watchmen Series",
          isUpdated: false
        },
        {
          id: 103, // Display order 103
          title: "Introduction to Prophecy",
          author: "Teacher Larry Kaslov",
          description: "A foundational course exploring biblical prophecy and end times. Students will study various prophetic perspectives and their biblical foundations with practical applications for modern ministry.",
          bookCoverUrl: "/introduction-to-prophecy-cover.png",
          category: "Prophecy",
          difficulty: "Intermediate",
          chapterCount: 5,
          estimatedReadingTime: "3-4 hours",
          isComplete: false,
          courseId: 103,
          courseName: "Introduction to Prophecy",
          isUpdated: false
        },
        {
          id: 104, // Display order 104
          title: "Theology 101",
          author: "Bishop Anthony Lee and Pastor Mark",
          description: "Welcome to our 10-week theology semester! Within this course we'll dive into various aspects of theology, each teaching will explore multiple topics and subjects, which will bring us to the conclusions of Why we believe What we believe, as outlined by the Word of God.",
          bookCoverUrl: "/theology-101-cover.png",
          category: "Theology",
          difficulty: "Beginner",
          chapterCount: 10,
          estimatedReadingTime: "5-6 hours",
          isComplete: false,
          courseId: 104,
          courseName: "Theology 101",
          isUpdated: false
        },
        {
          id: 105, // Display order 105
          title: "Men of God",
          author: "Pastor Kevin & Bishop Anthony Lee",
          description: "The Man of God course is an 8-week Bible study designed to challenge, equip, and empower men to walk boldly in their God-given purpose. This course is taught by two pastors from different SFGM locations, each bringing unique insights to help you grow spiritually and practically.",
          bookCoverUrl: "/man-of-god-course-cover.webp",
          category: "Character Development",
          difficulty: "Intermediate",
          chapterCount: 8,
          estimatedReadingTime: "5-6 hours",
          isComplete: false,
          courseId: 105,
          courseName: "Men of God",
          isUpdated: false
        }
      ];

      // Add the coming soon textbooks to the array
      completeTextbooks.push(...comingSoonTextbooks);

      return completeTextbooks;
    }
  });

  const handleReadTextbook = (textbook: Textbook) => {
    // Check if course requires password (Deacon Course 6 or Youth Ministry 8)
    if (textbook.courseId === 6 || textbook.courseId === 8) {
      setPasswordCourseId(textbook.courseId);
      setPasswordCourseName(textbook.title);
      setPendingAction(() => {
        if (textbook.courseId === 6) {
          return () => setLocation('/deacon-course-complete-ebook');
        } else if (textbook.courseId === 8) {
          return () => setLocation('/youth-ministry-complete-ebook');
        }
        return () => {};
      });
      setShowPasswordPrompt(true);
      return;
    }
    
    // For "Acts in Action" (courseId 1), navigate to the complete e-book
    if (textbook.courseId === 1) {
      setLocation('/acts-in-action-ebook');
      return;
    }
    
    // For "Don't Be a Jonah" (courseId 3), navigate to the complete e-book
    if (textbook.courseId === 3) {
      setLocation('/dont-be-a-jonah-complete-book');
      return;
    }
    
    // For "Becoming a Fire Starter" (courseId 2), navigate to the complete e-book
    if (textbook.courseId === 2) {
      setLocation('/becoming-a-firestarter-complete-ebook');
      return;
    }
    
    // For "Studying for Service" (courseId 5), navigate to the complete e-book
    if (textbook.courseId === 5) {
      setLocation('/studying-for-service-complete-ebook');
      return;
    }
    
    // For "G.R.O.W" (courseId 4), navigate to the complete e-book
    if (textbook.courseId === 4) {
      setLocation('/grow-complete-ebook');
      return;
    }
    
    // For Level Up Leadership (courseId 7), navigate to course page (no e-book yet)
    if (textbook.courseId === 7) {
      setLocation(`/course/${textbook.courseId}`);
      return;
    }
    
    // For coming soon courses (courseId 16, 9), show locked modal
    if (textbook.courseId === 16 || textbook.courseId === 9) {
      setSelectedTextbook(textbook);
      setShowModal(true);
      return;
    }
    
    // For content coming soon, show centered modal
    if (textbook.bookCoverUrl === 'content-coming-soon') {
      setSelectedTextbook(textbook);
      setShowModal(true);
      return;
    }
    
    // For other textbooks, navigate to the complete book reader
    setLocation(`/pdf-download?courseId=${textbook.courseId}`);
  };

  const handleViewCourse = (courseId: number) => {
    setLocation(`/course/${courseId}`);
  };

  const handleAddToLibrary = (textbook: Textbook) => {
    // Check if book is already in library before adding
    if (isAuthenticated && isBookInLibrary(textbook.title, textbook.author)) {
      toast({
        title: "Already in Library",
        description: "This book is already in your personal library",
        variant: "default",
      });
      return;
    }
    
    // Convert textbook to book format for personal library (matching the expected fields)
    const bookData = {
      title: textbook.title,
      author: textbook.author,
      category: textbook.category,
      description: textbook.description,
      difficulty: textbook.difficulty,
      estimatedReadingTime: textbook.estimatedReadingTime,
      rating: 5, // Default rating for textbooks
      coverColor: "bg-blue-500", // Default color
      readingStatus: "want_to_read", // Default status
      priority: 1, // Default priority
    };
    addToLibraryMutation.mutate(bookData);
  };

  const isBookInLibrary = (bookTitle: string, bookAuthor: string) => {
    if (!personalLibrary || !Array.isArray(personalLibrary)) return false;
    return personalLibrary.some((book: any) => 
      book.bookTitle === bookTitle && book.bookAuthor === bookAuthor
    );
  };




  if (isLoading) {
    return (
      <div 
        className="min-h-screen relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-indigo-900/80 to-purple-900/85"></div>
        <div className="relative z-10">
          <Navigation />
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div 
        className="min-h-screen relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-indigo-900/80 to-purple-900/85"></div>
        <div className="relative z-10">
        <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="relative">
                <FaBook className="text-5xl text-yellow-400 drop-shadow-lg animate-pulse" />
                <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-50"></div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
                SFGM e-books catalog
              </h1>
            </div>
            <p className="text-white/90 text-lg mt-2">Discover Your Next Great Read 📚</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30 shadow-lg">
              <div className="flex items-center gap-2 text-white">
                <FaGraduationCap className="text-2xl text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold">{(textbooks || []).length}</div>
                  <div className="text-xs text-white/80">Total Books</div>
                </div>
              </div>
            </div>
          </div>

        {/* Textbooks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(textbooks || []).map((textbook) => (
                <Card key={textbook.id} className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 bg-white/95 backdrop-blur-sm border-2 border-white/30 flex flex-col h-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-xl">
              <CardHeader className="pb-4">
                {/* Book Cover */}
                <div className="relative mb-3" id={`card-${textbook.id}`}>
                  {isAuthenticated && isBookInLibrary(textbook.title, textbook.author) ? (
                    <div className="absolute top-2 left-2 z-40">
                      <span className="text-[10px] bg-green-600 text-white px-2 py-1 rounded-full font-semibold shadow">Added to Library</span>
                    </div>
                  ) : null}
                  {/* Coming Soon Badge Overlay for Coming Soon courses */}
                  {(textbook.courseId >= 101 && textbook.courseId <= 106) && (
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1 z-40 shadow-lg">
                      <i className="fas fa-clock"></i>
                      COMING SOON
                    </div>
                  )}
                  <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
                    {textbook.bookCoverUrl && !textbook.bookCoverUrl.includes('placeholder') && textbook.bookCoverUrl !== 'content-coming-soon' ? (
                      <img 
                        src={textbook.bookCoverUrl} 
                        alt={textbook.title}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : textbook.bookCoverUrl === 'content-coming-soon' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                        <FaBook className="text-3xl text-gray-400 mb-2" />
                        <div className="text-center px-2">
                          <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">CONTENT</div>
                          <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">COMING SOON</div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaBook className="text-4xl text-blue-500 opacity-50" />
                      </div>
                    )}
                  </div>

                  {/* Modal positioned exactly in the center of the card image */}
                  {showModal && selectedTextbook?.id === textbook.id && (
                    <div className="absolute inset-0 flex items-center justify-center z-50">
                      <div 
                        className="absolute inset-0 bg-black bg-opacity-50 rounded-lg"
                        onClick={() => setShowModal(false)}
                      />
                      <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 shadow-2xl max-w-sm mx-4 border border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => setShowModal(false)}
                          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                          <FaTimes className="text-lg" />
                        </button>
                        <div className="text-center">
                          {(selectedTextbook?.courseId === 5 || selectedTextbook?.courseId === 16 || selectedTextbook?.courseId === 8 || selectedTextbook?.courseId === 9) ? (
                            <>
                              <i className="fas fa-lock text-4xl text-orange-600 mb-4"></i>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                Read Book - Locked
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 mb-4">
                                The textbook content for {selectedTextbook?.title} is currently locked. Please check back later when the content becomes available.
                              </p>
                              <Button 
                                onClick={() => setShowModal(false)}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                              >
                                Understood
                              </Button>
                            </>
                          ) : (
                            <>
                              <FaBook className="text-4xl text-blue-600 mb-4 mx-auto" />
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                {selectedTextbook?.title}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Content is coming soon! Please check back later for updates.
                              </p>
                              <Button 
                                onClick={() => setShowModal(false)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Got it!
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Title and Author */}
                <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 line-clamp-2 group-hover:from-pink-600 group-hover:to-orange-600 transition-all duration-300">
                  {textbook.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 mb-3">
                  <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full">
                    <FaUser className="text-xs text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{textbook.author}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-0">

                {/* Book Details */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-xl border border-blue-300/30">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{textbook.chapterCount}</div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-1">📖 Chapters</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-purple-500/10 to-pink-600/20 rounded-xl border border-purple-300/30">
                    <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{textbook.estimatedReadingTime}</div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-1">⏱️ Time</div>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1.5 rounded-full shadow-md">
                    {textbook.category}
                  </span>
                  <span className="text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full shadow-md">
                    {textbook.difficulty}
                  </span>
                </div>

                {/* Action Buttons - Hidden for Coming Soon courses (IDs 101-106, 9, 16) */}
                {!(textbook.courseId >= 101 && textbook.courseId <= 106) && textbook.courseId !== 9 && textbook.courseId !== 16 && (
                  <div className="space-y-2 mt-auto">
                    {/* Read E-Book Button */}
                    {textbook.courseId === 7 ? (
                      // Level Up Leadership - Link to Amazon instead of e-book
                      <a
                        href="https://www.amazon.com/Levels-Leadership-Proven-Maximize-Potential/dp/1599953633"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <Button 
                          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white h-9 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                          size="sm"
                        >
                          📖 Start Reading
                        </Button>
                      </a>
                    ) : (
                      <Button 
                        onClick={() => {
                          if (textbook.courseId === 1) {
                            // Navigate to the complete e-book for Acts in Action
                            setLocation('/acts-in-action-ebook');
                          } else if (textbook.courseId === 3) {
                            // Navigate to the complete e-book for Don't Be a Jonah
                            setLocation('/dont-be-a-jonah-complete-book');
                          } else if (textbook.courseId === 2) {
                            // Navigate to the complete e-book for Becoming a Fire Starter
                            setLocation('/becoming-a-firestarter-complete-ebook');
                          } else if (textbook.courseId === 5) {
                            // Navigate to the complete e-book for Studying for Service
                            setLocation('/studying-for-service-complete-ebook');
                          } else if (textbook.courseId === 4) {
                            // Navigate to the complete e-book for G.R.O.W
                            setLocation('/grow-complete-ebook');
                        } else if (textbook.courseId === 6 || textbook.courseId === 8) {
                          // Check password for locked courses
                          setPasswordCourseId(textbook.courseId);
                          setPasswordCourseName(textbook.title);
                          setPendingAction(() => {
                            if (textbook.courseId === 6) {
                              return () => setLocation('/deacon-course-complete-ebook');
                            } else if (textbook.courseId === 8) {
                              return () => setLocation('/youth-ministry-complete-ebook');
                            }
                            return () => {};
                          });
                          setShowPasswordPrompt(true);
                        } else {
                            setLocation(`/pdf-download?courseId=${textbook.courseId}`);
                          }
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white h-9 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                        size="sm"
                      >
                        📖 Start Reading
                      </Button>
                    )}
                    
                    {/* Add to Library Button - Hidden for Level Up Leadership (courseId 7) */}
                    {textbook.courseId !== 7 && (
                      <Button 
                        variant={isAuthenticated && isBookInLibrary(textbook.title, textbook.author) ? "secondary" : "outline"}
                        onClick={() => {
                          if (!isAuthenticated) {
                            toast({
                              title: "Login Required",
                              description: "Please login to add books to your personal library",
                              variant: "destructive",
                            });
                            return;
                          }
                          // Prevent adding if already in library
                          if (isBookInLibrary(textbook.title, textbook.author)) {
                            toast({
                              title: "Already in Library",
                              description: "This book is already in your personal library",
                              variant: "default",
                            });
                            return;
                          }
                          const textbookData = {
                            ...textbook,
                            readingStatus: "want_to_read",
                            priority: "high",
                            rating: 5,
                            coverColor: "blue"
                          };
                          handleAddToLibrary(textbookData);
                        }}
                        className={`w-full h-9 text-sm font-semibold rounded-xl transition-all duration-300 ${
                          isAuthenticated && isBookInLibrary(textbook.title, textbook.author)
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                            : "bg-white/90 hover:bg-white border-2 border-purple-300 text-purple-700 hover:text-purple-800 shadow-md hover:shadow-lg"
                        }`}
                        size="sm"
                        disabled={isAuthenticated && (isBookInLibrary(textbook.title, textbook.author) || addToLibraryMutation.isPending)}
                      >
                        {isAuthenticated && addToLibraryMutation.isPending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        ) : isAuthenticated && isBookInLibrary(textbook.title, textbook.author) ? (
                          <>✅ Saved!</>
                        ) : (
                          <>💾 Save to Library</>
                        )}
                      </Button>
                    )}
                    
                    {/* Take Course Button */}
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        // Check if course requires password (Deacon Course 6 or Youth Ministry 8)
                        if (textbook.courseId === 6 || textbook.courseId === 8) {
                          setPasswordCourseId(textbook.courseId);
                          setPasswordCourseName(textbook.title);
                          setPendingAction(() => () => handleViewCourse(textbook.courseId));
                          setShowPasswordPrompt(true);
                        } else {
                          handleViewCourse(textbook.courseId);
                        }
                      }}
                      className={`w-full h-9 text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ${
                        isEnrolledInCourse(textbook.courseId)
                          ? "bg-gradient-to-r from-green-500/20 to-emerald-600/20 hover:from-green-500/30 hover:to-emerald-600/30 border-2 border-green-400 text-green-700 hover:text-green-800"
                          : "bg-gradient-to-r from-orange-500/10 to-yellow-500/10 hover:from-orange-500/20 hover:to-yellow-500/20 border-2 border-orange-300 text-orange-700 hover:text-orange-800"
                      }`}
                      size="sm"
                    >
                      {isEnrolledInCourse(textbook.courseId) ? '✅ Enrolled' : '🎓 Enroll Now'}
                    </Button>
                  </div>
                )}

                {/* Course Connection */}
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FaCalendar className="text-xs" />
                    <span className="text-xs">{textbook.courseName}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {!textbooks || textbooks.length === 0 ? (
          <div className="text-center py-12">
            <FaBook className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2">
              No Textbooks Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Complete textbooks will appear here as they are added to the catalog.
            </p>
          </div>
        ) : null}

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              About SFGM Textbooks
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              All textbooks in the SFGM catalog are authored by Bishop Anthony Lee and designed to provide 
              comprehensive spiritual education for ministry students. Each textbook is integrated with 
              corresponding Bible School courses featuring quizzes, discussions, and practical applications.
            </p>
          </div>
        </div>
      </div>

        <Footer />
        </div>
      </div>
      
      {/* Password Prompt Modal */}
      {passwordCourseId && (
        <CoursePasswordPrompt
          courseId={passwordCourseId}
          courseName={passwordCourseName}
          isOpen={showPasswordPrompt}
          onClose={() => {
            setShowPasswordPrompt(false);
            setPasswordCourseId(null);
            setPasswordCourseName("");
            setPendingAction(null);
          }}
          onSuccess={() => {
            if (pendingAction) {
              pendingAction();
            }
          }}
        />
      )}
    </TooltipProvider>
  );
}