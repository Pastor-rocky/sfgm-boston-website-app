import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";
import { COURSE_ACCESS_CODES } from "@shared/course-access-codes";

export const COURSE_PASSWORDS = COURSE_ACCESS_CODES;

interface CoursePasswordPromptProps {
  courseId: number;
  courseName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CoursePasswordPrompt({
  courseId,
  courseName,
  isOpen,
  onClose,
  onSuccess,
}: CoursePasswordPromptProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = COURSE_PASSWORDS[courseId];
    
    if (password === correctPassword) {
      setError("");
      setPassword("");
      onSuccess();
      onClose();
    } else {
      setError("Incorrect password. Please ask a staff member for the access code.");
      setPassword("");
      toast({
        title: "Access Denied",
        description: "Incorrect password. Please ask a staff member for the access code.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-orange-600" />
            Course Access Required
          </DialogTitle>
          <DialogDescription>
            This course is currently locked. Please ask a staff member for the access code to enroll or view the e-book.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Access Code for {courseName}
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter access code"
              className={error ? "border-red-500" : ""}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}





