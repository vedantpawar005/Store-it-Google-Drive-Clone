"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { sendEmailOTP, verifySecret } from "@/lib/actions/user.action";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type OTPModalProps = {
  initialAccountId: string;
  email: string;
};

const OTPModal = ({ initialAccountId, email }: OTPModalProps) => {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(true);
  const [otp, setOtp] = useState("");
  const [accountId, setAccountId] = useState(initialAccountId); // 🔥 FIX
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setErrorMessage("Please enter the 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await verifySecret({
        accountId,
        secret: otp,
      });

      router.push("/");
    } catch (error) {
      setErrorMessage("Invalid or expired OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const newAccountId = await sendEmailOTP({ email });

      if (newAccountId) {
        setAccountId(newAccountId); // 🔥 MOST IMPORTANT LINE
        setOtp("");
      }
    } catch (error) {
      console.error("Failed to resend OTP", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="shad-alert-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="h2 text-center">
            Verify OTP
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-light-100">
            We&apos;ve sent a code to{" "}
            <span className="text-brand">{email}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup className="shad-otp">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot key={i} index={i} className="shad-otp-slot" />
            ))}
          </InputOTPGroup>
        </InputOTP>

        {errorMessage && (
          <p className="mt-2 text-center text-sm text-red-500">
            {errorMessage}
          </p>
        )}

        <AlertDialogFooter>
          <div className="flex w-full flex-col gap-4">
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={isLoading}
              className="shad-submit-btn h-12"
            >
              Submit
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="ml-2 animate-spin"
                />
              )}
            </AlertDialogAction>

            <div className="text-center text-light-100">
              Didn&apos;t get a code?
              <Button
                type="button"
                variant="link"
                className="pl-1 text-brand"
                onClick={handleResendOtp}
              >
                Resend
              </Button>
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OTPModal;
