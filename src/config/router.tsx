import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import LoginPage from "@/pages/auth-pages/LoginPage";
import VerifyOTP from "@/pages/auth-pages/VerifyOtpPage";
import BlogsPage from "@/pages/dashboard-pages/blog-page/BlogPage";
import CreateBlog from "@/pages/dashboard-pages/blog-page/CreateBlogPage";
import UpdateBlog from "@/pages/dashboard-pages/blog-page/UpdateBlogPage";
import CreateTestimonial from "@/pages/dashboard-pages/CreateTestimonialPage";
import EnquiriesPage from "@/pages/dashboard-pages/equiry-page/EnquiryListPage";
import HomePage from "@/pages/dashboard-pages/HomePage";
import TestimonialsPage from "@/pages/dashboard-pages/TestimonialPage";
import UpdateTestimonial from "@/pages/dashboard-pages/UpdateTestimonialPage";
import { createBrowserRouter, Navigate } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard/home" />,
  },
  {

    path:"auth",
    element:<AuthLayout />,
    children:[
      {
        path:"login",
        element:<LoginPage />
      },
      {
        path:"verify-otp",
        element:<VerifyOTP />
      }
    ]

  },

  {
    path: "dashboard",
    element: <DashboardLayout />,
    children: [
      {
        path: "home",
        element: <HomePage />,
      },
      {
        path:"testimonials",
        element:<TestimonialsPage />
      },{
        path:"testimonials/create",
        element:<CreateTestimonial />
      },{
        path:"testimonials/:id/edit",
        element:<UpdateTestimonial />
      },{
        path:"blogs",
        element:<BlogsPage />

      },
      {
        path:"blogs/create",
        element:<CreateBlog />
      },{
        path:"blogs/:id/edit",
        element:<UpdateBlog />
      },

      {
        path:"enquiries",
        element:<EnquiriesPage />

      }
    ],
  },
]);

export default router;
