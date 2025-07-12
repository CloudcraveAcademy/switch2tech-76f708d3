import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { FileText, Plus, Calendar, Clock, Edit, Trash2, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  max_score: number;
  is_published: boolean;
  course_id: string;
  submissions_count?: number;
}

interface AssignmentManagerProps {
  courseId: string;
}

const AssignmentManager = ({ courseId }: AssignmentManagerProps) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    max_score: 100,
    is_published: false,
  });

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      
      const { data: assignmentsData, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', courseId)
        .order('due_date', { ascending: true });

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
    if (courseId) {
      fetchAssignments();
    }
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.due_date) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingAssignment) {
        // Update existing assignment
        const { error } = await supabase
          .from('assignments')
          .update({
            title: formData.title.trim(),
            description: formData.description.trim(),
            due_date: formData.due_date,
            max_score: formData.max_score,
            is_published: formData.is_published,
          })
          .eq('id', editingAssignment.id);

        if (error) throw error;

        toast({
          title: "Assignment updated",
          description: "Assignment has been updated successfully",
        });
      } else {
        // Create new assignment
        const { error } = await supabase
          .from('assignments')
          .insert({
            course_id: courseId,
            title: formData.title.trim(),
            description: formData.description.trim(),
            due_date: formData.due_date,
            max_score: formData.max_score,
            is_published: formData.is_published,
          });

        if (error) throw error;

        toast({
          title: "Assignment created",
          description: "New assignment has been created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingAssignment(null);
      setFormData({
        title: '',
        description: '',
        due_date: '',
        max_score: 100,
        is_published: false,
      });
      fetchAssignments();
    } catch (error) {
      console.error("Error saving assignment:", error);
      toast({
        title: "Error saving assignment",
        description: "Failed to save assignment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      due_date: assignment.due_date.split('T')[0], // Format for input[type="date"]
      max_score: assignment.max_score,
      is_published: assignment.is_published,
    });
    setIsDialogOpen(true);
  };

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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Assignment Management
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Assignment Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter assignment title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter assignment description and instructions"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="max_score">Maximum Score</Label>
                    <Input
                      id="max_score"
                      type="number"
                      min="1"
                      value={formData.max_score}
                      onChange={(e) => setFormData({ ...formData, max_score: parseInt(e.target.value) || 100 })}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_published">Publish immediately</Label>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {assignments.length > 0 ? (
          <div className="space-y-4 p-6">
            {assignments.map((assignment) => (
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
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Due: {formatDate(assignment.due_date)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Max Score: {assignment.max_score}
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
                      onClick={() => handleEdit(assignment)}
                    >
                      <Edit className="h-4 w-4" />
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
            <h3 className="text-lg font-medium text-gray-700">No assignments yet</h3>
            <p className="text-gray-500 mb-4">Create your first assignment to engage students</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentManager;