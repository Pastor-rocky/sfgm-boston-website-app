import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAudioUrl } from '@/lib/audio-storage';
import {
  SectionHeading,
  BlueSection,
  GreenSection,
  PurpleSection,
  RedSection,
  YellowSection,
  BulletList,
  BulletItem,
  HighlightText
} from '@/components/audio-player-text-template';

const ActsAudioPlayer: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const audioSrc = getAudioUrl('acts-in-action-cp1.mp3');
  const localStorageKey = 'audio_progress_acts_ch1';

  // Load saved progress on mount
  useEffect(() => {
    const saved = localStorage.getItem(localStorageKey);
    if (saved) {
      setCurrentTime(parseFloat(saved));
    }
  }, [localStorageKey]);

  // Audio controls
  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSkip = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = Math.min(Math.max(0, audio.currentTime + delta), duration || audio.duration || 0);
    audio.currentTime = next;
    setCurrentTime(next);
  };

  // Audio controls
  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = value[0];
    setVolume(value[0]);
  };

  // Persist progress
  const saveProgress = () => {
    localStorage.setItem(localStorageKey, currentTime.toString());
    toast({
      title: "Progress Saved",
      description: "Your listening progress has been saved.",
    });
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => setLocation('/course/1')}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
            <h1 className="text-xl font-bold text-white">Acts in Action - Chapter 1</h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Audio Player */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <img 
                src="/acts-in-action-cover.png" 
                alt="Acts in Action Cover"
                className="w-24 h-auto rounded shadow-sm flex-shrink-0"
              />
              <div>
                <h3 className="text-white text-2xl font-bold"><span className="text-3xl align-text-top mr-1">🎶</span> <span className="align-middle">Acts in Action</span></h3>
                <p className="text-white/90 text-xl font-semibold"><span className="align-middle">Chapter 1: Preparation and Launch</span> <span className="text-2xl align-text-top ml-1">🎬</span></p>
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-white mr-3" />
                <span className="text-white text-lg">Loading audio player...</span>
              </div>
            ) : (
              <>
                {/* Main Controls */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Button
                    onClick={() => handleSkip(-15)}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    onClick={handlePlayPause}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14"
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>
                  
                  <Button
                    onClick={() => handleSkip(15)}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="px-2">
                  <Slider
                    value={[currentTime]}
                    max={duration}
                    step={1}
                    onValueChange={([value]) => {
                      const audio = audioRef.current;
                      if (!audio) return;
                      audio.currentTime = value;
                      setCurrentTime(value);
                    }}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-white/70 mt-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-3 justify-center mt-4">
                  <Volume2 className="h-4 w-4 text-white" />
                  <Slider value={[volume]} max={1} step={0.1} onValueChange={([v]) => handleVolumeChange([v])} className="w-24" />
                </div>

                {/* Audio element */}
                <audio
                  ref={audioRef}
                  src={audioSrc}
                  preload="auto"
                  onLoadedMetadata={() => {
                    if (audioRef.current) {
                      setDuration(audioRef.current.duration || 0);
                      // Restore saved progress if available
                      const saved = localStorage.getItem(localStorageKey);
                      if (saved) {
                        audioRef.current.currentTime = parseFloat(saved);
                      }
                    }
                  }}
                  onLoadedData={() => {
                    console.log('Audio loaded successfully:', audioSrc);
                    setIsLoading(false);
                  }}
                  onError={(e) => {
                    const audio = audioRef.current;
                    const error = audio?.error;
                    let errorMessage = 'Failed to load audio file.';
                    
                    if (error) {
                      switch (error.code) {
                        case error.MEDIA_ERR_ABORTED:
                          errorMessage = 'Audio loading was aborted.';
                          break;
                        case error.MEDIA_ERR_NETWORK:
                          errorMessage = 'Network error while loading audio.';
                          break;
                        case error.MEDIA_ERR_DECODE:
                          errorMessage = 'Audio file could not be decoded.';
                          break;
                        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                          errorMessage = 'Audio format not supported or file not found.';
                          break;
                        default:
                          errorMessage = `Audio error (code ${error.code}).`;
                      }
                    }
                    
                    console.error('Audio loading error:', {
                      error,
                      code: error?.code,
                      message: error?.message,
                      src: audioSrc,
                      audioElement: audio,
                    });
                    
                    setIsLoading(false);
                    toast({
                      title: 'Audio Error',
                      description: `${errorMessage} File: ${audioSrc}. Check browser console for details.`,
                      variant: 'destructive',
                    });
                  }}
                  onTimeUpdate={() => {
                    if (audioRef.current) {
                      setCurrentTime(audioRef.current.currentTime || 0);
                    }
                  }}
                  onEnded={() => setIsPlaying(false)}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Text Content - Intro Section */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white text-center">
              ACTS IN ACTION: A Leadership Study Guide
            </CardTitle>
            <p className="text-center text-purple-200 text-lg">
              "If We Do What They Did, We'll Get What They Got"
            </p>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <div className="text-white leading-relaxed space-y-6">
              <SectionHeading>THE FIRST CHURCH SUCCESS CODE</SectionHeading>
              <BlueSection title="💡">
                <p>The promise is simple and bold: <HighlightText color="blue">"If we do what they did, we'll get what they got."</HighlightText> This book will help you understand what the early church did to receive the power of the Holy Spirit and what they achieved through that empowerment. By studying their methods, we can apply the same principles that led to their extraordinary success.</p>
                <p>This study also incorporates key leadership principles from John Maxwell, using commentary from the Maxwell Leadership Bible alongside insights from his broader leadership library. Our hope is that this book will help you grow into the servant leader God has called you to be.</p>
              </BlueSection>

              <SectionHeading>WHAT THEY GOT: THE RESULTS THAT CHANGED HISTORY</SectionHeading>
              <GreenSection title="📈">
                <p>The outcomes recorded in Acts are staggering. In a single day, three thousand people believed and were baptized (Acts 2:41). Daily growth followed and never stopped (Acts 2:47). Ordinary people operated in supernatural power and boldness (Acts 4:13). The movement spread across the known world, reaching all the way to Rome (Acts 28:31). Churches were planted in every major city (Romans 15:19). The impact outlasted persecution and opposition, even scattering believers who preached wherever they went (Acts 8:4). The bottom line is that they started with 120 people in an upper room and, by God's power, changed the world forever.</p>
              </GreenSection>

              <SectionHeading>WHAT THEY DID: THE BLUEPRINT WE CAN FOLLOW</SectionHeading>
              <PurpleSection title="📘">
                <p>The early church's success was not accidental. They followed specific principles that any church can apply today:</p>
                <BulletList>
                  <BulletItem>They prepared thoroughly before launching publicly</BulletItem>
                  <BulletItem>They operated in supernatural power rather than human strength</BulletItem>
                  <BulletItem>They maintained unity while embracing cultural and social diversity</BulletItem>
                  <BulletItem>They faced opposition with courage and wisdom</BulletItem>
                  <BulletItem>They adapted their methods while keeping their message pure</BulletItem>
                  <BulletItem>They developed leaders at every level of the organization</BulletItem>
                  <BulletItem>They multiplied disciples, not merely converts</BulletItem>
                  <BulletItem>They planted churches rather than simply growing attendance in one place</BulletItem>
                </BulletList>
              </PurpleSection>

              <SectionHeading>WHY JOHN MAXWELL?</SectionHeading>
              <YellowSection title="📚">
                <p>John C. Maxwell is recognized globally as a foremost voice on leadership development. His insights help us understand how the early church leaders operated with such effectiveness and clarity.</p>
                <p>Maxwell's contribution is extensive. He has spent more than forty years studying leadership principles and has sold more than thirty-one million books worldwide. His biblical commentary in the Maxwell Leadership Bible, paired with practical application from his broader work, offers a unique bridge between timeless truth and modern leadership practice. Maxwell often identifies principles others miss. Acts displays these principles in the most successful spiritual movement in history. Together, they provide both a biblical foundation and practical application. His approach helps us see that the early church's success followed proven leadership principles that still work. When we combine biblical truth with practical leadership wisdom, we position ourselves to experience similar results in our ministries.</p>
              </YellowSection>

              <SectionHeading>THE ACTS ADVANTAGE</SectionHeading>
              <BlueSection title="🎯">
                <p>Why study the first church? They had no advantages we do not already have. There were no church buildings or facilities, no sound systems or technology, no marketing budgets or programs, no seminary-trained staff, no denominational support, and no government backing. Yet they had the results we desperately want: explosive, sustainable growth; supernatural demonstrations of power; unity across cultural and social barriers; impact that transformed entire communities; courage under extreme persecution; and leadership development at every level. The conclusion is inescapable. <HighlightText color="blue">If they could do it with less, we can do it with more—if we follow their methods.</HighlightText></p>
              </BlueSection>

              <SectionHeading>YOUR 11-WEEK JOURNEY</SectionHeading>
              <GreenSection title="📅">
                <p>This study is designed for eleven weeks of learning and practice:</p>
                <BulletList>
                  <BulletItem>Week 1: Introduction and overview</BulletItem>
                  <BulletItem>Week 2: Preparation and Launch (Acts 1–2)</BulletItem>
                  <BulletItem>Week 3: Power and Opposition (Acts 3–5)</BulletItem>
                  <BulletItem>Week 4: Crisis and Growth (Acts 6–7)</BulletItem>
                  <BulletItem>Week 5: Expansion and Conversion (Acts 8–9)</BulletItem>
                  <BulletItem>Week 6: Breaking Barriers (Acts 10–12)</BulletItem>
                  <BulletItem>Week 7: First Missionary Journey (Acts 13–15)</BulletItem>
                  <BulletItem>Week 8: European Expansion (Acts 16–18)</BulletItem>
                  <BulletItem>Week 9: Ephesian Ministry (Acts 19–21)</BulletItem>
                  <BulletItem>Week 10: Trials and Testimony (Acts 22–26)</BulletItem>
                  <BulletItem>Week 11: Rome and Beyond (Acts 27–28)</BulletItem>
                </BulletList>
                <p>Each week includes clear applications designed to help you "do what they did" in your context.</p>
              </GreenSection>

              <SectionHeading>HOW TO USE THIS STUDY</SectionHeading>
              <PurpleSection title="🔧">
                <p>Each chapter includes:</p>
                <BulletList>
                  <BulletItem><HighlightText color="purple">What they faced</HighlightText> — the challenges and opportunities of the moment</BulletItem>
                  <BulletItem><HighlightText color="purple">What they did</HighlightText> — their specific methods and strategies</BulletItem>
                  <BulletItem><HighlightText color="purple">What they got</HighlightText> — the measurable results they achieved</BulletItem>
                  <BulletItem><HighlightText color="purple">Maxwell's insights</HighlightText> — leadership principles with book references</BulletItem>
                  <BulletItem><HighlightText color="purple">Your weekly challenge</HighlightText> — practical steps to apply their methods</BulletItem>
                  <BulletItem><HighlightText color="purple">Reflection questions</HighlightText> — for personal growth and group discussion</BulletItem>
                </BulletList>
              </PurpleSection>

              <SectionHeading>THE ACTS LEADERSHIP DNA</SectionHeading>
              <YellowSection title="⭐">
                <p>Maxwell identifies five characteristics that made the early church leaders so effective:</p>
                <BulletList>
                  <BulletItem><strong>Vision-driven:</strong> They knew exactly where they were going: "To the ends of the earth" (Acts 1:8)</BulletItem>
                  <BulletItem><strong>Spirit-empowered:</strong> They operated in supernatural power, not human ability (Acts 1:8; 2:4)</BulletItem>
                  <BulletItem><strong>People-focused:</strong> They prioritized relationships and community over programs (Acts 2:42–47)</BulletItem>
                  <BulletItem><strong>Mission-minded:</strong> Everything they did served their primary purpose of making disciples (Acts 2:47)</BulletItem>
                  <BulletItem><strong>Multiplication-oriented:</strong> They developed leaders who developed other leaders, strengthening and expanding churches (Acts 14:21–23)</BulletItem>
                </BulletList>
              </YellowSection>

              <SectionHeading>THE CORE PRINCIPLE</SectionHeading>
              <BlueSection title="💎">
                <p><HighlightText color="blue">"If we do what they did, we'll get what they got."</HighlightText> This is not about copying their exact methods; it is about applying their timeless principles in our modern context. The early church used first-century methods, but their principles were timeless. We must use twenty-first-century methods built on those same timeless principles. As Maxwell writes, "Leadership principles are timeless, but leadership methods must be timely" (Leadership 101, p. 45).</p>
              </BlueSection>

              <SectionHeading>YOUR PREPARATION FOR THE JOURNEY</SectionHeading>
              <PurpleSection title="❓">
                <p>Before beginning Week 2, consider a few critical questions:</p>
                <BulletList>
                  <BulletItem>What results do you want to see in your church or ministry?</BulletItem>
                  <BulletItem>What methods are you currently using to achieve those results?</BulletItem>
                  <BulletItem>How open are you to changing your approach if needed?</BulletItem>
                  <BulletItem>What would happen if your church grew like the early church grew?</BulletItem>
                  <BulletItem>Are you prepared to do what they did to get what they got?</BulletItem>
                </BulletList>
              </PurpleSection>

              <SectionHeading>THE PROMISE AND THE CHALLENGE</SectionHeading>
              <GreenSection title="🎁">
                <p>The promise is that God's power has not diminished. His methods still work. If we follow the early church's blueprint, we can expect similar results. The challenge is that their methods required sacrifice, courage, and complete dependence on God. Are we willing to pay the same price for the same results? Maxwell reminds us, "Everything worthwhile is uphill" (The 15 Invaluable Laws of Growth, p. 89). The early church understood this. They climbed every hill, faced every challenge, and overcame every obstacle because they knew their mission was worth any sacrifice.</p>
              </GreenSection>

              <SectionHeading>READY TO BEGIN?</SectionHeading>
              <YellowSection title="🚀">
                <p>The next ten weeks will challenge much of what you think you know about church growth, leadership, and ministry effectiveness. You will discover methods that seem too simple to work and principles that appear too demanding to follow. But remember: <HighlightText color="yellow">"If we do what they did, we'll get what they got."</HighlightText> The question is not whether their methods work—the Book of Acts proves they do. The question is whether we are willing to apply them. Let's find out.</p>
              </YellowSection>
            </div>
          </CardContent>
        </Card>

        {/* Text Content - Chapter 1 Section */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white text-center">
              CHAPTER 1: PREPARATION AND LAUNCH
            </CardTitle>
            <p className="text-center text-purple-200 text-lg">
              Acts 1–2 — "If We Prepare and Launch Like They Did …"
            </p>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <div className="text-white leading-relaxed space-y-6">
              <SectionHeading>WHAT THEY FACED</SectionHeading>
              <BlueSection title="💡">
                <p>The Ultimate Leadership Challenge was upon them. Their founder had just left. Their team was confused about timing and strategy. They had no resources, no facilities, and no organizational structure. Their enemies thought they were finished. The pressure was immense. Jesus had given them an impossible mission—reach the entire world—with no clear plan for how to accomplish it. The stakes could not have been higher. If they failed, Christianity would die with Jesus. If they succeeded, they would change history forever.</p>
              </BlueSection>

              <SectionHeading>WHAT THEY DID: THE TWO-PHASE SUCCESS STRATEGY</SectionHeading>

              <GreenSection title="PHASE 1: STRATEGIC PREPARATION (Acts 1:1–26)">
                <h4 className="text-lg font-semibold mb-3 text-blue-200">Step 1: Vision Clarification (vv. 6–8)</h4>
                <p>When the disciples asked about timing—“Lord, are you at this time going to restore the kingdom?”—Jesus redirected them from speculation to purpose and power. "You will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth" (v. 8). The vision formula was clear: local in Jerusalem, where they were; regional in Judea and Samaria, their nation; and global to the ends of the earth, everywhere else. As Maxwell's Law of Navigation says, "Anyone can steer the ship, but it takes a leader to chart the course" (The 21 Irrefutable Laws of Leadership, p. 17).</p>
              </GreenSection>

              <GreenSection title="">
                <h4 className="text-lg font-semibold mb-3 text-blue-200">Step 2: Power Connection (vv. 4–5, 8a)</h4>
                <p>Jesus instructed them, "Wait for the gift my Father promised … you will receive power when the Holy Spirit comes on you." Their waiting strategy was not passive, for they prayed and organized. It was not permanent, for the waiting had a specific purpose. It was not optional, because Jesus commanded it. And it was not wasted, since they used the time to prepare. Maxwell writes, "You cannot give what you do not have" (The 15 Invaluable Laws of Growth, p. 89).</p>
              </GreenSection>

              <GreenSection title="">
                <h4 className="text-lg font-semibold mb-3 text-blue-200">Step 3: Unity Building (vv. 12–14)</h4>
                <p>"They all joined together constantly in prayer" (v. 14). Their unity had four elements. It included all; every person participated, about 120 in total. They joined together; this was corporate, not merely individual prayer. They did so constantly; it was ongoing, not occasional. And it was prayer that formed their primary preparation activity. Those included were the eleven apostles, women disciples including Mary the mother of Jesus, Jesus' brothers, and other faithful followers. As Maxwell's Law of Significance reminds us, "One is too small a number to achieve greatness" (The 17 Indisputable Laws of Teamwork, p. 45).</p>
              </GreenSection>

              <GreenSection title="">
                <h4 className="text-lg font-semibold mb-3 text-blue-200">Step 4: Leadership Development (vv. 15–26)</h4>
                <p>Peter immediately addressed the leadership gap left by Judas's betrayal. Their selection process stood on a biblical foundation in fulfillment of Old Testament prophecy. The criteria were clear; the candidate had to be with them from the beginning. Their focus was on character and faithfulness rather than talent and fame. The decision involved the entire team, and the process invited divine guidance as they prayed for God's choice. The result was that Matthias was chosen and "added to the eleven apostles" (v. 26). As Maxwell says, "Everything rises and falls on leadership" (The 21 Irrefutable Laws of Leadership, p. 1).</p>
              </GreenSection>

              <GreenSection title="PHASE 2: EXPLOSIVE LAUNCH (Acts 2:1–47)">
                <h4 className="text-lg font-semibold mb-3 text-blue-200">Step 1: Supernatural Empowerment (vv. 1–4)</h4>
                <p>"When the day of Pentecost came, they were all together in one place." The empowerment experience engaged every sense. There was a sound like the blowing of a violent wind. There was a sight as tongues of fire came to rest on each of them. There was speech as they began to speak in other tongues. The multiplication principle was unmistakable. Instead of one person with supernatural power—Jesus—there were now 120 people supernaturally empowered. Maxwell's Law of Empowerment states, "Only secure leaders give power to others" (The 21 Irrefutable Laws of Leadership, p. 189).</p>
              </GreenSection>

              <GreenSection title="">
                <h4 className="text-lg font-semibold mb-3 text-blue-200">Step 2: Magnetic Attraction (vv. 5–13)</h4>
                <p>"When they heard this sound, a crowd came together in bewilderment" (v. 6). The crowd was massive, numbering in the thousands, and diverse, "from every nation under heaven" (v. 5). Their response mixed amazement with perplexity. The communication miracle was that each person heard the disciples speaking in their own native language about "the wonders of God" (v. 11). Languages represented included Parthians, Medes, Elamites, Mesopotamians, and at least twelve other distinct groups. Maxwell notes in Everyone Communicates, Few Connect, "Connecting is the ability to identify with people and relate to them in a way that increases your influence with them" (p. 23).</p>
              </GreenSection>

              <GreenSection title="">
                <h4 className="text-lg font-semibold mb-3 text-blue-200">Step 3: Crisis Leadership (vv. 14–36)</h4>
                <p>When critics accused them of being drunk, Peter seized the moment for one of the greatest sermons in church history. His response strategy was deliberate. He addressed the criticism directly (vv. 14–15), provided biblical context (vv. 16–21), presented the gospel clearly (vv. 22–36), and called for an immediate decision (v. 36). The message focused on Jesus—His life, death, resurrection, and lordship. Maxwell's Law of the Moment says, "Great leaders recognize a crucial moment and know how to seize it" (Leadership Gold, p. 89).</p>
              </GreenSection>

              <GreenSection title="">
                <h4 className="text-lg font-semibold mb-3 text-blue-200">Step 4: Massive Response (vv. 37–41)</h4>
                <p>"When the people heard this, they were cut to the heart and said, 'What shall we do?'" (v. 37). Peter's action plan was straightforward. Repent, changing your mind about Jesus. Be baptized, making a public declaration of faith. Receive the Holy Spirit, trusting God for personal empowerment. Accept the promise, which is for you and your children. The result was breathtaking: "About three thousand were added to their number that day" (v. 41).</p>
              </GreenSection>

              <GreenSection title="">
                <h4 className="text-lg font-semibold mb-3 text-blue-200">Step 5: Sustainable Systems (vv. 42–47)</h4>
                <p>They did not merely add 3,000 people. They integrated them immediately. Four pillars sustained their growth. They devoted themselves to the apostles' teaching, absorbing truth and doctrine (v. 42a). They embraced fellowship and the breaking of bread, forming deep relational bonds (v. 42b). They committed to prayer, seeking God together (v. 42c). And they practiced generosity, holding their possessions loosely, sharing freely, and giving to anyone who had need (vv. 44–45). Maxwell writes, "To add growth, lead followers—to multiply, lead leaders" (The 21 Irrefutable Laws of Leadership, p. 251).</p>
              </GreenSection>

              <SectionHeading>WHAT THEY GOT: UNPRECEDENTED RESULTS</SectionHeading>
              <PurpleSection title="📈">
                <p>The immediate results were astonishing. There were 3,000 new believers in a single day. There were zero dropouts recorded. New believers were completely integrated into church life. Supernatural signs and wonders multiplied (v. 43). And they enjoyed favor with all the people (v. 47a). The ongoing results showed sustained health. Daily growth continued as "the Lord added to their number daily those who were being saved" (v. 47b). They functioned as a unified community with no recorded divisions or factions. Their culture of generosity led many to sell possessions to help others. The atmosphere was joyful, marked by "glad and sincere hearts" (v. 46). The entire city took notice, and the church had favor with all the people.</p>
              </PurpleSection>

              <SectionHeading>MAXWELL'S LEADERSHIP LAWS IN ACTION</SectionHeading>
              <BlueSection title="📘">
                <p>The Law of Legacy was evident as Jesus prepared successors who exceeded His immediate impact. The Law of Explosive Growth was on display as they multiplied leaders, not just followers, producing exponential growth. The Law of the Big Mo became a reality as Pentecost created unstoppable momentum that carried them through future challenges.</p>
              </BlueSection>

              <SectionHeading>MODERN APPLICATION: THE PREPARATION–LAUNCH MODEL</SectionHeading>
              <YellowSection title="🔧">
                <p>Phase 1 is Preparation, the season before going public. Clarify your vision until everyone can repeat it. Build team unity through extended prayer and planning. Develop your leaders using character-based criteria. Wait for empowerment rather than rushing into activity.</p>
                <p>Phase 2 is Launch, when God opens the door. Seize the moment as opportunities arise. Communicate clearly across cultural and generational barriers. Have systems ready to handle rapid growth. Focus on multiplication, not mere addition. Maxwell observes, "The secret to successful launching is successful preparation" (Leadership Gold, p. 156).</p>
              </YellowSection>

              <SectionHeading>COMMON LAUNCH MISTAKES TO AVOID</SectionHeading>
              <RedSection title="⚠️">
                <BulletList>
                  <BulletItem>Mistake 1: Launching without adequate preparation — Acts 1–2 shows ten days of intensive preparation before public launch.</BulletItem>
                  <BulletItem>Mistake 2: Operating in human strength alone — they waited for supernatural empowerment.</BulletItem>
                  <BulletItem>Mistake 3: Having no systems for growth — four pillars were ready to receive and disciple 3,000 new people.</BulletItem>
                  <BulletItem>Mistake 4: Focusing on events instead of processes — they cultivated daily growth through sustainable systems.</BulletItem>
                </BulletList>
              </RedSection>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActsAudioPlayer;
