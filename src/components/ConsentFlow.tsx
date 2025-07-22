'use client';

import { useState } from 'react';
import { Shield, FileText, Check, X, AlertCircle, Eye } from 'lucide-react';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';

interface ConsentFlowProps {
  onAccept: () => void;
  onReject: () => void;
  showTitle?: boolean;
}

export default function ConsentFlow({ onAccept, onReject, showTitle = true }: ConsentFlowProps) {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);

  const canProceed = privacyChecked && termsChecked;

  const handleAccept = () => {
    if (canProceed) {
      onAccept();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-2xl w-full mx-auto max-h-[95vh] overflow-y-auto">
        {/* Header */}
        {showTitle && (
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">Welcome to MyMacros</h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg px-2">
              Before we get started, please review our privacy and service terms
            </p>
          </div>
        )}

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-800 mb-1 text-sm sm:text-base">Health Data Processing</h3>
            <p className="text-xs sm:text-sm text-amber-700">
              MyMacros processes nutritional information which may be considered health data under GDPR. 
              We require your explicit consent to provide our macro tracking services.
            </p>
          </div>
        </div>

        {/* Consent Options */}
        <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
          
          {/* Privacy Policy */}
          <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 mt-1">
                <button
                  onClick={() => setPrivacyChecked(!privacyChecked)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors touch-friendly ${
                    privacyChecked 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {privacyChecked && <Check className="w-3 h-3 text-white" />}
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Privacy Policy</h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 leading-relaxed">
                  I agree to the processing of my personal data including meal descriptions, macro goals, 
                  and AI-generated nutrition content as described in the privacy policy.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPrivacyModal(true)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium transition-colors touch-friendly"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    Read Privacy Policy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Terms of Service */}
          <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 mt-1">
                <button
                  onClick={() => setTermsChecked(!termsChecked)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors touch-friendly ${
                    termsChecked 
                      ? 'bg-green-600 border-green-600' 
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {termsChecked && <Check className="w-3 h-3 text-white" />}
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Terms of Service</h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 leading-relaxed">
                  I accept the terms of service and agree to use MyMacros in accordance with the stated conditions.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowTermsModal(true)}
                    className="flex items-center gap-1 text-green-600 hover:text-green-700 text-xs sm:text-sm font-medium transition-colors touch-friendly"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    Read Terms of Service
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={onReject}
            className="order-2 sm:order-1 flex-1 py-3 sm:py-3 px-4 sm:px-6 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 touch-friendly text-sm sm:text-base"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={!canProceed}
            className={`order-1 sm:order-2 flex-1 py-3 sm:py-3 px-4 sm:px-6 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 touch-friendly text-sm sm:text-base ${
              canProceed
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
            Accept & Continue
          </button>
        </div>

        {!canProceed && (
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 px-2">
            Please review and accept both the privacy policy and terms of service to continue
          </p>
        )}

        {/* Footer */}
        <div className="text-center mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 px-2">
            By accepting, you confirm that you are at least 18 years old and agree to our data processing practices.
          </p>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <PrivacyPolicy 
          onClose={() => setShowPrivacyModal(false)}
          showAsModal={true}
        />
      )}

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <TermsOfService
          onClose={() => setShowTermsModal(false)}
          showAsModal={true}
        />
      )}
      
      {/* Mobile-optimized styles */}
      <style jsx>{`
        .touch-friendly {
          min-height: 44px;
          min-width: 44px;
        }
        
        @media (hover: none) and (pointer: coarse) {
          .touch-friendly:hover {
            transform: none;
          }
        }
        
        @media (max-width: 640px) {
          .touch-friendly {
            min-height: 48px;
          }
        }
      `}</style>
    </div>
  );
} 