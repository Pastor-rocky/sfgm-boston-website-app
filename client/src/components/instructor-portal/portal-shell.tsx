import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  LogOut,
  BookOpen,
  UserPlus,
  Award,
  Shield,
  Camera,
} from "lucide-react";

export default function InstructorPortalShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const [location] = useLocation();
  const { user } = useAuth();
  const role = ((user as { role?: string } | null)?.role ?? "").toLowerCase();
  const email = ((user as { email?: string } | null)?.email ?? "").toLowerCase();
  const isDean = role === "dean" || role === "admin" || email === "pastor_rocky@sfgmboston.com";
  const studentsLabel = isDean ? "All Students" : "My Students";

  const navItems = [
    { href: "/instructor-portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/instructor-portal/essays", label: "Essay Inbox", icon: FileText },
    { href: "/instructor-portal/students", label: studentsLabel, icon: Users },
    { href: "/instructor-portal/certificates", label: "Certificates", icon: Award },
    { href: "/instructor-portal/messages", label: "Messages", icon: MessageSquare },
    { href: "/instructor-portal/obs-controller", label: "OBS Controller", icon: Camera },
    ...(isDean
      ? [
          { href: "/instructor-portal/applications", label: "Applications", icon: UserPlus },
          { href: "/instructor-portal/dean-tools", label: "Dean Tools", icon: Shield },
        ]
      : []),
  ];

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "Instructor";
  const church = (user as { sfgmChurch?: string } | null)?.sfgmChurch;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden md:flex w-64 flex-col bg-[#0b4f6c] text-white shadow-xl">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/15 flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">SFGM Instructor Portal</p>
              <p className="text-xs text-white/70">Bible School</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = item.exact
              ? location === item.href
              : location.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                    active
                      ? "bg-white text-[#0b4f6c] shadow"
                      : "text-white/90 hover:bg-white/10",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
          <Link href="/instructor-application">
            <span className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors cursor-pointer mt-4 border border-white/20">
              <UserPlus className="h-4 w-4" />
              Apply to teach
            </span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <p className="text-xs text-white/60 px-1">Signed in as</p>
          <p className="text-sm font-semibold px-1 truncate">{displayName}</p>
          {church ? <p className="text-xs text-white/70 px-1 truncate">{church}</p> : null}
          {isDean ? (
            <p className="text-xs text-amber-300 px-1 font-medium">Dean — all students</p>
          ) : null}
          <Link href="/logout">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-5">
          <div className="md:hidden mb-3 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const active = item.exact
                ? location === item.href
                : location.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <span
                    className={cn(
                      "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium border cursor-pointer",
                      active
                        ? "bg-[#0b4f6c] text-white border-[#0b4f6c]"
                        : "bg-white text-slate-700 border-slate-200",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle ? <p className="text-slate-600 mt-1">{subtitle}</p> : null}
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
