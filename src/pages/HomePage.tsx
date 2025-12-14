import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Users, GraduationCap, Building, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Center, Student, Teacher, Payment, Expense } from "@shared/types";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { StatCard } from "@/components/StatCard";
import { format } from 'date-fns';
const formatCurrency = (amountInCents: number) => {
  if (typeof amountInCents !== 'number') return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(0);
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amountInCents / 100);
};
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
  const { data: expenses, isLoading: isLoadingExpenses } = useQuery<{ items: Expense[] }>({
    queryKey: ['expenses'],
    queryFn: () => api('/api/expenses'),
  });
  const isLoading = isLoadingStudents || isLoadingTeachers || isLoadingCenters || isLoadingPayments || isLoadingExpenses;
  const totalRevenue = React.useMemo(() => {
    if (!payments) return 0;
    return payments.items.reduce((sum, p) => sum + p.paidAmount, 0);
  }, [payments]);
  const totalExpenses = React.useMemo(() => {
    if (!expenses) return 0;
    return expenses.items.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);
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
        const amount = 'paidAmount' in item ? item.paidAmount : item.amount;
        monthlyData[monthKey][type] += amount;
      });
    };
    addData(payments?.items, 'income');
    addData(expenses?.items, 'expenses');
    return Object.values(monthlyData).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [payments, expenses]);
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Global Dashboard</h1>
          <p className="text-lg text-muted-foreground">An executive summary of all your centers.</p>
        </header>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={TrendingUp} isLoading={isLoading} />
          <StatCard title="Net Profit" value={formatCurrency(netProfit)} icon={DollarSign} isLoading={isLoading} />
          <StatCard title="Active Students" value={students?.items.length ?? 0} icon={Users} isLoading={isLoading} />
          <StatCard title="Teachers" value={teachers?.items.length ?? 0} icon={GraduationCap} isLoading={isLoading} />
        </div>
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>Monthly income vs. expenses across all centers.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full">
              {isLoading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend iconType="circle" />
                    <Area type="monotone" dataKey="income" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" name="Income" />
                    <Area type="monotone" dataKey="expenses" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive) / 0.2)" name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}