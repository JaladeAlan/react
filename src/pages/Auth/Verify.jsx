import React from "react";
import Button from "../../components/Button";

export default function Verify() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <h1 className="text-xl font-semibold mb-4">Verify Your Email</h1>
      <p className="text-gray-600 text-center mb-6">
        We’ve sent a verification link to your email. Please check your inbox.
      </p>
      <Button>Resend Email</Button>
    </div>
  );
}
