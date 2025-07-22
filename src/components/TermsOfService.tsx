'use client';

import { useState } from 'react';
import { X, Eye, FileText } from 'lucide-react';

interface TermsOfServiceProps {
  onClose?: () => void;
  showAsModal?: boolean;
  className?: string;
}

export default function TermsOfService({ onClose, showAsModal = false, className = '' }: TermsOfServiceProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const content = (
    <div className={`bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Terms of Service for MyMacros</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Toggle between summary and full terms */}
      <div className="mb-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          {isExpanded ? 'Show Summary' : 'Read Full Terms'}
        </button>
      </div>

      {/* Content */}
      <div className="prose prose-sm max-w-none">
        {!isExpanded ? (
          // Summary version
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Terms of Service Summary</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• You must be at least 18 years old to use MyMacros</li>
              <li>• The app is for personal, non-commercial use only</li>
              <li>• Nutritional information is not medical advice - consult professionals for medical needs</li>
              <li>• You're responsible for using the app legally and respectfully</li>
              <li>• We can terminate accounts that violate these terms</li>
              <li>• These terms are governed by Swedish law</li>
              <li>• You have consumer rights that cannot be limited by these terms</li>
            </ul>
            <p className="text-sm text-gray-600 mt-3 italic">
              Click "Read Full Terms" above for complete details.
            </p>
          </div>
        ) : (
          // Full terms
          <div className="space-y-6">
            <section>
              <p className="text-gray-700 mb-4">
                <strong>Effective from:</strong> [Date]
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. General</h3>
              <p className="text-gray-700">
                These Terms of Service ("Terms") govern your use of the MyMacros mobile application ("App") provided by [Company name or data controller] ("we" or "us"). By creating an account or using the App, you agree to be bound by these Terms. Do not use the App if you do not accept the Terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. License and Usage</h3>
              <p className="text-gray-700">
                We grant you a limited, non-exclusive, non-transferable license to use the App for personal and non-commercial use. You may not copy, modify, distribute, or create derivative works based on the App.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Age Restriction</h3>
              <p className="text-gray-700">
                The App is intended for users who are at least 18 years old. By using the App, you certify that you are at least 18 years old.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. User Account</h3>
              <p className="text-gray-700">
                To use the App's features, you need to create an account. You are responsible for ensuring the information you provide is accurate and for protecting your login credentials. You may not share your account with anyone else.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Service Content and Purpose</h3>
              <p className="text-gray-700">
                The App is a tool for tracking your meals and nutritional intake. The information presented in the App is not medical advice and does not replace consultation with a doctor or dietitian.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6. User Responsibilities</h3>
              <p className="text-gray-700 mb-2">
                You agree, among other things, to:
              </p>
              <ul className="space-y-1 text-gray-700 ml-4">
                <li>• Not use the App for illegal purposes</li>
                <li>• Not manipulate, decompile, or otherwise attempt to recreate the source code</li>
                <li>• Not transmit viruses, malicious code, or automated scripts</li>
                <li>• Not use the App to harass, threaten, or harm others</li>
              </ul>
              <p className="text-gray-700 mt-3">
                This list is not exhaustive – you are responsible for using the App legally and responsibly.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Intellectual Property Rights</h3>
              <p className="text-gray-700">
                All content in the App, including but not limited to text, graphics, logos, and code, belongs to us or our licensors and is protected by intellectual property laws. The user is not granted any right to use such content beyond what is expressly stated in these Terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Limitation of Liability</h3>
              <p className="text-gray-700">
                The App is provided in its current state without any warranties. We are not liable for damages arising from the use of the App, including errors in nutritional calculations or technical interruptions, unless otherwise required by mandatory law.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Changes to Terms</h3>
              <p className="text-gray-700">
                We reserve the right to update or change these Terms. For significant changes, you will be notified via the App or email. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">10. Termination</h3>
              <p className="text-gray-700">
                You can terminate your account at any time via the App. We reserve the right to terminate or suspend your account for violations of these Terms or suspected abuse.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">11. Applicable Law and Dispute Resolution</h3>
              <p className="text-gray-700">
                These Terms are governed by Swedish substantive law. Disputes arising in connection with these Terms shall be decided by Swedish general courts, with Stockholm District Court as the first instance, unless otherwise required by mandatory consumer or internationally applicable law.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">12. Mandatory Legal Provisions</h3>
              <p className="text-gray-700">
                Nothing in these Terms limits your rights under mandatory consumer legislation or other applicable mandatory law.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">13. Consumer Information</h3>
              <p className="text-gray-700 mb-2">
                According to applicable consumer law, the following information must be provided:
              </p>
              <ul className="space-y-1 text-gray-700 ml-4">
                <li>• <strong>Supplier:</strong> [Company name and organization number]</li>
                <li>• <strong>Address:</strong> [Postal address]</li>
                <li>• <strong>Email:</strong> [contact@example.com]</li>
                <li>• <strong>Phone:</strong> [Phone number if available]</li>
              </ul>
              <div className="bg-yellow-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700">
                  If you use the App as a consumer, you normally have a 14-day right of withdrawal from when you create an account. By starting to use the App, you consent to the service beginning immediately and the right of withdrawal may therefore be lost. However, you can terminate your account at any time according to point 10.
                </p>
              </div>
              <p className="text-gray-700 mt-3">
                You will receive a copy of these terms in a permanent format (e.g., via email) when you create an account.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact</h3>
              <p className="text-gray-700">
                Have questions about these Terms or the App? Contact us at [contact@example.com].
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );

  if (showAsModal) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in overflow-y-auto">
        <div className="max-h-[95vh] sm:max-h-[90vh] overflow-y-auto w-full">
          {content}
        </div>
      </div>
    );
  }

  return content;
} 