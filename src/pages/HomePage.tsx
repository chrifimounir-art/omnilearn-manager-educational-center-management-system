import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, GraduationCap, Building } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Center, Student, Teacher, Payment } from "@shared/types";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
const mockChartData = [
  { name: 'Jan', revenue: 4000, expenses: 2400 },
  { name: 'Feb', revenue: 3000, expenses: 1398 },
  { name: 'Mar', revenue: 2000, expenses: 9800 },
  { name: 'Apr', revenue: 2780, expenses: 3908 },
  { name: 'May', revenue: 1890, expenses: 4800 },
  { name: 'Jun', revenue: 2390, expenses: 3800 },
];
function StatCard({ title, value, icon: Icon, isLoading }: { title: string; value: string | number; icon: React.ElementType; isLoading?: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-3xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}
export function HomePage() {
  const { data: students, isLoading: isLoadingStudents } = useQuery<{ items: Student[] }>({
    queryKey: ['students'],
    queryFn: () => api('/api/students'),
  });
  const { data: teachers, isLoading: isLoadingTeachers } = useQuery<{ items: Teacher[] }>({
    queryKey: ['teachers'],
    queryFn: () => api('/api/teachers'),
  });
  const { data: centers, isLoading: isLoadingCenters } = useQuery<{ items: Center[] }>({
    queryKey: ['centers'],
    queryFn: () => api('/api/centers'),
  });
  const { data: payments, isLoading: isLoadingPayments } = useQuery<{ items: Payment[] }>({
    queryKey: ['payments'],
    queryFn: () => api('/api/payments'),
  });
  const totalRevenue = React.useMemo(() => {
    if (!payments) return 0;
    return payments.items.reduce((sum, p) => sum + p.paidAmount, 0);
  }, [payments]);
  const formatCurrency = (amountInCents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amountInCents / 100);
  };
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Global Dashboard</h1>
          <p className="text-lg text-muted-foreground">An executive summary of all your centers.</p>
        </header>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} isLoading={isLoadingPayments} />
          <StatCard title="Active Students" value={students?.items.length ?? 0} icon={Users} isLoading={isLoadingStudents} />
          <StatCard title="Active Teachers" value={teachers?.items.length ?? 0} icon={GraduationCap} isLoading={isLoadingTeachers} />
          <StatCard title="Total Centers" value={centers?.items.length ?? 0} icon={Building} isLoading={isLoadingCenters} />
        </div>
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Financial Overview (Mock Data)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                    formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}