import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { CentersPage } from '@/pages/CentersPage';
import { StudentsPage } from '@/pages/StudentsPage';
import { TeachersPage } from '@/pages/TeachersPage';
import { FinancesPage } from '@/pages/FinancesPage';
import { AcademicPage } from '@/pages/AcademicPage';
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/centers",
    element: <CentersPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/students",
    element: <StudentsPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/teachers",
    element: <TeachersPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/academic",
    element: <AcademicPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/finances",
    element: <FinancesPage />,
    errorElement: <RouteErrorBoundary />,
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)