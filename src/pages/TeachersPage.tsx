import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Teacher } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
const remunerationMap: Record<Teacher['remuneration'], string> = {
  hourly: 'Hourly',
  per_student: 'Per Student',
  percentage: 'Percentage',
};
export function TeachersPage() {
  const { data, isLoading, error } = useQuery<{ items: Teacher[] }>({
    queryKey: ['teachers'],
    queryFn: () => api('/api/teachers'),
  });
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Teacher Registry</h1>
            <p className="text-lg text-muted-foreground">Browse and manage your teaching staff.</p>
          </div>
          <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Teacher
          </Button>
        </header>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading && [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </CardContent>
            </Card>
          ))}
          {error && <div className="col-span-full text-destructive">Failed to load teachers: {error.message}</div>}
          {!isLoading && !data?.items.length && <div className="col-span-full text-center py-16 border-2 border-dashed rounded-lg">No teachers found.</div>}
          {data?.items.map((teacher) => (
            <Card key={teacher.id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${teacher.firstName} ${teacher.lastName}`} />
                  <AvatarFallback>{teacher.firstName[0]}{teacher.lastName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{teacher.firstName} {teacher.lastName}</CardTitle>
                  <CardDescription>{teacher.specialty}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="secondary">{remunerationMap[teacher.remuneration]}</Badge>
                <p className="text-sm text-muted-foreground">
                  Assigned to {teacher.centerIds.length} center(s)
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}