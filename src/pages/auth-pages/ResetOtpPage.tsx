import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useNavigate, useLocation } from "react-router-dom"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import { LoaderCircle } from "lucide-react"

import { verifyResetOtp } from "@/config/api/auth.api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

interface ApiErrorResponse {
  message: string
}

function VerifyResetOtpPage(props: React.ComponentProps<typeof Card>) {
  const [otp, setOtp] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  const email = location.state?.email as string | undefined

  const verifyResetOtpMutation = useMutation({
    mutationFn: verifyResetOtp,
    onSuccess: () => {
      toast.success("OTP verified", {
        description: "You can now set a new password.",
      })
      navigate("/auth/reset-password", { state: { email } })
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Verification failed", {
        description: error.response?.data?.message ?? "Invalid or expired OTP.",
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
    if (otp.length === 6) {
      verifyResetOtpMutation.mutate({ email, otp })
    } else {
      toast.error("Invalid code", { description: "Please enter the complete 6-digit code." })
    }
  }

  return (
    <Card {...props} className="border-0 max-w-md shadow-none mx-auto py-[60px] lg:py-1">
      <CardHeader className="lg:px-6 px-0">
        <CardTitle className="text-2xl font-bold text-center">Enter verification code</CardTitle>
      </CardHeader>

      <CardContent className="lg:px-6 px-0">
        <form onSubmit={onSubmitHandler}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="otp" className="text-sm font-semibold text-[#374151]">
                Verification code
              </FieldLabel>

              <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                <InputOTPGroup className="gap-2.5 w-full">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="bg-[#E5E7EB] flex-1 p-6 rounded-md border"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              <FieldDescription className="text-xs text-[#535353]">
                Enter the 6-digit code from your authenticator app.
              </FieldDescription>
            </Field>

            <Button
              type="submit"
              variant="theme"
              className="w-full"
              disabled={verifyResetOtpMutation.isPending}
            >
              {verifyResetOtpMutation.isPending && (
                <LoaderCircle className="animate-spin mr-2 h-4 w-4" />
              )}
              {verifyResetOtpMutation.isPending ? "Verifying..." : "Verify & Continue"}
            </Button>

            <div className="text-center text-sm mt-4">
              <span className="text-[#535353]">Didn't receive a code? </span>
              <button
                type="button"
                className="text-blue-600 hover:underline font-semibold"
                onClick={() => navigate("/auth/forgot-password")}
              >
                Try again
              </button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

export default VerifyResetOtpPage