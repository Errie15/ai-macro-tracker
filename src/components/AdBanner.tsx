'use client';

import { useEffect, useState } from 'react';

interface AdBannerProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
  className?: string;
}

// Declare global AdSense
declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export default function AdBanner({ 
  adSlot, 
  adFormat = 'auto',
  responsive = true,
  className = ''
}: AdBannerProps) {
  const [adError, setAdError] = useState(false);

  useEffect(() => {
    try {
      // Push ad to AdSense
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
      setAdError(true);
    }
  }, []);

  // Don't render if there's an error
  if (adError) {
    return null;
  }

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
} 