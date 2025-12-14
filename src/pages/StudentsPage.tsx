import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Student } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
export function StudentsPage() {
  const { data, isLoading, error } = useQuery<{ items: Student[] }>({
    queryKey: ['students'],
    queryFn: () => api('/api/students'),
  });
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Student Directory</h1>
            <p className="text-lg text-muted-foreground">Search and manage all enrolled students.</p>
          </div>
          <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>All Students</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search students..." className="pl-8 w-full md:w-1/3" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrollment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  </TableRow>
                ))}
                {error && <TableRow><TableCell colSpan={4} className="text-center text-destructive">Failed to load students.</TableCell></TableRow>}
                {!isLoading && !data?.items.length && <TableRow><TableCell colSpan={4} className="text-center">No students found.</TableCell></TableRow>}
                {data?.items.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.firstName} {student.lastName}</TableCell>
                    <TableCell>{format(new Date(student.dateOfBirth), 'PPP')}</TableCell>
                    <TableCell><Badge>Active</Badge></TableCell>
                    <TableCell>{format(new Date(student.createdAt), 'PPP')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}