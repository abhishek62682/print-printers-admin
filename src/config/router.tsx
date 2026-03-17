import { RoleGuard } from "@/components/RoleGuard";
import { ROLE_GROUPS } from "@/config/roles";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import AuditLogsPage from "@/pages/activity-pages/AuditLogsPage";
import MyAuditLogsPage from "@/pages/activity-pages/MyActivityPage";
import ForgotPasswordPage from "@/pages/auth-pages/ForgotPasswordPage";
import LoginPage from "@/pages/auth-pages/LoginPage";
import VerifyResetOtpPage from "@/pages/auth-pages/ResetOtpPage";
import ResetPasswordPage from "@/pages/auth-pages/ResetPasswordPage";
import VerifyOTP from "@/pages/auth-pages/VerifyOtpPage";
import BlogsPage from "@/pages/dashboard-pages/blog-page/BlogPage";
import CreateBlog from "@/pages/dashboard-pages/blog-page/CreateBlogPage";
import UpdateBlog from "@/pages/dashboard-pages/blog-page/UpdateBlogPage";
import CreateTestimonial from "@/pages/dashboard-pages/CreateTestimonialPage";
import EnquiriesPage from "@/pages/dashboard-pages/equiry-page/EnquiryListPage";
import HomePage from "@/pages/dashboard-pages/HomePage";
import ProfilePage from "@/pages/dashboard-pages/profile-page";
import TestimonialsPage from "@/pages/dashboard-pages/TestimonialPage";
import UpdateTestimonial from "@/pages/dashboard-pages/UpdateTestimonialPage";
import UsersPage from "@/pages/user-management-pages";
import { createBrowserRouter, Navigate } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard/home" />,
  },
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      { path: "login",      element: <LoginPage /> },
      { path: "verify-otp", element: <VerifyOTP /> },
      {
        path:"forgot-password" , element:<ForgotPasswordPage />
      },
      {
        path:"reset-password" , element:<ResetPasswordPage />
      },{
        path:"verify-reset-otp" , element:<VerifyResetOtpPage />
      }
    ],
  },
  {
    path: "dashboard",
    element: <DashboardLayout />,
    children: [
      // ✅ Both roles
      {
        path: "home",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.SUPER_ADMIN}>
            <HomePage />
          </RoleGuard>
        ),
      },
      {
        path: "profile",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.ALL}>
            <ProfilePage />
          </RoleGuard>
        ),
      },

      // ✅ Both roles — blogs
      {
        path: "blogs",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.ALL}>
            <BlogsPage />
          </RoleGuard>
        ),
      },
      {
        path: "blogs/create",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.ALL}>
            <CreateBlog />
          </RoleGuard>
        ),
      },
      {
        path: "blogs/:id/edit",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.ALL}>
            <UpdateBlog />
          </RoleGuard>
        ),
      },

      // 🔒 SUPER_ADMIN only
      {
        path: "testimonials",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.SUPER_ADMIN}>
            <TestimonialsPage />
          </RoleGuard>
        ),
      },
      {
        path: "testimonials/create",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.SUPER_ADMIN}>
            <CreateTestimonial />
          </RoleGuard>
        ),
      },
      {
        path: "testimonials/:id/edit",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.SUPER_ADMIN}>
            <UpdateTestimonial />
          </RoleGuard>
        ),
      },
      {
        path: "inquiries",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.SUPER_ADMIN}>
            <EnquiriesPage />
          </RoleGuard>
        ),
      },
      {
        path: "audit-logs",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.SUPER_ADMIN}>
            <AuditLogsPage />
          </RoleGuard>
        ),
      },
      {
        path: "my-activity",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.ALL}>
            <MyAuditLogsPage />
          </RoleGuard>
        ),
      },
      {
        path: "users",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.SUPER_ADMIN}>
            <UsersPage />
          </RoleGuard>
        ),
      },
    ],
  },
]);

export default router;