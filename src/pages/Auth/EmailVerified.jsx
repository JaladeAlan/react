import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function EmailVerified() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md text-center w-full max-w-md">
        <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Email Verified!</h2>
        <p className="text-gray-600 mb-6">
          Your email address has been successfully verified.
        </p>
        <Link
          to="/login"
          className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
