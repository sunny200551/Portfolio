import React, { Component, useState, useEffect, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('[CanvasErrorBoundary] 3D Canvas error caught, rendering fallback:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface TimeoutSuspenseProps {
  timeoutMs?: number;
  fallback: ReactNode;
  timeoutFallback: ReactNode;
  children: ReactNode;
  active?: boolean;
}

const SuspenseTracker: React.FC<{ onResolve: () => void; children: ReactNode }> = ({ onResolve, children }) => {
  useEffect(() => {
    onResolve();
  }, [onResolve]);

  return <>{children}</>;
};

/**
 * Wraps 3D content with a timeout. If Suspense takes longer than timeoutMs (default: 4000ms)
 * to resolve, it gracefully switches to timeoutFallback (e.g. flat 2D view).
 */
export const TimeoutSuspense: React.FC<TimeoutSuspenseProps> = ({
  timeoutMs = 4000,
  fallback,
  timeoutFallback,
  children,
  active = true,
}) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    if (!active || isResolved) return;

    const timer = setTimeout(() => {
      if (!isResolved) {
        setHasTimedOut(true);
      }
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [timeoutMs, isResolved, active]);

  if (hasTimedOut && !isResolved) {
    return <>{timeoutFallback}</>;
  }

  return (
    <React.Suspense fallback={fallback}>
      <SuspenseTracker onResolve={() => setIsResolved(true)}>
        {children}
      </SuspenseTracker>
    </React.Suspense>
  );
};
