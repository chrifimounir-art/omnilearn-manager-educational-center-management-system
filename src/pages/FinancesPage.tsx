import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Users, TrendingUp, TrendingDown, Download, PlusCircle, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Student, Payment, Expense, Center, FinancialConfig, Teacher } from '@shared/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { StatCard } from '@/components/StatCard';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
const formatCurrency = (amountInCents: number) => {
    if (typeof amountInCents !== 'number') return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(0);
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amountInCents / 100);
};
const paymentSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  centerId: z.string().min(1, "Center is required"),
  baseAmount: z.number().min(1, "Amount must be at least 1 MAD").default(300),
  discountPercent: z.number().min(0).max(100).default(0),
});
type PaymentFormData = z.infer<typeof paymentSchema>;
function AddPaymentForm({ onFinished }: { onFinished: () => void }) {
  const queryClient = useQueryClient();
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery<{ items: Student[] }>({ queryKey: ['students'], queryFn: () => api('/api/students') });
  const { data: centersData, isLoading: isLoadingCenters } = useQuery<{ items: Center[] }>({ queryKey: ['centers'], queryFn: () => api('/api/centers') });
  const form = useForm<PaymentFormData>({ resolver: zodResolver(paymentSchema), defaultValues: { studentId: '', centerId: '', baseAmount: 300, discountPercent: 0 } });
  const mutation = useMutation({
    mutationFn: (newPayment: Omit<Payment, 'id' | 'paidDate' | 'createdAt'>) => api<Payment>('/api/payments', { method: 'POST', body: JSON.stringify(newPayment) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success("Payment recorded successfully!");
      onFinished();
    },
    onError: (err) => toast.error(`Failed to record payment: ${err.message}`),
  });
  const onSubmit = (values: PaymentFormData) => {
    const baseAmount = values.baseAmount * 100; // Convert to cents
    const discountPercent = values.discountPercent || 0;
    const discountAmount = (baseAmount * discountPercent) / 100;
    const paidAmount = baseAmount - discountAmount;
    mutation.mutate({ ...values, baseAmount, discountAmount, paidAmount });
  };
  if (isLoadingStudents || isLoadingCenters) return <div>Loading...</div>;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="studentId" render={({ field }) => (
          <FormItem><FormLabel>Student</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a student" /></SelectTrigger></FormControl><SelectContent>{studentsData?.items.map(s => <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="centerId" render={({ field }) => (
          <FormItem><FormLabel>Center</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a center" /></SelectTrigger></FormControl><SelectContent>{centersData?.items.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="baseAmount" render={({ field }) => (
          <FormItem><FormLabel>Amount (MAD)</FormLabel><FormControl><Input type="number" placeholder="300" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="discountPercent" render={({ field }) => (
          <FormItem><FormLabel>Discount (%)</FormLabel><FormControl><Input type="number" placeholder="10" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" disabled={mutation.isPending} className="w-full">{mutation.isPending ? "Saving..." : "Record Payment"}</Button>
      </form>
    </Form>
  );
}
const expenseSchema = z.object({
  centerId: z.string().min(1, "Center is required"),
  description: z.string().min(3, "Description is required"),
  amount: z.number().min(1, "Amount must be at least 1 MAD").default(100),
});
type ExpenseFormData = z.infer<typeof expenseSchema>;
function AddExpenseForm({ onFinished }: { onFinished: () => void }) {
  const queryClient = useQueryClient();
  const { data: centersData, isLoading: isLoadingCenters } = useQuery<{ items: Center[] }>({ queryKey: ['centers'], queryFn: () => api('/api/centers') });
  const form = useForm<ExpenseFormData>({ resolver: zodResolver(expenseSchema), defaultValues: { centerId: '', description: '', amount: 100 } });
  const mutation = useMutation({
    mutationFn: (newExpense: Omit<Expense, 'id' | 'date' | 'createdAt'>) => api<Expense>('/api/expenses', { method: 'POST', body: JSON.stringify(newExpense) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success("Expense recorded successfully!");
      onFinished();
    },
    onError: (err) => toast.error(`Failed to record expense: ${err.message}`),
  });
  const onSubmit = (values: ExpenseFormData) => {
    mutation.mutate({ ...values, amount: values.amount * 100 }); // Convert to cents
  };
  if (isLoadingCenters) return <div>Loading...</div>;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="centerId" render={({ field }) => (
          <FormItem><FormLabel>Center</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a center" /></SelectTrigger></FormControl><SelectContent>{centersData?.items.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="e.g., Office Supplies" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="amount" render={({ field }) => (
          <FormItem><FormLabel>Amount (MAD)</FormLabel><FormControl><Input type="number" placeholder="150" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" disabled={mutation.isPending} className="w-full">{mutation.isPending ? "Saving..." : "Record Expense"}</Button>
      </form>
    </Form>
  );
}
const configSchema = z.object({
  centerId: z.string().min(1, "Center is required"),
  basePricePerStudent: z.number().positive("Base price must be positive").default(300),
  profPercent: z.number().min(0).max(100).default(50),
  centerPercent: z.number().min(0).max(100).default(50),
}).refine(data => data.profPercent + data.centerPercent === 100, {
  message: "Professor and Center percentages must add up to 100",
  path: ["centerPercent"],
});
type ConfigFormData = z.infer<typeof configSchema>;
function ConfigForm({ onFinished, existingConfig }: { onFinished: () => void, existingConfig?: FinancialConfig }) {
  const queryClient = useQueryClient();
  const { data: centersData, isLoading: isLoadingCenters } = useQuery<{ items: Center[] }>({ queryKey: ['centers'], queryFn: () => api('/api/centers') });
  const form = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: existingConfig ? { ...existingConfig, basePricePerStudent: existingConfig.basePricePerStudent / 100 } : { centerId: '', basePricePerStudent: 300, profPercent: 50, centerPercent: 50 }
  });
  const mutation = useMutation({
    mutationFn: (config: Omit<FinancialConfig, 'id' | 'createdAt'>) => api<FinancialConfig>('/api/financial-configs', { method: 'POST', body: JSON.stringify(config) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-configs'] });
      toast.success("Configuration saved successfully!");
      onFinished();
    },
    onError: (err) => toast.error(`Failed to save config: ${err.message}`),
  });
  const onSubmit = (values: ConfigFormData) => {
    mutation.mutate({ ...values, basePricePerStudent: values.basePricePerStudent * 100 }); // Convert to cents
  };
  if (isLoadingCenters) return <div>Loading...</div>;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="centerId" render={({ field }) => (
          <FormItem><FormLabel>Center</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!existingConfig}><FormControl><SelectTrigger><SelectValue placeholder="Select a center" /></SelectTrigger></FormControl><SelectContent>{centersData?.items.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="basePricePerStudent" render={({ field }) => (
          <FormItem><FormLabel>Base Price per Student (MAD)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="profPercent" render={({ field }) => (
          <FormItem><FormLabel>Professor's Share (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="centerPercent" render={({ field }) => (
          <FormItem><FormLabel>Center's Share (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" disabled={mutation.isPending} className="w-full">{mutation.isPending ? "Saving..." : "Save Configuration"}</Button>
      </form>
    </Form>
  );
}
export function FinancesPage() {
  const [isSheetOpen, setSheetOpen] = React.useState<false | 'payment' | 'expense' | 'config'>(false);
  const queryClient = useQueryClient();
  const { data: paymentsData, isLoading: l1 } = useQuery<{ items: Payment[] }>({ queryKey: ['payments'], queryFn: () => api('/api/payments') });
  const { data: expensesData, isLoading: l2 } = useQuery<{ items: Expense[] }>({ queryKey: ['expenses'], queryFn: () => api('/api/expenses') });
  const { data: studentsData, isLoading: l3 } = useQuery<{ items: Student[] }>({ queryKey: ['students'], queryFn: () => api('/api/students') });
  const { data: centersData, isLoading: l4 } = useQuery<{ items: Center[] }>({ queryKey: ['centers'], queryFn: () => api('/api/centers') });
  const { data: teachersData, isLoading: l5 } = useQuery<{ items: Teacher[] }>({ queryKey: ['teachers'], queryFn: () => api('/api/teachers') });
  const { data: configsData, isLoading: l6 } = useQuery<{ items: FinancialConfig[] }>({ queryKey: ['financial-configs'], queryFn: () => api('/api/financial-configs') });
  const isLoading = l1 || l2 || l3 || l4 || l5 || l6;
  const deletePaymentMutation = useMutation({
    mutationFn: (id: string) => api(`/api/payments/${id}`, { method: 'DELETE' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['payments'] }); toast.success('Payment deleted!'); },
    onError: (err) => toast.error(`Failed to delete: ${err.message}`),
  });
  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => api(`/api/expenses/${id}`, { method: 'DELETE' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }); toast.success('Expense deleted!'); },
    onError: (err) => toast.error(`Failed to delete: ${err.message}`),
  });
  const totalRevenue = React.useMemo(() => paymentsData?.items.reduce((sum, p) => sum + p.paidAmount, 0) ?? 0, [paymentsData]);
  const totalExpenses = React.useMemo(() => expensesData?.items.reduce((sum, e) => sum + e.amount, 0) ?? 0, [expensesData]);
  const netProfit = totalRevenue - totalExpenses;
  const chartData = React.useMemo(() => {
    const monthlyData: Record<string, { name: string; income: number; expenses: number }> = {};
    const addData = (items: (Payment | Expense)[] | undefined, type: 'income' | 'expenses') => {
      items?.forEach(item => {
        const date = new Date('date' in item ? item.date : item.paidDate);
        const monthKey = format(date, 'MMM yyyy');
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { name: monthKey, income: 0, expenses: 0 };
        }
        const amount = ('paidAmount' in item ? item.paidAmount : item.amount);
        monthlyData[monthKey][type] += amount;
      });
    };
    addData(paymentsData?.items, 'income');
    addData(expensesData?.items, 'expenses');
    return Object.values(monthlyData).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [paymentsData, expensesData]);
  const allTransactions = React.useMemo(() => {
    const payments = paymentsData?.items.map(p => ({ ...p, type: 'income' as const, date: p.paidDate, amount: p.paidAmount, description: `Tuition - ${studentsData?.items.find(s => s.id === p.studentId)?.firstName ?? 'N/A'}` })) ?? [];
    const expenses = expensesData?.items.map(e => ({ ...e, type: 'expense' as const })) ?? [];
    return [...payments, ...expenses].sort((a, b) => b.date - a.date);
  }, [paymentsData, expensesData, studentsData]);
  const centerStats = React.useMemo(() => {
    if (!centersData || !paymentsData || !configsData || !teachersData) return [];
    return centersData.items.map(center => {
      const centerPayments = paymentsData.items.filter(p => p.centerId === center.id);
      const sumPaid = centerPayments.reduce((s, p) => s + p.paidAmount, 0);
      const config = configsData.items.find(cf => cf.centerId === center.id);
      const profGain = config ? (sumPaid * config.profPercent / 100) : 0;
      const centerGain = sumPaid - profGain;
      const teacherCount = teachersData.items.filter(t => t.centerIds.includes(center.id)).length || 1;
      const teacherShare = profGain / teacherCount;
      return { center, sumPaid, profGain, centerGain, teacherShare };
    });
  }, [centersData, paymentsData, configsData, teachersData]);
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Financial Report", 14, 16);
    (doc as any).autoTable({
      startY: 22,
      head: [['Date', 'Description', 'Type', 'Amount']],
      body: allTransactions.map(tx => [format(new Date(tx.date), 'PPP'), tx.description, tx.type, formatCurrency(tx.type === 'income' ? tx.amount : -tx.amount)]),
    });
    doc.save('financial-report.pdf');
    toast.success("PDF report downloaded!");
  };
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(allTransactions.map(tx => ({ Date: format(new Date(tx.date), 'PPP'), Description: tx.description, Type: tx.type, Amount: (tx.type === 'income' ? tx.amount : -tx.amount) / 100 })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, "financial-report.xlsx");
    toast.success("Excel report downloaded!");
  };
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Financial Hub</h1>
          <p className="text-lg text-muted-foreground">Track income, expenses, and profitability.</p>
        </header>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={TrendingUp} isLoading={isLoading} />
          <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} icon={TrendingDown} isLoading={isLoading} />
          <StatCard title="Net Profit" value={formatCurrency(netProfit)} icon={DollarSign} isLoading={isLoading} />
          <StatCard title="Active Students" value={studentsData?.items.length.toString() ?? '0'} icon={Users} isLoading={isLoading} />
        </div>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="configs">Configs</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6 pt-4">
            <Card>
              <CardHeader><CardTitle>Income vs. Expenses</CardTitle><CardDescription>Summary of financial performance.</CardDescription></CardHeader>
              <CardContent className="pl-2"><div className="h-[350px] w-full">{isLoading ? <Skeleton className="h-full w-full" /> : (<ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value)} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} formatter={(value: number) => formatCurrency(value)} /><Legend iconType="circle" /><Area type="monotone" dataKey="income" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" name="Income" /><Area type="monotone" dataKey="expenses" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive) / 0.2)" name="Expenses" /></AreaChart></ResponsiveContainer>)}</div></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="transactions" className="space-y-6 pt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Recent Transactions</CardTitle><CardDescription>A log of all financial activities.</CardDescription></div><div className="flex gap-2"><Button variant="outline" onClick={() => setSheetOpen('expense')}><PlusCircle className="mr-2 h-4 w-4" />Add Expense</Button><Button onClick={() => setSheetOpen('payment')}><PlusCircle className="mr-2 h-4 w-4" />Add Payment</Button></div></CardHeader>
              <CardContent><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{isLoading && [...Array(5)].map((_, i) => <TableRow key={i}><TableCell><Skeleton className="h-5 w-24" /></TableCell><TableCell><Skeleton className="h-5 w-40" /></TableCell><TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell><TableCell className="text-right"><Skeleton className="h-5 w-16" /></TableCell><TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell></TableRow>)}{allTransactions.map(tx => (<TableRow key={tx.id}><TableCell className="hidden sm:table-cell">{format(new Date(tx.date), 'PPP')}</TableCell><TableCell className="font-medium">{tx.description}</TableCell><TableCell><Badge variant={tx.type === 'income' ? 'default' : 'destructive'} className="capitalize">{tx.type}</Badge></TableCell><TableCell className={`text-right font-mono ${tx.type === 'income' ? 'text-emerald-600' : 'text-destructive'}`}>{formatCurrency(tx.type === 'income' ? tx.amount : -tx.amount)}</TableCell><TableCell className="text-right"><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this transaction.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => tx.type === 'income' ? deletePaymentMutation.mutate(tx.id) : deleteExpenseMutation.mutate(tx.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></TableCell></TableRow>))}</TableBody></Table></div></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payroll" className="space-y-6 pt-4">
            <Card>
              <CardHeader><CardTitle>Payroll Overview</CardTitle><CardDescription>Estimated teacher payouts based on center revenue and financial configs.</CardDescription></CardHeader>
              <CardContent><Table><TableHeader><TableRow><TableHead>Center</TableHead><TableHead>Total Revenue</TableHead><TableHead>Professor Share</TableHead><TableHead>Center Share</TableHead><TableHead>Est. Per Teacher</TableHead></TableRow></TableHeader><TableBody>{isLoading ? <TableRow><TableCell colSpan={5}><Skeleton className="h-20 w-full" /></TableCell></TableRow> : centerStats.map(stat => (<TableRow key={stat.center.id}><TableCell>{stat.center.name}</TableCell><TableCell>{formatCurrency(stat.sumPaid)}</TableCell><TableCell>{formatCurrency(stat.profGain)}</TableCell><TableCell>{formatCurrency(stat.centerGain)}</TableCell><TableCell>{formatCurrency(stat.teacherShare)}</TableCell></TableRow>))}</TableBody></Table></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="configs" className="space-y-6 pt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Financial Configurations</CardTitle><CardDescription>Manage revenue sharing rules for each center.</CardDescription></div><Button onClick={() => setSheetOpen('config')}><PlusCircle className="mr-2 h-4 w-4" />Add Config</Button></CardHeader>
              <CardContent><Table><TableHeader><TableRow><TableHead>Center</TableHead><TableHead>Base Price</TableHead><TableHead>Professor %</TableHead><TableHead>Center %</TableHead></TableRow></TableHeader><TableBody>{isLoading ? <TableRow><TableCell colSpan={4}><Skeleton className="h-20 w-full" /></TableCell></TableRow> : configsData?.items.map(c => (<TableRow key={c.id}><TableCell>{centersData?.items.find(center => center.id === c.centerId)?.name}</TableCell><TableCell>{formatCurrency(c.basePricePerStudent)}</TableCell><TableCell>{c.profPercent}%</TableCell><TableCell>{c.centerPercent}%</TableCell></TableRow>))}</TableBody></Table></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports" className="space-y-6 pt-4">
            <Card>
              <CardHeader><CardTitle>Export Reports</CardTitle><CardDescription>Download your financial data in various formats.</CardDescription></CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4"><Button onClick={handleExportPDF}><Download className="mr-2 h-4 w-4" />Export as PDF</Button><Button onClick={handleExportExcel}><Download className="mr-2 h-4 w-4" />Export as Excel</Button></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Sheet open={isSheetOpen === 'payment'} onOpenChange={(open) => !open && setSheetOpen(false)}><SheetContent><SheetHeader><SheetTitle>Record a Payment</SheetTitle><SheetDescription>Enter details for a new student payment.</SheetDescription></SheetHeader><div className="py-8"><AddPaymentForm onFinished={() => setSheetOpen(false)} /></div></SheetContent></Sheet>
      <Sheet open={isSheetOpen === 'expense'} onOpenChange={(open) => !open && setSheetOpen(false)}><SheetContent><SheetHeader><SheetTitle>Record an Expense</SheetTitle><SheetDescription>Enter details for a new expense.</SheetDescription></SheetHeader><div className="py-8"><AddExpenseForm onFinished={() => setSheetOpen(false)} /></div></SheetContent></Sheet>
      <Sheet open={isSheetOpen === 'config'} onOpenChange={(open) => !open && setSheetOpen(false)}><SheetContent><SheetHeader><SheetTitle>Set Financial Config</SheetTitle><SheetDescription>Define revenue sharing for a center.</SheetDescription></SheetHeader><div className="py-8"><ConfigForm onFinished={() => setSheetOpen(false)} /></div></SheetContent></Sheet>
    </AppLayout>
  );
}