import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, BookOpen, GraduationCap, Settings, Shield, 
  UserPlus, Trash2, Key, Award, Building2, Mail, Phone,
  ArrowLeft, LogOut, Plus, Edit, CheckCircle, XCircle, ChevronDown, BookOpen as BookOpenIcon, UserX, Ban, Unlock
} from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SFGM_CHURCHES } from "@/lib/sfgm-churches";


const INSTRUCTOR_CHURCH_POSITIONS = ["Pastor", "Elder", "Deacon", "Teacher", "Minister"] as const;


export default function AdminPanel() {
  const { isAuthenticated: isLoggedIn } = useAuth();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  const [showDeleteCourseDialog, setShowDeleteCourseDialog] = useState(false);
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false);
  const [showGradesDialog, setShowGradesDialog] = useState(false);
  const [showEnrollmentsDialog, setShowEnrollmentsDialog] = useState(false);
  const [selectedCourseToEnroll, setSelectedCourseToEnroll] = useState<number | null>(null);
  const [showAssignInstructorDialog, setShowAssignInstructorDialog] = useState(false);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>("");
  const [showChurchInstructorDialog, setShowChurchInstructorDialog] = useState(false);
  const [editingChurch, setEditingChurch] = useState<typeof SFGM_CHURCHES[0] | null>(null);
  const [churchInstructorForm, setChurchInstructorForm] = useState({ instructorName: "", email: "", phone: "" });
  const [showAddInstructorDialog, setShowAddInstructorDialog] = useState(false);
  const [selectedChurchForInstructor, setSelectedChurchForInstructor] = useState<typeof SFGM_CHURCHES[0] | null>(null);
  const [selectedStudentToPromote, setSelectedStudentToPromote] = useState<string>("");
  const [createNewInstructor, setCreateNewInstructor] = useState(false);
  const [showEditDefaultDialog, setShowEditDefaultDialog] = useState(false);
  const [selectedDefaultInstructor, setSelectedDefaultInstructor] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [testEmailTo, setTestEmailTo] = useState("");
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: "",
    description: "",
    duration: 4,
    category: "",
    difficulty: "",
    points: 0,
  });
  const [newUser, setNewUser] = useState({
    churchPosition: "" as "" | (typeof INSTRUCTOR_CHURCH_POSITIONS)[number],
    name: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    role: "student" as const,
    sfgmChurch: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const adminPasswordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoggedIn && !isAuthenticated) {
      adminPasswordInputRef.current?.focus();
    }
  }, [isLoggedIn, isAuthenticated]);

  // Custom API request with admin headers (uses typed password)
  const adminApiRequest = async (method: string, url: string, data?: unknown): Promise<Response> => {
    const headers: Record<string, string> = {
      'x-admin-password': password,
    };

    if (data) headers['Content-Type'] = 'application/json';

    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });

    if (!res.ok) {
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }

    return res;
  };

  const handleLogin = async () => {
    try {
      // Verify admin password by calling a protected admin endpoint
      await adminApiRequest('GET', '/api/admin/users');
      setIsAuthenticated(true);
      toast({
        title: 'Access Granted',
        description: 'Welcome to the Admin Panel',
      });
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes('503') && msg.includes('Admin panel is not configured')) {
        toast({
          title: 'Admin Panel Not Configured',
          description: 'Set ADMIN_PASSWORD in Render environment variables, then redeploy/restart.',
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Access Denied',
        description: msg.includes('401') ? 'Invalid admin password' : msg,
        variant: 'destructive',
      });
    }
  };

  // Fetch users
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await adminApiRequest("GET", "/api/admin/users");
      return response.json();
    },
    enabled: isAuthenticated && isLoggedIn,
    retry: false,
  });

  // Fetch courses
  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useQuery({
    queryKey: ["/api/admin/courses"],
    queryFn: async () => {
      const response = await adminApiRequest("GET", "/api/admin/courses");
      return response.json();
    },
    enabled: isAuthenticated && isLoggedIn,
    retry: false,
  });

  // Fetch church instructor info (name, email, phone overrides per church)
  const { data: churchInstructorMap = {} } = useQuery({
    queryKey: ["/api/admin/church-instructors"],
    queryFn: async () => {
      try {
        const response = await adminApiRequest("GET", "/api/admin/church-instructors");
        return response.json();
      } catch {
        return {};
      }
    },
    enabled: isAuthenticated && isLoggedIn,
    retry: false,
  });

  // Fetch grades for selected user
  const { data: gradesData, isLoading: gradesLoading } = useQuery({
    queryKey: ["/api/admin/users", selectedUser?.id, "grades"],
    queryFn: async () => {
      const response = await adminApiRequest(
        "GET",
        `/api/admin/users/${selectedUser.id}/grades`
      );
      return response.json();
    },
    enabled: isAuthenticated && isLoggedIn && !!selectedUser && showGradesDialog,
    retry: false,
  });

  // Fetch enrollments for selected user
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/admin/users", selectedUser?.id, "enrollments"],
    queryFn: async () => {
      const response = await adminApiRequest(
        "GET",
        `/api/admin/users/${selectedUser.id}/enrollments`
      );
      return response.json();
    },
    enabled: isAuthenticated && isLoggedIn && !!selectedUser && showEnrollmentsDialog,
    retry: false,
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await adminApiRequest(
        "DELETE",
        `/api/admin/users/${userId}`
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "User has been permanently removed from the system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowDeleteUserDialog(false);
      setSelectedUser(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Block/unblock user mutation
  const blockUserMutation = useMutation({
    mutationFn: async ({ userId, isBlocked }: { userId: string; isBlocked: boolean }) => {
      const response = await adminApiRequest(
        "PATCH",
        `/api/admin/users/${userId}/block`,
        { isBlocked }
      );
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.isBlocked ? "User Blocked" : "User Unblocked",
        description: `User has been ${variables.isBlocked ? "blocked" : "unblocked"} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user block status",
        variant: "destructive",
      });
    },
  });

  // Enroll student in course mutation
  const enrollStudentMutation = useMutation({
    mutationFn: async ({ userId, courseId }: { userId: string; courseId: number }) => {
      const response = await adminApiRequest(
        "POST",
        `/api/admin/users/${userId}/enroll`,
        { courseId }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Student Enrolled",
        description: "Student has been enrolled in the course successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users", selectedUser?.id, "enrollments"] });
      setSelectedCourseToEnroll(null);
    },
    onError: (e: any) => {
      toast({
        title: "Error",
        description: e?.message || "Failed to enroll student",
        variant: "destructive",
      });
    },
  });

  // Unenroll student from course mutation
  const unenrollStudentMutation = useMutation({
    mutationFn: async ({ userId, courseId }: { userId: string; courseId: number }) => {
      const response = await adminApiRequest(
        "DELETE",
        `/api/admin/users/${userId}/enrollments/${courseId}`
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Student Unenrolled",
        description: "Student has been unenrolled from the course successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users", selectedUser?.id, "enrollments"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unenroll student",
        variant: "destructive",
      });
    },
  });

  // Update user role mutation (student/instructor/dean only, not admin)
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "student" | "instructor" | "dean" }) => {
      const response = await adminApiRequest(
        "PATCH",
        `/api/admin/users/${userId}/role`,
        { role }
      );
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Role Updated",
        description: `User role has been changed to ${variables.role}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/church-instructors"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  // Update user's church mutation
  const updateUserChurchMutation = useMutation({
    mutationFn: async ({ userId, sfgmChurch }: { userId: string; sfgmChurch: string | null }) => {
      console.log("[FRONTEND] Updating church for user:", userId, "to:", sfgmChurch);
      const response = await adminApiRequest(
        "PATCH",
        `/api/admin/users/${userId}/church`,
        { sfgmChurch: sfgmChurch || null }
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[FRONTEND] Church update failed:", errorText);
        throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      console.log("[FRONTEND] Church update response:", result);
      return result;
    },
    onMutate: async ({ userId, sfgmChurch }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["/api/admin/users"] });
      
      // Snapshot the previous value
      const previousUsersData = queryClient.getQueryData(["/api/admin/users"]);
      
      // Optimistically update the cache - ensure sfgmChurch is properly set and trimmed
      const churchValue = sfgmChurch ? String(sfgmChurch).trim() : null;
      console.log(`[OPTIMISTIC] Updating user ${userId} church to: "${churchValue}"`);
      
      queryClient.setQueryData(["/api/admin/users"], (old: any) => {
        if (!old || !old.users) return old;
        // Create a new array to ensure React detects the change
        const updatedUsers = old.users.map((user: any) => {
          if (user.id === userId) {
            const updated = { 
              ...user, 
              sfgmChurch: churchValue
            };
            console.log(`[OPTIMISTIC] User ${userId} updated:`, updated);
            return updated;
          }
          return user;
        });
        // Return new object to trigger re-render
        return {
          ...old,
          users: updatedUsers,
          count: updatedUsers.length,
        };
      });
      
      return { previousUsersData };
    },
    onSuccess: (data, variables) => {
      console.log("[SUCCESS] Church update success, server response:", data);
      const serverChurch = data?.user?.sfgmChurch ? String(data.user.sfgmChurch).trim() : null;
      console.log(`[SUCCESS] Server returned church for ${variables.userId}: "${serverChurch}"`);
      
      
      // Also update the cache immediately with server response
      queryClient.setQueryData(["/api/admin/users"], (old: any) => {
        if (!old || !old.users) return old;
        const updatedUsers = old.users.map((user: any) => {
          if (user.id === variables.userId) {
            // Use the server response if available, otherwise use the variable
            const updatedUser = data?.user 
              ? { ...data.user, sfgmChurch: serverChurch }
              : { ...user, sfgmChurch: variables.sfgmChurch ? String(variables.sfgmChurch).trim() : null };
            console.log(`[SUCCESS] Updating user ${user.id} in cache - old: "${user.sfgmChurch}", new: "${updatedUser.sfgmChurch}"`);
            return updatedUser;
          }
          return user;
        });
        return {
          ...old,
          users: updatedUsers,
          count: updatedUsers.length,
        };
      });
      
      toast({
        title: "Church Updated",
        description: variables.sfgmChurch 
          ? `User's church has been set to ${variables.sfgmChurch}.`
          : "User's church assignment has been removed.",
      });
      
      // Invalidate to trigger re-renders
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/church-instructors"] });
      
      // Force a component re-render by updating refresh key
      setRefreshKey(prev => prev + 1);
    },
    onError: (error: any, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousUsersData) {
        queryClient.setQueryData(["/api/admin/users"], context.previousUsersData);
      }
      const errorMessage = error?.message || "Failed to update user's church";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Demote instructor to student mutation (kept for backward compatibility)
  const demoteInstructorMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await adminApiRequest(
        "PATCH",
        `/api/admin/users/${userId}/role`,
        { role: "student" }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Instructor Removed",
        description: "The instructor has been demoted to student role.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/church-instructors"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove instructor",
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      const response = await adminApiRequest(
        "PUT",
        `/api/admin/users/${userId}/password`,
        { newPassword }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "User password has been changed successfully.",
      });
      setShowPasswordDialog(false);
      setNewPassword("");
      setSelectedUser(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    },
  });

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async (form: typeof newUser) => {
      const name = (form.name ?? "").trim();
      const firstName = form.churchPosition
        ? `${form.churchPosition} ${name}`.trim()
        : name;
      const payload = {
        firstName,
        lastName: "",
        email: form.email,
        username: form.username,
        phone: form.phone || undefined,
        password: form.password,
        role: form.role,
        sfgmChurch: form.sfgmChurch || undefined,
      };
      const response = await adminApiRequest("POST", "/api/admin/users", payload);
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "User Created",
        description: "New user has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      // Also refresh church instructor info if it was an instructor with a church
      if (variables.role === "instructor" && variables.sfgmChurch) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/church-instructors"] });
        queryClient.refetchQueries({ queryKey: ["/api/admin/church-instructors"] });
      }
      // If this was an instructor with a church, it was likely from the add instructor dialog
      if (variables.role === "instructor" && variables.sfgmChurch) {
        setShowAddInstructorDialog(false);
        setSelectedChurchForInstructor(null);
        setCreateNewInstructor(false);
        setSelectedStudentToPromote("");
      } else {
        setShowUserDialog(false);
      }
      // Reset form
      setNewUser({
        churchPosition: "",
        name: "",
        email: "",
        username: "",
        phone: "",
        password: "",
        role: "student",
        sfgmChurch: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  // Assign instructor to course mutation
  const assignInstructorMutation = useMutation({
    mutationFn: async ({ courseId, instructorId }: { courseId: number; instructorId: string | null }) => {
      const response = await adminApiRequest("PATCH", `/api/admin/courses/${courseId}/instructor`, {
        instructorId: instructorId || null,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Instructor Assigned",
        description: "Instructor has been assigned to the course successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      setShowAssignInstructorDialog(false);
      setSelectedInstructorId("");
      setSelectedCourse(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to assign instructor",
        variant: "destructive",
      });
    },
  });

  // Add course mutation
  const addCourseMutation = useMutation({
    mutationFn: async (courseData: typeof newCourse) => {
      const response = await adminApiRequest(
        "POST",
        "/api/admin/courses",
        courseData
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Course Created",
        description: "New course has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      setShowAddCourseDialog(false);
      setNewCourse({
        name: "",
        description: "",
        duration: 4,
        category: "",
        difficulty: "",
        points: 0,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create course",
        variant: "destructive",
      });
    },
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const response = await adminApiRequest(
        "DELETE",
        `/api/admin/courses/${courseId}`
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Course Deleted",
        description: "Course has been removed from the system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      setShowDeleteCourseDialog(false);
      setSelectedCourse(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    },
  });

  // Promote student to instructor
  const promoteToInstructorMutation = useMutation({
    mutationFn: async ({ userId, church }: { userId: string; church: string }) => {
      // First promote the user
      const roleResponse = await adminApiRequest("PATCH", `/api/admin/users/${userId}/role`, { role: "instructor" });
      const userData = await roleResponse.json();
      
      // Then update church instructor info
      const user = users.find((u: any) => u.id === userId);
      if (user) {
        const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        await adminApiRequest("PUT", `/api/admin/church-instructors/${encodeURIComponent(church)}`, {
          instructorName: fullName,
          email: user.email || "",
          phone: user.phone || "",
        });
      }
      
      return userData;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Student promoted to instructor and added to church list." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/church-instructors"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/church-instructors"] });
      setShowAddInstructorDialog(false);
      setSelectedChurchForInstructor(null);
      setSelectedStudentToPromote("");
      setCreateNewInstructor(false);
    },
    onError: (e: any) => {
      toast({
        title: "Error",
        description: e?.message || "Failed to promote student to instructor",
        variant: "destructive",
      });
    },
  });

  // Update church instructor info (name, email, phone)
  const updateChurchInstructorMutation = useMutation({
    mutationFn: async ({ church, ...body }: { church: string; instructorName: string; email: string; phone: string }) => {
      const response = await adminApiRequest(
        "PUT",
        `/api/admin/church-instructors/${encodeURIComponent(church)}`,
        body
      );
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Default instructor updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/church-instructors"] });
      setShowChurchInstructorDialog(false);
      setShowEditDefaultDialog(false);
      setEditingChurch(null);
      setSelectedDefaultInstructor("");
    },
    onError: (e: any) => {
      toast({
        title: "Error",
        description: e?.message || "Failed to update church instructor info",
        variant: "destructive",
      });
    },
  });

  const users = (usersData?.users || []).map((u: any) => ({
    ...u,
    sfgmChurch: u.sfgmChurch ? String(u.sfgmChurch).trim() : null
  }));

  // Memoize expensive church filtering to prevent recalculation on every render - O(n) instead of O(n*m)
  const { usersByChurchMap, usersWithoutChurch } = useMemo(() => {
    if (!users || users.length === 0) {
      return { usersByChurchMap: new Map<string, any[]>(), usersWithoutChurch: [] };
    }
    
    const churchMap = new Map<string, any[]>();
    
    // Simple exact match first (fastest)
    const usersByExactChurch = new Map<string, any[]>();
    users.forEach((u: any) => {
      if (u.sfgmChurch && u.sfgmChurch.trim()) {
        const church = u.sfgmChurch.trim();
        if (!usersByExactChurch.has(church)) {
          usersByExactChurch.set(church, []);
        }
        usersByExactChurch.get(church)!.push(u);
      }
    });
    
    // Map to SFGM_CHURCHES structure
    SFGM_CHURCHES.forEach((church) => {
      const exactMatch = usersByExactChurch.get(church.church);
      if (exactMatch && exactMatch.length > 0) {
        churchMap.set(church.church, exactMatch);
      }
    });
    
    const withoutChurch = users.filter((u: any) => !u.sfgmChurch || !u.sfgmChurch.trim());
    
    return { usersByChurchMap: churchMap, usersWithoutChurch: withoutChurch };
  }, [users]);
  const instructors = users.filter((u: any) => {
    const role = (u.role || "").toLowerCase();
    return role === "instructor" || role === "dean";
  });
  const courses = coursesData?.courses || [];
  const grades = gradesData?.grades || [];

  const adminGateBackground = (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
      </div>
      <Navigation />
    </div>
  );

  if (!isLoggedIn) {
    return (
      <>
        {adminGateBackground}
        <Dialog open>
          <DialogContent
            className="bg-gradient-to-br from-slate-900 to-slate-800 border-white/20 text-white sm:max-w-md [&>button]:hidden"
            onInteractOutside={(event) => event.preventDefault()}
            onEscapeKeyDown={(event) => event.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-300" />
                Sign in required
              </DialogTitle>
              <DialogDescription className="text-blue-200">
                Log in to your SFGM account before opening the admin panel.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => { window.location.href = "/login"; }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Go to Login
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {adminGateBackground}
        <Dialog open>
          <DialogContent
            className="bg-gradient-to-br from-slate-900 to-slate-800 border-white/20 text-white sm:max-w-md [&>button]:hidden"
            onInteractOutside={(event) => event.preventDefault()}
            onEscapeKeyDown={(event) => event.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-300" />
                Admin Panel
              </DialogTitle>
              <DialogDescription className="text-blue-200">
                Enter the admin password to continue.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <Input
                ref={adminPasswordInputRef}
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                autoComplete="current-password"
              />
              <Button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Shield className="w-4 h-4 mr-2" />
                Continue
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Get students from selected church for promotion dropdown (with flexible matching)
  const studentsFromChurch = selectedChurchForInstructor
    ? users.filter((u: any) => {
        if ((u.role || "").toLowerCase() !== "student" || !u.sfgmChurch) {
          return false;
        }
        const userChurch = (u.sfgmChurch || "").trim();
        const targetChurch = selectedChurchForInstructor.church.trim();
        // Try multiple matching strategies
        return (
          userChurch === targetChurch ||
          userChurch.toLowerCase() === targetChurch.toLowerCase() ||
          userChurch.toLowerCase().includes(targetChurch.toLowerCase()) ||
          targetChurch.toLowerCase().includes(userChurch.toLowerCase()) ||
          userChurch.toLowerCase().includes(selectedChurchForInstructor.city.toLowerCase()) ||
          targetChurch.toLowerCase().includes(selectedChurchForInstructor.city.toLowerCase())
        );
      })
    : [];

  // Get all instructors grouped by church (case-insensitive matching)
  // Include both instructors and deans
  const instructorsByChurch = users.reduce((acc: Record<string, any[]>, user: any) => {
    const role = (user.role || "").toLowerCase();
    if ((role === "instructor" || role === "dean") && user.sfgmChurch) {
      // Normalize church name for matching (trim and case-insensitive)
      const normalizedChurch = user.sfgmChurch.trim();
      
      // Try exact match first
      let matchedChurch = SFGM_CHURCHES.find(c => c.church === normalizedChurch)?.church;
      
      // If no exact match, try case-insensitive
      if (!matchedChurch) {
        matchedChurch = SFGM_CHURCHES.find(c => 
          c.church.toLowerCase() === normalizedChurch.toLowerCase()
        )?.church;
      }
      
      // Use matched church or original if no match found
      const churchKey = matchedChurch || normalizedChurch;
      
      if (!acc[churchKey]) {
        acc[churchKey] = [];
      }
      acc[churchKey].push(user);
    }
    return acc;
  }, {});
  
  // Also create a map with all possible church name variations for lookup
  const allInstructorsByChurchVariations: Record<string, any[]> = {};
  Object.entries(instructorsByChurch).forEach(([churchKey, instructors]) => {
    // Add to exact key
    allInstructorsByChurchVariations[churchKey] = instructors;
    // Add to lowercase key
    allInstructorsByChurchVariations[churchKey.toLowerCase()] = instructors;
    // Try to match with SFGM_CHURCHES
    const matchedChurch = SFGM_CHURCHES.find(c => 
      c.church.toLowerCase() === churchKey.toLowerCase() ||
      c.church === churchKey
    );
    if (matchedChurch) {
      allInstructorsByChurchVariations[matchedChurch.church] = instructors;
    }
  });

  // Get instructor names for courses
  const getInstructorName = (instructorId: string | null | undefined) => {
    if (!instructorId) return "Unassigned";
    const instructor = users.find((u: any) => u.id === instructorId);
    if (!instructor) return "Unknown";
    return `${instructor.firstName || ""} ${instructor.lastName || ""}`.trim() || instructor.username || "Unknown";
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      <Navigation />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black text-white mb-1 drop-shadow-lg">Admin Panel</h1>
                    <p className="text-blue-200 font-medium">Manage users, courses, and system settings</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 border border-white/20">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAuthenticated(false)}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-white/10 backdrop-blur-md border border-white/20 p-1 rounded-xl">
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-blue-200 rounded-lg"
            >
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="instructors"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-blue-200 rounded-lg"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Instructors
            </TabsTrigger>
            <TabsTrigger 
              value="courses"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-blue-200 rounded-lg"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-blue-200 rounded-lg"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                      <Users className="w-6 h-6" />
                      All Users {usersData?.count !== undefined && (
                        <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                          {usersData.count}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-blue-200">Manage user accounts organized by church</CardDescription>
                  </div>
                  <Button 
                    onClick={() => {
                      setNewUser({
                        churchPosition: "", name: "", email: "", username: "", phone: "", password: "",
                        role: "student",
                        sfgmChurch: "",
                      });
                      setShowUserDialog(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {usersError && (
                  <div className="text-center py-8 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">
                    <XCircle className="w-8 h-8 mx-auto mb-2" />
                    Error loading users: {usersError instanceof Error ? usersError.message : 'Unknown error'}
                  </div>
                )}
                {usersLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-blue-200">Loading users...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Group users by church - using memoized data */}
                    {(() => {
                      return (
                        <>
                          {/* Show churches with users */}
                          {Array.from(usersByChurchMap.entries()).map(([churchName, churchUsers]) => {
                            const church = SFGM_CHURCHES.find(c => c.church === churchName) || SFGM_CHURCHES[0];
                            const userIds = churchUsers.map((u: any) => u.id).sort().join(',');
                            return (
                              <Card key={`${churchName}-${userIds}`} className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl">
                                <CardHeader>
                                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                    <Building2 className="w-5 h-5" />
                                    {churchName}
                                    <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                                      {churchUsers.length} {churchUsers.length === 1 ? 'user' : 'users'}
                                    </Badge>
                                  </CardTitle>
                                  <CardDescription className="text-blue-200">
                                    {church.city}, {church.state}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="border-white/20 hover:bg-white/5">
                                          <TableHead className="text-blue-200 font-semibold">Username</TableHead>
                                          <TableHead className="text-blue-200 font-semibold">Name</TableHead>
                                          <TableHead className="text-blue-200 font-semibold">Email</TableHead>
                                          <TableHead className="text-blue-200 font-semibold">Phone</TableHead>
                                          <TableHead className="text-blue-200 font-semibold">Church</TableHead>
                                          <TableHead className="text-blue-200 font-semibold">Role</TableHead>
                                          <TableHead className="text-blue-200 font-semibold">Created</TableHead>
                                          <TableHead className="text-blue-200 font-semibold">Actions</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {churchUsers.map((user: any) => {
                                          const churchValue = user.sfgmChurch && user.sfgmChurch.trim() ? user.sfgmChurch.trim() : "none";
                                          // Debug log to see what value the Select is receiving
                                          if (user.id === 'pastor-rocky') {
                                            console.log(`[RENDER] Rendering Select for ${user.id}, church value: "${churchValue}", user.sfgmChurch: "${user.sfgmChurch}"`);
                                          }
                                          return (
                                          <TableRow key={user.id} className="border-white/10 hover:bg-white/10 transition-colors">
                                            <TableCell className="font-medium text-white">
                                              <div className="flex items-center gap-2">
                                                {user.username || 'N/A'}
                                                {user.isBlocked && (
                                                  <Badge className="bg-red-500/20 text-red-200 border-red-400/30 text-xs">
                                                    <Ban className="w-3 h-3 mr-1" />
                                                    Blocked
                                                  </Badge>
                                                )}
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-white">
                                              {`${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A"}
                                            </TableCell>
                                            <TableCell className="text-blue-200">{user.email || 'N/A'}</TableCell>
                                            <TableCell className="text-blue-200">{user.phone || 'N/A'}</TableCell>
                                            <TableCell>
                                              {/* Church dropdown - key forces re-render when church changes */}
                                              <Select
                                                key={`church-select-${user.id}-${churchValue}-${refreshKey}`}
                                                value={churchValue}
                                                onValueChange={(newChurch: string) => {
                                                  const newChurchValue = newChurch === "none" ? null : newChurch.trim();
                                                  console.log(`[SELECT] Changing church for ${user.id} from "${user.sfgmChurch}" to "${newChurchValue}"`);
                                                  updateUserChurchMutation.mutate({ 
                                                    userId: user.id, 
                                                    sfgmChurch: newChurchValue
                                                  });
                                                }}
                                                disabled={updateUserChurchMutation.isPending}
                                              >
                                                <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white hover:bg-white/20">
                                                  <SelectValue placeholder="Select church">
                                                    {user.sfgmChurch && user.sfgmChurch.trim() ? user.sfgmChurch.trim() : "No church"}
                                                  </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-800 border-white/20 max-h-[300px] overflow-y-auto">
                                                  <SelectItem value="none" className="text-white focus:bg-white/20 cursor-pointer">
                                                    No church
                                                  </SelectItem>
                                                  {[...SFGM_CHURCHES]
                                                    .sort((a, b) => a.church.localeCompare(b.church))
                                                    .map((church) => (
                                                      <SelectItem 
                                                        key={church.church} 
                                                        value={church.church}
                                                        className="text-white focus:bg-white/20 cursor-pointer"
                                                      >
                                                        {church.church}
                                                      </SelectItem>
                                                    ))}
                                                </SelectContent>
                                              </Select>
                                            </TableCell>
                                            <TableCell>
                                              {/* Role dropdown - only allow student/instructor/dean, not admin */}
                                              {user.role === 'admin' ? (
                                                <Badge className="bg-red-500/20 text-red-200 border-red-400/30">
                                                  Admin
                                                </Badge>
                                              ) : (
                                                <Select
                                                  value={user.role || "student"}
                                                  onValueChange={(newRole: "student" | "instructor" | "dean") => {
                                                    updateRoleMutation.mutate({ userId: user.id, role: newRole });
                                                  }}
                                                  disabled={updateRoleMutation.isPending}
                                                >
                                                  <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white hover:bg-white/20">
                                                    <SelectValue>
                                                      <Badge className={
                                                        user.role === 'instructor' ? 'bg-purple-500/20 text-purple-200 border-purple-400/30' :
                                                        user.role === 'dean' ? 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30' :
                                                        'bg-blue-500/20 text-blue-200 border-blue-400/30'
                                                      }>
                                                        {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
                                                      </Badge>
                                                    </SelectValue>
                                                  </SelectTrigger>
                                                  <SelectContent className="bg-slate-800 border-white/20">
                                                    <SelectItem value="student" className="text-white focus:bg-white/20 cursor-pointer">
                                                      Student
                                                    </SelectItem>
                                                    <SelectItem value="instructor" className="text-white focus:bg-white/20 cursor-pointer">
                                                      Instructor
                                                    </SelectItem>
                                                    <SelectItem value="dean" className="text-white focus:bg-white/20 cursor-pointer">
                                                      Dean
                                                    </SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              )}
                                            </TableCell>
                                            <TableCell className="text-blue-200">
                                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex gap-2">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowGradesDialog(true);
                                                  }}
                                                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                                                >
                                                  <Award className="w-3 h-3 mr-1" />
                                                  Grades
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => {
                                                    setSelectedUser(user);
                                                    setNewPassword("");
                                                    setShowPasswordDialog(true);
                                                  }}
                                                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                                                >
                                                  <Key className="w-3 h-3 mr-1" />
                                                  Password
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="destructive"
                                                  onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowDeleteUserDialog(true);
                                                  }}
                                                  className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-400/30"
                                                >
                                                  <Trash2 className="w-3 h-3 mr-1" />
                                                  Delete
                                                </Button>
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                          );
                                        })}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                          
                          {/* Show users without church assigned */}
                          {usersWithoutChurch.length > 0 && (
                            <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl">
                              <CardHeader>
                                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                  <Users className="w-5 h-5" />
                                  No Church Assigned
                                  <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-400/30">
                                    {usersWithoutChurch.length} {usersWithoutChurch.length === 1 ? 'user' : 'users'}
                                  </Badge>
                                </CardTitle>
                                <CardDescription className="text-blue-200">
                                  Users without a church assignment
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="border-white/20 hover:bg-white/5">
                                        <TableHead className="text-blue-200 font-semibold">Username</TableHead>
                                        <TableHead className="text-blue-200 font-semibold">Name</TableHead>
                                        <TableHead className="text-blue-200 font-semibold">Email</TableHead>
                                        <TableHead className="text-blue-200 font-semibold">Phone</TableHead>
                                        <TableHead className="text-blue-200 font-semibold">Church</TableHead>
                                        <TableHead className="text-blue-200 font-semibold">Role</TableHead>
                                        <TableHead className="text-blue-200 font-semibold">Created</TableHead>
                                        <TableHead className="text-blue-200 font-semibold">Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {usersWithoutChurch.map((user: any) => {
                                        // Compute churchValue consistently to ensure proper re-rendering
                                        const churchValue = user.sfgmChurch && user.sfgmChurch.trim() ? user.sfgmChurch.trim() : "none";
                                        return (
                                          <TableRow key={user.id} className="border-white/10 hover:bg-white/10 transition-colors">
                                            <TableCell className="font-medium text-white">
                                              <div className="flex items-center gap-2">
                                                {user.username || 'N/A'}
                                                {user.isBlocked && (
                                                  <Badge className="bg-red-500/20 text-red-200 border-red-400/30 text-xs">
                                                    <Ban className="w-3 h-3 mr-1" />
                                                    Blocked
                                                  </Badge>
                                                )}
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-white">
                                              {`${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A"}
                                            </TableCell>
                                            <TableCell className="text-blue-200">{user.email || 'N/A'}</TableCell>
                                            <TableCell className="text-blue-200">{user.phone || 'N/A'}</TableCell>
                                            <TableCell>
                                              {/* Church dropdown - key forces re-render when church changes */}
                                              <Select
                                                key={`church-select-${user.id}-${churchValue}-${refreshKey}`}
                                                value={churchValue}
                                                onValueChange={(newChurch: string) => {
                                                  const newChurchValue = newChurch === "none" ? null : newChurch.trim();
                                                  console.log(`[SELECT] Changing church for ${user.id} from "${user.sfgmChurch}" to "${newChurchValue}"`);
                                                  updateUserChurchMutation.mutate({ 
                                                    userId: user.id, 
                                                    sfgmChurch: newChurchValue
                                                  });
                                                }}
                                                disabled={updateUserChurchMutation.isPending}
                                              >
                                                <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white hover:bg-white/20">
                                                  <SelectValue placeholder="Select church">
                                                    {user.sfgmChurch && user.sfgmChurch.trim() ? user.sfgmChurch.trim() : "No church"}
                                                  </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-800 border-white/20 max-h-[300px] overflow-y-auto">
                                                  <SelectItem value="none" className="text-white focus:bg-white/20 cursor-pointer">
                                                    No church
                                                  </SelectItem>
                                                  {[...SFGM_CHURCHES]
                                                    .sort((a, b) => a.church.localeCompare(b.church))
                                                    .map((church) => (
                                                      <SelectItem 
                                                        key={church.church} 
                                                        value={church.church}
                                                        className="text-white focus:bg-white/20 cursor-pointer"
                                                      >
                                                        {church.church}
                                                      </SelectItem>
                                                    ))}
                                                </SelectContent>
                                              </Select>
                                            </TableCell>
                                            <TableCell>
                                            {user.role === 'admin' ? (
                                              <Badge className="bg-red-500/20 text-red-200 border-red-400/30">
                                                Admin
                                              </Badge>
                                            ) : (
                                              <Select
                                                value={user.role || "student"}
                                                onValueChange={(newRole: "student" | "instructor" | "dean") => {
                                                  updateRoleMutation.mutate({ userId: user.id, role: newRole });
                                                }}
                                                disabled={updateRoleMutation.isPending}
                                              >
                                                <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white hover:bg-white/20">
                                                  <SelectValue>
                                                    <Badge className={
                                                      user.role === 'instructor' ? 'bg-purple-500/20 text-purple-200 border-purple-400/30' :
                                                      user.role === 'dean' ? 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30' :
                                                      'bg-blue-500/20 text-blue-200 border-blue-400/30'
                                                    }>
                                                      {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
                                                    </Badge>
                                                  </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-800 border-white/20">
                                                  <SelectItem value="student" className="text-white focus:bg-white/20 cursor-pointer">
                                                    Student
                                                  </SelectItem>
                                                  <SelectItem value="instructor" className="text-white focus:bg-white/20 cursor-pointer">
                                                    Instructor
                                                  </SelectItem>
                                                  <SelectItem value="dean" className="text-white focus:bg-white/20 cursor-pointer">
                                                    Dean
                                                  </SelectItem>
                                                </SelectContent>
                                              </Select>
                                            )}
                                            </TableCell>
                                            <TableCell className="text-blue-200">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                            <div className="flex gap-2">
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                  setSelectedUser(user);
                                                  setShowGradesDialog(true);
                                                }}
                                                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                                              >
                                                <Award className="w-3 h-3 mr-1" />
                                                Grades
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                  setSelectedUser(user);
                                                  setNewPassword("");
                                                  setShowPasswordDialog(true);
                                                }}
                                                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                                              >
                                                <Key className="w-3 h-3 mr-1" />
                                                Password
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                  setSelectedUser(user);
                                                  setShowEnrollmentsDialog(true);
                                                }}
                                                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                                              >
                                                <BookOpenIcon className="w-3 h-3 mr-1" />
                                                Courses
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                  blockUserMutation.mutate({ 
                                                    userId: user.id, 
                                                    isBlocked: !user.isBlocked 
                                                  });
                                                }}
                                                disabled={blockUserMutation.isPending || user.role === "admin"}
                                                className={user.isBlocked 
                                                  ? "bg-green-500/20 hover:bg-green-500/30 text-green-200 border-green-400/30" 
                                                  : "bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 border-orange-400/30"}
                                              >
                                                {user.isBlocked ? (
                                                  <>
                                                    <Unlock className="w-3 h-3 mr-1" />
                                                    Unblock
                                                  </>
                                                ) : (
                                                  <>
                                                    <Ban className="w-3 h-3 mr-1" />
                                                    Block
                                                  </>
                                                )}
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => {
                                                  setSelectedUser(user);
                                                  setShowDeleteUserDialog(true);
                                                }}
                                                className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-400/30"
                                              >
                                                <Trash2 className="w-3 h-3 mr-1" />
                                                Delete
                                              </Button>
                                            </div>
                                            </TableCell>
                                        </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructors" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SFGM_CHURCHES.map((c) => {
                // Try multiple matching strategies to find instructors for this church
                // First try the variations map
                let churchInstructors = 
                  allInstructorsByChurchVariations[c.church] || 
                  allInstructorsByChurchVariations[c.church.toLowerCase()] ||
                  Object.entries(instructorsByChurch).find(([key]) => {
                    const keyLower = key.toLowerCase();
                    const churchLower = c.church.toLowerCase();
                    return keyLower === churchLower ||
                           keyLower.includes(churchLower) ||
                           churchLower.includes(keyLower);
                  })?.[1] || [];
                
                // If still no match, try direct filtering with flexible matching
                // Include both instructors and deans
                if (churchInstructors.length === 0) {
                  churchInstructors = users.filter((u: any) => {
                    const role = (u.role || "").toLowerCase();
                    if ((role !== "instructor" && role !== "dean") || !u.sfgmChurch) {
                      return false;
                    }
                    const userChurch = (u.sfgmChurch || "").trim();
                    const targetChurch = c.church.trim();
                    return (
                      userChurch === targetChurch ||
                      userChurch.toLowerCase() === targetChurch.toLowerCase() ||
                      userChurch.toLowerCase().includes(targetChurch.toLowerCase()) ||
                      targetChurch.toLowerCase().includes(userChurch.toLowerCase()) ||
                      userChurch.toLowerCase().includes(c.city.toLowerCase()) ||
                      targetChurch.toLowerCase().includes(c.city.toLowerCase())
                    );
                  });
                }
                
                const defaultInfo = (churchInstructorMap as Record<string, { instructorName?: string | null; email?: string | null; phone?: string | null }>)[c.church];
                const defaultName = String(defaultInfo?.instructorName ?? c.defaultInstructor ?? "");
                const defaultEmail = defaultInfo?.email ?? "";
                const defaultPhone = defaultInfo?.phone ?? "";
                
                return (
                  <Card key={c.church} className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl hover:shadow-purple-500/20 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            {c.church}
                          </CardTitle>
                          <CardDescription className="text-blue-200">
                            {c.city}, {c.state}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Default Instructor Section */}
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-blue-200 uppercase tracking-wide">Default Instructor</span>
                          <Badge className="bg-gray-500/20 text-gray-300 border-gray-400/30 text-xs">
                            Default
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="font-semibold text-white text-lg">
                            {defaultName || "Not set"}
                          </div>
                          {defaultEmail && (
                            <div className="flex items-center gap-2 text-sm text-blue-200">
                              <Mail className="w-4 h-4" />
                              {defaultEmail}
                            </div>
                          )}
                          {defaultPhone && (
                            <div className="flex items-center gap-2 text-sm text-blue-200">
                              <Phone className="w-4 h-4" />
                              {defaultPhone}
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingChurch(c);
                              setSelectedDefaultInstructor("");
                              setShowEditDefaultDialog(true);
                            }}
                            className="mt-2 bg-white/10 hover:bg-white/20 text-white border-white/20 w-full"
                          >
                            <Edit className="w-3 h-3 mr-2" />
                            Edit Default
                          </Button>
                        </div>
                      </div>

                      {/* Active Instructors Section */}
                      {churchInstructors.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-blue-200 uppercase tracking-wide">
                              Active Instructors ({churchInstructors.length})
                            </span>
                          </div>
                          <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {churchInstructors.map((instructor: any) => {
                              const fullName = `${instructor.firstName || ""} ${instructor.lastName || ""}`.trim() || instructor.username;
                              return (
                                <div key={instructor.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="font-semibold text-white">{fullName}</div>
                                    <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30 text-xs">
                                      Active
                                    </Badge>
                                  </div>
                                  {instructor.email && (
                                    <div className="flex items-center gap-2 text-sm text-blue-200 mb-1">
                                      <Mail className="w-3 h-3" />
                                      {instructor.email}
                                    </div>
                                  )}
                                  {instructor.phone && (
                                    <div className="flex items-center gap-2 text-sm text-blue-200 mb-2">
                                      <Phone className="w-3 h-3" />
                                      {instructor.phone}
                                    </div>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm(`Remove ${fullName} as instructor? They will be demoted to student role.`)) {
                                        demoteInstructorMutation.mutate(instructor.id);
                                      }
                                    }}
                                    disabled={demoteInstructorMutation.isPending}
                                    className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-400/30 text-xs"
                                  >
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    {demoteInstructorMutation.isPending ? "Removing..." : "Remove Instructor"}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Add Instructor Button */}
                      <Button
                        onClick={() => {
                          setSelectedChurchForInstructor(c);
                          setSelectedStudentToPromote("");
                          setCreateNewInstructor(false);
                          setShowAddInstructorDialog(true);
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Instructor
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                      <BookOpen className="w-6 h-6" />
                      All Courses {coursesData?.count !== undefined && (
                        <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                          {coursesData.count}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-blue-200">Manage course offerings</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowAddCourseDialog(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Course
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {coursesError && (
                  <div className="text-center py-8 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">
                    <XCircle className="w-8 h-8 mx-auto mb-2" />
                    Error loading courses: {coursesError instanceof Error ? coursesError.message : 'Unknown error'}
                  </div>
                )}
                {coursesLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-blue-200">Loading courses...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/20 hover:bg-white/5">
                          <TableHead className="text-blue-200 font-semibold">ID</TableHead>
                          <TableHead className="text-blue-200 font-semibold">Title</TableHead>
                          <TableHead className="text-blue-200 font-semibold">Instructor</TableHead>
                          <TableHead className="text-blue-200 font-semibold">Description</TableHead>
                          <TableHead className="text-blue-200 font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {courses.map((course: any) => (
                          <TableRow key={course.id} className="border-white/10 hover:bg-white/10 transition-colors">
                            <TableCell className="font-medium text-white">{course.id}</TableCell>
                            <TableCell className="text-white font-medium">{course.title || course.name}</TableCell>
                            <TableCell>
                              <Badge 
                                className={
                                  course.instructorId 
                                    ? "bg-purple-500/20 text-purple-200 border-purple-400/30" 
                                    : "bg-gray-500/20 text-gray-300 border-gray-400/30"
                                }
                              >
                                {getInstructorName(course.instructorId)}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-md truncate text-blue-200">
                              {course.description || 'No description'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedCourse(course);
                                    setSelectedInstructorId(course.instructorId || "");
                                    setShowAssignInstructorDialog(true);
                                  }}
                                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                                >
                                  <GraduationCap className="w-3 h-3 mr-1" />
                                  Assign
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedCourse(course);
                                    setShowDeleteCourseDialog(true);
                                  }}
                                  className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-400/30"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <Mail className="w-6 h-6" />
                  Send Test Email
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Verify Postmark is working by sending a test email to any address.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium text-blue-200 block mb-1">Email address</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={testEmailTo}
                      onChange={(e) => setTestEmailTo(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/60"
                    />
                  </div>
                  <Button
                    onClick={async () => {
                      const to = testEmailTo.trim();
                      if (!to) {
                        toast({ title: "Enter an email", variant: "destructive" });
                        return;
                      }
                      setTestEmailSending(true);
                      try {
                        const response = await adminApiRequest("POST", "/api/admin/test-email", { to });
                        const data = await response.json();
                        if (data.delivered) {
                          toast({ title: "Test email sent", description: `Check ${to} (and spam).` });
                        } else {
                          toast({ title: "Email not sent", description: data.reason || "Unknown reason", variant: "destructive" });
                        }
                      } catch (err: any) {
                        toast({ title: "Failed", description: err?.message || String(err), variant: "destructive" });
                      } finally {
                        setTestEmailSending(false);
                      }
                    }}
                    disabled={testEmailSending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {testEmailSending ? "Sending…" : "Send test email"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Footer />
      </div>
    </div>

      {/* Add User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              {newUser.role === "instructor" && newUser.sfgmChurch
                ? `Add instructor for ${newUser.sfgmChurch}`
                : "Add New User"}
            </DialogTitle>
            <DialogDescription className="text-blue-200">
              {newUser.role === "instructor" && newUser.sfgmChurch
                ? `Create an instructor account for ${newUser.sfgmChurch}. Church is pre-filled; you can change it if needed.`
                : "Create a new user account"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Church position (optional for students)</label>
              <select
                className="w-full px-3 py-2 border border-white/20 rounded-md bg-white/10 text-white focus:ring-2 focus:ring-blue-500"
                value={newUser.churchPosition}
                onChange={(e) => setNewUser({ ...newUser, churchPosition: e.target.value as typeof newUser.churchPosition })}
              >
                <option value="" className="bg-slate-800">Select position</option>
                {INSTRUCTOR_CHURCH_POSITIONS.map((p) => (
                  <option key={p} value={p} className="bg-slate-800">{p}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Name (first name)</label>
              <Input
                placeholder="e.g. Rocky"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
              />
            </div>
            <Input
              placeholder="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
            />
            <Input
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
            />
            <Input
              placeholder="Phone (optional)"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
            />
            <Input
              placeholder="SFGM Church (optional, e.g. SFGM Boston, SFGM Orlando)"
              value={newUser.sfgmChurch}
              onChange={(e) => setNewUser({ ...newUser, sfgmChurch: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
            />
            <Input
              placeholder="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
            />
            <select
              className="w-full px-3 py-2 border border-white/20 rounded-md bg-white/10 text-white focus:ring-2 focus:ring-blue-500"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
            >
              <option value="student" className="bg-slate-800">Student</option>
              <option value="instructor" className="bg-slate-800">Instructor</option>
              <option value="admin" className="bg-slate-800">Admin</option>
              <option value="dean" className="bg-slate-800">Dean</option>
            </select>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUserDialog(false)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={() => addUserMutation.mutate(newUser)}
              disabled={!newUser.name.trim() || !newUser.email || !newUser.username || !newUser.password}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-2">
              <Key className="w-5 h-5" />
              Change Password
            </DialogTitle>
            <DialogDescription className="text-blue-200">
              Set a new password for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordDialog(false)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedUser && newPassword.length >= 6) {
                  changePasswordMutation.mutate({
                    userId: selectedUser.id,
                    newPassword,
                  });
                }
              }}
              disabled={newPassword.length < 6}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Default Instructor Dialog */}
      <Dialog open={showEditDefaultDialog} onOpenChange={setShowEditDefaultDialog}>
        <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Set Default Instructor — {editingChurch?.church}
            </DialogTitle>
            <DialogDescription className="text-blue-200">
              Select an existing instructor from {editingChurch?.church} to set as the default instructor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Select Instructor</label>
              {editingChurch && (() => {
                // More flexible matching - check for exact match, case-insensitive, and partial matches
                // Include both instructors and deans
                const churchInstructorsForDefault = users.filter((u: any) => {
                  const role = (u.role || "").toLowerCase();
                  if ((role !== "instructor" && role !== "dean") || !u.sfgmChurch) {
                    return false;
                  }
                  
                  const userChurch = (u.sfgmChurch || "").trim();
                  const targetChurch = editingChurch.church.trim();
                  
                  // Try multiple matching strategies
                  return (
                    userChurch === targetChurch ||
                    userChurch.toLowerCase() === targetChurch.toLowerCase() ||
                    userChurch.toLowerCase().includes(targetChurch.toLowerCase()) ||
                    targetChurch.toLowerCase().includes(userChurch.toLowerCase()) ||
                    // Also check if church name contains the city
                    userChurch.toLowerCase().includes(editingChurch.city.toLowerCase()) ||
                    targetChurch.toLowerCase().includes(editingChurch.city.toLowerCase())
                  );
                });
                
                // Debug: Log what we found
                console.log('Editing church:', editingChurch.church);
                console.log('All instructors:', users.filter((u: any) => (u.role || "").toLowerCase() === "instructor").map((u: any) => ({
                  name: `${u.firstName} ${u.lastName}`,
                  church: u.sfgmChurch,
                  role: u.role
                })));
                console.log('Filtered instructors for default:', churchInstructorsForDefault.map((u: any) => ({
                  name: `${u.firstName} ${u.lastName}`,
                  church: u.sfgmChurch
                })));
                
                return churchInstructorsForDefault.length > 0 ? (
                  <Select 
                    value={selectedDefaultInstructor || ""} 
                    onValueChange={(value) => {
                      setSelectedDefaultInstructor(value);
                    }}
                  >
                    <SelectTrigger className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <SelectValue placeholder="Choose an instructor...">
                        {selectedDefaultInstructor 
                          ? (() => {
                              const selected = churchInstructorsForDefault.find((i: any) => String(i.id) === String(selectedDefaultInstructor));
                              return selected ? `${selected.firstName || ""} ${selected.lastName || ""}`.trim() || selected.username : "Select instructor";
                            })()
                          : "Select instructor..."
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20 max-h-[300px] overflow-y-auto">
                      {churchInstructorsForDefault.map((instructor: any) => {
                        const fullName = `${instructor.firstName || ""} ${instructor.lastName || ""}`.trim() || instructor.username;
                        return (
                          <SelectItem 
                            key={instructor.id} 
                            value={String(instructor.id)}
                            className="text-white focus:bg-white/20 cursor-pointer hover:bg-white/10"
                          >
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold">{fullName}</span>
                              {instructor.email && (
                                <span className="text-xs text-blue-200">{instructor.email}</span>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 text-blue-200 text-sm">
                      No instructors found for {editingChurch.church}. Please add an instructor first.
                    </div>
                    {/* Show all instructors for debugging */}
                    {instructors.length > 0 && (
                      <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3">
                        <div className="text-yellow-200 text-sm font-semibold mb-2">All Instructors in System:</div>
                        <div className="space-y-1 text-xs text-yellow-200">
                          {instructors.map((instructor: any) => (
                            <div key={instructor.id}>
                              {`${instructor.firstName || ""} ${instructor.lastName || ""}`.trim() || instructor.username} 
                              {instructor.sfgmChurch && (
                                <span className="text-yellow-300"> - Church: "{instructor.sfgmChurch}"</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => { 
                setShowEditDefaultDialog(false); 
                setEditingChurch(null);
                setSelectedDefaultInstructor("");
              }}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingChurch && selectedDefaultInstructor) {
                  const selectedInstructor = users.find((u: any) => String(u.id) === String(selectedDefaultInstructor));
                  if (selectedInstructor) {
                    const fullName = `${selectedInstructor.firstName || ""} ${selectedInstructor.lastName || ""}`.trim() || selectedInstructor.username;
                    updateChurchInstructorMutation.mutate({
                      church: editingChurch.church,
                      instructorName: fullName,
                      email: selectedInstructor.email || "",
                      phone: selectedInstructor.phone || "",
                    });
                    setShowEditDefaultDialog(false);
                    setEditingChurch(null);
                    setSelectedDefaultInstructor("");
                  }
                }
              }}
              disabled={updateChurchInstructorMutation.isPending || !selectedDefaultInstructor}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {updateChurchInstructorMutation.isPending ? "Saving..." : "Set as Default"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Grades Dialog */}
      <Dialog open={showGradesDialog} onOpenChange={setShowGradesDialog}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 to-slate-800 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-2">
              <Award className="w-5 h-5" />
              Student Grades
            </DialogTitle>
            <DialogDescription className="text-blue-200">
              Quiz grades for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {gradesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-blue-200">Loading grades...</p>
              </div>
            ) : grades.length === 0 ? (
              <div className="text-center py-12 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-200">
                <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No quiz attempts found for this student.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20">
                      <TableHead className="text-blue-200 font-semibold">Quiz</TableHead>
                      <TableHead className="text-blue-200 font-semibold">Score</TableHead>
                      <TableHead className="text-blue-200 font-semibold">Status</TableHead>
                      <TableHead className="text-blue-200 font-semibold">Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((grade: any, index: number) => (
                      <TableRow key={index} className="border-white/10 hover:bg-white/10">
                        <TableCell className="text-white">{grade.quizTitle}</TableCell>
                        <TableCell className="text-white font-semibold">{grade.scorePercent}%</TableCell>
                        <TableCell>
                          <Badge className={
                            grade.passed
                              ? "bg-green-500/20 text-green-200 border-green-400/30"
                              : "bg-red-500/20 text-red-200 border-red-400/30"
                          }>
                            {grade.passed ? <><CheckCircle className="w-3 h-3 mr-1 inline" /> Passed</> : <><XCircle className="w-3 h-3 mr-1 inline" /> Failed</>}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-blue-200">
                          {new Date(grade.completedAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setShowGradesDialog(false)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Enrollments Dialog */}
      <Dialog open={showEnrollmentsDialog} onOpenChange={setShowEnrollmentsDialog}>
        <DialogContent className="max-w-3xl bg-gradient-to-br from-slate-900 to-slate-800 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5" />
              Student Enrollments & Progress
            </DialogTitle>
            <DialogDescription className="text-blue-200">
              Course enrollments and progress for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {enrollmentsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-blue-200">Loading enrollments...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Enrolled Courses */}
                <div>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <BookOpenIcon className="w-4 h-4" />
                    Enrolled Courses ({enrollmentsData?.enrollments?.length || 0})
                  </h3>
                  {!enrollmentsData?.enrollments || enrollmentsData.enrollments.length === 0 ? (
                    <div className="text-center py-8 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-200">
                      <BookOpenIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No course enrollments found.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {enrollmentsData.enrollments.map((enrollment: any) => (
                        <div
                          key={enrollment.id}
                          className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <h4 className="text-white font-semibold">{enrollment.course?.name || "Unknown Course"}</h4>
                            <div className="flex gap-4 mt-2 text-sm text-blue-200">
                              <span>
                                Status: <Badge className={enrollment.status === "completed" ? "bg-green-500/20 text-green-200 border-green-400/30" : enrollment.status === "dropped" ? "bg-red-500/20 text-red-200 border-red-400/30" : "bg-blue-500/20 text-blue-200 border-blue-400/30"}>{enrollment.status || "active"}</Badge>
                              </span>
                              {enrollment.enrolledAt && (
                                <span>Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                              )}
                              {enrollment.completedAt && (
                                <span className="text-green-200">Completed: {new Date(enrollment.completedAt).toLocaleDateString()}</span>
                              )}
                              {enrollment.progressPercent !== undefined && (
                                <span>Progress: {enrollment.progressPercent.toFixed(0)}%</span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (selectedUser && enrollment.course?.id) {
                                unenrollStudentMutation.mutate({
                                  userId: selectedUser.id,
                                  courseId: enrollment.course.id,
                                });
                              }
                            }}
                            disabled={unenrollStudentMutation.isPending}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-400/30"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Unenroll
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Enroll in New Course */}
                <div className="border-t border-white/10 pt-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Enroll in New Course
                  </h3>
                  {coursesData?.courses && coursesData.courses.length > 0 ? (
                    <div className="flex gap-2">
                      <Select
                        value={selectedCourseToEnroll?.toString() || ""}
                        onValueChange={(value) => setSelectedCourseToEnroll(parseInt(value))}
                      >
                        <SelectTrigger className="flex-1 bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select a course to enroll" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20">
                          {coursesData.courses
                            .filter((course: any) => {
                              // Filter out already enrolled courses
                              const enrolledCourseIds = (enrollmentsData?.enrollments || []).map((e: any) => e.course?.id);
                              return !enrolledCourseIds.includes(course.id);
                            })
                            .map((course: any) => (
                              <SelectItem
                                key={course.id}
                                value={course.id.toString()}
                                className="text-white focus:bg-white/20 cursor-pointer"
                              >
                                {course.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => {
                          if (selectedUser && selectedCourseToEnroll) {
                            enrollStudentMutation.mutate({
                              userId: selectedUser.id,
                              courseId: selectedCourseToEnroll,
                            });
                          }
                        }}
                        disabled={!selectedCourseToEnroll || enrollStudentMutation.isPending}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Enroll
                      </Button>
                    </div>
                  ) : (
                    <div className="text-blue-200 text-sm">No courses available</div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowEnrollmentsDialog(false);
                setSelectedCourseToEnroll(null);
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Delete User Dialog */}
      <AlertDialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-2xl flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-200">
              Are you sure you want to permanently delete <span className="font-semibold text-white">{selectedUser?.username}</span>? This action
              cannot be undone and will remove all associated data (enrollments, quiz attempts,
              progress, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedUser) {
                  deleteUserMutation.mutate(selectedUser.id);
                }
              }}
              className="bg-red-600/20 hover:bg-red-600/30 text-red-200 border-red-400/30"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Instructor Dialog */}
      <Dialog open={showAssignInstructorDialog} onOpenChange={setShowAssignInstructorDialog}>
        <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Assign Instructor to Course
            </DialogTitle>
            <DialogDescription className="text-blue-200">
              {selectedCourse && `Assign an instructor to "${selectedCourse.title || selectedCourse.name}"`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Select Instructor</label>
              <select
                className="w-full px-3 py-2 border border-white/20 rounded-md bg-white/10 text-white focus:ring-2 focus:ring-blue-500"
                value={selectedInstructorId}
                onChange={(e) => setSelectedInstructorId(e.target.value)}
              >
                <option value="" className="bg-slate-800">Unassigned (remove instructor)</option>
                {instructors.map((instructor: any) => (
                  <option key={instructor.id} value={instructor.id} className="bg-slate-800">
                    {`${instructor.firstName || ""} ${instructor.lastName || ""}`.trim() || instructor.username} ({instructor.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-blue-200 mt-1">
                Only students enrolled in courses assigned to this instructor will appear in their dashboard.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAssignInstructorDialog(false);
                setSelectedInstructorId("");
                setSelectedCourse(null);
              }}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedCourse) {
                  assignInstructorMutation.mutate({
                    courseId: selectedCourse.id,
                    instructorId: selectedInstructorId || null,
                  });
                }
              }}
              disabled={assignInstructorMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {assignInstructorMutation.isPending ? "Assigning..." : "Assign Instructor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Course Dialog */}
      <Dialog open={showAddCourseDialog} onOpenChange={setShowAddCourseDialog}>
        <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Course
            </DialogTitle>
            <DialogDescription className="text-blue-200">Create a new course offering</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Course Name *"
              value={newCourse.name}
              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
            />
            <textarea
              className="w-full px-3 py-2 border border-white/20 rounded-md min-h-[100px] bg-white/10 text-white placeholder:text-blue-200 focus:ring-2 focus:ring-blue-500"
              placeholder="Description"
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
            />
            <Input
              placeholder="Duration (weeks) *"
              type="number"
              value={newCourse.duration}
              onChange={(e) => setNewCourse({ ...newCourse, duration: parseInt(e.target.value) || 4 })}
              className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
            />
            <Input
              placeholder="Category (optional)"
              value={newCourse.category}
              onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
            />
            <Input
              placeholder="Difficulty (optional)"
              value={newCourse.difficulty}
              onChange={(e) => setNewCourse({ ...newCourse, difficulty: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
            />
            <Input
              placeholder="Points (optional)"
              type="number"
              value={newCourse.points}
              onChange={(e) => setNewCourse({ ...newCourse, points: parseInt(e.target.value) || 0 })}
              className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddCourseDialog(false)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={() => addCourseMutation.mutate(newCourse)}
              disabled={!newCourse.name || !newCourse.duration}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Create Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Instructor Dialog */}
      <Dialog open={showAddInstructorDialog} onOpenChange={setShowAddInstructorDialog}>
        <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add Instructor for {selectedChurchForInstructor?.church}
            </DialogTitle>
            <DialogDescription className="text-blue-200">
              Promote an existing student from this church to instructor, or create a new instructor account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Choose option</label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer text-white">
                  <input
                    type="radio"
                    checked={!createNewInstructor}
                    onChange={() => {
                      setCreateNewInstructor(false);
                      setSelectedStudentToPromote("");
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Promote existing student</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-white">
                  <input
                    type="radio"
                    checked={createNewInstructor}
                    onChange={() => {
                      setCreateNewInstructor(true);
                      setSelectedStudentToPromote("");
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Create new instructor</span>
                </label>
              </div>
            </div>

            {!createNewInstructor ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Select student from {selectedChurchForInstructor?.church}</label>
                {studentsFromChurch.length === 0 ? (
                  <p className="text-sm text-blue-200 bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
                    No students found from this church. Create a new instructor instead.
                  </p>
                ) : (
                  <select
                    className="w-full px-3 py-2 border border-white/20 rounded-md bg-white/10 text-white focus:ring-2 focus:ring-blue-500"
                    value={selectedStudentToPromote}
                    onChange={(e) => setSelectedStudentToPromote(e.target.value)}
                  >
                    <option value="" className="bg-slate-800">Select a student...</option>
                    {studentsFromChurch.map((student: any) => (
                      <option key={student.id} value={student.id} className="bg-slate-800">
                        {`${student.firstName || ""} ${student.lastName || ""}`.trim() || student.username} ({student.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Church position (optional)</label>
                  <select
                    className="w-full px-3 py-2 border border-white/20 rounded-md bg-white/10 text-white focus:ring-2 focus:ring-blue-500"
                    value={newUser.churchPosition}
                    onChange={(e) => setNewUser({ ...newUser, churchPosition: e.target.value as typeof newUser.churchPosition })}
                  >
                    <option value="" className="bg-slate-800">Select position</option>
                    {INSTRUCTOR_CHURCH_POSITIONS.map((p) => (
                      <option key={p} value={p} className="bg-slate-800">{p}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Name (first name)</label>
                  <Input
                    placeholder="e.g. Rocky"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                  />
                </div>
                <Input
                  placeholder="Email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                />
                <Input
                  placeholder="Username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                />
                <Input
                  placeholder="Phone (optional)"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                />
                <Input
                  placeholder="Password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddInstructorDialog(false);
                setSelectedChurchForInstructor(null);
                setSelectedStudentToPromote("");
                setCreateNewInstructor(false);
              }}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!createNewInstructor) {
                  // Promote existing student
                  if (selectedStudentToPromote && selectedChurchForInstructor) {
                    promoteToInstructorMutation.mutate({
                      userId: selectedStudentToPromote,
                      church: selectedChurchForInstructor.church,
                    });
                  }
                } else {
                  // Create new instructor directly
                  if (selectedChurchForInstructor) {
                    addUserMutation.mutate({
                      ...newUser,
                      role: "instructor",
                      sfgmChurch: selectedChurchForInstructor.church,
                    });
                  }
                }
              }}
              disabled={
                (!createNewInstructor && !selectedStudentToPromote) ||
                (createNewInstructor && (!newUser.name.trim() || !newUser.email || !newUser.username || !newUser.password))
              }
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {!createNewInstructor ? "Promote to Instructor" : "Create New Instructor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <AlertDialog open={showDeleteCourseDialog} onOpenChange={setShowDeleteCourseDialog}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-2xl flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              Delete Course
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-200">
              Are you sure you want to permanently delete <span className="font-semibold text-white">"{selectedCourse?.title || selectedCourse?.name}"</span>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedCourse) {
                  deleteCourseMutation.mutate(selectedCourse.id);
                }
              }}
              className="bg-red-600/20 hover:bg-red-600/30 text-red-200 border-red-400/30"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

