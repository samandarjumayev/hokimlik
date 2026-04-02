import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import App from "../App";
import ProtectedRoute from "./ProtectedRoute";
import DashboardPage from "../pages/dashboard/DashboardPage";
import Home from "../pages/Home";
import ApplicationsPage from "../pages/applications/ApplicationsPage";
import ReportsPage from "../pages/reports/ReportsPage";
import MahallasPages from "../pages/mahallas/MahallasPage";
import UsersPage from "../pages/users/UsersPage";
import Settings from "../pages/Settings";
import UserDetails from "../pages/users/UserDetails";
import ApplicationDetailPage from "../pages/applications/ApplicationDetailPage";
import Services from "../pages/services/Services";


export const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />
    },
    {
        // Auth bo'lishi kerak
        path: '/dashboard',
        element: (
            <ProtectedRoute allowRoles={['super_admin', 'hokim', 'service_staff']}>
                <App />
            </ProtectedRoute>
        ),
        children: [
            { 
                index: true, 
                element: (
                    <ProtectedRoute allowRoles={['super_admin', 'hokim']}>
                        <DashboardPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'applications',
                element: (
                    <ProtectedRoute allowRoles={['super_admin', 'hokim', 'service_staff']}>
                        <ApplicationsPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'applications/:id',
                element: (
                    <ProtectedRoute allowRoles={['super_admin', 'hokim', 'service_staff']}>
                        <ApplicationDetailPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'mahalla-reports',
                element: (
                    <ProtectedRoute allowRoles={['super_admin', 'hokim']}>
                        <ReportsPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'mahallas',
                element: (
                    <ProtectedRoute allowRoles={['super_admin']}>
                        <MahallasPages />
                    </ProtectedRoute>
                )
            },
            {
                path: 'users',
                element: (
                    <ProtectedRoute allowRoles={['super_admin']}>
                        <UsersPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'users/:id',
                element: (
                    <ProtectedRoute allowRoles={['super_admin', 'hokim']}>
                        <UserDetails />
                    </ProtectedRoute>
                )
            },
            {
                path: 'services',
                element: (
                    <ProtectedRoute allowRoles={['super_admin']}>
                        <Services />
                    </ProtectedRoute>
                )
            },
            {
                path: 'settings',
                element: (
                    <ProtectedRoute allowRoles={['super_admin']}>
                        <Settings />
                    </ProtectedRoute>
                )
            }
        ]
    },
    { path: '/login', element: <Login /> }
])