import { useEffect } from "react";
import { useLocation } from "wouter";
import { MAN_OF_GOD_COURSE_URL } from "@/lib/man-of-god-config";

/** Friendly URL alias — redirects to the enrolled course hub (course ID 16). */
export default function ManOfGodCourse() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation(MAN_OF_GOD_COURSE_URL);
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      Loading SFGM Man of God Course…
    </div>
  );
}
