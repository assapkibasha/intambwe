import { Suspense } from "react";
import EmployeeDashboardLayout from "../layout/EmployeeDashboardLayout";
import MainLayout from "../layout/MainLayout";
import PrivateEmployeeRoute from "../layout/protectors/PrivateEmployeeRoute";
import EmployeeLogin from "../pages/auth/employee/EmployeeLogin";
import DashboardHomePage from "../pages/dashboard/DashboardHome";

// CORRECT IMPORT + PASCALCASE
import DepartmentDashboard from "../pages/dashboard/employee/departmentDashboard";

import EmployeeProfilePage from "../pages/dashboard/employee/EmployeeProfilePage";
import Home from "../pages/Home";
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-600">Loading...</p>
  </div>
);

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> }
    ],
  },

  {
    path: "/employee",
    element: <PrivateEmployeeRoute><Outlet context={{ role: 'employee' }} /></PrivateEmployeeRoute>,
    children: [
      { index: true, element: <Navigate to="/employee/dashboard" replace /> },
      {
        path: "dashboard",
        element: <SuspenseWrapper><EmployeeDashboardLayout role="employee" /></SuspenseWrapper>,
        children: [
          { index: true, element: <DashboardHomePage /> },
          { path: "profile", element: <EmployeeProfilePage /> },
          
          // FIXED: Correct component name + imported above
          { path: "department", element: <DepartmentDashboard /> },
          // or use: "departments" (plural) → better UX
          // { path: "departments", element: <DepartmentDashboard /> },
        ],
      },
    ],
  },

  {
    path: "/auth",
    element: <Outlet />,
    children: [
      { path: "employee/login", element: <EmployeeLogin /> }
    ],
  },

  // Optional: 404 page
  {
    path: "*",
    element: <div className="p-10 text-center text-2xl text-gray-600">404 - Page Not Found</div>
  }
]);

export default router;