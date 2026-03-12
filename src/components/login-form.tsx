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
import { useNavigate } from "react-router-dom";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [payload, setPayload] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const setAuthEmail = useAuthStore((store) => store.setEmail);

  const loginMutation = useMutation({
    mutationFn: loginUser,

    onSuccess: (data) => {
      console.log("Login success:", data.message);

      navigate("/auth/verify-otp");

      
      toast("Event has been created", {
        description: "Sunday, December 03, 2023 at 9:00 AM",
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    },

    onError: (error: any) => {
      console.error("Login failed:", error.response?.data?.message);

       toast(error.response?.data?.message || "Something went wrong", {
        description: "Sunday, December 03, 2023 at 9:00 AM",
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });

      
      
    },
  });

  function onSubmitHandler(e) {
    e.preventDefault();
    if (payload.email && payload.password) {
      loginMutation.mutate(payload);
      setAuthEmail(payload.email)
    }
  }

  return (
    <form onSubmit={onSubmitHandler}
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
            onChange={(e) =>
              setPayload((prev) => ({ ...prev, email: e.target.value }))
            }
            id="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            onChange={(e) =>
              setPayload((prev) => ({ ...prev, password: e.target.value }))
            }
            id="password"
            type="password"
            placeholder="password"
            required
          />
        </Field>
        <Field>
          <Button variant="theme" type="submit">Login</Button>
        </Field>

        <FieldDescription className="text-center text-sm ">
          This portal is restricted to authorized administrators.
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
