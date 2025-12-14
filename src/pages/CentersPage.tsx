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
import { Building, PlusCircle, Trash2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Center } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
const centerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
});
type CenterFormData = z.infer<typeof centerSchema>;
function CenterForm({ onFinished }: { onFinished: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<CenterFormData>({
    resolver: zodResolver(centerSchema),
    defaultValues: { name: '', address: '' },
  });
  const mutation = useMutation({
    mutationFn: (newCenter: CenterFormData) => api<Center>('/api/centers', {
      method: 'POST',
      body: JSON.stringify(newCenter),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centers'] });
      toast.success('Center created successfully!');
      onFinished();
      form.reset();
    },
    onError: (error) => {
      toast.error(`Failed to create center: ${error.message}`);
    },
  });
  function onSubmit(values: CenterFormData) {
    mutation.mutate(values);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Center Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Downtown Learning Hub" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 123 Main St, Metropolis" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating...' : 'Create Center'}
        </Button>
      </form>
    </Form>
  );
}
export function CentersPage() {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<{ items: Center[] }>({
    queryKey: ['centers'],
    queryFn: () => api('/api/centers'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/centers/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centers'] });
      toast.success('Center deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete center: ${error.message}`);
    },
  });
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Center Management</h1>
            <p className="text-lg text-muted-foreground">Manage your training center locations.</p>
          </div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Center
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Create a New Center</SheetTitle>
                <SheetDescription>Fill in the details for your new training center.</SheetDescription>
              </SheetHeader>
              <div className="py-8">
                <CenterForm onFinished={() => setIsSheetOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </header>
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardFooter>
                  <Skeleton className="h-10 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        {error && <div className="text-destructive">Failed to load centers: {error.message}</div>}
        {!isLoading && !data?.items.length && (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Building className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No centers found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by creating your first center.</p>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((center) => (
            <Card key={center.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  {center.name}
                </CardTitle>
                <CardDescription>{center.address}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow" />
              <CardFooter className="flex justify-end">
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(center.id)} disabled={deleteMutation.isPending && deleteMutation.variables === center.id}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}