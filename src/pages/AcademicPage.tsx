import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Trash2, BookOpen, Layers, School, Users } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Center, Level, Class, Subject } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
// Schemas and Forms
const levelSchema = z.object({ name: z.string().min(2, "Name is required"), centerId: z.string().min(1, "Center is required") });
type LevelFormData = z.infer<typeof levelSchema>;
const classSchema = z.object({ name: z.string().min(1, "Name is required"), levelId: z.string().min(1, "Level is required"), capacity: z.number().min(1, "Capacity must be positive") });
type ClassFormData = z.infer<typeof classSchema>;
const subjectSchema = z.object({ name: z.string().min(2, "Name is required"), centerId: z.string().min(1, "Center is required"), levelIds: z.string().optional() });
type SubjectFormData = z.infer<typeof subjectSchema>;
// Reusable Form Components
function LevelForm({ onFinished }: { onFinished: () => void }) {
    const queryClient = useQueryClient();
    const { data: centersData, isLoading } = useQuery<{ items: Center[] }>({ queryKey: ['centers'], queryFn: () => api('/api/centers') });
    const form = useForm<LevelFormData>({ resolver: zodResolver(levelSchema), defaultValues: { name: '', centerId: '' } });
    const mutation = useMutation({
        mutationFn: (data: LevelFormData) => api<Level>('/api/levels', { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['levels'] }); toast.success("Level created!"); onFinished(); },
        onError: (err) => toast.error(`Failed: ${err.message}`),
    });
    if (isLoading) return <p>Loading centers...</p>;
    return (
        <Form {...form}><form onSubmit={form.handleSubmit(d => mutation.mutate(d))} className="space-y-6">
            <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Level Name</FormLabel><FormControl><Input placeholder="e.g., Primaire" {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="centerId" render={({ field }) => <FormItem><FormLabel>Center</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a center" /></SelectTrigger></FormControl><SelectContent>{centersData?.items.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>} />
            <Button type="submit" disabled={mutation.isPending} className="w-full">{mutation.isPending ? "Saving..." : "Create Level"}</Button>
        </form></Form>
    );
}
function ClassForm({ onFinished }: { onFinished: () => void }) {
    const queryClient = useQueryClient();
    const { data: levelsData, isLoading } = useQuery<{ items: Level[] }>({ queryKey: ['levels'], queryFn: () => api('/api/levels') });
    const form = useForm<ClassFormData>({ resolver: zodResolver(classSchema), defaultValues: { name: '', levelId: '', capacity: 25 } });
    const mutation = useMutation({
        mutationFn: (data: ClassFormData) => api<Class>('/api/classes', { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['classes'] }); toast.success("Class created!"); onFinished(); },
        onError: (err) => toast.error(`Failed: ${err.message}`),
    });
    if (isLoading) return <p>Loading levels...</p>;
    return (
        <Form {...form}><form onSubmit={form.handleSubmit(d => mutation.mutate(d))} className="space-y-6">
            <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Class Name</FormLabel><FormControl><Input placeholder="e.g., CP" {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="levelId" render={({ field }) => <FormItem><FormLabel>Level</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a level" /></SelectTrigger></FormControl><SelectContent>{levelsData?.items.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>} />
            <FormField control={form.control} name="capacity" render={({ field }) => <FormItem><FormLabel>Capacity</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>} />
            <Button type="submit" disabled={mutation.isPending} className="w-full">{mutation.isPending ? "Saving..." : "Create Class"}</Button>
        </form></Form>
    );
}
function SubjectForm({ onFinished }: { onFinished: () => void }) {
    const queryClient = useQueryClient();
    const { data: centersData, isLoading: l1 } = useQuery<{ items: Center[] }>({ queryKey: ['centers'], queryFn: () => api('/api/centers') });
    const { data: levelsData, isLoading: l2 } = useQuery<{ items: Level[] }>({ queryKey: ['levels'], queryFn: () => api('/api/levels') });
    const form = useForm<SubjectFormData>({ resolver: zodResolver(subjectSchema), defaultValues: { name: '', centerId: '', levelIds: '' } });
    const mutation = useMutation({
        mutationFn: (data: Omit<Subject, 'id' | 'createdAt'>) => api<Subject>('/api/subjects', { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['subjects'] }); toast.success("Subject created!"); onFinished(); },
        onError: (err) => toast.error(`Failed: ${err.message}`),
    });
    const onSubmit = (values: SubjectFormData) => {
        const levelIds = values.levelIds?.split(',').map(id => id.trim()).filter(Boolean) ?? [];
        mutation.mutate({ ...values, levelIds });
    }
    if (l1 || l2) return <p>Loading data...</p>;
    return (
        <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Subject Name</FormLabel><FormControl><Input placeholder="e.g., Mathématiques" {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="centerId" render={({ field }) => <FormItem><FormLabel>Center</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a center" /></SelectTrigger></FormControl><SelectContent>{centersData?.items.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>} />
            <FormField control={form.control} name="levelIds" render={({ field }) => <FormItem><FormLabel>Associated Level IDs (comma-separated)</FormLabel><FormControl><Input placeholder="e.g., level-1, level-2" {...field} /></FormControl><p className="text-xs text-muted-foreground">Available: {levelsData?.items.map(l => l.id).join(', ')}</p><FormMessage /></FormItem>} />
            <Button type="submit" disabled={mutation.isPending} className="w-full">{mutation.isPending ? "Saving..." : "Create Subject"}</Button>
        </form></Form>
    );
}
// Main Page Component
export function AcademicPage() {
    const [sheet, setSheet] = React.useState<false | 'level' | 'class' | 'subject'>(false);
    const queryClient = useQueryClient();
    const { data: levels, isLoading: l1 } = useQuery<{ items: Level[] }>({ queryKey: ['levels'], queryFn: () => api('/api/levels') });
    const { data: classes, isLoading: l2 } = useQuery<{ items: Class[] }>({ queryKey: ['classes'], queryFn: () => api('/api/classes') });
    const { data: subjects, isLoading: l3 } = useQuery<{ items: Subject[] }>({ queryKey: ['subjects'], queryFn: () => api('/api/subjects') });
    const { data: centers, isLoading: l4 } = useQuery<{ items: Center[] }>({ queryKey: ['centers'], queryFn: () => api('/api/centers') });
    const isLoading = l1 || l2 || l3 || l4;
    const createDeleteMutation = (key: string, endpoint: string) => useMutation({
        mutationFn: (id: string) => api(`/api/${endpoint}/${id}`, { method: 'DELETE' }),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: [key] }); toast.success(`${key.slice(0, -1)} deleted!`); },
        onError: (err) => toast.error(`Failed: ${err.message}`),
    });
    const deleteLevel = createDeleteMutation('levels', 'levels');
    const deleteClass = createDeleteMutation('classes', 'classes');
    const deleteSubject = createDeleteMutation('subjects', 'subjects');
    const getCenterName = (id: string) => centers?.items.find(c => c.id === id)?.name ?? 'N/A';
    const getLevelName = (id: string) => levels?.items.find(l => l.id === id)?.name ?? 'N/A';
    return (
        <AppLayout container>
            <div className="space-y-8">
                <header>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Academic Management</h1>
                    <p className="text-lg text-muted-foreground">Define the structure of your academic offerings.</p>
                </header>
                <Tabs defaultValue="levels">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="levels">Levels</TabsTrigger>
                        <TabsTrigger value="classes">Classes</TabsTrigger>
                        <TabsTrigger value="subjects">Subjects</TabsTrigger>
                    </TabsList>
                    <TabsContent value="levels" className="pt-4"><Card>
                        <CardHeader className="flex-row items-center justify-between"><div className="space-y-1.5"><CardTitle>Levels</CardTitle><CardDescription>Manage academic levels like Primary, Secondary.</CardDescription></div><Button onClick={() => setSheet('level')}><PlusCircle className="mr-2 h-4 w-4" />Add Level</Button></CardHeader>
                        <CardContent><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Center</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
                            {isLoading && [...Array(3)].map((_, i) => <TableRow key={i}><TableCell colSpan={3}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)}
                            {levels?.items.map(l => <TableRow key={l.id}><TableCell>{l.name}</TableCell><TableCell>{getCenterName(l.centerId)}</TableCell><TableCell className="text-right"><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Level?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the level.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteLevel.mutate(l.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></TableCell></TableRow>)}
                        </TableBody></Table></CardContent>
                    </Card></TabsContent>
                    <TabsContent value="classes" className="pt-4"><Card>
                        <CardHeader className="flex-row items-center justify-between"><div className="space-y-1.5"><CardTitle>Classes</CardTitle><CardDescription>Manage individual classes within levels.</CardDescription></div><Button onClick={() => setSheet('class')}><PlusCircle className="mr-2 h-4 w-4" />Add Class</Button></CardHeader>
                        <CardContent><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Level</TableHead><TableHead>Capacity</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
                            {isLoading && [...Array(3)].map((_, i) => <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)}
                            {classes?.items.map(c => <TableRow key={c.id}><TableCell>{c.name}</TableCell><TableCell>{getLevelName(c.levelId)}</TableCell><TableCell>{c.capacity}</TableCell><TableCell className="text-right"><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Class?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the class.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteClass.mutate(c.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></TableCell></TableRow>)}
                        </TableBody></Table></CardContent>
                    </Card></TabsContent>
                    <TabsContent value="subjects" className="pt-4"><Card>
                        <CardHeader className="flex-row items-center justify-between"><div className="space-y-1.5"><CardTitle>Subjects</CardTitle><CardDescription>Manage subjects taught at your centers.</CardDescription></div><Button onClick={() => setSheet('subject')}><PlusCircle className="mr-2 h-4 w-4" />Add Subject</Button></CardHeader>
                        <CardContent><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Center</TableHead><TableHead>Levels</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
                            {isLoading && [...Array(3)].map((_, i) => <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)}
                            {subjects?.items.map(s => <TableRow key={s.id}><TableCell>{s.name}</TableCell><TableCell>{getCenterName(s.centerId)}</TableCell><TableCell>{s.levelIds.map(getLevelName).join(', ')}</TableCell><TableCell className="text-right"><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Subject?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the subject.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteSubject.mutate(s.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></TableCell></TableRow>)}
                        </TableBody></Table></CardContent>
                    </Card></TabsContent>
                </Tabs>
            </div>
            <Sheet open={!!sheet} onOpenChange={(open) => !open && setSheet(false)}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Create New {sheet?.charAt(0).toUpperCase() + sheet!.slice(1)}</SheetTitle>
                        <SheetDescription>Fill in the details below.</SheetDescription>
                    </SheetHeader>
                    <div className="py-8">
                        {sheet === 'level' && <LevelForm onFinished={() => setSheet(false)} />}
                        {sheet === 'class' && <ClassForm onFinished={() => setSheet(false)} />}
                        {sheet === 'subject' && <SubjectForm onFinished={() => setSheet(false)} />}
                    </div>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}