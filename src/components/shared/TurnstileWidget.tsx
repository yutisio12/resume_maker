'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const CONTAINER_ID = 'turnstile-container';

interface Props {
  siteKey: string;
  onVerify: (token: string) => void;
}

export default function TurnstileWidget({ siteKey, onVerify }: Props) {
  const callbackRef = useRef(onVerify);
  const widgetIdRef = useRef<string | null>(null);

  // Keep the latest callback without re-rendering the widget on every parent
  // state change (onVerify is usually an inline function).
  callbackRef.current = onVerify;

  useEffect(() => {
    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !window.turnstile || widgetIdRef.current) return;
      const container = document.getElementById(CONTAINER_ID);
      if (!container) return;

      widgetIdRef.current = window.turnstile.render(container, {
        sitekey: siteKey,
        action: 'resume-gate',
        callback: (token: string) => callbackRef.current(token),
      });
    };

    let script = document.querySelector<HTMLScriptElement>('script[data-turnstile-script]');
    let createdScript = false;

    if (!script) {
      script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.dataset.turnstileScript = 'true';
      document.body.appendChild(script);
      createdScript = true;
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      script.addEventListener('load', renderWidget);
    }

    return () => {
      cancelled = true;
      script.removeEventListener('load', renderWidget);

      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Widget is already gone; nothing left to clean up.
        }
        widgetIdRef.current = null;
      }

      if (createdScript) script.remove();
    };
  }, [siteKey]);

  return <div id={CONTAINER_ID} className='flex justify-center my-4' />;
}
