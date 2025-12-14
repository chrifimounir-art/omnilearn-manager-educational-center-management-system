import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Users, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Student } from '@shared/types';
const mockChartData = [
  { name: 'Jan', income: 4000, expenses: 2400 }, { name: 'Feb', income: 3000, expenses: 1398 },
  { name: 'Mar', income: 5000, expenses: 7800 }, { name: 'Apr', income: 4780, expenses: 3908 },
  { name: 'May', income: 5890, expenses: 4800 }, { name: 'Jun', income: 4390, expenses: 3800 },
];
const mockTransactions = [
  { id: 'txn-1', date: '2024-06-15', description: 'Tuition Fee - Alice J.', amount: 300, type: 'income', status: 'completed' },
  { id: 'txn-2', date: '2024-06-14', description: 'Teacher Payout - John D.', amount: -1200, type: 'payroll', status: 'completed' },
  { id: 'txn-3', date: '2024-06-13', description: 'Office Supplies', amount: -150, type: 'expense', status: 'completed' },
  { id: 'txn-4', date: '2024-06-12', description: 'Tuition Fee - Bob S.', amount: 300, type: 'income', status: 'pending' },
  { id: 'txn-5', date: '2024-06-11', description: 'Rent Payment', amount: -2500, type: 'expense', status: 'completed' },
];
function StatCard({ title, value, icon: Icon, isLoading, description }: { title: string; value: string; icon: React.ElementType; isLoading?: boolean; description?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-8 w-32" /> : <div className="text-3xl font-bold">{value}</div>}
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
export function FinancesPage() {
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery<{ items: Student[] }>({
    queryKey: ['students'],
    queryFn: () => api('/api/students'),
  });
  const totalStudents = studentsData?.items.length ?? 0;
  const avgFee = 300; // Mock average fee per student
  const estimatedRevenue = totalStudents * avgFee;
  const totalExpenses = 4500; // Mock total expenses
  const netProfit = estimatedRevenue - totalExpenses;
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Financial Hub</h1>
          <p className="text-lg text-muted-foreground">Track income, expenses, and profitability.</p>
        </header>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Estimated Revenue" value={`$${estimatedRevenue.toLocaleString()}`} icon={DollarSign} isLoading={isLoadingStudents} description="Based on active students" />
          <StatCard title="Total Expenses" value={`$${totalExpenses.toLocaleString()}`} icon={TrendingDown} description="This month" />
          <StatCard title="Net Profit" value={`$${netProfit.toLocaleString()}`} icon={TrendingUp} isLoading={isLoadingStudents} description="This month" />
          <StatCard title="Active Students" value={totalStudents.toString()} icon={Users} isLoading={isLoadingStudents} description="Contributing to revenue" />
        </div>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="reports" disabled>Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6 pt-4">
            <Card>
              <CardHeader><CardTitle>Income vs. Expenses</CardTitle><CardDescription>A summary of financial performance over the last 6 months.</CardDescription></CardHeader>
              <CardContent className="pl-2">
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                      <Legend iconType="circle" />
                      <Area type="monotone" dataKey="income" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" name="Income" />
                      <Area type="monotone" dataKey="expenses" stackId="1" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground) / 0.2)" name="Expenses" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="transactions" className="space-y-6 pt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Recent Transactions</CardTitle><CardDescription>A log of all financial activities.</CardDescription></div>
                <Button variant="outline" size="sm" disabled><Download className="mr-2 h-4 w-4" />Export</Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {mockTransactions.map(tx => (
                        <TableRow key={tx.id}>
                          <TableCell className="hidden sm:table-cell">{tx.date}</TableCell>
                          <TableCell className="font-medium">{tx.description}</TableCell>
                          <TableCell><Badge variant="outline" className="capitalize">{tx.type}</Badge></TableCell>
                          <TableCell><Badge variant={tx.status === 'completed' ? 'default' : 'secondary'} className="capitalize">{tx.status}</Badge></TableCell>
                          <TableCell className={`text-right font-mono ${tx.amount > 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                            {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}