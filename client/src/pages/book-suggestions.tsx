import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Star, Clock, User } from "lucide-react";
// import libraryImage from "@assets/image_1753290560182.png";
// import maxwellLaws21Cover from "@assets/image_1753291709866.png";
// import maxwellLevels5Cover from "@assets/image_1753291790731.png";
// import bevereBaitCover from "@assets/image_1753291944592.png";
// import bevereAweCover from "@assets/image_1753291987894.png";
// import warrenPurposeCover from "@assets/image_1753292039331.png";
// import tenBoomHidingCover from "@assets/image_1753292081654.png";
// import evansPreachingCover from "@assets/image_1753292126929.png";
// import robinsonLarsonCover from "@assets/image_1753292155323.png";
// import larkinDispensationalCover from "@assets/image_1753292214279.png";
// import lewisScrewtapeCover from "@assets/image_1753292248699.png";

// Amazon URL mapping for direct product links
const getAmazonUrl = (title: string, author: string) => {
  const amazonMappings: { [key: string]: string } = {
    'The Screwtape Letters': 'https://www.amazon.com/dp/0060652934/?bestFormat=true&k=screw%20tape%20letters%20cs%20lewis&ref_=nb_sb_ss_w_scx-ent-pd-bk-d_k1_1_10_de&crid=F1ZP7W1MOPWG&sprefix=scriw%20tape',
    'The Purpose Driven Life': 'https://www.amazon.com/What-Earth-Expanded-Purpose-Driven/dp/031032906X',
    'Jesus Calling': 'https://www.amazon.com/Jesus-Calling-Sarah-Young/dp/1400322359',
    'Mere Christianity': 'https://www.amazon.com/Mere-Christianity-C-S-Lewis/dp/0060652926',
    'The Hiding Place': 'https://www.amazon.com/Hiding-Place-Triumphant-Story-Corrie/dp/0553256696',
    'Wild at Heart': 'https://www.amazon.com/Wild-Heart-Revised-Updated-Discovering/dp/1400200393',
    'Battlefield of the Mind': 'https://www.amazon.com/Battlefield-Mind-Winning-Battle-Your/dp/0446691097',
    'The Power of a Praying Woman': 'https://www.amazon.com/Power-Praying%C2%AE-Woman-Stormie-Omartian/dp/0736957766',
    'Dispensational Truth': 'https://www.amazon.com/Greatest-Book-Dispensational-Truth-World/dp/0001473727',
    'The 21 Irrefutable Laws of Leadership': 'https://www.amazon.com/21-Irrefutable-Laws-Leadership-Follow/dp/0785288376',
    'The Five Levels of Leadership': 'https://www.amazon.com/Levels-Leadership-Proven-Maximize-Potential/dp/1599953633',
    'The Bait of Satan': 'https://www.amazon.com/Bait-Satan-Living-Free-Deadly/dp/1629991570',
    'The Awe of God': 'https://www.amazon.com/Awe-God-Astounding-Healthy-Changes/dp/1641238291',
    'The Art and Craft of Biblical Preaching': 'https://www.amazon.com/Art-Craft-Biblical-Preaching-Comprehensive/dp/0310252989'
  };
  return amazonMappings[title] || `https://www.amazon.com/s?k=${encodeURIComponent(title + ' ' + author)}&tag=sfgmboston-20`;
};

