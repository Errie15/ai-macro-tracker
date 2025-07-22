'use client';

import { useState, useEffect } from 'react';
import { Cookie, X, Check } from 'lucide-react';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowConsent(true);
    } else if (consent === 'accepted') {
      // Load ads if consent was given
      loadGoogleAds();
    }
  }, []);

  const loadGoogleAds = () => {
    // Initialize Google AdSense
    if (typeof window !== 'undefined') {
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({
          google_ad_client: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,
          enable_page_level_ads: true
        });
      } catch (error) {
        console.error('AdSense loading error:', error);
      }
    }
  };

  const handleAccept = () => {
    setLoading(true);
    localStorage.setItem('cookie-consent', 'accepted');
    loadGoogleAds();
    
    // Small delay for UX
    setTimeout(() => {
      setShowConsent(false);
      setLoading(false);
    }, 500);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-slide-up">
        <div className="flex items-start gap-3 mb-4">
          <Cookie className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              🍪 Cookies & Annonser
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Vi använder cookies och visar annonser för att hålla appen gratis. 
              Dina data behandlas enligt GDPR och vi delar inte personlig information.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4 inline mr-2" />
            Avböj
          </button>
          
          <button
            onClick={handleAccept}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
            ) : (
              <Check className="w-4 h-4 inline mr-2" />
            )}
            Acceptera
          </button>
        </div>
      </div>
    </div>
  );
} 