import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuthStore } from "@/config/store/auth";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/config/api/auth.api";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { Eye, EyeOff,  LoaderCircle } from "lucide-react";

interface LoginPayload {
  email:    string;
  password: string;
}

interface ApiErrorResponse {
  message: string;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [payload, setPayload] = useState<LoginPayload>({
    email:    "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);


  const navigate     = useNavigate();
  const setAuthEmail = useAuthStore((store) => store.setEmail);

  const loginMutation = useMutation({
    mutationFn: loginUser,

    onSuccess: () => {
      setAuthEmail(payload.email);
      toast.success("OTP sent successfully", {
        description: "Open your authenticator app and enter the OTP.",
      });
      navigate("/auth/verify-otp");
    },

    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message =
        error.response?.data?.message ?? "Something went wrong. Please try again.";
      toast.error("Login failed", {
        description: message,
      });
    },
  });

  function onSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (payload.email && payload.password) {
      loginMutation.mutate(payload);
    }
  }

  return (
    <form
      onSubmit={onSubmitHandler}
      className={cn("flex flex-col max-w-sm w-full mx-auto gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            onChange={(e) =>
              setPayload((prev) => ({ ...prev, email: e.target.value }))
            }
          />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              to="/auth/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <div className="relative">
  <Input
    id="password"
    type={showPassword ? "text" : "password"}
    placeholder="••••••••"
    required
    className="pr-10"
    onChange={(e) =>
      setPayload((prev) => ({ ...prev, password: e.target.value }))
    }
  />
  <button
    type="button"
    onClick={() => setShowPassword((prev) => !prev)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
  >
    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
</div>
        </Field>

        <Field>
          <Button
            variant="theme"
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full"
          >
            {loginMutation.isPending && (
              <LoaderCircle className="animate-spin mr-2 h-4 w-4" />
            )}
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </Button>
        </Field>

        <FieldDescription className="text-center text-sm">
          This portal is restricted to authorized administrators.
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}