const bookSuggestions = [
  {
    id: 1,
    title: "The 21 Irrefutable Laws of Leadership",
    author: "John C. Maxwell",
    category: "Leadership",
    description: "Maxwell's definitive guide to leadership principles that stand the test of time. Essential reading for ministry leaders and anyone seeking to develop their leadership capacity.",
    difficulty: "Intermediate",
    estimatedReadingTime: "300 pages",
    rating: 5,
    coverImage: null,
    coverColor: "bg-blue-500"
  },
  {
    id: 2,
    title: "The Five Levels of Leadership",
    author: "John C. Maxwell",
    category: "Leadership",
    description: "A progressive approach to leadership development, from positional authority to pinnacle leadership. Perfect for understanding the journey of leadership growth.",
    difficulty: "Intermediate",
    estimatedReadingTime: "320 pages",
    rating: 5,
    coverImage: null,
    coverColor: "bg-green-500"
  },
  {
    id: 3,
    title: "The Bait of Satan",
    author: "John Bevere",
    category: "Spiritual Warfare",
    description: "Bevere's powerful teaching on overcoming offense and the traps that Satan sets through unforgiveness. A must-read for spiritual maturity and freedom.",
    difficulty: "Intermediate",
    estimatedReadingTime: "240 pages",
    rating: 5,
    coverImage: null,
    coverColor: "bg-red-500"
  },
  {
    id: 4,
    title: "The Awe of God",
    author: "John Bevere",
    category: "Spiritual Growth",
    description: "Rediscovering the fear of the Lord and developing a deeper reverence for God's holiness. Essential for cultivating intimate relationship with the Almighty.",
    difficulty: "Intermediate",
    estimatedReadingTime: "272 pages",
    rating: 5,
    coverImage: null,
    coverColor: "bg-purple-500"
  },
  {
    id: 5,
    title: "The Purpose Driven Life",
    author: "Rick Warren",
    category: "Spiritual Growth",
    description: "Warren's transformational 40-day spiritual journey to discover your purpose in God's plan. One of the best-selling Christian books of all time.",
    difficulty: "Beginner",
    estimatedReadingTime: "334 pages",
    rating: 5,
    coverImage: null,
    coverColor: "bg-orange-500"
  },
  {
    id: 6,
    title: "The Hiding Place",
    author: "Corrie ten Boom",
    category: "Biography",
    description: "Ten Boom's incredible true story of faith, forgiveness, and God's faithfulness during the Holocaust. A powerful testimony of God's grace in the darkest circumstances.",
    difficulty: "Intermediate",
    estimatedReadingTime: "241 pages",
    rating: 5,
    coverImage: null,
    coverColor: "bg-indigo-500"
  },
  {
    id: 7,
    title: "The Power of Preaching",
    author: "Tony Evans",
    category: "Preaching",
    description: "Evans' comprehensive guide to biblical preaching with practical tools for sermon preparation and delivery. Essential for pastors and ministry leaders.",
    difficulty: "Advanced",
    estimatedReadingTime: "224 pages",
    rating: 4,
    coverImage: null,
    coverColor: "bg-cyan-500"
  },
  {
    id: 8,
    title: "The Art and Craft of Biblical Preaching",
    author: "Robinson & Larson",
    category: "Preaching",
    description: "A comprehensive guide to biblical preaching that combines theological depth with practical application for effective sermon preparation and delivery.",
    difficulty: "Advanced",
    estimatedReadingTime: "736 pages",
    rating: 4,
    coverImage: null,
    coverColor: "bg-gray-500"
  },
  {
    id: 9,
    title: "Dispensational Truth",
    author: "Clarence Larkin",
    category: "Theology",
    description: "Larkin's comprehensive study of dispensational theology with detailed charts and biblical analysis of God's plan throughout the ages.",
    difficulty: "Advanced",
    estimatedReadingTime: "192 pages",
    rating: 4,
    coverImage: null,
    coverColor: "bg-yellow-500"
  },
  {
    id: 10,
    title: "The Screwtape Letters",
    author: "C.S. Lewis",
    category: "Fiction",
    description: "A satirical novel about a senior demon instructing his nephew on the art of temptation. A brilliant examination of human nature and our spiritual battles.",
    difficulty: "Intermediate",
    estimatedReadingTime: "160 pages",
    rating: 5,
    coverImage: null,
    coverColor: "bg-pink-500"
  }
];

// Optional cover overrides served from client/public
const coverOverrides: { [key: string]: string } = {
  'The 21 Irrefutable Laws of Leadership': 'https://m.media-amazon.com/images/I/71X80jyO-4L._UF1000,1000_QL80_.jpg',
  'The Five Levels of Leadership': 'https://m.media-amazon.com/images/I/81+L-SrW92L._UF1000,1000_QL80_.jpg',
  'The Bait of Satan': 'https://m.media-amazon.com/images/I/61pfCoraMSL._UF1000,1000_QL80_.jpg',
  'The Awe of God': 'https://m.media-amazon.com/images/I/51vsitdNprL._UF1000,1000_QL80_.jpg',
  'The Purpose Driven Life': 'https://m.media-amazon.com/images/I/81g5wWEnukL._UF1000,1000_QL80_.jpg',
  'The Hiding Place': 'https://m.media-amazon.com/images/I/71BZ0mBmVdL._UF1000,1000_QL80_.jpg',
  'The Power of Preaching': 'https://m.media-amazon.com/images/I/81bGwIcnEHL._UF1000,1000_QL80_.jpg',
  'The Art and Craft of Biblical Preaching': 'https://m.media-amazon.com/images/I/71NYn9qkLML._UF1000,1000_QL80_.jpg',
  'Dispensational Truth': 'https://m.media-amazon.com/images/I/81lyMKWIq4L._UF1000,1000_QL80_.jpg',
  'The Screwtape Letters': 'https://m.media-amazon.com/images/I/71W-XT7Ls1L._UF1000,1000_QL80_.jpg',
};

