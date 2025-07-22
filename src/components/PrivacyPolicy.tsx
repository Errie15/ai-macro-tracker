'use client';

import { useState } from 'react';
import { X, Eye, Shield } from 'lucide-react';

interface PrivacyPolicyProps {
  onClose?: () => void;
  showAsModal?: boolean;
  className?: string;
}

export default function PrivacyPolicy({ onClose, showAsModal = false, className = '' }: PrivacyPolicyProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const content = (
    <div className={`bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Privacy Policy for MyMacros</h2>
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

      {/* Toggle between summary and full policy */}
      <div className="mb-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          {isExpanded ? 'Show Summary' : 'Read Full Policy'}
        </button>
      </div>

      {/* Content */}
      <div className="prose prose-sm max-w-none">
        {!isExpanded ? (
          // Summary version
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy Policy Summary</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• We collect your email address to create and manage your account</li>
              <li>• We collect your meal descriptions, macro goals, and AI-generated nutrition data</li>
              <li>• Your meal data is processed with OpenAI's language model to estimate nutrition content</li>
              <li>• We don't sell your data or use it for advertising</li>
              <li>• Data may be processed outside the EU (USA via OpenAI) with appropriate GDPR protections</li>
              <li>• You can request data access, correction, deletion, or export at any time</li>
              <li>• You can withdraw consent by deleting your account or contacting us</li>
            </ul>
            <p className="text-sm text-gray-600 mt-3 italic">
              Click "Read Full Policy" above for complete details.
            </p>
          </div>
        ) : (
          // Full policy
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Who is responsible for your data?</h3>
              <p className="text-gray-700 mb-2">
                MyMacros is provided by [Data Controller], who is responsible for processing your personal data under GDPR.
              </p>
              <p className="text-gray-700">
                <strong>Contact:</strong> [contact@example.com]
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. What data do we collect and why?</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left font-semibold">Data Type</th>
                      <th className="p-3 text-left font-semibold">Purpose</th>
                      <th className="p-3 text-left font-semibold">Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-3">Email address</td>
                      <td className="p-3">Create and manage user account</td>
                      <td className="p-3">Contract (Article 6.1(b))</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3">Meal descriptions, macro goals, and AI-generated nutrition content</td>
                      <td className="p-3">Display nutrition information and track progress</td>
                      <td className="p-3">Explicit consent (Article 9.2(a))</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. How do we handle your data?</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Your data is used only to provide you with app functionality</li>
                <li>• Access to your data is restricted to authorized personnel and protected with encryption</li>
                <li>• Meal descriptions you enter are analyzed with OpenAI's language model to estimate nutrition content</li>
                <li>• We do not sell your data and do not use it for advertising</li>
                <li>• Data may be processed outside the EU (e.g., in the USA via OpenAI) and is protected through EU Commission Standard Contractual Clauses (SCC), which is an approved protection under GDPR Article 46.2(c)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. How long do we keep your data?</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Your data is stored as long as you have an active account with us</li>
                <li>• You can request deletion of your data at any time</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Your rights under GDPR</h3>
              <p className="text-gray-700 mb-2">You have the right to:</p>
              <ul className="space-y-1 text-gray-700 ml-4">
                <li>• Access your data (Art 15)</li>
                <li>• Correct inaccurate data (Art 16)</li>
                <li>• Delete your data (Art 17)</li>
                <li>• Export your data in machine-readable format (Art 20)</li>
                <li>• Object to or restrict processing (Art 18 and 21)</li>
                <li>• Withdraw consent at any time (Art 7.3)</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Contact us at [contact@example.com] to exercise your rights. You also have the right to file a complaint with the Privacy Protection Authority (IMY) (Art 77).
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Third-party providers</h3>
              <p className="text-gray-700 mb-2">
                We only use OpenAI as a third-party provider.
              </p>
              <p className="text-gray-700 mb-2">
                OpenAI processes only your text inputs to generate nutrition information, on our behalf. OpenAI is based in the USA, which means certain data is transferred to a third country.
              </p>
              <p className="text-gray-700">
                As the data controller, we are obligated to ensure this transfer occurs legally and securely. We have entered into data processing agreements with OpenAI and have ensured the protection level meets EU requirements by using EU Commission Standard Contractual Clauses (SCC) under Article 46.2(c).
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Contact us</h3>
              <p className="text-gray-700">
                Have questions about how we process personal data? Contact us at [contact@example.com].
              </p>
            </section>

            <section className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Consent for Processing Nutrition Data</h3>
              <p className="text-gray-700 mb-3">
                By using MyMacros, you agree that we process the following information:
              </p>
              <ul className="space-y-1 text-gray-700 ml-4">
                <li>• What you eat</li>
                <li>• Your macro goals</li>
                <li>• Our calculated nutrition content based on your input</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Information about what you eat, your macro goals, and AI-generated nutrition content may in some cases be considered health data under Article 4.15 of GDPR. To ensure strong protection of your privacy, we process this data with explicit consent.
              </p>
              <p className="text-gray-700 mt-2">
                You can withdraw your consent at any time by deleting your account or contacting us.
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