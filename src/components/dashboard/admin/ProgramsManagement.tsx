import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Edit, Plus, Calendar, Users, Building } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ProgramsManagement = () => {
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [programType, setProgramType] = useState<'mentorship' | 'internship'>('mentorship');
  const queryClient = useQueryClient();

  // Fetch mentorship programs
  const { data: mentorshipPrograms, isLoading: loadingMentorship } = useQuery({
    queryKey: ["mentorship-programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentorship_programs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch internship programs
  const { data: internshipPrograms, isLoading: loadingInternships } = useQuery({
    queryKey: ["internship-programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internship_programs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create/Update program
  const saveProgram = useMutation({
    mutationFn: async (programData: any) => {
      const table = programType === 'mentorship' ? 'mentorship_programs' : 'internship_programs';
      
      if (programData.id) {
        // Update existing program
        const { error } = await supabase
          .from(table)
          .update(programData)
          .eq("id", programData.id);
        if (error) throw error;
      } else {
        // Create new program
        const { error } = await supabase
          .from(table)
          .insert([programData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentorship-programs"] });
      queryClient.invalidateQueries({ queryKey: ["internship-programs"] });
      setIsCreateDialogOpen(false);
      setEditingProgram(null);
      toast({ title: "Program saved successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error saving program",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      upcoming: "outline",
      active: "default",
      completed: "secondary",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const ProgramForm = ({ program, onSave }: { program?: any; onSave: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      name: program?.name || '',
      description: program?.description || '',
      status: program?.status || 'upcoming',
      start_date: program?.start_date ? new Date(program.start_date).toISOString().split('T')[0] : '',
      end_date: program?.end_date ? new Date(program.end_date).toISOString().split('T')[0] : '',
      max_participants: program?.max_participants || (programType === 'mentorship' ? undefined : ''),
      max_interns: program?.max_interns || (programType === 'internship' ? undefined : ''),
      company: program?.company || (programType === 'internship' ? '' : undefined),
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const submitData: any = { ...formData };
      if (program?.id) submitData.id = program.id;
      
      // Clean up fields based on program type
      if (programType === 'mentorship') {
        delete submitData.company;
        delete submitData.max_interns;
      } else {
        delete submitData.max_participants;
      }
      
      onSave(submitData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Program Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        {programType === 'internship' && (
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
          <div>
            <Label htmlFor="max_participants">
              Max {programType === 'mentorship' ? 'Participants' : 'Interns'}
            </Label>
            <Input
              id="max_participants"
              type="number"
              value={programType === 'mentorship' ? formData.max_participants : formData.max_interns}
              onChange={(e) => setFormData({ 
                ...formData, 
                [programType === 'mentorship' ? 'max_participants' : 'max_interns']: parseInt(e.target.value) || undefined 
              })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => {
            setIsCreateDialogOpen(false);
            setEditingProgram(null);
          }}>
            Cancel
          </Button>
          <Button type="submit" disabled={saveProgram.isPending}>
            {saveProgram.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    );
  };

  const ProgramTable = ({ programs, type, loading }: { programs: any[]; type: 'mentorship' | 'internship'; loading: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          {type === 'internship' && <TableHead>Company</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Capacity</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={type === 'internship' ? 6 : 5} className="text-center">Loading...</TableCell>
          </TableRow>
        ) : programs?.length === 0 ? (
          <TableRow>
            <TableCell colSpan={type === 'internship' ? 6 : 5} className="text-center">No programs found</TableCell>
          </TableRow>
        ) : (
          programs?.map((program) => (
            <TableRow key={program.id}>
              <TableCell className="font-medium">{program.name}</TableCell>
              {type === 'internship' && <TableCell>{program.company || 'N/A'}</TableCell>}
              <TableCell>{getStatusBadge(program.status)}</TableCell>
              <TableCell>
                {program.start_date && program.end_date ? (
                  <>
                    {new Date(program.start_date).toLocaleDateString()} - {new Date(program.end_date).toLocaleDateString()}
                  </>
                ) : 'Not set'}
              </TableCell>
              <TableCell>
                {type === 'mentorship' ? program.max_participants : program.max_interns} {type === 'mentorship' ? 'participants' : 'interns'}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setProgramType(type);
                      setEditingProgram(program);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Programs Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Program
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Program</DialogTitle>
              <DialogDescription>
                Choose the type of program to create
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Program Type</Label>
                <Select value={programType} onValueChange={(value: 'mentorship' | 'internship') => setProgramType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mentorship">Mentorship Program</SelectItem>
                    <SelectItem value="internship">Internship Program</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ProgramForm onSave={(data) => saveProgram.mutate(data)} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mentorship Programs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mentorshipPrograms?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Internship Programs</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{internshipPrograms?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...mentorshipPrograms || [], ...internshipPrograms || []]
                .filter(program => program.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Programs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...mentorshipPrograms || [], ...internshipPrograms || []]
                .filter(program => program.status === 'upcoming').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mentorship" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mentorship">Mentorship Programs</TabsTrigger>
          <TabsTrigger value="internship">Internship Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="mentorship">
          <Card>
            <CardHeader>
              <CardTitle>Mentorship Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgramTable 
                programs={mentorshipPrograms || []} 
                type="mentorship" 
                loading={loadingMentorship} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="internship">
          <Card>
            <CardHeader>
              <CardTitle>Internship Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgramTable 
                programs={internshipPrograms || []} 
                type="internship" 
                loading={loadingInternships} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editingProgram && (
        <Dialog open={!!editingProgram} onOpenChange={() => setEditingProgram(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit {programType === 'mentorship' ? 'Mentorship' : 'Internship'} Program</DialogTitle>
            </DialogHeader>
            <ProgramForm 
              program={editingProgram} 
              onSave={(data) => saveProgram.mutate(data)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProgramsManagement;