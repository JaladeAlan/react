import React from "react";
import Button  from "../../components/Button";
import Input  from "../../components/Input";

export default function ForgotPassword() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
      <div className="w-full max-w-sm space-y-4">
        <Input label="Email" type="email" placeholder="Enter your email" />
        <Button className="w-full">Send Reset Link</Button>
      </div>
    </div>
  );
}
