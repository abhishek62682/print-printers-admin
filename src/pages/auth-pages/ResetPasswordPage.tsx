import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useNavigate, useLocation } from "react-router-dom"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import { LoaderCircle, Eye, EyeOff } from "lucide-react"

import { resetPassword } from "@/config/api/auth.api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

interface ApiErrorResponse {
  message: string
}

function ResetPasswordPage(props: React.ComponentProps<typeof Card>) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const email = location.state?.email as string | undefined

  const resetMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success("Password reset successful", {
        description: "You can now login with your new password.",
      })
      navigate("/auth/login")
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Reset failed", {
        description: error.response?.data?.message ?? "Something went wrong. Please try again.",
      })
    },
  })

  function onSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!email) {
      toast.error("Session expired", { description: "Please start the reset process again." })
      navigate("/auth/forgot-password")
      return
    }

    if (newPassword.length < 8) {
      toast.error("Password too short", { description: "Password must be at least 8 characters." })
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match", { description: "Please make sure both passwords match." })
      return
    }

    resetMutation.mutate({ email, newPassword })
  }

  return (
    <Card {...props} className="border-0 max-w-md shadow-none mx-auto py-[60px] lg:py-1">
      <CardHeader className="lg:px-6 px-0">
        <CardTitle className="text-2xl font-bold text-center">Set new password</CardTitle>
      </CardHeader>

      <CardContent className="lg:px-6 px-0">
        <form onSubmit={onSubmitHandler}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="newPassword" className="text-sm font-semibold text-[#374151]">
                New Password
              </FieldLabel>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={resetMutation.isPending}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]"
                  onClick={() => setShowNew((prev) => !prev)}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldDescription className="text-xs text-[#535353]">
                Must be at least 8 characters.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword" className="text-sm font-semibold text-[#374151]">
                Confirm Password
              </FieldLabel>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={resetMutation.isPending}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]"
                  onClick={() => setShowConfirm((prev) => !prev)}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Button
              type="submit"
              variant="theme"
              className="w-full"
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending && <LoaderCircle className="animate-spin mr-2 h-4 w-4" />}
              {resetMutation.isPending ? "Resetting..." : "Reset Password"}
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

export default ResetPasswordPage