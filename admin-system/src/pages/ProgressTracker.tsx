import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  GraduationCap,
  Building,
  Briefcase,
  BarChart3,
  Target,
  Percent,
  User,
  Megaphone,
  FolderOpen
} from "lucide-react";

interface College {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  college_id: number;
}

interface Course {
  id: number;
  name: string;
  department_id: number;
}

interface Program {
  id: number;
  name: string;
  course_id: number;
}

interface Student {
  id: number;
  name: string;
  registration_number: string;
}

interface Lecturer {
  id: number;
  name: string;
  email: string;
  specialization?: string;
  employee_id?: string;
  is_active?: boolean;
}

interface StudentProgressStats {
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
  assessments: StudentProgressStats;
  assignments: StudentProgressStats;
  live_classes: StudentProgressStats;
  overall: {
    participation_rate: string;
    performance_level: string;
  };
}

interface DetailedStudentProgress extends StudentProgress {
  student: Student & { email: string };
  program: string;
  assessments: StudentProgressStats & { not_submitted: number };
  assignments: StudentProgressStats & { not_submitted: number };
  live_classes: StudentProgressStats & { not_attended: number };
}

interface LecturerStats {
  programs: number;
  assessments: number;
  assignments: number;
  live_classes: number;
  total_activities: number;
}

interface LecturerProgress {
  lecturer: Lecturer;
  stats: LecturerStats;
  overall: {
    activity_level: string;
  };
}

interface DetailedLecturerProgress {
  lecturer: Lecturer & { specialization: string; employee_id: string };
  programs: { total: number };
  students: { total: number };
  assessments: { total_created: number; active: number; completed: number };
  assignments: { total_created: number; active: number; completed: number };
  live_classes: { total_created: number; active: number; completed: number };
  content: { total_created: number };
  announcements: { total_created: number };
  overall: { total_activities: number; activity_level: string };
}

