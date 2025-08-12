import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { FileText, Search, Calendar, Users, Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  max_score: number;
  is_published: boolean;
  course_id: string;
  course?: {
    title: string;
    instructor: {
      first_name: string;
      last_name: string;
    };
  };
  submissions_count?: number;
}

const AssignmentOverview = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      
      const { data: assignmentsData, error } = await supabase
        .from('assignments')
        .select(`
          *,
          course:courses (
            title,
            instructor:user_profiles_public!instructor_id (
              first_name,
              last_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch submission counts for each assignment
      const assignmentsWithCounts = await Promise.all(
        (assignmentsData || []).map(async (assignment) => {
          const { count } = await supabase
            .from('assignment_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('assignment_id', assignment.id);

          return {
            ...assignment,
            submissions_count: count || 0,
          };
        })
      );

      setAssignments(assignmentsWithCounts);
      setFilteredAssignments(assignmentsWithCounts);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast({
        title: "Error loading assignments",
        description: "Failed to fetch assignments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    let filtered = assignments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.course?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${assignment.course?.instructor.first_name} ${assignment.course?.instructor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus === 'published') {
      filtered = filtered.filter(assignment => assignment.is_published);
    } else if (filterStatus === 'draft') {
      filtered = filtered.filter(assignment => !assignment.is_published);
    }

    setFilteredAssignments(filtered);
  }, [assignments, searchTerm, filterStatus]);

  const handleDelete = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to delete this assignment? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Assignment deleted",
        description: "Assignment has been deleted successfully",
      });

      fetchAssignments();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast({
        title: "Error deleting assignment",
        description: "Failed to delete assignment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const togglePublishStatus = async (assignment: Assignment) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .update({ is_published: !assignment.is_published })
        .eq('id', assignment.id);

      if (error) throw error;

      toast({
        title: assignment.is_published ? "Assignment unpublished" : "Assignment published",
        description: `Assignment has been ${assignment.is_published ? 'unpublished' : 'published'} successfully`,
      });

      fetchAssignments();
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast({
        title: "Error updating assignment",
        description: "Failed to update assignment status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading assignments...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Assignment Overview
        </CardTitle>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search assignments, courses, or instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'published' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('published')}
            >
              Published
            </Button>
            <Button
              variant={filterStatus === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('draft')}
            >
              Drafts
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filteredAssignments.length > 0 ? (
          <div className="space-y-4 p-6">
            {filteredAssignments.map((assignment) => (
              <div key={assignment.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{assignment.title}</h3>
                      <Badge variant={assignment.is_published ? "default" : "secondary"}>
                        {assignment.is_published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div>
                        <strong>Course:</strong> {assignment.course?.title}
                      </div>
                      <div>
                        <strong>Instructor:</strong> {assignment.course?.instructor.first_name} {assignment.course?.instructor.last_name}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Due: {formatDate(assignment.due_date)}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {assignment.submissions_count} submissions
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePublishStatus(assignment)}
                    >
                      {assignment.is_published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(assignment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700">
              {searchTerm || filterStatus !== 'all' ? 'No assignments found' : 'No assignments yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' ? 
                'Try adjusting your search criteria' : 
                'Assignments will appear here once instructors create them'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentOverview;