import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";

interface Course {
  id: number;
  code: string;
  name: string;
  academic_level: string;
}

interface CourseListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CourseListDialog = ({ open, onOpenChange }: CourseListDialogProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open && courses.length === 0) {
      fetchCourses();
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCourses(courses);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = courses.filter(
        (course) =>
          course.code.toLowerCase().includes(query) ||
          course.name.toLowerCase().includes(query) ||
          course.id.toString().includes(query)
      );
      setFilteredCourses(filtered);
    }
  }, [searchQuery, courses]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://must-lms-backend.onrender.com/api/courses/list');
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.courses);
        setFilteredCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAcademicLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      certificate: "bg-gray-100 text-gray-800",
      diploma: "bg-blue-100 text-blue-800",
      bachelor: "bg-green-100 text-green-800",
      masters: "bg-purple-100 text-purple-800",
      phd: "bg-red-100 text-red-800",
    };
    return colors[level?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Available Courses</DialogTitle>
          <DialogDescription>
            Browse all available courses with their codes. Use these codes in your CSV file.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by code, name, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex-1 overflow-auto border rounded-md">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              {searchQuery ? "No courses found matching your search" : "No courses available"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-mono font-semibold">{course.code}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell className="text-muted-foreground">{course.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getAcademicLevelColor(course.academic_level)}>
                        {course.academic_level}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredCourses.length} of {courses.length} courses
        </div>
      </DialogContent>
    </Dialog>
  );
};
