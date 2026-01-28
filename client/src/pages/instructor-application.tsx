import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";

const COURSE_OTHER = "__other__";
const INSTRUCTOR_APP_EMAIL = "pastor_rocky@sfgmboston.com";
const INSTRUCTOR_APP_SUBJECT = "Instructor Application – SFGM Boston Bible School";

function buildEmailBody(
  form: Record<string, string>,
  userName: string,
  userEmail: string
): string {
  const courseVal =
    form.courseOfInterest === COURSE_OTHER
      ? form.courseOther?.trim()
        ? `Other: ${form.courseOther.trim()}`
        : "Other"
      : form.courseOfInterest;
  const lines: string[] = [
    "INSTRUCTOR APPLICATION",
    "—".repeat(40),
    "",
    "Applicant information",
    "—".repeat(40),
    `Name: ${userName || "(not provided)"}`,
    `Email: ${userEmail || "(not provided)"}`,
    `Phone: ${form.phone?.trim() || "(not provided)"}`,
    "",
    "Application details",
    "—".repeat(40),
    `Course interested in: ${courseVal || "(not provided)"}`,
    `SFGM church: ${form.sfgmChurch?.trim() || "(not provided)"}`,
    `Church position: ${form.churchPosition?.trim() || "(not provided)"}`,
    "",
    "Teaching experience:",
    form.teachingExperience?.trim() || "(not provided)",
    "",
    "Subjects of interest:",
    form.subjectsOfInterest?.trim() || "(not provided)",
    "",
    "Ministry background:",
    form.ministry_background?.trim() || "(not provided)",
    "",
    "Motivation for teaching:",
    form.motivation?.trim() || "(not provided)",
    "",
    "Availability:",
    form.availability?.trim() || "(not provided)",
    "",
    "Additional comments:",
    form.additionalComments?.trim() || "(none)",
  ];
  return lines.join("\r\n");
}

