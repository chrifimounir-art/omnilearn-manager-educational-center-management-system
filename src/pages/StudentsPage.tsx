import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Trash2, Users } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Center, Student } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
const studentSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  centerIds: z.string().min(1, 'At least one Center ID is required'),
});
type StudentFormData = z.infer<typeof studentSchema>;
function StudentForm({ onFinished, centers }: { onFinished: () => void, centers: Center[] }) {
  const queryClient = useQueryClient();
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: { firstName: '', lastName: '', dateOfBirth: '', centerIds: '' },
  });
  const mutation = useMutation({
    mutationFn: (newStudent: Omit<Student, 'id' | 'createdAt'>) => api<Student>('/api/students', {
      method: 'POST',
      body: JSON.stringify(newStudent),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student created successfully!');
      onFinished();
      form.reset();
    },
    onError: (error) => {
      toast.error(`Failed to create student: ${error.message}`);
    },
  });
  function onSubmit(values: StudentFormData) {
    const centerIds = values.centerIds.split(',').map(id => id.trim()).filter(Boolean);
    mutation.mutate({ ...values, centerIds });
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="firstName" render={({ field }) => (
          <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="e.g., Alice" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="lastName" render={({ field }) => (
          <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="e.g., Johnson" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
          <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="centerIds" render={({ field }) => (
          <FormItem>
            <FormLabel>Center IDs</FormLabel>
            <FormControl><Input placeholder="e.g., center-1, center-2" {...field} /></FormControl>
            <p className="text-sm text-muted-foreground">
              Available IDs: {centers.map(c => c.id).join(', ') || 'No centers available'}
            </p>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? 'Creating...' : 'Create Student'}
        </Button>
      </form>
    </Form>
  );
}
export function StudentsPage() {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const { data: studentsData, isLoading: isLoadingStudents, error: studentsError } = useQuery<{ items: Student[] }>({
    queryKey: ['students'],
    queryFn: () => api('/api/students'),
  });
  const { data: centersData, isLoading: isLoadingCenters } = useQuery<{ items: Center[] }>({
    queryKey: ['centers'],
    queryFn: () => api('/api/centers'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/students/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete student: ${error.message}`);
    },
  });
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Student Directory</h1>
            <p className="text-lg text-muted-foreground">Search and manage all enrolled students.</p>
          </div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" />Add Student</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader><SheetTitle>Add a New Student</SheetTitle><SheetDescription>Fill in the details for the new student.</SheetDescription></SheetHeader>
              <div className="py-8">
                {isLoadingCenters ? <p>Loading centers...</p> : <StudentForm onFinished={() => setIsSheetOpen(false)} centers={centersData?.items || []} />}
              </div>
            </SheetContent>
          </Sheet>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>All Students</CardTitle>
            <div className="relative mt-2"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search students..." className="pl-8 w-full md:w-1/3" /></div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Full Name</TableHead><TableHead className="hidden md:table-cell">Date of Birth</TableHead><TableHead>Status</TableHead><TableHead className="hidden sm:table-cell">Enrollment Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isLoadingStudents && [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                    </TableRow>
                  ))}
                  {studentsError && <TableRow><TableCell colSpan={5} className="text-center text-destructive">Failed to load students.</TableCell></TableRow>}
                  {!isLoadingStudents && !studentsData?.items.length && (
                    <TableRow><TableCell colSpan={5} className="h-48 text-center">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No students found</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new student.</p>
                    </TableCell></TableRow>
                  )}
                  {studentsData?.items.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.firstName} {student.lastName}</TableCell>
                      <TableCell className="hidden md:table-cell">{format(new Date(student.dateOfBirth), 'PPP')}</TableCell>
                      <TableCell><Badge>Active</Badge></TableCell>
                      <TableCell className="hidden sm:table-cell">{format(new Date(student.createdAt), 'PPP')}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the student's record.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(student.id)} disabled={deleteMutation.isPending}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}