export const ProgressTracker = () => {
  const [activeTab, setActiveTab] = useState("students");
  
  // Student filters
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [lecturers, setLecturers] = useState<LecturerProgress[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);
  const [selectedLecturer, setSelectedLecturer] = useState<LecturerProgress | null>(null);
  const [studentProgress, setStudentProgress] = useState<DetailedStudentProgress | null>(null);
  const [lecturerProgress, setLecturerProgress] = useState<DetailedLecturerProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch colleges
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch('https://must-lms-backend.onrender.com/api/colleges');
        if (response.ok) {
          const result = await response.json();
          setColleges(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching colleges:', error);
      }
    };
    fetchColleges();
  }, []);

  // Fetch departments when college is selected
  useEffect(() => {
    if (!selectedCollege) {
      setDepartments([]);
      setSelectedDepartment("");
      return;
    }

    const fetchDepartments = async () => {
      try {
        const response = await fetch('https://must-lms-backend.onrender.com/api/departments');
        if (response.ok) {
          const result = await response.json();
          const filteredDepts = result.data?.filter((dept: Department) => 
            dept.college_id === parseInt(selectedCollege)
          ) || [];
          setDepartments(filteredDepts);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, [selectedCollege]);

  // Fetch courses when department is selected
  useEffect(() => {
    if (!selectedDepartment) {
      setCourses([]);
      setSelectedCourse("");
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await fetch('https://must-lms-backend.onrender.com/api/courses');
        if (response.ok) {
          const result = await response.json();
          const filteredCourses = result.data?.filter((course: Course) => 
            course.department_id === parseInt(selectedDepartment)
          ) || [];
          setCourses(filteredCourses);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, [selectedDepartment]);

  // Fetch programs when course is selected
  useEffect(() => {
    if (!selectedCourse) {
      setPrograms([]);
      setSelectedProgram("");
      return;
    }

    const fetchPrograms = async () => {
      try {
        // Use user_type=admin to get all programs from backend (no semester filtering)
        const response = await fetch('https://must-lms-backend.onrender.com/api/programs?user_type=admin&skip_semester_filter=true');
        if (response.ok) {
          const result = await response.json();
          const filteredPrograms = result.data?.filter((program: Program) => 
            program.course_id === parseInt(selectedCourse)
          ) || [];
          setPrograms(filteredPrograms);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };
    fetchPrograms();
  }, [selectedCourse]);

  // Fetch students based on filters
  useEffect(() => {
    if (!selectedProgram) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://must-lms-backend.onrender.com/api/progress/students?program_name=${encodeURIComponent(selectedProgram)}`
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

  // Fetch all lecturers with progress
  useEffect(() => {
    if (activeTab !== "lecturers") return;

    const fetchLecturers = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://must-lms-backend.onrender.com/api/progress/lecturers');
        if (response.ok) {
          const result = await response.json();
          setLecturers(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching lecturers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLecturers();
  }, [activeTab]);

  // Fetch individual student progress
  const handleViewStudentProgress = async (student: StudentProgress) => {
    setSelectedStudent(student);
    setLoading(true);
    
    try {
      const response = await fetch(
        `https://must-lms-backend.onrender.com/api/progress/student/${student.student.id}?program_name=${encodeURIComponent(selectedProgram)}`
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

  // Fetch individual lecturer progress
  const handleViewLecturerProgress = async (lecturer: LecturerProgress) => {
    setSelectedLecturer(lecturer);
    setLoading(true);
    
    try {
      const response = await fetch(
        `https://must-lms-backend.onrender.com/api/progress/lecturer/${lecturer.lecturer.id}`
      );
      
      if (response.ok) {
        const result = await response.json();
        setLecturerProgress(result.data);
      }
    } catch (error) {
      console.error('Error fetching lecturer progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (level: string) => {
    switch (level) {
      case 'Excellent': return 'bg-green-100 text-green-800 border-green-300';
      case 'Good': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Average': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Very Active': return 'bg-green-100 text-green-800 border-green-300';
      case 'Active': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-red-100 text-red-800 border-red-300';
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

  const filteredLecturers = lecturers.filter(lecturer =>
    lecturer.lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecturer.lecturer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          Progress Tracker
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor student and lecturer performance across the institution
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        setSearchTerm("");
        setSelectedStudent(null);
        setSelectedLecturer(null);
        setStudentProgress(null);
        setLecturerProgress(null);
      }}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="lecturers" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Lecturers
          </TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6 mt-6">
          {!selectedStudent && (
            <>
              {/* Filters Card */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Filter Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* College Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">College</label>
                      <Select value={selectedCollege} onValueChange={(value) => {
                        setSelectedCollege(value);
                        setSelectedDepartment("");
                        setSelectedCourse("");
                        setSelectedProgram("");
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select College" />
                        </SelectTrigger>
                        <SelectContent>
                          {colleges.map((college) => (
                            <SelectItem key={college.id} value={college.id.toString()}>
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                {college.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Department Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Department</label>
                      <Select 
                        value={selectedDepartment} 
                        onValueChange={(value) => {
                          setSelectedDepartment(value);
                          setSelectedCourse("");
                          setSelectedProgram("");
                        }}
                        disabled={!selectedCollege}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                {dept.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Course Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Course</label>
                      <Select 
                        value={selectedCourse} 
                        onValueChange={(value) => {
                          setSelectedCourse(value);
                          setSelectedProgram("");
                        }}
                        disabled={!selectedDepartment}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                {course.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Program Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Program</label>
                      <Select 
                        value={selectedProgram} 
                        onValueChange={setSelectedProgram}
                        disabled={!selectedCourse}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Program" />
                        </SelectTrigger>
                        <SelectContent>
                          {programs.map((program) => (
                            <SelectItem key={program.id} value={program.name}>
                              {program.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Search and Results */}
              {selectedProgram && (
                <>
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
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <TrendingUp className="h-8 w-8 text-primary animate-pulse" />
                      <span className="ml-2">Loading students...</span>
                    </div>
                  ) : filteredStudents.length > 0 ? (
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

                              <div className="grid grid-cols-3 gap-2 pt-2">
                                <div className="text-center p-2 bg-blue-50 rounded">
                                  <FileText className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                                  <p className="text-xs text-muted-foreground">Assess.</p>
                                  <p className="text-sm font-bold">{student.assessments.submitted}/{student.assessments.total}</p>
                                </div>
                                <div className="text-center p-2 bg-green-50 rounded">
                                  <BookOpen className="h-4 w-4 mx-auto text-green-600 mb-1" />
                                  <p className="text-xs text-muted-foreground">Assign.</p>
                                  <p className="text-sm font-bold">{student.assignments.submitted}/{student.assignments.total}</p>
                                </div>
                                <div className="text-center p-2 bg-purple-50 rounded">
                                  <Video className="h-4 w-4 mx-auto text-purple-600 mb-1" />
                                  <p className="text-xs text-muted-foreground">Classes</p>
                                  <p className="text-sm font-bold">{student.live_classes.attended}/{student.live_classes.total}</p>
                                </div>
                              </div>
                            </div>

                            <Button variant="ghost" size="sm" className="w-full mt-3 text-primary">
                              View Details <ChevronRight className="h-4 w-4 ml-2" />
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
                        <p className="text-muted-foreground text-center">
                          {searchTerm ? "Try adjusting your search terms" : "No students enrolled in this program yet"}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {!selectedProgram && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Select Filters</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      Please select College, Department, Course, and Program to view student progress
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Detailed Student Progress View */}
          {selectedStudent && studentProgress && (
            <div className="space-y-6">
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
                    
                    <div className="space-y-2">
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
                    
                    <div className="space-y-2">
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
                    
                    <div className="space-y-2">
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
            </div>
          )}
        </TabsContent>

        {/* Lecturers Tab */}
        <TabsContent value="lecturers" className="space-y-6 mt-6">
          {!selectedLecturer && (
            <>
              {/* Search */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search lecturers by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{filteredLecturers.length}</span>
                  <span className="text-muted-foreground">Lecturers</span>
                </div>
              </div>

              {/* Lecturers Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <TrendingUp className="h-8 w-8 text-primary animate-pulse" />
                  <span className="ml-2">Loading lecturers...</span>
                </div>
              ) : filteredLecturers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLecturers.map((lecturer) => (
                    <Card 
                      key={lecturer.lecturer.id} 
                      className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-green-500/50 hover:border-l-green-500"
                      onClick={() => handleViewLecturerProgress(lecturer)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                              <GraduationCap className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{lecturer.lecturer.name}</h3>
                              <p className="text-sm text-muted-foreground">{lecturer.lecturer.email}</p>
                              {lecturer.lecturer.specialization && (
                                <p className="text-xs text-muted-foreground">{lecturer.lecturer.specialization}</p>
                              )}
                            </div>
                          </div>
                          <Badge className={`${getPerformanceColor(lecturer.overall.activity_level)} border`}>
                            {lecturer.overall.activity_level}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <BookOpen className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                            <p className="text-lg font-bold text-blue-700">{lecturer.stats.programs}</p>
                            <p className="text-xs text-muted-foreground">Programs</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <BarChart3 className="h-5 w-5 mx-auto text-green-600 mb-1" />
                            <p className="text-lg font-bold text-green-700">{lecturer.stats.total_activities}</p>
                            <p className="text-xs text-muted-foreground">Activities</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-sm font-bold">{lecturer.stats.assessments}</p>
                            <p className="text-xs text-muted-foreground">Assess.</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-sm font-bold">{lecturer.stats.assignments}</p>
                            <p className="text-xs text-muted-foreground">Assign.</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-sm font-bold">{lecturer.stats.live_classes}</p>
                            <p className="text-xs text-muted-foreground">Classes</p>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm" className="w-full mt-3 text-green-600">
                          View Details <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Lecturers Found</h3>
                    <p className="text-muted-foreground text-center">
                      {searchTerm ? "Try adjusting your search terms" : "No lecturers registered yet"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Detailed Lecturer Progress View */}
          {selectedLecturer && lecturerProgress && (
            <div className="space-y-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedLecturer(null);
                  setLecturerProgress(null);
                }}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Lecturers List
              </Button>

              {/* Lecturer Header Card */}
              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-green-200 flex items-center justify-center">
                        <GraduationCap className="h-8 w-8 text-green-700" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{lecturerProgress.lecturer.name}</h2>
                        <p className="text-muted-foreground">{lecturerProgress.lecturer.email}</p>
                        {lecturerProgress.lecturer.employee_id && (
                          <p className="text-sm text-muted-foreground">ID: {lecturerProgress.lecturer.employee_id}</p>
                        )}
                        {lecturerProgress.lecturer.specialization && (
                          <p className="text-sm text-green-700">{lecturerProgress.lecturer.specialization}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <Badge className={`${getPerformanceColor(lecturerProgress.overall.activity_level)} text-lg px-4 py-2 border`}>
                        {lecturerProgress.overall.activity_level}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">Activity Level</p>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <BookOpen className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                      <p className="text-2xl font-bold text-blue-700">{lecturerProgress.programs.total}</p>
                      <p className="text-sm text-muted-foreground">Programs</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <Users className="h-6 w-6 mx-auto text-purple-600 mb-2" />
                      <p className="text-2xl font-bold text-purple-700">{lecturerProgress.students.total}</p>
                      <p className="text-sm text-muted-foreground">Students</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <BarChart3 className="h-6 w-6 mx-auto text-green-600 mb-2" />
                      <p className="text-2xl font-bold text-green-700">{lecturerProgress.overall.total_activities}</p>
                      <p className="text-sm text-muted-foreground">Total Activities</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <FolderOpen className="h-6 w-6 mx-auto text-orange-600 mb-2" />
                      <p className="text-2xl font-bold text-orange-700">{lecturerProgress.content.total_created}</p>
                      <p className="text-sm text-muted-foreground">Content Items</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Activity Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Assessments */}
                <Card className="border-t-4 border-t-blue-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-blue-700 text-base">
                      <FileText className="h-5 w-5" />
                      Assessments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-3 bg-blue-50 rounded-lg mb-3">
                      <p className="text-3xl font-bold text-blue-700">{lecturerProgress.assessments.total_created}</p>
                      <p className="text-sm text-muted-foreground">Total Created</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Active</span>
                        <span className="font-bold">{lecturerProgress.assessments.active}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Completed</span>
                        <span className="font-bold">{lecturerProgress.assessments.completed}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Assignments */}
                <Card className="border-t-4 border-t-green-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-green-700 text-base">
                      <BookOpen className="h-5 w-5" />
                      Assignments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-3 bg-green-50 rounded-lg mb-3">
                      <p className="text-3xl font-bold text-green-700">{lecturerProgress.assignments.total_created}</p>
                      <p className="text-sm text-muted-foreground">Total Created</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Active</span>
                        <span className="font-bold">{lecturerProgress.assignments.active}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Completed</span>
                        <span className="font-bold">{lecturerProgress.assignments.completed}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Classes */}
                <Card className="border-t-4 border-t-purple-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-purple-700 text-base">
                      <Video className="h-5 w-5" />
                      Live Classes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-3 bg-purple-50 rounded-lg mb-3">
                      <p className="text-3xl font-bold text-purple-700">{lecturerProgress.live_classes.total_created}</p>
                      <p className="text-sm text-muted-foreground">Total Created</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Active/Scheduled</span>
                        <span className="font-bold">{lecturerProgress.live_classes.active}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Completed</span>
                        <span className="font-bold">{lecturerProgress.live_classes.completed}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Announcements */}
                <Card className="border-t-4 border-t-orange-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-orange-700 text-base">
                      <Megaphone className="h-5 w-5" />
                      Announcements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-3 bg-orange-50 rounded-lg mb-3">
                      <p className="text-3xl font-bold text-orange-700">{lecturerProgress.announcements.total_created}</p>
                      <p className="text-sm text-muted-foreground">Total Posted</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Content Items</span>
                        <span className="font-bold">{lecturerProgress.content.total_created}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Loading overlay */}
      {loading && (selectedStudent || selectedLecturer) && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary animate-pulse" />
              <span>Loading progress data...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
