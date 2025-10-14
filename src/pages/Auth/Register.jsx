import React from "react";
import Button  from "../../components/Button";
import  Input  from "../../components/Input";

export default function Register() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6">Create Account</h1>
      <div className="w-full max-w-sm space-y-4">
        <Input label="Full Name" placeholder="John Doe" />
        <Input label="Email" type="email" placeholder="Enter your email" />
        <Input label="Password" type="password" placeholder="Create password" />
        <Button className="w-full">Register</Button>
        <p className="text-sm text-gray-500 text-center mt-3">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 font-medium">Login</a>
        </p>
      </div>
    </div>
  );
}
