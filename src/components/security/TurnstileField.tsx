import { useEffect, useId, useRef, useState } from 'react';

import { getTurnstileSiteKey, isTurnstileEnabled } from '@/lib/turnstile';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  const existing = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Turnstile script failed')), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Turnstile script failed'));
    document.head.appendChild(script);
  });
}

interface TurnstileFieldProps {
  onTokenChange: (token: string) => void;
  className?: string;
  resetKey?: number;
  loadErrorMessage?: string;
}

export default function TurnstileField({
  onTokenChange,
  className,
  resetKey = 0,
  loadErrorMessage,
}: TurnstileFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const fieldId = useId();

  useEffect(() => {
    if (!isTurnstileEnabled()) return;

    let cancelled = false;

    void loadTurnstileScript()
      .then(() => {
        if (!cancelled) {
          setReady(true);
          setLoadFailed(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
          onTokenChange('');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [onTokenChange]);

  useEffect(() => {
    if (!ready || !containerRef.current || !window.turnstile) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: getTurnstileSiteKey(),
      theme: 'auto',
      callback: (token) => onTokenChange(token),
      'expired-callback': () => onTokenChange(''),
      'error-callback': () => onTokenChange(''),
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [ready, onTokenChange]);

  useEffect(() => {
    if (!ready || !window.turnstile || !widgetIdRef.current) return;
    window.turnstile.reset(widgetIdRef.current);
    onTokenChange('');
  }, [resetKey, ready, onTokenChange]);

  if (!isTurnstileEnabled()) {
    return null;
  }

  return (
    <div className={className}>
      <div
        ref={containerRef}
        id={fieldId}
        aria-label="Security verification"
      />
      {loadFailed && loadErrorMessage ? (
        <p className="mt-2 text-center text-sm text-red-600" role="alert">
          {loadErrorMessage}
        </p>
      ) : null}
    </div>
  );
}