export default function BookSuggestions() {
  const { isAuthenticated } = useAuth();

  // Show all books
  const filteredBooks = bookSuggestions;

  // Redirect non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-lg p-8">
            <BookOpen className="mx-auto h-16 w-16 text-blue-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
            <p className="text-gray-600 mb-6">
              Please log in to access the Book Suggestions page. This resource is available to registered SFGM Boston Bible School students.
            </p>
            <a 
              href="/login" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Log In to Continue
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-rose-50">
        <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="relative mb-12 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/10">
          <div className="h-72 relative bg-gradient-to-br from-indigo-600 via-purple-600 via-pink-600 to-rose-600">
            <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent"></div>
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            <div className="relative z-10 flex items-center justify-center h-full px-4">
              <div className="text-center text-white max-w-4xl">
                <div className="mb-6 animate-fade-in-up">
                  <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 drop-shadow-2xl bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                    Book Suggestions
                  </h1>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
                </div>
                <p className="text-xl md:text-2xl mb-8 text-blue-50 font-medium drop-shadow-lg">Curated Reading List for SFGM Boston Bible School</p>
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl transform transition-all duration-300 hover:bg-white/15 hover:scale-[1.02]">
                  <h2 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
                    <span className="text-3xl">📚</span>
                    <span>Supplemental Reading Collection</span>
                  </h2>
                  <p className="text-sm leading-relaxed text-blue-50">
                    Enhance your Bible School education with these supplemental books. Purchase from Amazon to support your spiritual growth, leadership development, and ministry preparation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border border-amber-200/50 rounded-2xl p-6 mb-8 shadow-lg backdrop-blur-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="p-2 bg-amber-100 rounded-lg">
                <svg className="h-6 w-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-base font-bold text-amber-900 mb-2">Legal Notice</h3>
              <div className="text-sm text-amber-800 leading-relaxed">
                <p>
                  <strong>SFGM Boston Bible School does not own the rights to these suggested reading materials.</strong> These books are recommended for educational and spiritual growth purposes only. We encourage students to purchase these books through legitimate retailers. All book covers, titles, and content remain the property of their respective authors and publishers.
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book, index) => {
            const coverOverride = coverOverrides[book.title];
            return (
              <Card 
                key={book.id} 
                className="flex flex-col h-full group rounded-3xl border border-slate-200/50 bg-white/90 backdrop-blur-xl shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-indigo-300/50 hover:bg-white"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-3">
                  {/* Book Cover */}
                  <div className="relative rounded-2xl h-72 flex items-center justify-center mb-4 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 group-hover:shadow-xl transition-shadow duration-500">
                    {(coverOverride || book.coverImage) ? (
                      <img 
                        src={coverOverride ?? (book.coverImage ?? undefined)} 
                        alt={`Cover of ${book.title}`}
                        className="w-full h-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className={`${book.coverColor} rounded-2xl h-72 w-full flex items-center justify-center transition-all duration-500 group-hover:brightness-110`}>
                        <BookOpen className="h-24 w-24 text-white drop-shadow-2xl transition-transform duration-500 group-hover:scale-110" />
                      </div>
                    )}
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl"></div>
                  </div>
                  
                  <CardTitle className="text-lg font-bold tracking-tight line-clamp-2 mb-2 text-slate-900 group-hover:text-indigo-600 transition-colors duration-300">
                    {book.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                    <User className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium">{book.author}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge variant="secondary" className="text-xs rounded-full px-3 py-1 font-semibold bg-indigo-100 text-indigo-700 border-0">
                      {book.category}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs rounded-full px-3 py-1 font-semibold ${
                        book.difficulty === 'Beginner' ? 'border-green-500 text-green-700 bg-green-50' :
                        book.difficulty === 'Intermediate' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                        'border-red-500 text-red-700 bg-red-50'
                      }`}
                    >
                      {book.difficulty}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 transition-all duration-300 ${
                          i < book.rating ? 'text-yellow-400 fill-current drop-shadow-sm' : 'text-slate-300'
                        }`} 
                      />
                    ))}
                    <span className="text-sm text-slate-600 ml-2 font-medium">({book.rating}/5)</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    <span>{book.estimatedReadingTime}</span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 pb-4 flex flex-col flex-grow">
                  <div className="text-sm text-slate-700 mb-4 line-clamp-3 leading-relaxed">
                    {book.description}
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-auto">
                    {/* Amazon Button */}
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full h-10 text-sm rounded-xl border-2 border-orange-500/30 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 font-semibold hover:from-orange-100 hover:to-amber-100 hover:border-orange-500 hover:shadow-lg hover:scale-105 transition-all duration-300"
                      asChild
                    >
                      <a 
                        href={getAmazonUrl(book.title, book.author)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <i className="fab fa-amazon text-orange-600 text-base"></i>
                        <span>Buy on Amazon</span>
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Resources */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Additional Reading Resources
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Christian Book Stores</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Lifeway Christian Store</li>
                  <li>• Family Christian Stores</li>
                  <li>• Mardel Christian & Education</li>
                  <li>• Local church bookstores</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Online Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• ChristianBook.com</li>
                  <li>• Audible.com (audiobooks)</li>
                  <li>• Kindle Store</li>
                  <li>• Apple Books</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Study Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• SFGM Boston Book Club</li>
                  <li>• Sunday School Classes</li>
                  <li>• Small Group Bible Studies</li>
                  <li>• Ministry Training Sessions</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
      </div>
    </>
  );
}