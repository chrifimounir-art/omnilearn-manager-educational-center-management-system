import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Center, Teacher, TeacherRemuneration } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
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
const remunerationOptions: TeacherRemuneration[] = ['hourly', 'per_student', 'percentage'];
const teacherSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  specialty: z.string().min(2, 'Specialty is required'),
  remuneration: z.enum(remunerationOptions),
  centerIds: z.string().min(1, 'At least one Center ID is required'),
});
type TeacherFormData = z.infer<typeof teacherSchema>;
const remunerationMap: Record<Teacher['remuneration'], string> = {
  hourly: 'Hourly',
  per_student: 'Per Student',
  percentage: 'Percentage',
};
function TeacherForm({ onFinished, centers }: { onFinished: () => void, centers: Center[] }) {
  const queryClient = useQueryClient();
  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { firstName: '', lastName: '', specialty: '', remuneration: 'hourly', centerIds: '' },
  });
  const mutation = useMutation({
    mutationFn: (newTeacher: Omit<Teacher, 'id' | 'createdAt'>) => api<Teacher>('/api/teachers', {
      method: 'POST',
      body: JSON.stringify(newTeacher),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher created successfully!');
      onFinished();
      form.reset();
    },
    onError: (error) => {
      toast.error(`Failed to create teacher: ${error.message}`);
    },
  });
  function onSubmit(values: TeacherFormData) {
    const centerIds = values.centerIds.split(',').map(id => id.trim()).filter(Boolean);
    mutation.mutate({ ...values, centerIds });
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="firstName" render={({ field }) => (
          <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="e.g., John" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="lastName" render={({ field }) => (
          <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="e.g., Doe" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="specialty" render={({ field }) => (
          <FormItem><FormLabel>Specialty</FormLabel><FormControl><Input placeholder="e.g., Mathematics" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="remuneration" render={({ field }) => (
          <FormItem><FormLabel>Remuneration</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select a payment model" /></SelectTrigger></FormControl>
              <SelectContent>{remunerationOptions.map(o => <SelectItem key={o} value={o}>{remunerationMap[o]}</SelectItem>)}</SelectContent>
            </Select><FormMessage />
          </FormItem>
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
          {mutation.isPending ? 'Creating...' : 'Create Teacher'}
        </Button>
      </form>
    </Form>
  );
}
export function TeachersPage() {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const { data: teachersData, isLoading: isLoadingTeachers, error: teachersError } = useQuery<{ items: Teacher[] }>({
    queryKey: ['teachers'],
    queryFn: () => api('/api/teachers'),
  });
  const { data: centersData, isLoading: isLoadingCenters } = useQuery<{ items: Center[] }>({
    queryKey: ['centers'],
    queryFn: () => api('/api/centers'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/teachers/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete teacher: ${error.message}`);
    },
  });
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Teacher Registry</h1>
            <p className="text-lg text-muted-foreground">Browse and manage your teaching staff.</p>
          </div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Add Teacher</Button></SheetTrigger>
            <SheetContent>
              <SheetHeader><SheetTitle>Add a New Teacher</SheetTitle><SheetDescription>Fill in the details for the new teacher.</SheetDescription></SheetHeader>
              <div className="py-8">
                {isLoadingCenters ? <p>Loading centers...</p> : <TeacherForm onFinished={() => setIsSheetOpen(false)} centers={centersData?.items || []} />}
              </div>
            </SheetContent>
          </Sheet>
        </header>
        {isLoadingTeachers && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}><CardHeader className="flex flex-row items-center gap-4"><Skeleton className="h-12 w-12 rounded-full" /><div className="space-y-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-24" /></div></CardHeader><CardContent className="space-y-2"><Skeleton className="h-6 w-20 rounded-full" /><Skeleton className="h-4 w-40" /></CardContent></Card>
            ))}
          </div>
        )}
        {teachersError && <div className="col-span-full text-destructive">Failed to load teachers: {teachersError.message}</div>}
        {!isLoadingTeachers && !teachersData?.items.length && (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No teachers found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first teacher.</p>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teachersData?.items.map((teacher) => (
            <Card key={teacher.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12"><AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${teacher.firstName} ${teacher.lastName}`} /><AvatarFallback>{teacher.firstName[0]}{teacher.lastName[0]}</AvatarFallback></Avatar>
                <div><CardTitle>{teacher.firstName} {teacher.lastName}</CardTitle><CardDescription>{teacher.specialty}</CardDescription></div>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <Badge variant="secondary">{remunerationMap[teacher.remuneration]}</Badge>
                <p className="text-sm text-muted-foreground">Assigned to {teacher.centerIds.length} center(s)</p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the teacher's record.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate(teacher.id)} disabled={deleteMutation.isPending}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}