export default function InstructorApplication() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    courseOfInterest: "",
    courseOther: "",
    sfgmChurch: "",
    churchPosition: "",
    phone: (user as any)?.phone ?? "",
    teachingExperience: "",
    subjectsOfInterest: "",
    ministry_background: "",
    motivation: "",
    availability: "",
    additionalComments: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const r = await fetch("/api/courses");
      if (!r.ok) throw new Error("Failed to fetch courses");
      return r.json();
    },
    enabled: isAuthenticated,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit an instructor application",
        variant: "destructive",
      });
      return;
    }
    if (!formData.phone?.trim()) {
      toast({
        title: "Phone required",
        description: "Please provide your phone number.",
        variant: "destructive",
      });
      return;
    }
    const userName = `${(user as any)?.firstName ?? ""} ${(user as any)?.lastName ?? ""}`.trim();
    const userEmail = (user as any)?.email ?? "";
    const body = buildEmailBody(formData, userName, userEmail);
    const mailto = `mailto:${encodeURIComponent(INSTRUCTOR_APP_EMAIL)}?subject=${encodeURIComponent(INSTRUCTOR_APP_SUBJECT)}&body=${encodeURIComponent(body)}`;
    setIsSubmitting(true);
    window.location.href = mailto;
    toast({
      title: "Open your email",
      description:
        "Your email client should open with the application pre-filled. Please send the email to complete your application.",
    });
    setTimeout(() => {
      setFormData({
        courseOfInterest: "",
        courseOther: "",
        sfgmChurch: "",
        churchPosition: "",
        phone: (user as any)?.phone ?? "",
        teachingExperience: "",
        subjectsOfInterest: "",
        ministry_background: "",
        motivation: "",
        availability: "",
        additionalComments: "",
      });
      setIsSubmitting(false);
    }, 600);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/80 to-slate-100">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-lg mx-auto shadow-xl border-0 bg-white/90 backdrop-blur">
            <CardContent className="text-center py-12 px-8">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-lock text-2xl text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Sign in to apply</h2>
              <p className="text-slate-600 mb-8">
                Please log in to access the instructor application.
              </p>
              <Button
                onClick={() => (window.location.href = "/login")}
                className="bg-amber-600 hover:bg-amber-700 text-white px-8"
              >
                <i className="fas fa-sign-in-alt mr-2" />
                Log in
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900">
      <Navigation />

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(251,191,36,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 text-amber-300 px-4 py-1.5 text-sm font-medium mb-6">
            <i className="fas fa-chalkboard-teacher" />
            <span>Teach with SFGM Boston</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Become an instructor
          </h1>
          <p className="text-lg md:text-xl text-amber-100/90 max-w-2xl mx-auto mb-4">
            Join our ministry team and help spread God&apos;s Word through education. Share your
            knowledge and passion for biblical teaching with our students.
          </p>
          <p className="text-sm text-slate-400">
            Questions or prefer to reach out first?{" "}
            <Link
              href="/contact"
              className="text-amber-400 hover:text-amber-300 hover:underline transition-colors"
            >
              Contact the administrator
            </Link>
          </p>
        </div>
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 -mt-2">
        {/* Requirements pill */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { icon: "fa-check", label: "Ministry experience" },
            { icon: "fa-book", label: "Biblical knowledge" },
            { icon: "fa-heart", label: "Passion for teaching" },
            { icon: "fa-clock", label: "Time commitment" },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-slate-200 px-4 py-2 text-sm"
            >
              <i className={`fas ${icon} text-amber-400`} />
              {label}
            </span>
          ))}
        </div>

        {/* Form card */}
        <Card className="shadow-2xl border-white/10 bg-white/95 backdrop-blur overflow-hidden">
          <CardHeader className="border-b border-slate-200/80 bg-gradient-to-r from-amber-50 to-orange-50/50">
            <CardTitle className="text-xl text-slate-900">Application</CardTitle>
            <p className="text-slate-600 text-sm mt-1">
              Please fill out all fields so we can learn about your qualifications and interests.
            </p>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New fields: course, church, position */}
              <div className="grid gap-4 sm:grid-cols-1">
                <div>
                  <Label htmlFor="courseOfInterest" className="text-slate-700">
                    What course are you interested in being an instructor for?
                  </Label>
                  <select
                    id="courseOfInterest"
                    value={formData.courseOfInterest}
                    onChange={(e) => handleInputChange("courseOfInterest", e.target.value)}
                    className="mt-1.5 flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
                  >
                    <option value="">Select a course...</option>
                    {(courses as { id: number; name: string }[]).map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    <option value={COURSE_OTHER}>Other (please specify below)</option>
                  </select>
                  {formData.courseOfInterest === COURSE_OTHER && (
                    <Input
                      placeholder="Specify course or topic"
                      value={formData.courseOther}
                      onChange={(e) => handleInputChange("courseOther", e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="sfgmChurch" className="text-slate-700">
                    What SFGM church do you belong to?
                  </Label>
                  <Input
                    id="sfgmChurch"
                    placeholder="e.g. SFGM Boston, SFGM Orlando"
                    value={formData.sfgmChurch}
                    onChange={(e) => handleInputChange("sfgmChurch", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="churchPosition" className="text-slate-700">
                    What is your position in church?
                  </Label>
                  <Input
                    id="churchPosition"
                    placeholder="e.g. Deacon, Elder, Youth Leader, Member"
                    value={formData.churchPosition}
                    onChange={(e) => handleInputChange("churchPosition", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <Label htmlFor="phone" className="text-slate-700">
                  Phone number <span className="text-amber-600">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                  className="mt-1.5 max-w-xs"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2 border-t border-slate-200 pt-6">
                <div>
                  <Label htmlFor="teachingExperience" className="text-slate-700">
                    Teaching experience
                  </Label>
                  <Textarea
                    id="teachingExperience"
                    placeholder="Describe your previous teaching or training experience..."
                    value={formData.teachingExperience}
                    onChange={(e) => handleInputChange("teachingExperience", e.target.value)}
                    required
                    className="mt-1.5 min-h-24"
                  />
                </div>
                <div>
                  <Label htmlFor="subjectsOfInterest" className="text-slate-700">
                    Subjects of interest
                  </Label>
                  <Textarea
                    id="subjectsOfInterest"
                    placeholder="What biblical topics or courses would you like to teach?"
                    value={formData.subjectsOfInterest}
                    onChange={(e) => handleInputChange("subjectsOfInterest", e.target.value)}
                    required
                    className="mt-1.5 min-h-24"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ministry_background" className="text-slate-700">
                  Ministry background
                </Label>
                <Textarea
                  id="ministry_background"
                  placeholder="Tell us about your involvement in Christian ministry and church leadership..."
                  value={formData.ministry_background}
                  onChange={(e) => handleInputChange("ministry_background", e.target.value)}
                  required
                  className="mt-1.5 min-h-28"
                />
              </div>

              <div>
                <Label htmlFor="motivation" className="text-slate-700">
                  Motivation for teaching
                </Label>
                <Textarea
                  id="motivation"
                  placeholder="Why do you want to become an instructor at SFGM Boston Bible School?"
                  value={formData.motivation}
                  onChange={(e) => handleInputChange("motivation", e.target.value)}
                  required
                  className="mt-1.5 min-h-28"
                />
              </div>

              <div>
                <Label htmlFor="availability" className="text-slate-700">
                  Availability
                </Label>
                <Textarea
                  id="availability"
                  placeholder="When are you available to create content and interact with students?"
                  value={formData.availability}
                  onChange={(e) => handleInputChange("availability", e.target.value)}
                  className="mt-1.5 min-h-20"
                />
              </div>

              <div>
                <Label htmlFor="additionalComments" className="text-slate-700">
                  Additional comments
                </Label>
                <Textarea
                  id="additionalComments"
                  placeholder="Anything else you'd like us to know..."
                  value={formData.additionalComments}
                  onChange={(e) => handleInputChange("additionalComments", e.target.value)}
                  className="mt-1.5 min-h-20"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-6 border-t border-slate-200">
                <Link href="/dashboard">
                  <Button type="button" variant="outline" className="w-full sm:w-auto">
                    <i className="fas fa-arrow-left mr-2" />
                    Back to dashboard
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2" />
                      Opening email...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-envelope mr-2" />
                      Submit application (opens email)
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
