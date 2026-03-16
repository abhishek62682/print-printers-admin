export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const PAGE_TITLES = {
  "/dashboard/home": "Home",
  "/dashboard/profile": "Profile",

  "/dashboard/testimonials": "Testimonials",
  "/dashboard/testimonials/create": "Add Testimonial",
  "/dashboard/testimonials/:id/edit": "Edit Testimonial",

  "/dashboard/blogs": "Blogs",
  "/dashboard/blogs/create": "Add Blog",
  "/dashboard/blogs/:id/edit": "Edit Blog",

  "/dashboard/inquiries": "Inquiries",

  "/dashboard/my-activity": "My Activity",
  "/dashboard/audit-logs": "Audit Logs",
};

export const getPageTitle = (pathname: string) => {
  if (PAGE_TITLES[pathname as keyof typeof PAGE_TITLES]) {
    return PAGE_TITLES[pathname as keyof typeof PAGE_TITLES];
  }

  if (/^\/dashboard\/testimonials\/[^/]+\/edit$/.test(pathname)) {
    return PAGE_TITLES["/dashboard/testimonials/:id/edit"];
  }

  if (/^\/dashboard\/blogs\/[^/]+\/edit$/.test(pathname)) {
    return PAGE_TITLES["/dashboard/blogs/:id/edit"];
  }

  return "Dashboard";
};
