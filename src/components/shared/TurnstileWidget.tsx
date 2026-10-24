'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    turnstile: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => void;
    };
  }
}

interface Props {
  siteKey: string;
  onVerify: (token: string) => void;
}

export default function TurnstileWidget({ siteKey, onVerify }: Props) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.turnstile) {
        window.turnstile.render('#turnstile-container', {
          sitekey: siteKey,
          callback: (token: string) => {
            onVerify(token);
          },
        });
      }
    };

    return () => {
      try {
        document.body.removeChild(script);
      } catch {}
    };
  }, [siteKey, onVerify]);

  return <div id='turnstile-container' className='flex justify-center my-4'></div>;
}
