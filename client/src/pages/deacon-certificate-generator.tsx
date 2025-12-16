import { useState } from 'react';
import Certificate from '@/components/certificate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';

export default function DeaconCertificateGenerator() {
  const [studentName, setStudentName] = useState('');
  const [completionDate, setCompletionDate] = useState(new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));
  const [showCertificate, setShowCertificate] = useState(false);
  const [students, setStudents] = useState<Array<{ name: string; date: string }>>([]);

  const courseName = "Deaconship Course";
  const instructorName = "Pastor Rocky Kaslov";

  const handleGenerate = () => {
    if (studentName.trim()) {
      setShowCertificate(true);
    }
  };

  const handleAddStudent = () => {
    if (studentName.trim()) {
      setStudents([...students, { name: studentName, date: completionDate }]);
      setStudentName('');
      setShowCertificate(false);
    }
  };

  const handleGenerateNext = () => {
    setShowCertificate(false);
    if (students.length > 0) {
      const nextStudent = students[0];
      setStudentName(nextStudent.name);
      setCompletionDate(nextStudent.date);
      setStudents(students.slice(1));
      setTimeout(() => setShowCertificate(true), 100);
    }
  };

  const handleDownloadAndNext = () => {
    // Trigger download is handled by the Certificate component
    setTimeout(() => {
      handleGenerateNext();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <i className="fas fa-certificate text-green-600"></i>
            Deacon Course Certificate Generator
          </h1>
          <p className="text-gray-600 mt-2">
            Generate certificates for students who completed the Deaconship Course
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Certificate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="studentName">Student Name</Label>
                <Input
                  id="studentName"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter student's full name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="completionDate">Completion Date</Label>
                <Input
                  id="completionDate"
                  type="text"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  placeholder="Month Day, Year"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Format: November 27, 2024
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleGenerate}
                  disabled={!studentName.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <i className="fas fa-eye mr-2"></i>
                  Preview Certificate
                </Button>
                
                {showCertificate && (
                  <Button 
                    onClick={handleAddStudent}
                    variant="outline"
                    className="flex-1"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add to List
                  </Button>
                )}
              </div>

              {students.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Students in Queue ({students.length})
                  </h3>
                  <ul className="list-disc list-inside text-blue-800 space-y-1">
                    {students.map((student, index) => (
                      <li key={index}>{student.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Quick Tips:</strong>
                </p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Enter each student's name one at a time</li>
                  <li>Click "Preview Certificate" to see how it looks</li>
                  <li>Click "Download & Print" on the certificate to print it</li>
                  <li>Add multiple students to the queue for batch processing</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Certificate Preview */}
          <div>
            {showCertificate && studentName ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Certificate Preview</span>
                      {students.length > 0 && (
                        <Button
                          onClick={handleDownloadAndNext}
                          variant="outline"
                          size="sm"
                        >
                          Download & Next
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Certificate
                      studentName={studentName}
                      courseName={courseName}
                      completionDate={completionDate}
                      instructorName={instructorName}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <i className="fas fa-certificate text-6xl text-gray-300 mb-4"></i>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Certificate Preview
                  </h3>
                  <p className="text-gray-500">
                    Enter a student name and click "Preview Certificate" to generate
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

