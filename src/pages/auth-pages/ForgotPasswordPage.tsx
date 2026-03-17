import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import { LoaderCircle } from "lucide-react"

import { forgotPassword } from "@/config/api/auth.api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

interface ApiErrorResponse {
  message: string
}

function ForgotPasswordPage(props: React.ComponentProps<typeof Card>) {
  const [email, setEmail] = useState("")
  const navigate = useNavigate()

  const forgotMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      toast.success("OTP sent", {
        description: "Check your authenticator app for the 6-digit code.",
      })
      navigate("/auth/verify-reset-otp", { state: { email } })
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to send OTP", {
        description: error.response?.data?.message ?? "Something went wrong. Please try again.",
      })
    },
  })

  function onSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (email.trim()) {
      forgotMutation.mutate({ email })
    } else {
      toast.error("Invalid input", { description: "Please enter your email address." })
    }
  }

  return (
    <Card {...props} className="border-0 max-w-md shadow-none mx-auto py-[60px] lg:py-1">
      <CardHeader className="lg:px-6 px-0">
        <CardTitle className="text-2xl font-bold text-center">Reset your password</CardTitle>
      </CardHeader>

      <CardContent className="lg:px-6 px-0">
        <form onSubmit={onSubmitHandler}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email" className="text-sm font-semibold text-[#374151]">
                Email Address
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={forgotMutation.isPending}
                required
              />
              <FieldDescription className="text-xs text-[#535353]">
                Enter the email address associated with your account.
              </FieldDescription>
            </Field>

            <Button
              type="submit"
              variant="theme"
              className="w-full"
              disabled={forgotMutation.isPending}
            >
              {forgotMutation.isPending && <LoaderCircle className="animate-spin mr-2 h-4 w-4" />}
              {forgotMutation.isPending ? "Sending OTP..." : "Send OTP"}
            </Button>

            <div className="text-center text-sm mt-4">
              <span className="text-[#535353]">Remember your password? </span>
              <button
                type="button"
                className="text-blue-600 hover:underline font-semibold"
                onClick={() => navigate("/auth/login")}
              >
                Login here
              </button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

export default ForgotPasswordPage