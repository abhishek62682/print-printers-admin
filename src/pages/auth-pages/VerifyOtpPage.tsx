import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { verifyOtp } from "@/config/api/auth.api";
import { useAuthStore } from "@/config/store/auth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { LoaderCircleIcon } from "lucide-react";

function OtpPage(props: React.ComponentProps<typeof Card>) {
  const [otp, setOtp] = useState("");

  const navigate = useNavigate();
 const email = useAuthStore((state) => state.user.email);
const setAuth = useAuthStore((state) => state.setAuth);

const otpMutation = useMutation({
  mutationFn: verifyOtp,

  onSuccess: (data) => {
   
    setAuth(email!, data?.data?.token);

 toast("Login successful 🎉", {
    description: "You have been successfully authenticated.",
  });
    navigate("/dashboard/home");
  },

  onError: (error: any) => {
    toast.error(
      error.response?.data?.message || "Invalid verification code"
    );
  },
});

  function onSubmitHandler(e: React.FormEvent) {
    e.preventDefault();

    if (otp.length === 6) {
      otpMutation.mutate({
        email,
        otp,
      });
    } else {
      toast.error("Please enter 6 digit OTP");
    }
  }

  return (
    <Card
      {...props}
      className="border-0 max-w-md shadow-none mx-auto py-[60px] lg:py-1"
    >
      <CardHeader className="lg:px-6 px-0">
        <CardTitle className="text-2xl font-bold text-center">
          Enter verification code
        </CardTitle>
      </CardHeader>

      <CardContent className="lg:px-6 px-0">
        <form onSubmit={onSubmitHandler}>
          <FieldGroup>
            <Field>
              <FieldLabel
                htmlFor="otp"
                className="text-[16px] font-bold text-[#374151]"
              >
                Verification code
              </FieldLabel>

              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
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

              <FieldDescription className="lg:text-[16px] text-[12px] text-[#535353]">
                Enter the 6-digit code sent to your email.
              </FieldDescription>
            </Field>

            <Button
              type="submit"
              variant="theme"
              className="w-full"
              disabled={otpMutation.isPending}
            >
              { otpMutation.isPending &&
                <div className="animate-spin">

                <LoaderCircleIcon />
              </div>
              }
              {otpMutation?.isPending ? "Verifying" : "Verify & Continue"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

export default OtpPage;