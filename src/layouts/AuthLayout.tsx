import { useAuthStore } from "@/config/store/auth";
import { Navigate, Outlet } from "react-router-dom";

const AuthLayout = () => {
  const { isAuthenticated, email } = useAuthStore((store) => store?.user);

  if (isAuthenticated && email) {
    return <Navigate to="/dashboard/home" />;
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex w-35 items-center gap-2 font-medium">
            <img src="/logo.png" alt="" />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1721830834983-f111ad63dbf4?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default AuthLayout;
