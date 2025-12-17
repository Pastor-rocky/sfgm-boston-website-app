import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const ADMIN_PASSWORD = "123";

// Custom API request with admin headers
async function adminApiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  const authToken = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    "x-admin-password": ADMIN_PASSWORD,
  };
  
  if (data) headers["Content-Type"] = "application/json";
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  return res;
}

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
  const [newPassword, setNewPassword] = useState("");
  const [newCourse, setNewCourse] = useState({
    name: "",
    description: "",
    duration: 4,
    category: "",
    difficulty: "",
    points: 0,
  });
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    role: "student" as const,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: "Access Granted",
        description: "Welcome to the Admin Panel",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid password",
        variant: "destructive",
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
    mutationFn: async (userData: typeof newUser) => {
      const response = await adminApiRequest(
        "POST",
        "/api/admin/users",
        userData
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Created",
        description: "New user has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowUserDialog(false);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        phone: "",
        password: "",
        role: "student",
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You must be logged in to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Panel Access</CardTitle>
            <CardDescription>Enter the admin password to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <Button onClick={handleLogin} className="w-full">
                Access Admin Panel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const users = usersData?.users || [];
  const courses = coursesData?.courses || [];
  const grades = gradesData?.grades || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage users, courses, and system settings</p>
        </div>
        <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
          Logout
        </Button>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Users {usersData?.count !== undefined && `(${usersData.count})`}</CardTitle>
                  <CardDescription>Manage student accounts and permissions</CardDescription>
                </div>
                <Button onClick={() => setShowUserDialog(true)}>
                  <i className="fas fa-user-plus mr-2"></i>Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {usersError && (
                <div className="text-center py-8 text-red-600">
                  Error loading users: {usersError instanceof Error ? usersError.message : 'Unknown error'}
                </div>
              )}
              {usersLoading ? (
                <div className="text-center py-8">Loading users...</div>
              ) : (
                <Table>
                  <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username || 'N/A'}</TableCell>
                        <TableCell>
                          {user.firstName || ''} {user.lastName || ''}
                        </TableCell>
                        <TableCell>{user.email || 'N/A'}</TableCell>
                        <TableCell>{user.phone || 'N/A'}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {user.role || 'student'}
                          </span>
                        </TableCell>
                        <TableCell>
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
                            >
                              <i className="fas fa-graduation-cap mr-1"></i>Grades
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowPasswordDialog(true);
                              }}
                            >
                              <i className="fas fa-key mr-1"></i>Password
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteUserDialog(true);
                              }}
                            >
                              <i className="fas fa-trash mr-1"></i>Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Courses {coursesData?.count !== undefined && `(${coursesData.count})`}</CardTitle>
                  <CardDescription>Manage course offerings</CardDescription>
                </div>
                <Button onClick={() => setShowAddCourseDialog(true)}>
                  <i className="fas fa-plus mr-2"></i>Add Course
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {coursesError && (
                <div className="text-center py-8 text-red-600">
                  Error loading courses: {coursesError instanceof Error ? coursesError.message : 'Unknown error'}
                </div>
              )}
              {coursesLoading ? (
                <div className="text-center py-8">Loading courses...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course: any) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.id}</TableCell>
                        <TableCell>{course.title || course.name}</TableCell>
                        <TableCell className="max-w-md truncate">
                          {course.description || 'No description'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedCourse(course);
                              setShowDeleteCourseDialog(true);
                            }}
                          >
                            <i className="fas fa-trash mr-1"></i>Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="First Name"
                value={newUser.firstName}
                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
              />
              <Input
                placeholder="Last Name"
                value={newUser.lastName}
                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
              />
            </div>
            <Input
              placeholder="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <Input
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            />
            <Input
              placeholder="Phone (optional)"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            />
            <Input
              placeholder="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
              <option value="dean">Dean</option>
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => addUserMutation.mutate(newUser)}
              disabled={!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.username || !newUser.password}
            >
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
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
            >
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Grades Dialog */}
      <Dialog open={showGradesDialog} onOpenChange={setShowGradesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Grades</DialogTitle>
            <DialogDescription>
              Quiz grades for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {gradesLoading ? (
              <div className="text-center py-8">Loading grades...</div>
            ) : grades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No quiz attempts found for this student.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{grade.quizTitle}</TableCell>
                      <TableCell>{grade.scorePercent}%</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            grade.passed
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {grade.passed ? "Passed" : "Failed"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(grade.completedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowGradesDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {selectedUser?.username}? This action
              cannot be undone and will remove all associated data (enrollments, quiz attempts,
              progress, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedUser) {
                  deleteUserMutation.mutate(selectedUser.id);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Course Dialog */}
      <Dialog open={showAddCourseDialog} onOpenChange={setShowAddCourseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>Create a new course offering</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Course Name *"
              value={newCourse.name}
              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
            />
            <textarea
              className="w-full px-3 py-2 border rounded-md min-h-[100px]"
              placeholder="Description"
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
            />
            <Input
              placeholder="Duration (weeks) *"
              type="number"
              value={newCourse.duration}
              onChange={(e) => setNewCourse({ ...newCourse, duration: parseInt(e.target.value) || 4 })}
            />
            <Input
              placeholder="Category (optional)"
              value={newCourse.category}
              onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
            />
            <Input
              placeholder="Difficulty (optional)"
              value={newCourse.difficulty}
              onChange={(e) => setNewCourse({ ...newCourse, difficulty: e.target.value })}
            />
            <Input
              placeholder="Points (optional)"
              type="number"
              value={newCourse.points}
              onChange={(e) => setNewCourse({ ...newCourse, points: parseInt(e.target.value) || 0 })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCourseDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => addCourseMutation.mutate(newCourse)}
              disabled={!newCourse.name || !newCourse.duration}
            >
              Create Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <AlertDialog open={showDeleteCourseDialog} onOpenChange={setShowDeleteCourseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{selectedCourse?.title || selectedCourse?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedCourse) {
                  deleteCourseMutation.mutate(selectedCourse.id);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

