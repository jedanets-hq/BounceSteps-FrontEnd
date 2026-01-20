import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  FileText, 
  Video, 
  Search,
  ChevronRight,
  ChevronLeft,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Target,
  Percent,
  User
} from "lucide-react";

interface Student {
  id: number;
  name: string;
  registration_number: string;
}

interface ProgressStats {
  total: number;
  submitted?: number;
  attended?: number;
  average_score?: string;
  average_grade?: string;
  participation_rate?: string;
  attendance_rate?: string;
}

interface StudentProgress {
  student: Student;
  assessments: ProgressStats;
  assignments: ProgressStats;
  live_classes: ProgressStats;
  overall: {
    participation_rate: string;
    performance_level: string;
  };
}

interface DetailedProgress extends StudentProgress {
  student: Student & { email: string };
  program: string;
  assessments: ProgressStats & { not_submitted: number };
  assignments: ProgressStats & { not_submitted: number };
  live_classes: ProgressStats & { not_attended: number };
}

interface Program {
  id: number;
  name: string;
  lecturer_id?: number;
  lecturer_name?: string;
}

export const ProgressTracker = () => {
  const [selectedProgram, setSelectedProgram] = useState("");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);
  const [studentProgress, setStudentProgress] = useState<DetailedProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch lecturer's programs
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // Use lecturer_username parameter with skip_semester_filter for Progress Tracker
        const programsResponse = await fetch(`https://must-lms-backend.onrender.com/api/programs?lecturer_username=${encodeURIComponent(currentUser.username || '')}&skip_semester_filter=true`);
        if (programsResponse.ok) {
          const programsResult = await programsResponse.json();
          const lecturerPrograms = programsResult.data || [];
          
          setPrograms(lecturerPrograms);
          
          if (lecturerPrograms.length > 0) {
            setSelectedProgram(lecturerPrograms[0].name);
          }
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };

    fetchPrograms();
  }, []);

  // Fetch students when program is selected
  useEffect(() => {
    if (!selectedProgram) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        const response = await fetch(
          `https://must-lms-backend.onrender.com/api/progress/students?program_name=${encodeURIComponent(selectedProgram)}&lecturer_id=${currentUser.id}`
        );
        
        if (response.ok) {
          const result = await response.json();
          setStudents(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedProgram]);

  // Fetch individual student progress
  const handleViewStudentProgress = async (student: StudentProgress) => {
    setSelectedStudent(student);
    setLoading(true);
    
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      const response = await fetch(
        `https://must-lms-backend.onrender.com/api/progress/student/${student.student.id}?program_name=${encodeURIComponent(selectedProgram)}&lecturer_id=${currentUser.id}`
      );
      
      if (response.ok) {
        const result = await response.json();
        setStudentProgress(result.data);
      }
    } catch (error) {
      console.error('Error fetching student progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (level: string) => {
    switch (level) {
      case 'Excellent': return 'bg-green-100 text-green-800 border-green-300';
      case 'Good': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Average': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const getProgressBarColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-blue-500';
    if (rate >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredStudents = students.filter(student =>
    student.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && students.length === 0 && !selectedStudent) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-primary mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">Loading Progress Data...</h3>
            <p className="text-muted-foreground">Fetching student progress information</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            Progress Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor individual student performance and participation in your programs
          </p>
        </div>
        
        {/* Program Selection */}
        <div className="w-full md:w-80">
          <Select value={selectedProgram} onValueChange={setSelectedProgram}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Program" />
            </SelectTrigger>
            <SelectContent>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.name}>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {program.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* No Programs Message */}
      {programs.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Programs Assigned</h3>
            <p className="text-muted-foreground text-center max-w-md">
              You don't have any programs assigned yet. Contact the administrator to get programs assigned to you.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Student List View */}
      {!selectedStudent && programs.length > 0 && (
        <div className="space-y-4">
          {/* Search and Stats */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name or registration number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold">{filteredStudents.length}</span>
              <span className="text-muted-foreground">Students</span>
            </div>
          </div>

          {/* Students Grid */}
          {filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student) => (
                <Card 
                  key={student.student.id} 
                  className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary/50 hover:border-l-primary"
                  onClick={() => handleViewStudentProgress(student)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{student.student.name}</h3>
                          <p className="text-sm text-muted-foreground">{student.student.registration_number}</p>
                        </div>
                      </div>
                      <Badge className={`${getPerformanceColor(student.overall.performance_level)} border`}>
                        {student.overall.performance_level}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Overall Progress</span>
                          <span className="font-bold text-lg">{student.overall.participation_rate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full transition-all ${getProgressBarColor(parseFloat(student.overall.participation_rate))}`}
                            style={{ width: `${student.overall.participation_rate}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <FileText className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                          <p className="text-xs text-muted-foreground">Assessments</p>
                          <p className="text-sm font-bold text-blue-700">
                            {student.assessments.submitted}/{student.assessments.total}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                          <BookOpen className="h-4 w-4 mx-auto text-green-600 mb-1" />
                          <p className="text-xs text-muted-foreground">Assignments</p>
                          <p className="text-sm font-bold text-green-700">
                            {student.assignments.submitted}/{student.assignments.total}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded-lg">
                          <Video className="h-4 w-4 mx-auto text-purple-600 mb-1" />
                          <p className="text-xs text-muted-foreground">Live Classes</p>
                          <p className="text-sm font-bold text-purple-700">
                            {student.live_classes.attended}/{student.live_classes.total}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" className="w-full mt-4 text-primary">
                      View Full Details <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Students Found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {searchTerm 
                    ? "No students match your search. Try adjusting your search terms."
                    : "No students are enrolled in this program yet."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Detailed Student Progress View */}
      {selectedStudent && studentProgress && (
        <div className="space-y-6">
          {/* Back Button */}
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedStudent(null);
              setStudentProgress(null);
            }}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Students List
          </Button>

          {/* Student Header Card */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{studentProgress.student.name}</h2>
                    <p className="text-muted-foreground">{studentProgress.student.registration_number}</p>
                    <p className="text-sm text-muted-foreground">{studentProgress.student.email}</p>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <Badge className={`${getPerformanceColor(studentProgress.overall.performance_level)} text-lg px-4 py-2 border`}>
                    {studentProgress.overall.performance_level}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">Overall Performance</p>
                </div>
              </div>

              {/* Overall Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Overall Participation Rate
                  </span>
                  <span className="text-3xl font-bold text-primary">{studentProgress.overall.participation_rate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full transition-all ${getProgressBarColor(parseFloat(studentProgress.overall.participation_rate))}`}
                    style={{ width: `${studentProgress.overall.participation_rate}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Assessments Card */}
            <Card className="border-t-4 border-t-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <FileText className="h-5 w-5" />
                  Assessments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4 bg-blue-50 rounded-lg">
                  <Percent className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                  <p className="text-3xl font-bold text-blue-700">{studentProgress.assessments.participation_rate}%</p>
                  <p className="text-sm text-muted-foreground">Participation Rate</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Submitted
                    </span>
                    <span className="font-bold text-green-700">{studentProgress.assessments.submitted}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      Not Submitted
                    </span>
                    <span className="font-bold text-red-700">{studentProgress.assessments.not_submitted}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-yellow-600" />
                      Average Score
                    </span>
                    <span className="font-bold text-yellow-700">{studentProgress.assessments.average_score}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="flex items-center gap-2 text-sm">
                      <BarChart3 className="h-4 w-4 text-gray-600" />
                      Total
                    </span>
                    <span className="font-bold">{studentProgress.assessments.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignments Card */}
            <Card className="border-t-4 border-t-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <BookOpen className="h-5 w-5" />
                  Assignments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4 bg-green-50 rounded-lg">
                  <Percent className="h-6 w-6 mx-auto text-green-600 mb-1" />
                  <p className="text-3xl font-bold text-green-700">{studentProgress.assignments.participation_rate}%</p>
                  <p className="text-sm text-muted-foreground">Participation Rate</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Submitted
                    </span>
                    <span className="font-bold text-green-700">{studentProgress.assignments.submitted}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      Not Submitted
                    </span>
                    <span className="font-bold text-red-700">{studentProgress.assignments.not_submitted}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-yellow-600" />
                      Average Grade
                    </span>
                    <span className="font-bold text-yellow-700">{studentProgress.assignments.average_grade}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="flex items-center gap-2 text-sm">
                      <BarChart3 className="h-4 w-4 text-gray-600" />
                      Total
                    </span>
                    <span className="font-bold">{studentProgress.assignments.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Classes Card */}
            <Card className="border-t-4 border-t-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Video className="h-5 w-5" />
                  Live Classes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4 bg-purple-50 rounded-lg">
                  <Percent className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                  <p className="text-3xl font-bold text-purple-700">{studentProgress.live_classes.attendance_rate}%</p>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Attended
                    </span>
                    <span className="font-bold text-green-700">{studentProgress.live_classes.attended}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      Not Attended
                    </span>
                    <span className="font-bold text-red-700">{studentProgress.live_classes.not_attended}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-600" />
                      Total Classes
                    </span>
                    <span className="font-bold">{studentProgress.live_classes.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Card */}
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-2xl font-bold text-primary">{studentProgress.overall.participation_rate}%</p>
                  <p className="text-sm text-muted-foreground">Overall Rate</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-2xl font-bold text-blue-600">{studentProgress.assessments.average_score}%</p>
                  <p className="text-sm text-muted-foreground">Avg Assessment</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-2xl font-bold text-green-600">{studentProgress.assignments.average_grade}%</p>
                  <p className="text-sm text-muted-foreground">Avg Assignment</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-2xl font-bold text-purple-600">{studentProgress.live_classes.attendance_rate}%</p>
                  <p className="text-sm text-muted-foreground">Attendance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading overlay for student details */}
      {loading && selectedStudent && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary animate-pulse" />
              <span>Loading student progress...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
