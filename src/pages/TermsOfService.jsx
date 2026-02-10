import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="text-blue-600" size={32} />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Terms of Service
            </h1>
          </div>
          <p className="text-gray-600">Last updated: February 10, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-blue max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to GrowthApp. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully. If you do not agree to these terms, you may not use our services.
            </p>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Account Registration
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              To use certain features of GrowthApp, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          {/* Investment Disclaimer */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Investment Disclaimer
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Land investments carry inherent risks. GrowthApp does not guarantee any returns on investment. All investment decisions are made at your own risk. We recommend consulting with a financial advisor before making any investment decisions. Past performance is not indicative of future results.
            </p>
          </section>

          {/* User Conduct */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. User Conduct
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Use the platform for any illegal or unauthorized purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit any malicious code or viruses</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the platform's functionality</li>
            </ul>
          </section>

          {/* Payments and Refunds */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Payments and Refunds
            </h2>
            <p className="text-gray-700 leading-relaxed">
              All payments are processed securely through our payment partners. Refund policies vary by transaction type and are subject to verification. Investment purchases are generally non-refundable except in cases of fraud or platform error. Please review specific refund terms before making any purchase.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Intellectual Property
            </h2>
            <p className="text-gray-700 leading-relaxed">
              All content on GrowthApp, including text, graphics, logos, images, and software, is the property of GrowthApp or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              GrowthApp is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the platform. Our total liability shall not exceed the amount you paid to us in the twelve months preceding the claim.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Termination
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violation of these Terms of Service. You may also terminate your account at any time by contacting our support team. Upon termination, your right to use the platform will immediately cease.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Changes to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may modify these Terms of Service at any time. We will notify you of significant changes via email or through the platform. Your continued use of GrowthApp after such modifications constitutes your acceptance of the updated terms.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-3 p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> legal@growthapp.com<br />
                <strong>Address:</strong> 123 Investment Street, Lagos, Nigeria
              </p>
            </div>
          </section>
        </div>

        {/* Back to Home Button */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}