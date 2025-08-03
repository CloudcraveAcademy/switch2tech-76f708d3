import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, CheckCircle, XCircle, Star, MessageSquare, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const TestimonialsManagement = () => {
  const queryClient = useQueryClient();

  // Fetch student success stories (testimonials)
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["student-success-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_success_stories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Update testimonial status
  const updateTestimonialStatus = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: boolean }) => {
      const updateData: any = {};
      updateData[field] = value;
      
      if (field === 'is_approved' && value) {
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("student_success_stories")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-success-stories"] });
      toast({ title: "Testimonial updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error updating testimonial",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete testimonial
  const deleteTestimonial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("student_success_stories")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-success-stories"] });
      toast({ title: "Testimonial deleted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error deleting testimonial",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (isApproved: boolean) => {
    return (
      <Badge variant={isApproved ? "default" : "outline"}>
        {isApproved ? "Approved" : "Pending"}
      </Badge>
    );
  };

  const getFeaturedBadge = (isFeatured: boolean) => {
    return (
      <Badge variant={isFeatured ? "secondary" : "outline"}>
        {isFeatured ? "Featured" : "Not Featured"}
      </Badge>
    );
  };

  const TestimonialDetails = ({ testimonial }: { testimonial: any }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold">Personal Information</h4>
          <p><strong>Name:</strong> {testimonial.name}</p>
          <p><strong>Role:</strong> {testimonial.role}</p>
          <p><strong>Company:</strong> {testimonial.company}</p>
          <p><strong>Submitted:</strong> {new Date(testimonial.created_at).toLocaleDateString()}</p>
        </div>
        <div>
          <h4 className="font-semibold">Status</h4>
          <p><strong>Approved:</strong> {testimonial.is_approved ? 'Yes' : 'No'}</p>
          <p><strong>Featured:</strong> {testimonial.is_featured ? 'Yes' : 'No'}</p>
          {testimonial.approved_at && (
            <p><strong>Approved At:</strong> {new Date(testimonial.approved_at).toLocaleDateString()}</p>
          )}
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold">Success Story</h4>
        <p className="bg-muted p-4 rounded-lg">{testimonial.story}</p>
      </div>

      {testimonial.image_url && (
        <div>
          <h4 className="font-semibold">Image</h4>
          <img 
            src={testimonial.image_url} 
            alt={testimonial.name}
            className="w-32 h-32 object-cover rounded-lg"
          />
        </div>
      )}

      {testimonial.video_url && (
        <div>
          <h4 className="font-semibold">Video URL</h4>
          <a 
            href={testimonial.video_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {testimonial.video_url}
          </a>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button
          onClick={() => updateTestimonialStatus.mutate({ 
            id: testimonial.id, 
            field: 'is_approved', 
            value: !testimonial.is_approved 
          })}
          disabled={updateTestimonialStatus.isPending}
          variant={testimonial.is_approved ? "outline" : "default"}
          className="flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          {testimonial.is_approved ? 'Unapprove' : 'Approve'}
        </Button>
        
        <Button
          onClick={() => updateTestimonialStatus.mutate({ 
            id: testimonial.id, 
            field: 'is_featured', 
            value: !testimonial.is_featured 
          })}
          disabled={updateTestimonialStatus.isPending}
          variant={testimonial.is_featured ? "outline" : "secondary"}
          className="flex items-center gap-2"
        >
          <Star className="h-4 w-4" />
          {testimonial.is_featured ? 'Unfeature' : 'Feature'}
        </Button>
        
        <Button
          variant="destructive"
          onClick={() => deleteTestimonial.mutate(testimonial.id)}
          disabled={deleteTestimonial.isPending}
          className="flex items-center gap-2"
        >
          <XCircle className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Testimonials Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Testimonials</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testimonials?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testimonials?.filter(t => t.is_approved).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testimonials?.filter(t => t.is_featured).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Testimonials</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role & Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : testimonials?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No testimonials found</TableCell>
                </TableRow>
              ) : (
                testimonials?.map((testimonial) => (
                  <TableRow key={testimonial.id}>
                    <TableCell>{testimonial.name}</TableCell>
                    <TableCell>
                      {testimonial.role} at {testimonial.company}
                    </TableCell>
                    <TableCell>{getStatusBadge(testimonial.is_approved)}</TableCell>
                    <TableCell>{getFeaturedBadge(testimonial.is_featured)}</TableCell>
                    <TableCell>
                      {new Date(testimonial.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Testimonial Details</DialogTitle>
                            <DialogDescription>
                              Review and manage this testimonial
                            </DialogDescription>
                          </DialogHeader>
                          <TestimonialDetails testimonial={testimonial} />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestimonialsManagement;